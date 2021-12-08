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



import * as THREE from '../js/three.module.js';
import {textures, blocks, scene, navmesh} from '../main.js';
import {MAX_FLOORS, SIDEWALK_WIDTH, OFFICE_TEXTURE_SCALE_U, FLOOR_HEIGHT, OFFICE_DOOR_WIDTH, OFFICE_DOOR_DISTANCE, OFFICE_ROOM_SIZE, BUILDING_TEXTURE_SCALE, DEBUG_BUILDINGS_OPACITY, OFFICE_CORRIDOR_WIDTH, OFFICE_ROOM_COUNT, SHADOWS, NO_SHADOWS, DEBUG_ALL_WHITE, DEBUG_HIDE_ROOFS, SAFE_MODE} from '../config.js';
import {Size, round, TOP, RIGHT, LEFT, BOTTOM, Pos} from '../core.js';


export class OfficeBuilding
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

		if( doorWings * OFFICE_DOOR_WIDTH >= wallSize )
		{
			doorWings = Math.floor( (wallSize-4) / OFFICE_DOOR_WIDTH );
		}

		return doorWings;
		
	} // OfficeBuilding.doorWings



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

		switch (n)
		{
			case 1:
					positions.push( 0 );
					break;
			case 2:
					var pos = THREE.Math.randFloat( 0.5*doorWidth+1, wallSize/2-doorWidth );	
					positions.push( pos, -pos );
					break;
			case 3:
					var pos = THREE.Math.randFloat( 1.5*doorWidth, wallSize/2-doorWidth );	
					positions.push( pos, 0, -pos );
					break;
			default:
					throw 'Invalid n='+n;
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


import {OfficeDoor} from './officeDoors.js';
import {Elevator} from './elevators.js';
import {Room} from './rooms.js';



export class OfficeBuildings
{
	constructor()
	{
		this.sysType = 'OfficeBuildings';
	}
	
	
	static geometry()
	{
		var geometry = new THREE.InstancedBufferGeometry();

		// x,y,z, nx,ny,nz, u,v
		
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
				side: DEBUG_HIDE_ROOFS?THREE.DoubleSide:THREE.FrontSide,
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

			material.userData.shader = shader;
			
			shader.uniforms.uTime = { value: 0.0 };
			shader.uniforms.uLamps = { value: 0.0 };
			shader.uniforms.uLampsIntensity = { value: 0.0 };
			
			shader.vertexShader =
				shader.vertexShader.replace(
					'void main() {\n',
					
					`
					  varying vec2 vTextureOffset;
					  varying vec2 vTextureScale;
					  attribute float officeId;
					  varying float vOfficeId;
					  void main() {
						vOfficeId = officeId;
						if (normal.y>0.5)
						{
							vTextureScale = vec2(0);
							vTextureOffset = vec2(0.1);
						}
						else
						{
							vTextureScale.x = (abs(normal.x)<0.5) ? instanceMatrix[0][0] : instanceMatrix[2][2];
							vTextureScale.y = instanceMatrix[1][1];
							vTextureOffset.x = 0.0;
							vTextureOffset.y = 0.0;
						}
					`
				);


			shader.fragmentShader =
				shader.fragmentShader.replace(
					'void main() {\n',
					
					`
					  varying vec2 vTextureScale;
					  varying vec2 vTextureOffset;
					  uniform float uTime;
					  uniform float uLamps;
					  uniform float uLampsIntensity;
					  varying float vOfficeId;
					  float isWindow;
					  void main() {\n
					`
				);
		
			shader.fragmentShader =
				shader.fragmentShader.replace(
				  '#include <map_fragment>',
				  
				  `
					vec2 texPos = vUv*vTextureScale+vTextureOffset;
					vec4 texelColor = texture2D( map, texPos );
					texelColor = mapTexelToLinear( texelColor );
					isWindow = pow(texelColor.b,4.0);
					texelColor = vec4(texelColor.r,texelColor.r,texelColor.r,1);
					diffuseColor *= texelColor;
				  `
				);
				
			shader.fragmentShader =
				shader.fragmentShader.replace(
				  '#include <normal_fragment_maps>',
				  
				  `
				    vec3 mapN = texture2D( normalMap, texPos ).xyz * 2.0 - 1.0;
				    mapN.xy *= normalScale;
				    normal = perturbNormal2Arb( -vViewPosition, normal, mapN, faceDirection );
				  `
				);
				
			shader.fragmentShader =
				shader.fragmentShader.replace(
				  '#include <dithering_fragment>',

					// make windows color
					// (x,y) - int coordinates of window
				  `
					#include <dithering_fragment>
					
					float x = floor(texPos.x);
					float y = floor(texPos.y);
					
					float windowId = (fract(5.0*sin(x+y*y)+vOfficeId)+fract(7.0*sin(y+x*x+vOfficeId)*(x+1.0))+0.1*sin(uTime/3000.0+x+y+vOfficeId))/2.0;
				  `	
				    +(DEBUG_ALL_WHITE
						? `	vec4 newColor = vec4(1);
						  `
						: `	float colorId = fract(12.81*windowId)+vOfficeId-1.0;
							vec4 newColor = vec4(1.0-0.2*colorId, 1.1-0.3*fract(1.0/colorId), 1.1+0.4*colorId, 1.0);
						  `	
					)+	
				  `
					float k = windowId < uLamps ? 1.0 : 0.0;
					
					isWindow *= k;
					
					gl_FragColor += float(${DEBUG_BUILDINGS_OPACITY})*isWindow*(1.0-windowId)*newColor*uLampsIntensity;
				  `
				);
				
			//console.log(shader.vertexShader);
		} // material.onBeforeCompile
		
		return material;
		
	} // OfficeBuildings.material
	
	
	
	static generate( offices, doors )
	{
		
		// in safe mode no office buildings are generated
		if( SAFE_MODE ) return;
		
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
		
		// in safe mode no office buildings are generated
		if( SAFE_MODE ) return;
		
		
		var instances = offices.length;
		
		var geometry  = OfficeBuildings.geometry(),
			material  = OfficeBuildings.material(),
			mesh = new THREE.InstancedMesh( geometry, material, instances );
			
		// every office building has own grayish color
		var colors = [];
		for( var i=0; i<instances; i++)
		{
			var intensity = DEBUG_ALL_WHITE ? 1.2 : Math.pow( THREE.Math.randFloat(0,1), 1/4 );
			colors.push( intensity, intensity, intensity );
		}
		var colorAttribute = new THREE.InstancedBufferAttribute( new Float32Array(colors), 3, false, 1 );
		geometry.setAttribute( 'color', colorAttribute );
		
		var id = [];
		for( var i=0; i<instances; i++ ) id.push( Math.random() );
		geometry.setAttribute(
			'officeId',
			new THREE.InstancedBufferAttribute(new Float32Array(id), 1, false, 1));

		// create an office building matrix
		var matrix = new THREE.Matrix4();
		for( var i=0; i<instances; i++ )
		{
			matrix.makeScale( offices[i].size.x, offices[i].height, offices[i].size.z );
			matrix.setPosition( offices[i].center.x, 0, offices[i].center.z );

			mesh.setMatrixAt( i, matrix );
		}

		mesh.receiveShadow = true;
		//mesh.castShadow = true;
		//mesh.position.y = -0.2;

		scene.add( mesh );

		if( SHADOWS != NO_SHADOWS )
		{
			var geometry  = OfficeBuildings.geometry(),
				material  = new THREE.MeshBasicMaterial({
					side: THREE.BackSide,
					//color: 'black',
					transparent: true,
					opacity: 0,
					depthWrite: false,
				}),
				shadowMesh = new THREE.InstancedMesh( geometry, material, instances );
			for( var i=0; i<instances; i++ )
			{
				matrix.makeScale( offices[i].size.x-1, offices[i].height-0.1, offices[i].size.z-1 );
				matrix.setPosition( offices[i].center.x, -1, offices[i].center.z );
				shadowMesh.setMatrixAt( i, matrix );
			}
			shadowMesh.castShadow = true;
			scene.add( shadowMesh );
		}
		
		return mesh;
	} // OfficeBuildings.image
	
	
	
} // OfficeBuildings
