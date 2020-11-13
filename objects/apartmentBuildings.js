//
//	class ApartmentBuilding
//		constructor( center, size, floors, block )
//		doorPositions( wallSize, doorWings )
//
//	class ApartmentBuildings
//		static geometry( )
//		static material( )
//		static generate( offices )
//		static image( offices )
//

class ApartmentBuilding
{
	constructor( center, size, floors, block )
	{
		this.sysType = 'ApartmentBuilding';

		this.center = center;
		this.size = size;
		this.floors = floors;
		this.block = block;

		this.height = FLOOR_HEIGHT * floors; // in meters

		this.doors = [];
		this.rooms = [];
		this.elevators = [];
		this.neighbourBuildings = [undefined, undefined, undefined, undefined];
		//this.cornerZones = {};
		
		var door1, door2,
			doorWings = 2,
			room,
			elevator;
		
		// add floors
		if( DEBUG_APARTMENT_ADD_FLOORS )
		{
			var floorMaterial = new THREE.MeshLambertMaterial({color:'white', transparent: true, opacity: 0.8});
			var floorGeometry = new THREE.BoxBufferGeometry(size.x,0.1,size.z);
			for( var floor = 1; floor<floors; floor++ )
			{
				var mesh = new THREE.Mesh( floorGeometry, floorMaterial );
				mesh.position.set( center.x, floor*FLOOR_HEIGHT, center.z );
				scene.add( mesh );
			}
		}
		
		
		if( size.z > size.x )
		{
			// decide doors on Z sides
			var positions = this.doorPositions( size.z, doorWings );

			for( var i=0; i<positions.length; i++ )
			{
				door1 = new OfficeDoor( center.addXZ(size.x/2,positions[i]), doorWings, 1 );
				door2 = new OfficeDoor( center.addXZ(-size.x/2,positions[i]), doorWings, 3 );
				this.doors.push( door1, door2 );
				
				elevator = new Elevator( center.addXZ(0,positions[i]), [door1,door2] );
				this.elevators.push( elevator );
			}
			
			// add boundary values for rooms
			positions.unshift( -size.z/2-2 );
			positions.push( size.z/2+2 );
			
			// rooms
			for( var i=0; i<positions.length-1; i++ )
			{
				var length = positions[i+1]-positions[i]-4,
					mid = (positions[i+1]+positions[i])/2;
					
				var roomCount = round( length / APARTMENT_ROOM_SIZE, 1 ),
					roomSize = length/roomCount;

				for( var j=0; j<roomCount; j++ )
				{
					room = new Room( center.addXZ( size.x/4+1/4, positions[i]+2 + roomSize*(j+0.5) ), new Size( size.x/2-3/2, roomSize-1 ), LEFT );
					this.rooms.push( room );
					
					room = new Room( center.addXZ( -size.x/4-1/4, positions[i]+2 + roomSize*(j+0.5) ), new Size( size.x/2-3/2, roomSize-1 ), RIGHT );
					this.rooms.push( room );
				}
			}
		}
		else
		{
			// decide doors on X sides
			var positions = this.doorPositions( size.x, doorWings );

			for( var i=0; i<positions.length; i++ )
			{
				door1 = new OfficeDoor( center.addXZ(positions[i],size.z/2), doorWings, 0);
				door2 = new OfficeDoor( center.addXZ(positions[i],-size.z/2), doorWings, 2);
				this.doors.push( door1, door2 );
				
				elevator = new Elevator( center.addXZ(positions[i],0), [door1,door2] );
				this.elevators.push( elevator );
			}
			
			// add boundary values for rooms
			positions.unshift( -size.x/2-2 );
			positions.push( size.x/2+2 );
			
			// rooms
			for( var i=0; i<positions.length-1; i++ )
			{
				var length = positions[i+1]-positions[i]-4,
					mid = (positions[i+1]+positions[i])/2;
				
				var roomCount = round( length / APARTMENT_ROOM_SIZE, 1 ),
					roomSize = length/roomCount;

				for( var j=0; j<roomCount; j++ )
				{
					room = new Room( center.addXZ( positions[i]+2 + roomSize*(j+0.5), size.z/4+1/4 ), new Size( roomSize-1, size.z/2-3/2 ), BOTTOM );
					this.rooms.push( room );
					
					room = new Room( center.addXZ( positions[i]+2 + roomSize*(j+0.5), -size.z/4-1/4 ), new Size( roomSize-1, size.z/2-3/2 ), TOP );
					this.rooms.push( room );
				}
			}
		}
		
		// for each room store the closest elevator and door
		for( var i=0; i<this.rooms.length; i++ )
		{
			this.rooms[i].closestDoor = this.doors[ this.rooms[i].zone.center.closestArrayIndex( this.doors ) ];
//todo - closest elevator (see below) can be calculated as the closest door (see line above)			
			var outsideRoom = this.rooms[i].zone.center,
				distance = Number.POSITIVE_INFINITY;
			
			for( var e=0; e<this.elevators.length; e++ )
			{
				var newDistance = outsideRoom.manhattanDistanceTo( this.elevators[e].zone.center );
				if( newDistance < distance )
				{
					distance = newDistance;
					this.rooms[i].closestElevator = this.elevators[e];
				}
			}
		}
		
		
		navmesh.addApartmentBuilding( this );
		
	} // ApartmentBuilding.constructor
		
		
		
	
	
	
	// defines allocation of doors on a wall
	doorPositions( wallSize, doorWings )
	{
		var positions = [],
			doorWidth = doorWings * OFFICE_DOOR_WIDTH;
			
		// decide doors
		var n = round( wallSize/APARTMENT_DOOR_DISTANCE, 1 );

		// equal distributions of doors
		var distance = wallSize/(n+1);
		for( var i=1; i<=n; i++)
		{
			var pos = round( distance*i, 2 ) - wallSize/2;
			
			positions.push( pos );
		}
		
		return positions;
		
	} // ApartmentBuilding.doorsPattern
	

} // ApartmentBuilding






class ApartmentBuildings
{
	constructor()
	{
		this.sysType = 'ApartmentBuildings';
	}
	
	
	static geometry()
	{
		var geometry = new THREE.InstancedBufferGeometry();

		var data = [];
		if( !DEBUG_HIDE_ROOFS )
		{
			data.push(
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
			);
		}
		
		data.push(
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
		);
		
		// x,y,z, nx,ny,nz, u,v
		var vertexBuffer = new THREE.InterleavedBuffer( new Float32Array(data), 8);
	
		var positions = new THREE.InterleavedBufferAttribute( vertexBuffer, 3/*values*/, 0/*offset*/ );
		var normals   = new THREE.InterleavedBufferAttribute( vertexBuffer, 3/*values*/, 3/*offset*/ );
		var uvs       = new THREE.InterleavedBufferAttribute( vertexBuffer, 2/*values*/, 6/*offset*/ );
		
		geometry.setAttribute( 'normal', normals);
		geometry.setAttribute( 'position', positions );
		geometry.setAttribute( 'uv', uvs);
		geometry.setAttribute( 'uv2', uvs);
		
		return geometry;
		
	} // ApartmentBuildings.geometry



	static material()
	{
		var material = new THREE.MeshStandardMaterial({
				side: DEBUG_HIDE_ROOFS?THREE.DoubleSide:THREE.FrontSide,
				color: 'white',
				flatShading: true,
				map: textures.apartment.map( 1/APARTMENT_TEXTURE_SCALE_U, 1/BUILDING_TEXTURE_SCALE ),
				normalMap: textures.apartmentNormal.map( 1/APARTMENT_TEXTURE_SCALE_U, 1/BUILDING_TEXTURE_SCALE ),
				transparent: DEBUG_BUILDINGS_OPACITY<0.9,
				opacity:     DEBUG_BUILDINGS_OPACITY,
				depthWrite:  DEBUG_BUILDINGS_OPACITY>0.9,
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
				  'normal = perturbNormal2Arb( -vViewPosition, normal, mapN );\n'
				);
				
			//console.log(shader.vertexShader);
		} // material.onBeforeCompile
		
		return material;
		
	} // ApartmentBuildings.material
	
	
	
	static generate( apartments, doors )
	{
		// create a set of apartment buildings
		for( var i=0; i<blocks.apartments.length; i++ )
		{				
			var previousApartmentBuilding = undefined;
			
			function addApartmentBuildingX( a, b, c, d )
			{
				// 	,--------, 
				//	'--------'
				var x = (Math.max( a.x, d.x ) + Math.min( b.x, c.x ))/2;
				var z = (Math.max( c.z, d.z ) + Math.min( a.z, b.z ))/2;
				var dX = Math.min( b.x, c.x ) - Math.max( a.x, d.x );

				var maxFloors = 4+MAX_APARTMENT_BUILDING_FLOORS*blocks.apartments[i].height,
					floors = Math.round( THREE.Math.randFloat(maxFloors/2,maxFloors) ),
					width = round( APARTMENT_BUILDING_WIDTH.randInt(), 2 );
				var apartment = new ApartmentBuilding(
									new Pos(x,z,block),
									new Size(round(dX,2),round(width,2)),
									floors,
									blocks.apartments[i]
				);
				
				block.buildings.push( apartment );
				apartments.push( apartment );
				doors.push( ...apartment.doors );
				
				// link with the previous apartment building 
				if( previousApartmentBuilding )
				{
					previousApartmentBuilding.neighbourBuildings[TOP] = apartment;
					apartment.neighbourBuildings[BOTTOM] = previousApartmentBuilding;
				}
				previousApartmentBuilding = apartment;
			}
			
			function addApartmentBuildingZ( a, b, c, d )
			{
				// 	,--, 
				//  |  |
				//	|  |
				//	'--'
				var x = (Math.max( a.x, d.x ) + Math.min( b.x, c.x ))/2;
				var z = (Math.max( c.z, d.z ) + Math.min( a.z, b.z ))/2;
				var dZ = Math.min( a.z, b.z ) - Math.max( d.z, c.z );

				var maxFloors = 4+MAX_APARTMENT_BUILDING_FLOORS*blocks.apartments[i].height,
					floors = Math.round( THREE.Math.randFloat(maxFloors/2,maxFloors) ),
					width = round( APARTMENT_BUILDING_WIDTH.randInt(), 2 );
				var apartment = new ApartmentBuilding(
									new Pos(x,z,block),
									new Size(round(width,2),round(dZ,2)),
									floors,
									blocks.apartments[i]
				);
				
				block.buildings.push( apartment );
				apartments.push( apartment );
				doors.push( ...apartment.doors );
				
				// link with the previous apartment building 
				if( previousApartmentBuilding )
				{
					previousApartmentBuilding.neighbourBuildings[RIGHT] = apartment;
					apartment.neighbourBuildings[LEFT] = previousApartmentBuilding;
				}
				previousApartmentBuilding = apartment;
			}
			
			var block = blocks.apartments[i],
				zone = block.zone.shrink( SIDEWALK_WIDTH );
			
			var a = zone.a,
				b = zone.b,
				c = zone.c,
				d = zone.d;

			if( Math.min(b.x-a.x,c.x-d.x) < Math.min(a.z-d.z,b.z-c.z) )
			{
				// X side is shorter, generate buildings along X
				// 	,--------, 
				//	'--------'
				//
				
				// number of buildings
				var toZ = Math.min(a.z,b.z),
					fromZ = Math.max(c.z,d.z);
				var slices = Math.round( (toZ-fromZ) / APARTMENT_BUILDING_DISTANCE );

				if (slices)
				{
					var sliceSize = (toZ-fromZ) / slices;
					
					for( var s = 0; s<slices; s++ )
					{
						addApartmentBuildingX(
							Zone.midZ( d, a, fromZ+(s+1)*sliceSize ),
							Zone.midZ( c, b, fromZ+(s+1)*sliceSize ),
							Zone.midZ( c, b, fromZ+s*sliceSize ),
							Zone.midZ( d, a, fromZ+s*sliceSize )
						);
					}
				}
			}
			else
			{
				// Z side is shorter, generate buildings along Z
				// 	,--, 
				//  |  |
				//	|  |
				//	'--'
				//
				
				// number of buildings
				var toX = Math.min(b.x,c.x),
					fromX = Math.max(a.x,d.x);
				var slices = Math.round( (toX-fromX) / APARTMENT_BUILDING_DISTANCE );

				if (slices)
				{
					var sliceSize = (toX-fromX) / slices;
					
					for( var s = 0; s<slices; s++ )
					{
						addApartmentBuildingZ(
							Zone.midX( a, b, fromX+s*sliceSize ),
							Zone.midX( a, b, fromX+(s+1)*sliceSize ),
							Zone.midX( d, c, fromX+(s+1)*sliceSize ),
							Zone.midX( d, c, fromX+s*sliceSize )
						);
					}
				}
			}
			
		} // for i in blocks.apartments
		
	} // ApartmentBuildings.generate


	
	static image( apartments )
	{
		var instances = apartments.length;
		
		var geometry  = ApartmentBuildings.geometry(),
			material  = ApartmentBuildings.material(),
			mesh = new THREE.InstancedMesh( geometry, material, instances );
			
		// create an apartment building matrix
		var matrix = new THREE.Matrix4();
		for( var i=0; i<instances; i++ )
		{
			matrix.makeScale( apartments[i].size.x, apartments[i].height, apartments[i].size.z );
			matrix.setPosition( apartments[i].center.x, 0, apartments[i].center.z );

			mesh.setMatrixAt( i, matrix );
		}

		mesh.receiveShadow = true;
		mesh.castShadow = true;

		scene.add( mesh );
	} // ApartmentBuildings.image
	
	
	
} // ApartmentBuildings
