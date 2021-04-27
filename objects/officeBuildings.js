//
//	class OfficeBuilding
//		constructor( center, size, floors, block )
//		doorWings( wallSize )
//		doorPositions( wallSize, doorWings )
//		roomCount( wallSize )
//		roomSize( wallSize, n )
//		roomCenter( x, z, floor )
//
//	class OfficeBuildings
//		static geometry( )
//		static material( )
//		static generate( offices, doors )
//		static image( offices, doors )
//
//
// Note: office building
//			- first floor is one big lobby, office rooms are from the next floor
//			- Rooms instances are defined as a single floor (i.e. all floor
//				share the same 



class OfficeBuilding
{
	constructor( center, size, floors, block )
	{
		this.sysType = 'OfficeBuilding';
		
		this.center = center;
		this.center.block = block;
		
		this.size = size;
		this.floors = floors;
		this.block = block;

		this.height = FLOOR_HEIGHT * floors; // in meters

		this.doors = [];
		this.rooms = [];
		this.elevators = [];
		
		// decide doors on Z sides
		var door,
			doorWings = this.doorWings( size.z ),
			positions = this.doorPositions( size.z, doorWings );

		for( var i=0; i<positions.length; i++ )
		{
			door = new OfficeDoor( center.addXZ(+size.x/2,positions[i]), doorWings, 1 );
			this.doors.push( door );
			
			door = new OfficeDoor( center.addXZ(-size.x/2,positions[i]), doorWings, 3 );
			this.doors.push( door );
		}
		
		// decide doors on X sides
		doorWings = this.doorWings( size.x );
		positions = this.doorPositions( size.x, doorWings );

		for( var i=0; i<positions.length; i++ )
		{
			door = new OfficeDoor( center.addXZ(positions[i],size.z/2), doorWings, 0 );
			this.doors.push( door );
			
			door = new OfficeDoor( center.addXZ(positions[i],-size.z/2), doorWings, 2 );
			this.doors.push( door );
		}
		
		// define offices
		var roomCount = new Size( this.roomCount(size.x), this.roomCount(size.z) ),
			roomSize = new Size( this.roomSize(size.x,roomCount.x)-1, this.roomSize(size.z,roomCount.z)-1 );
			
		//console.log('roomCount=',roomCount);

		// positions of elevators
		var elevX = Math.floor( roomCount.x/3 ),
			elevZ = Math.floor( roomCount.z/3 );
			
		elevX = Math.floor( THREE.Math.randInt(roomCount.x/4, roomCount.x/2-1) );
		elevZ = Math.floor( THREE.Math.randInt(roomCount.z/4, roomCount.z/2-1) );
		
		var room;
		for( var x=0; x<roomCount.x; x++ )
		for( var z=0; z<roomCount.z; z++ )
		{
			if( (x==elevX || (x==roomCount.x-elevX-1 && roomCount.x>2)) &&
				(z==elevZ || (z==roomCount.z-elevZ-1 && roomCount.z>2)) )
			{
				// elevator size is as room size, because it is used as lobby
				// the actual size of the shaft is OFFICE_ELEVATOR_SHAFT_WIDTH
				//room = new Elevator( this.roomCenter(x,z,0,roomSize), roomSize ); //2020-12-12 it was this, roomSize looks like wrong, it must be array of doors
				room = new Elevator( this.roomCenter(x,z,0,roomSize), [], floors );
				this.elevators.push( room );
			}
			else
			{
				var facing,
					dX = x - (roomCount.x-1)/2,
					dZ = z - (roomCount.z-1)/2;
					
				if( Math.abs(dX) > Math.abs(dZ) )
					facing = dX>0 ? LEFT : RIGHT;
				else
					facing = dZ>0 ? BOTTOM : TOP;
				
				room = new Room( this.roomCenter(x,z,0,roomSize), roomSize, facing );
				this.rooms.push( room );
				
				if( x == 0 ) room.outerWall[LEFT] = true;
				if( x == roomCount.x-1 ) room.outerWall[RIGHT] = true;
				if( z == 0 ) room.outerWall[BOTTOM] = true;
				if( z == roomCount.z-1 ) room.outerWall[TOP] = true;
			}
		}
		
		navmesh.addOfficeBuilding( this );
		
	} // OfficeBuilding.constructor
	
	
	
	// select the size of a door segment
	doorWings( wallSize )
	{
		var doorWings = 2*THREE.Math.randInt(1,2);
		
		if( this.floors>10 ) doorWings = 2*THREE.Math.randInt(2,3);
		if( this.floors>25 ) doorWings = 2*THREE.Math.randInt(3,4);
		if( this.floors>40 ) doorWings = 2*THREE.Math.randInt(4,4);

		return doorWings;
		
	} // OfficeBuilding.doorWidth



	// select allocation of doors on a wall
	doorPositions( wallSize, doorWings )
	{
		var positions = [],
			doorWidth = doorWings * OFFICE_DOOR_WIDTH;

		for( var n=3; n>0; n-- )
		{
			// wall sections clear from doors
			var clearWall = (wallSize - n*doorWidth)/(n+1);
			if( clearWall >= OFFICE_DOOR_DISTANCE ) break;
			if( n==1 ) break;
		}

		// there is middle door if n=1 or n=3
		if( n!=2 )
			positions.push( 0 );
		
		// there are side doors if n>1
		if( n>1 )
		{
			var pos = THREE.Math.randFloat( 1.5*doorWidth, wallSize/2-doorWidth );				
			positions.push( pos, -pos );
		}
		
		return positions;
		
	} // OfficeBuilding.doorPositions



	// select office count along a wall
	roomCount( wallSize )
	{
		var roomSize = OFFICE_ROOM_SIZE.randFloat();
		
		// equation:
		// n*officeSize + (n-1)*corridorWidth = wallSize
		var n = Math.floor( (wallSize + OFFICE_CORRIDOR_WIDTH) / (roomSize + OFFICE_CORRIDOR_WIDTH) );
		
		// because n is rounded down, the total length might be smaller, so recalculate room size
		n = THREE.Math.clamp( n, OFFICE_ROOM_COUNT.min, OFFICE_ROOM_COUNT.max );

		return n;

	} // OfficeBuilding.roomCount


	// select office sizes along a wall
	roomSize( wallSize, n )
	{
		return (wallSize - (n-1)*OFFICE_CORRIDOR_WIDTH) / n;

	} // OfficeBuilding.roomSize


	roomCenter( x, z, floor, roomSize )
	{	
		return new Pos(
					this.center.x - this.size.x/2 + (roomSize.x+1)*(x+0.5) + OFFICE_CORRIDOR_WIDTH*x,
					this.center.z - this.size.z/2 + (roomSize.z+1)*(z+0.5) + OFFICE_CORRIDOR_WIDTH*z,
					this.block,
					floor *  FLOOR_HEIGHT ); 
	}

	
} // OfficeBuilding



class OfficeBuildings
{
	constructor()
	{
		this.sysType = 'OfficeBuildings';
	}
	
	
	static geometry()
	{
		var geometry = new THREE.InstancedBufferGeometry();

		// x,y,z, nx,ny,nz, u,v
		
		var data = [
				// Top (from Y+)
				 -1/2, 1, -1/2,		0, 1, 0,	0, 0,
				 -1/2, 1,  1/2,		0, 1, 0,	0, 1,
					0, 1,    0,		0, 1, 0,	1, 1/2,
				  1/2, 1,  1/2,		0, 1, 0,	0, 1,
				  1/2, 1, -1/2,		0, 1, 0,	0, 0,
					0, 1,    0,		0, 1, 0,	1, 1/2,

				 1/2, 1, -1/2,		0, 1, 0,	0, 1,
				-1/2, 1, -1/2,		0, 1, 0,	0, 0,
					0, 1,    0,		0, 1, 0,	1, 1/2,
				  
				 -1/2, 1, 1/2,		0, 1, 0,	0, 1,
				1/2, 1, 1/2,		0, 1, 0,	0, 0,
					0, 1,    0,		0, 1, 0,	1, 1/2,
				  
				 // Front (from Z+) 
				 -1/2, 1,  1/2,		0, 0, 1,	0, 1,
				 -1/2, 0,  1/2,		0, 0, 1, 	0, 0,
				  1/2, 0,  1/2, 	0, 0, 1, 	1, 0, 
				 -1/2, 1,  1/2,		0, 0, 1,	0, 1,
				  1/2, 0,  1/2, 	0, 0, 1, 	1, 0, 
				  1/2, 1,  1/2,		0, 0, 1, 	1, 1,
				  
				 // Back (from Z-) 
				 -1/2, 1, -1/2,		0, 0,-1,	1, 1,
				  1/2, 0, -1/2, 	0, 0,-1, 	0, 0, 
				 -1/2, 0, -1/2,		0, 0,-1, 	1, 0,
				 -1/2, 1, -1/2,		0, 0,-1,	1, 1,
				  1/2, 1, -1/2,		0, 0,-1, 	0, 1,
				  1/2, 0, -1/2, 	0, 0,-1, 	0, 0, 
				  
				 // Right (from X+) 
				  1/2, 1,  1/2,		1, 0, 0,	0, 1,
				  1/2, 0,  1/2,		1, 0, 0, 	0, 0,
				  1/2, 0, -1/2, 	1, 0, 0, 	1, 0, 
				  1/2, 1,  1/2,		1, 0, 0,	0, 1,
				  1/2, 0, -1/2, 	1, 0, 0, 	1, 0, 
				  1/2, 1, -1/2,		1, 0, 0, 	1, 1,
				  
				 // Left (from X-) 
				 -1/2, 1,  1/2,		-1, 0, 0,	1, 1,
				 -1/2, 0, -1/2, 	-1, 0, 0, 	0, 0, 
				 -1/2, 0,  1/2,		-1, 0, 0, 	1, 0,
				 -1/2, 1,  1/2,		-1, 0, 0,	1, 1,
				 -1/2, 1, -1/2,		-1, 0, 0, 	0, 1,
				 -1/2, 0, -1/2, 	-1, 0, 0, 	0, 0, 
			 ];
		

		var vertexBuffer = new THREE.InterleavedBuffer( new Float32Array(data), 8);
	
		var positions = new THREE.InterleavedBufferAttribute( vertexBuffer, 3/*values*/, 0/*offset*/ );
		var normals   = new THREE.InterleavedBufferAttribute( vertexBuffer, 3/*values*/, 3/*offset*/ );
		var uvs       = new THREE.InterleavedBufferAttribute( vertexBuffer, 2/*values*/, 6/*offset*/ );
		
		geometry.setAttribute( 'normal', normals);
		geometry.setAttribute( 'position', positions );
		geometry.setAttribute( 'uv', uvs);
		geometry.setAttribute( 'uv2', uvs);
		
		return geometry;
		
	} // OfficeBuildings.geometry



	static material()
	{

		var material = new THREE.MeshStandardMaterial({
				//side: THREE.FrontSide,
				color: 'white',
				flatShading: true,
				vertexColors: true,
				map: textures.office.map( 1/OFFICE_TEXTURE_SCALE_U, 1/BUILDING_TEXTURE_SCALE ),
				normalMap: textures.officeNormal.map( 1/OFFICE_TEXTURE_SCALE_U,1/BUILDING_TEXTURE_SCALE ),
				transparent: DEBUG_BUILDINGS_OPACITY<0.9,
				opacity:     DEBUG_BUILDINGS_OPACITY,
				depthWrite:  DEBUG_BUILDINGS_OPACITY>0.9,
				metalness: 0,
				roughness: 1,
			});

		// inject GLSL code to rescale textures vertically
		// for uniform scaling - extract scaling factor from
		// the instance matrix
		material.onBeforeCompile = shader => {
			//console.log(shader.vertexShader);
			//console.log(shader.fragmentShader);

			shader.vertexShader =
				shader.vertexShader.replace(
					'void main() {\n',
					
					'varying vec2 vTextureOffset;\n'+
					'varying vec2 vTextureScale;\n'+
					'void main() {\n'+
					'	if (normal.y>0.5)\n'+
					'	{\n'+
					'		vTextureScale = vec2(0);\n'+
					'		vTextureOffset = vec2(0.1);\n'+
					'	}\n'+
					'	else\n'+
					'	{\n'+
					'		vTextureScale.x = (abs(normal.x)<0.5) ? instanceMatrix[0][0] : instanceMatrix[2][2];\n'+
					'		vTextureScale.y = instanceMatrix[1][1];\n'+
					'		vTextureOffset.x = 0.0;\n'+
					'		vTextureOffset.y = 0.0;\n'+
					'	}\n'+
					''
				);


			shader.fragmentShader =
				shader.fragmentShader.replace(
					'void main() {\n',
					
					'varying vec2 vTextureScale;\n'+
					'varying vec2 vTextureOffset;\n'+
					'void main() {\n'
				);
		
			shader.fragmentShader =
				shader.fragmentShader.replace(
				  '#include <map_fragment>',
				  
				  'vec4 texelColor = texture2D( map, vUv*vTextureScale+vTextureOffset );\n'+
				  'texelColor = mapTexelToLinear( texelColor );\n'+
				  'diffuseColor *= texelColor;'
				);
				
			shader.fragmentShader =
				shader.fragmentShader.replace(
				  '#include <normal_fragment_maps>',
				  
				  'vec3 mapN = texture2D( normalMap, vUv*vTextureScale+vTextureOffset ).xyz * 2.0 - 1.0;\n'+
				  'mapN.xy *= normalScale;\n'+
				  'normal = perturbNormal2Arb( -vViewPosition, normal, mapN, faceDirection );\n'
				);
				
			//console.log(shader.vertexShader);
		} // material.onBeforeCompile
		
		return material;
		
	} // OfficeBuildings.material
	
	
	
	static generate( offices, doors )
	{
		// create an office building occupying the square part
		// of the block reduced by sidewalks from all directions
		for( var i=0; i<blocks.offices.length; i++ )
		{				
			var block = blocks.offices[i];
			
			// building size
			var floors = Math.round(2 + MAX_FLOORS*block.height ),
				sizeX = round( block.zone.dX() - 2*SIDEWALK_WIDTH, 1 ),
				sizeZ = round( block.zone.dZ() - 2*SIDEWALK_WIDTH, 2 );
			
			// avoid tall sheet-flat buildings
			var minSize = Math.min( sizeX, sizeZ );
			if( minSize<10 & floors>20 ) floors = THREE.Math.randInt(10,20);  

			var office = new OfficeBuilding(
								block.zone.center,
								new Size( sizeX, sizeZ ),
								floors,
								block
			);
			
			block.buildings.push( office );
			offices.push( office );
			doors.push( ...office.doors );
			
		} // for i in blocks.offices
		
	} // OfficeBuildings.generate


	
	static image( offices )
	{
		var instances = offices.length;
		
		var geometry  = OfficeBuildings.geometry(),
			material  = OfficeBuildings.material(),
			mesh = new THREE.InstancedMesh( geometry, material, instances );
			
		// every office building has own grayish color
		var colors = [];
		for( var i=0; i<instances; i++)
		{
			var intensity = Math.pow( THREE.Math.randFloat(0,1), 1/8 );
			colors.push( intensity, intensity, intensity );
		}
		var colorAttribute = new THREE.InstancedBufferAttribute( new Float32Array(colors), 3, false, 1 );
		geometry.setAttribute( 'color', colorAttribute );
		
		
		// create an office building matrix
		var matrix = new THREE.Matrix4();
		for( var i=0; i<instances; i++ )
		{
			matrix.makeScale( offices[i].size.x, offices[i].height, offices[i].size.z );
			matrix.setPosition( offices[i].center.x, 0, offices[i].center.z );

			mesh.setMatrixAt( i, matrix );
		}

		mesh.receiveShadow = true;
		mesh.castShadow = true;
		//mesh.position.y = -0.2;

		scene.add( mesh );

		if( SHADOWS != NO_SHADOWS )
		{
			var geometry  = OfficeBuildings.geometry(),
				material  = new THREE.MeshBasicMaterial({
					side: THREE.BackSide,
					color: 'black',
					transparent: true,
					opacity: 0,
				}),
				mesh = new THREE.InstancedMesh( geometry, material, instances );
			for( var i=0; i<instances; i++ )
			{
				matrix.makeScale( offices[i].size.x-0.1, offices[i].height, offices[i].size.z-0.1 );
				matrix.setPosition( offices[i].center.x, -4, offices[i].center.z );
				mesh.setMatrixAt( i, matrix );
			}
			mesh.castShadow = true;
			scene.add( mesh );
		}
		
	} // OfficeBuildings.image
	
	
	
} // OfficeBuildings
