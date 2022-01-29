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


import * as THREE from '../js/three.module.js';
import {OfficeDoor} from './officeDoors.js';
import {Elevator} from './elevators.js';
import {Room} from './rooms.js';
import {blocks, navmesh, textures, scene} from '../main.js';
import {midX, midZ, round, Pos, Size, LEFT, RIGHT, BOTTOM, TOP} from '../core.js';
import {DEBUG_ALL_WHITE, SIDEWALK_WIDTH, APARTMENT_BUILDING_DISTANCE, MAX_APARTMENT_BUILDING_FLOORS, DEBUG_HIDE_ROOFS, APARTMENT_BUILDING_WIDTH, FLOOR_HEIGHT, DEBUG_APARTMENT_ADD_FLOORS, OFFICE_DOOR_WIDTH, APARTMENT_DOOR_DISTANCE, APARTMENT_ROOM_SIZE, APARTMENT_TEXTURE_SCALE_U, BUILDING_TEXTURE_SCALE, DEBUG_BUILDINGS_OPACITY, SHADOWS, NO_SHADOWS, SAFE_MODE} from '../config.js';


export class ApartmentBuilding
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
			var floorGeometry = new THREE.BoxGeometry(size.x-0.1,0.1,size.z-0.1);
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
				
				elevator = new Elevator( center.addXZ(0,positions[i]), [door1,door2], floors );
				this.elevators.push( elevator );
			}
			
			// add boundary values for rooms
			positions.unshift( -size.z/2-2 );
			positions.push( size.z/2+2 );
			
			// rooms
			for( var i=0; i<positions.length-1; i++ )
			{
				var length = positions[i+1]-positions[i]-4;
					
				var roomCount = Math.max( 1, round( length / APARTMENT_ROOM_SIZE, 1 )),
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
				
				elevator = new Elevator( center.addXZ(positions[i],0), [door1,door2], floors );
				this.elevators.push( elevator );
			}
			
			// add boundary values for rooms
			positions.unshift( -size.x/2-2 );
			positions.push( size.x/2+2 );
			
			// rooms
			for( var i=0; i<positions.length-1; i++ )
			{
				var length = positions[i+1]-positions[i]-4;
				
				var roomCount = Math.max( 1, round( length / APARTMENT_ROOM_SIZE, 1 ) ),
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
		var positions = [];
			
		// decide doors
		var n = Math.max( 1, round( wallSize/APARTMENT_DOOR_DISTANCE, 1 ) );

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






export class ApartmentBuildings
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
				vertexColors: true,
				map: textures.apartment.map( 1/APARTMENT_TEXTURE_SCALE_U, 1/BUILDING_TEXTURE_SCALE ),
				normalMap: textures.apartmentNormal.map( 1/APARTMENT_TEXTURE_SCALE_U, 1/BUILDING_TEXTURE_SCALE ),
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
					  
					  attribute float apartmentId;
					  varying float vApartmentId;
					  
					  void main() {
					 	vApartmentId = apartmentId;
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
					  varying float vApartmentId;
					  float isWindow;
					  void main() {
					`
				);

			shader.fragmentShader =
				shader.fragmentShader.replace(
				  '#include <map_fragment>',
				  
				  `
					vec2 texPos = vUv*vTextureScale+vTextureOffset;
					vec4 texelColor = texture2D( map, texPos );
				    texelColor = mapTexelToLinear( texelColor );
					isWindow = pow(texelColor.b,2.0);
					texelColor = vec4(texelColor.r,texelColor.r,texelColor.r,1);
					diffuseColor *= texelColor;
				  `
				);
		
			shader.fragmentShader =
				shader.fragmentShader.replace(
				  '#include <normal_fragment_maps>',
				  
				  `
				    vec3 mapN = texture2D( normalMap, vUv*vTextureScale+vTextureOffset ).xyz * 2.0 - 1.0;
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
					
					float windowId = (fract(5.0*sin(x+y*y)+vApartmentId)+fract(7.0*sin(y+x*x+vApartmentId)*(x+1.0))+0.1*sin(uTime/3000.0+x+y+vApartmentId))/2.0;
				  `	
				    +(DEBUG_ALL_WHITE
						? `	vec4 newColor = vec4(1);
						  `
						: `	float colorId = fract(12.81*windowId)+vApartmentId-1.0;
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
		
	} // ApartmentBuildings.material
	
	
	
	static generate( apartments, doors )
	{
		// in safe mode no apartment buildings are generated
		if( SAFE_MODE ) return;
		
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

				// is building too small
				if( dX < APARTMENT_BUILDING_WIDTH.min ) return;
				
				var maxFloors = 2+MAX_APARTMENT_BUILDING_FLOORS*blocks.apartments[i].height,
					floors = Math.max(2,Math.round( THREE.Math.randFloat(maxFloors/2,maxFloors) )),
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

				// is building too small
				if( dZ < APARTMENT_BUILDING_WIDTH.min ) return;

				var maxFloors = 2+MAX_APARTMENT_BUILDING_FLOORS*blocks.apartments[i].height,
					floors = Math.max(2,Math.round( THREE.Math.randFloat(maxFloors/2,maxFloors) )),
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
							midZ( d, a, fromZ+(s+1)*sliceSize ),
							midZ( c, b, fromZ+(s+1)*sliceSize ),
							midZ( c, b, fromZ+s*sliceSize ),
							midZ( d, a, fromZ+s*sliceSize )
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
							midX( a, b, fromX+s*sliceSize ),
							midX( a, b, fromX+(s+1)*sliceSize ),
							midX( d, c, fromX+(s+1)*sliceSize ),
							midX( d, c, fromX+s*sliceSize )
						);
					}
				}
			}
			
		} // for i in blocks.apartments
		
	} // ApartmentBuildings.generate


	
	static image( apartments )
	{
		// in safe mode no apartment buildings are generated
		if( SAFE_MODE ) return;
		
		// no buildings if they are fully transparent
		if( DEBUG_BUILDINGS_OPACITY < 0.01 ) return;

		var instances = apartments.length;
		
		var geometry  = ApartmentBuildings.geometry(),
			material  = ApartmentBuildings.material(),
			mesh = new THREE.InstancedMesh( geometry, material, instances );

		// every office building has own grayish color
		var colors = [];
		for( var i=0; i<instances; i++)
		{
			if( DEBUG_ALL_WHITE )
				colors.push( 1, 1, 1 )
			else
			{
				var intensity = Math.pow( THREE.Math.randFloat(0,1), 1/4 );
				colors.push( intensity, intensity, 0.9*intensity );
			}
		}
		var colorAttribute = new THREE.InstancedBufferAttribute( new Float32Array(colors), 3, false, 1 );
		geometry.setAttribute( 'color', colorAttribute );

		var id = [];
		for( var i=0; i<instances; i++ ) id.push( Math.random() );
		geometry.setAttribute(
			'apartmentId',
			new THREE.InstancedBufferAttribute(new Float32Array(id), 1, false, 1));
		
		// create an apartment building matrix
		var matrix = new THREE.Matrix4();
		for( var i=0; i<instances; i++ )
		{
			matrix.makeScale( apartments[i].size.x, apartments[i].height, apartments[i].size.z );
			matrix.setPosition( apartments[i].center.x, 0, apartments[i].center.z );

			mesh.setMatrixAt( i, matrix );
		}

		mesh.receiveShadow = true;
		//mesh.castShadow = true;
		//mesh.position.y = 0;

		scene.add( mesh );

		if( SHADOWS != NO_SHADOWS )
		{
			var geometry  = ApartmentBuildings.geometry(),
				material  = new THREE.MeshBasicMaterial({
					side: THREE.BackSide,
					//color: 'crimson',
					transparent: true,
					opacity: 0,
					depthWrite: false,
				}),
				shadowMesh = new THREE.InstancedMesh( geometry, material, instances );
			for( var i=0; i<instances; i++ )
			{
				matrix.makeScale( apartments[i].size.x-1, apartments[i].height-0.1, apartments[i].size.z-1 );
				matrix.setPosition( apartments[i].center.x, -1, apartments[i].center.z );
				shadowMesh.setMatrixAt( i, matrix );
			}
			shadowMesh.castShadow = true;
			scene.add( shadowMesh );
		}
		
		return mesh;
		
	} // ApartmentBuildings.image
	
	
	
} // ApartmentBuildings
