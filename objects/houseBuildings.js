//
//	class HouseDoor
//		constructor( center, rotation )
//		randomPos( )
//		isInside( position )
//
//	class HouseWing
//		constructor( center, size, floors )
//		randomPos( )
//		isInside( position, margin )
//
//	class HouseBuilding
//		constructor( wingA, wingB, facing, block )
//		randomPos( )
//		randomPosAB( )
//		occupied( pos )
//
//	class HouseBuildings
//		static geometry( )
//		static material( )
//		static generate( houses )
//		static image( houses )
//
//
// navigational info:
//
//		house.doors[].ringIndex -- in the house ring
//		house.path.ringIndex -- in the house ring
//		house.ringIndex -- in the block ring


// seed = 60944
// ground size = 5000
// people = 5000
//											1door/house
//					 size	count	  kB	kB
//                  ------	------	----
// HouseBuilding	 	48	 27238	1307  1307
// HouseDoor			32	102133	3268   872
// HouseWing		 	28	 54476	1525  1525
// NavMeshHouseZone	 	36	 27238	 981   981
// HouseSidewalkPath 	44	 27238	1198  1198
// NavMeshRectZone			108953		  3922
//							------	---- -----
//							238323	8280  5883



import * as THREE from '../js/three.module.js';
import {HouseSidewalks, HouseSidewalk, HouseSidewalkPath} from './houseSidewalks.js';
import {blocks, navmesh, textures, scene} from '../main.js';
import {round, Pos, Size, RectZone} from '../core.js';
import {pick} from '../coreNav.js';
import {CARTOON_STYLE, SIDEWALK_WIDTH, HOUSE_BOUNDING_RADIUS, FLOOR_HEIGHT, DEBUG_HIDE_ROOFS, SHADOWS, NO_SHADOWS, DEBUG_ALL_WHITE, DEBUG_BUILDINGS_OPACITY} from '../config.js';


class HouseDoor
{

	constructor( center, rotation )
	{
		//this.sysType = 'HouseDoor';
		
		this.center = center;
		this.rotation = rotation;
		
		this.outsideZone = undefined;
		this.insideZone = undefined;
		
	} // HouseDoor.constructor
	
} // HouseDoor



class HouseWing
{
	
	constructor( center, size, floors )
	{
		
		//this.sysType = 'HouseWing';
		
		this.size = size;
		this.floors = floors;
		this.zone = new RectZone( center, size );
	} // HouseWing.constructor
	
	
		
	get doors( )
	{
		switch( 10*this.size.x + this.size.z )
		{
			case 44:
				return [
					new HouseDoor( this.center.addXZ(1,2), 0 ) 
				];
			case 48:
				return [
					new HouseDoor( this.center.addXZ(1,4), 0 ),
					new HouseDoor( this.center.addXZ(2,-3), 1 ),
					new HouseDoor( this.center.addXZ(-2,3), 3 )
				];
			case 84:
				return [
					new HouseDoor( this.center.addXZ(1,2), 0 ),
					new HouseDoor( this.center.addXZ(-3,-2), 2 )
				];
			case 88:
				return [
					new HouseDoor( this.center.addXZ(1,4), 0 ),
					new HouseDoor( this.center.addXZ(4,-3), 1 ),
					new HouseDoor( this.center.addXZ(-4,3), 3 ),
					new HouseDoor( this.center.addXZ(-3,-4), 2 )
				];
			default:
				console.error( 'Unhandled situation with doors of a house wing.', this );
		}
	} // HouseWing.doors
		
	
	
	
	get height( )
	{
		return this.floors * FLOOR_HEIGHT;
	}


	get center( )
	{
		return this.zone.center;
	}


	randomPos( )
	{
		return this.insideZone.randomPos( );
		
	} // HouseWing.randomPos
	

	
	isInside( position, margin = 0 )
	{
		return this.zone.xRange.inside( position.x, margin ) && this.zone.zRange.inside( position.z, margin );
				
	} // HouseWing.isInside

} // HouseWing




export class HouseBuilding
{
	
	constructor( wingA, wingB, facing, block )
	{
		this.sysType = 'HouseBuilding';
		this.id = undefined; //set in HouseBuildings.generate()
		
		this.wingA = wingA;
		this.wingB = wingB;

		this.facing = facing;
		
		this.block = block;
		
		this.door = undefined;
		this.ring = [ ];

		// remove doors from wingA that are inside wingB
		var doors = [];
		var wingDoors = wingA.doors;
		for( var i=wingDoors.length-1; i>=0; i-- )
			if( !wingB.isInside( wingDoors[i].center ) )
				doors.push( wingDoors[i] );
		
		wingDoors = wingB.doors;
		// remove doors from wingB that are inside wingA
		for( var i=wingDoors.length-1; i>=0; i-- )
			if( !wingA.isInside( wingDoors[i].center ) )
				doors.push( wingDoors[i] );
			
		// house facing
		//
		//       Z+
		//	 	 1	
		//	X- 2   0 X+
		//       3
		//       Z-
		var idx = 0;
		switch( facing )
		{
			case 0: // X+
				for( var i=1; i<doors.length; i++ )
					if( doors[i].center.x > doors[idx].center.x )
						idx = i;
				break;
			case 1: // Z+
				for( var i=1; i<doors.length; i++ )
					if( doors[i].center.z > doors[idx].center.z )
						idx = i;
				break;
			case 2: // X-
				for( var i=1; i<doors.length; i++ )
					if( doors[i].center.x < doors[idx].center.x )
						idx = i;
				break;
			case 3: // Z-
				for( var i=1; i<doors.length; i++ )
					if( doors[i].center.z < doors[idx].center.z )
						idx = i;
				break;
		}
		
		this.door = doors[idx];
		
		// prepare ring		
		var pos,
			size = new Size(1,1),
			zoneA = wingA.zone.shrink(-0.5),
			zoneB = wingB.zone.shrink(-0.5);

		var x = [zoneA.minX(),zoneA.maxX(),zoneB.minX(),zoneB.maxX()];
		var z = [zoneA.minZ(),zoneA.maxZ(),zoneB.minZ(),zoneB.maxZ()];

		for( var ix=0; ix<4; ix++ )
		for( var iz=0; iz<4; iz++ )
		{
			pos = new Pos(x[ix],z[iz],block);
			if( wingA.isInside(pos) ) continue;
			if( wingB.isInside(pos) ) continue;
			if( !wingA.isInside(pos,-1) && !wingB.isInside(pos,-1) ) continue;
			this.ring.push( new RectZone(pos,size) );
		}

	} // HouseBuilding.constructor
	
	
	
	randomPos( )
	{
		// 50% chance to pick wingA or wingB
		return pick( [this.wingA, this.wingB] ).randomPos( );
		
	} // HouseBuilding.randomPos
	
	
	
	// random pos inside the intersection of wingA and wingB
	randomPosAB( )
	{
		var x = THREE.Math.randFloat( 
					Math.max(this.wingA.insideZone.xRange.min,this.wingB.insideZone.xRange.min),
					Math.min(this.wingA.insideZone.xRange.max,this.wingB.insideZone.xRange.max) );
		var z = THREE.Math.randFloat( 
					Math.max(this.wingA.insideZone.zRange.min,this.wingB.insideZone.zRange.min),
					Math.min(this.wingA.insideZone.zRange.max,this.wingB.insideZone.zRange.max) );
		return new Pos( x, z, this.block, 0 );
		
	} // HouseWing.randomPos
	

	
	occupied( pos )
	{
		// check whether the position is forbidden for planting a tree
	
		if( this.wingA.isInside(pos, -2) ) return true; // no tree allowed
		if( this.wingB.isInside(pos, -2) ) return true; // no tree allowed
		if( this.path.isInside(pos, -2) ) return true; // no tree allowed
		
		return false; // tree allowed
		
	} // HouseBuilding.occupied
	
} // HouseBuilding



export class HouseBuildings
{
	constructor()
	{
		this.sysType = 'HouseBuildings';
	}
	
	static geometry()
	{
		var geometry = new THREE.InstancedBufferGeometry();

		// x,y,z, nx,ny,nz, u,v
		var R0=0.0,	// roof from V
			R1=0.1, // roof to V
			W0=0.0, // wall from V
			W1=1.0, // wall to V
			H0=-0.5, // wall from U
			H1=0.5, // wall to U
			HH0=H0+1, // hidden wall from U
			HH1=H1+1; // hidden wall to U
			
		var RH=1.4, // roof height
			RW=0.5; // roof extended X and Z coordinates
			
		var RY=1; // vertical position of roof edge
		
		var data = [];
		if( !DEBUG_HIDE_ROOFS )
		{
			data.push(
				// Top-left (from Y+ X-) triangluar
				-RW,  RY, -RW,		-1, 1/2, 0,		 0,  R0,
				-RW,  RY,  RW,		-1, 1/2, 0,		 1,  R0,
				-1/3, RH,  0,		-1, 1/2, 0,		1/2, R1,
				// Top-right (from Y+ X+) triangular
				  RW,  RY,  RW,		1, 1/2, 0,		 0,  R0,
				  RW,  RY, -RW,		1, 1/2, 0,		 1,  R0,
				 1/3, RH,  0,		1, 1/2, 0,		1/2, R1,
				 
				// Top-back (from Y+ Z-) quadrilateral
				 RW,  RY, -RW,		0, 1/2, -1,		 0,  R0,
				-RW,  RY, -RW,		0, 1/2, -1,		 1,  R0,
				 1/3, RH,  0,		0, 1/2, -1,		1/6, R1,
				-RW,  RY, -RW,		0, 1/2, -1,		 1,  R0,
				-1/3, RH,  0,		0, 1/2, -1,		5/6, R1,
				 1/3, RH,  0,		0, 1/2, -1,		1/6, R1,

				// Top-back (from Y+ Z+) quadrilateral
				-RW,  RY, RW,		0, 1/2, 1,		 0,  R0,
				 RW,  RY, RW,		0, 1/2, 1,		 1,  R0,
				 1/3, RH, 0,		0, 1/2, 1,		5/6, R1,
				-RW,  RY, RW,		0, 1/2, 1,		 0,  R0,
				 1/3, RH, 0,		0, 1/2, 1,		5/6, R1,
				-1/3, RH, 0,		0, 1/2, 1,		1/6, R1,
				
				// Bottom of roof
				-RW,  RY, -RW,		0, 0, 0, 		0, 0,
				 RW,  RY,  RW,		0, 0, 0, 		0, 0,
				-RW,  RY,  RW,		0, 0, 0, 		0, 0,

				-RW,  RY, -RW,		0, 0, 0, 		0, 0,
				 RW,  RY, -RW,		0, 0, 0, 		0, 0,
				 RW,  RY,  RW,		0, 0, 0, 		0, 0,
			);
		}

		data.push(
			 // Front (from Z+) 
			 -1/2, 1,  1/2,		0, 0, 1,	H0, W1,
			 -1/2, 0,  1/2,		0, 0, 1, 	H0, W0,
			  1/2, 0,  1/2, 	0, 0, 1, 	H1, W0, 
			 -1/2, 1,  1/2,		0, 0, 1,	H0, W1,
			  1/2, 0,  1/2, 	0, 0, 1, 	H1, W0, 
			  1/2, 1,  1/2,		0, 0, 1, 	H1, W1,
			  
			 // Back (from Z-) 
			 -1/2, 1, -1/2,		0, 0,-1,	HH1, W1,
			  1/2, 0, -1/2, 	0, 0,-1, 	HH0, W0, 
			 -1/2, 0, -1/2,		0, 0,-1, 	HH1, W0,
			 -1/2, 1, -1/2,		0, 0,-1,	HH1, W1,
			  1/2, 1, -1/2,		0, 0,-1, 	HH0, W1,
			  1/2, 0, -1/2, 	0, 0,-1, 	HH0, W0, 
			  
			 // Right (from X+) 
			  1/2, 1,  1/2,		1, 0, 0,	HH0, W1,
			  1/2, 0,  1/2,		1, 0, 0, 	HH0, W0,
			  1/2, 0, -1/2, 	1, 0, 0, 	HH1, W0, 
			  1/2, 1,  1/2,		1, 0, 0,	HH0, W1,
			  1/2, 0, -1/2, 	1, 0, 0, 	HH1, W0, 
			  1/2, 1, -1/2,		1, 0, 0, 	HH1, W1,
			  
			 // Left (from X-) 
			 -1/2, 1,  1/2,		-1, 0, 0,	HH1, W1,
			 -1/2, 0, -1/2, 	-1, 0, 0, 	HH0, W0, 
			 -1/2, 0,  1/2,		-1, 0, 0, 	HH1, W0,
			 -1/2, 1,  1/2,		-1, 0, 0,	HH1, W1,
			 -1/2, 1, -1/2,		-1, 0, 0, 	HH0, W1,
			 -1/2, 0, -1/2, 	-1, 0, 0, 	HH0, W0,
		);
		
		if( SHADOWS != NO_SHADOWS && false )
		{
			data.push(
				 // Bottom (from Y-)
				 -1/2, 0.05, -1/2,		0, 1, 0,	0, 0,
				  1/2, 0.05,  1/2,		0, 1, 0,	0, 0,
				 -1/2, 0.05,  1/2,		0, 1, 0,	0, 0,

				 -1/2, 0.05, -1/2,		0, 1, 0,	0, 0,
				  1/2, 0.05, -1/2,		0, 1, 0,	0, 0,
				  1/2, 0.05,  1/2,		0, 1, 0,	0, 0,
				 // Bottom (from Y-)
				 -1/2, 0.1, -1/2,		0, 1, 0,	0, 0,
				  1/2, 0.1,  1/2,		0, 1, 0,	0, 0,
				 -1/2, 0.1,  1/2,		0, 1, 0,	0, 0,

				 -1/2, 0.1, -1/2,		0, 1, 0,	0, 0,
				  1/2, 0.1, -1/2,		0, 1, 0,	0, 0,
				  1/2, 0.1,  1/2,		0, 1, 0,	0, 0,
				 // Bottom (from Y-)
				 -1/2, 0.0, -1/2,		0, 1, 0,	0, 0,
				  1/2, 0.0,  1/2,		0, 1, 0,	0, 0,
				 -1/2, 0.0,  1/2,		0, 1, 0,	0, 0,

				 -1/2, 0.0, -1/2,		0, 1, 0,	0, 0,
				  1/2, 0.0, -1/2,		0, 1, 0,	0, 0,
				  1/2, 0.0,  1/2,		0, 1, 0,	0, 0,
			);
		}
		
		var vertexBuffer = new THREE.InterleavedBuffer( new Float32Array(data), 8);
	
		var positions = new THREE.InterleavedBufferAttribute( vertexBuffer, 3/*values*/, 0/*offset*/ );
		var normals   = new THREE.InterleavedBufferAttribute( vertexBuffer, 3/*values*/, 3/*offset*/ );
		var uvs       = new THREE.InterleavedBufferAttribute( vertexBuffer, 2/*values*/, 6/*offset*/ );
		
		geometry.setAttribute( 'normal', normals);
		geometry.setAttribute( 'position', positions );
		geometry.setAttribute( 'uv', uvs);
		geometry.setAttribute( 'uv2', uvs);
		
		return geometry;
		
	} // HouseBuildings.geometry



	static material()
	{
		var material = new THREE.MeshPhongMaterial({
				color: DEBUG_ALL_WHITE?'white':'cornsilk',
				//emissive: 'white',
				//emissiveIntensity: DEBUG_ALL_WHITE?0.2:0,
				shininess: DEBUG_ALL_WHITE?0:1,
				vertexColors: true,
				flatShading: true,
				map: textures.house.map(),
				bumpMap: textures.houseBump.map(),
				bumpScale: DEBUG_ALL_WHITE?0.1:1,
				side: DEBUG_HIDE_ROOFS?THREE.DoubleSide:THREE.FrontSide,
				transparent: DEBUG_BUILDINGS_OPACITY<0.9,
				opacity:     DEBUG_BUILDINGS_OPACITY,
				depthWrite:  DEBUG_BUILDINGS_OPACITY>0.9,
			});

		if( CARTOON_STYLE )
		{
			material.specular = new THREE.Color( 10, 10, 10 );
		}
		
		// inject GLSL code to fix the height of the roof
		material.onBeforeCompile = shader => {
			//console.log(shader.vertexShader);
			//console.log(shader.fragmentShader);

			material.userData.shader = shader;

			shader.uniforms.uTime = { value: 0.0 };
			shader.uniforms.uLamps = { value: 0.0 };
			shader.uniforms.uLampsIntensity = { value: 0.0 };

			shader.vertexShader =
				shader.vertexShader.replace(
					'#include <project_vertex>',

					//'#include <project_vertex>\n'+
					'vec4 mvPosition = vec4( transformed, 1.0 );\n'+
					'if (mvPosition.y>1.1)\n'+
					'{\n'+
					'	mvPosition.y = 3.0*(mvPosition.y-1.0)/instanceMatrix[1][1]+1.0;\n'+
					'}\n'+
					'mvPosition = instanceMatrix * mvPosition;\n'+
					'mvPosition = modelViewMatrix * mvPosition;\n'+
					'gl_Position = projectionMatrix * mvPosition;\n'+
					''
				);

			shader.vertexShader =
				shader.vertexShader.replace(
					'void main() {\n',
					
					'vec2 textureOffset = vec2(1.0);\n'+
					'vec2 textureScale;\n'+
					'attribute float houseId;\n'+
					'varying float vHouseId;\n'+
					'void main() {\n'+
					'	vHouseId = houseId;\n'+
					'	if (normal.y<0.1)\n'+
					'	{\n'+ // texture of walls
					'		textureScale.x = (abs(normal.x)<0.5) ? instanceMatrix[0][0]/10.0 : instanceMatrix[2][2]/10.0;\n'+
					'		textureScale.y = 0.45*instanceMatrix[1][1]/2.5;\n'+
					'		textureOffset.x = 0.0;\n'+
					'		textureOffset.y = 0.08;\n'+
					'	} else {\n'+ // texture of house roof
					'		textureScale.x = (abs(normal.x)<0.5) ? instanceMatrix[0][0]/3.0 : instanceMatrix[2][2]/3.0;\n'+
					'		textureScale.y = 0.9;\n'+
					'	}\n'+
					''
				);

			shader.vertexShader =
				shader.vertexShader.replace(
					'#include <uv_vertex>',
					
					'vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n'+
					'vUv = vUv*textureScale+textureOffset;\n'+
					''
				);
			shader.fragmentShader =
				shader.fragmentShader.replace(
					'void main() {\n',
					
					`
					  uniform float uTime;
					  uniform float uLamps;
					  uniform float uLampsIntensity;
					  varying float vHouseId;
					  float isWindow;
					  void main() {
					`
				);

			shader.fragmentShader =
				shader.fragmentShader.replace(
				  '#include <map_fragment>',
				  
				  `
					vec4 texelColor = texture2D( map, vUv );
				    texelColor = mapTexelToLinear( texelColor );
					isWindow = pow(texelColor.b,2.0);
					texelColor = vec4(texelColor.r,texelColor.g,texelColor.g,1);
				    diffuseColor *= texelColor;
				  `
				);
						
			shader.fragmentShader =
				shader.fragmentShader.replace(
				  '#include <dithering_fragment>',

					// make windows color
					// (x,y) - int coordinates of window
				  `
					#include <dithering_fragment>
					
					float x = floor(5.0*vUv.x);
					float y = floor(2.0*vUv.y);
					
					float windowId = (fract(5.0*cos(x+y*y)+vHouseId)+fract(7.0*sin(y+x*x+5.0*vHouseId)*(x+1.0))+0.02*sin(uTime*y/300.0+x+y+13.0*vHouseId))/2.0;
				  `	
				    +(CARTOON_STYLE
						? `	vec4 newColor = vec4(1);
						  `
						: `	float colorId = fract(12.81*windowId)+vHouseId-1.0;
							vec4 newColor = vec4(1.0-0.2*colorId, 1.1-0.3*fract(1.0/colorId), 1.1+0.4*colorId, 1.0);
						  `	
					)+	
				  `
					float k = windowId < uLamps ? 1.0 : 0.0;
					
					isWindow *= k;
					
					gl_FragColor += isWindow*(1.0-windowId)*newColor*uLampsIntensity;
				  `	
				    +(!CARTOON_STYLE
						? ``
						: `	float bw = smoothstep(0.6, 0.7, gl_FragColor.g);
							gl_FragColor = vec4(bw,bw,bw,1.0);
						  `	
					)
				);				
			//console.log(shader.vertexShader);
		} // material.onBeforeCompile
		
		return material;
		
	} // HouseBuildings.material
	
	
	
	static generate( houses, sidewalks )
	{

		for( var i=0; i<blocks.houses.length; i++ )
		{
			var block = blocks.houses[i];
			//block.walkingAreas = [];
			
			function addHouse( pos, facings )
			{	// add a pair of two houses

				// locations
				var x1 = round( pos.x, 1 ),
					z1 = round( pos.z, 1 ),
					x2 = round( pos.x+2*THREE.Math.randInt(-1,1), 1 ),
					z2 = round( pos.z+2*THREE.Math.randInt(-1,1), 1 );
					
				// sizes
				// 2021.08.22: HOUSE_BOUNDING_RADIUS replaced by 6, because the house
				// wing sizes must be 4 or 8. This size (see 44, 48, 84 & 88) is important
				// for wing placement
				var sx1 = round( THREE.Math.randInt( 3, 2*6/*HOUSE_BOUNDING_RADIUS*/-4 ), 4),
					sz1 = round( THREE.Math.randInt( 3, 2*6/*HOUSE_BOUNDING_RADIUS*/-4 ), 4),
					sx2 = round( THREE.Math.randInt( 3, 2*6/*HOUSE_BOUNDING_RADIUS*/-4 ), 4),
					sz2 = round( THREE.Math.randInt( 3, 2*6/*HOUSE_BOUNDING_RADIUS*/-4 ), 4);

				// if there are matching X walls move the first house in the opposite direction
				var dMin = (x1-sx1/2)-(x2-sx2/2),
					dMax = (x1+sx1/2)-(x2+sx2/2);
				if( dMin*dMax==0 )
				{
					x1 += Math.sign(dMin+dMax);
					x2 -= Math.sign(dMin+dMax);
					if( dMin==dMax ) x1++, x2--; // no opposite direction, just move
				}

				// if there are matching Z walls move the first house in the opposite direction
				var dMin = (z1-sz1/2)-(z2-sz2/2),
					dMax = (z1+sz1/2)-(z2+sz2/2);
				if( dMin*dMax==0 )
				{
					z1 += Math.sign(dMin+dMax);
					z2 -= Math.sign(dMin+dMax);
					if( dMin==dMax ) z1++,z2--; // no opposite direction, just move
				}
				
				var floors1 = THREE.Math.randInt( 1, 2 ),
					floors2 = THREE.Math.randInt( 1, 3-floors1 );
				
				// pack the house
				var wingA = new HouseWing( new Pos(x1,z1,block), new Size(sx1,sz1), floors1 );
				var wingB = new HouseWing( new Pos(x2,z2,block), new Size(sx2,sz2), floors2 );
				
				var house = new HouseBuilding( wingA, wingB, pick(facings), block );
				house.id = houses.length;
				
				block.buildings.push( house );
				houses.push( house ); // global list of all houses
				
				// sidewalks and path to the street
				sidewalks.push( new HouseSidewalk( /*block,*/ wingA ) );
				sidewalks.push( new HouseSidewalk( /*block,*/ wingB ) );
				sidewalks.push( new HouseSidewalkPath( /*block,*/ house/*, facing*/ ) );

				navmesh.addHouse( house );		
			} // HouseBuildings.generate.addHouse
			
			
			function addHousesBetween( a, b, facing )
			{
				// estimate number of houses
				var n = Math.round( a.distanceTo( b )/(2*HOUSE_BOUNDING_RADIUS) );
				
				// skip the first and the last house, they are added explcitly
				for (var i=1; i<n-1; i++)
					addHouse( a.midPointTo(b,i/(n-1)), facing );
			}

			var houseZone = block.zone.shrink( SIDEWALK_WIDTH + HOUSE_BOUNDING_RADIUS + 3 );
						
			// skip this block if it is too small
			if( houseZone.dX() < HOUSE_BOUNDING_RADIUS 
				|| houseZone.dZ() < HOUSE_BOUNDING_RADIUS ) continue;

			var a = houseZone.a,
				b = houseZone.b,
				c = houseZone.c,
				d = houseZone.d;
			
/*			// skip this block if it is too small
			if( a.distanceTo(b) < HOUSE_BOUNDING_RADIUS 
				|| b.distanceTo(c) < HOUSE_BOUNDING_RADIUS 
				|| c.distanceTo(d) < HOUSE_BOUNDING_RADIUS 
				|| d.distanceTo(a) < HOUSE_BOUNDING_RADIUS ) continue;
*/			
			if(	(a.distanceTo(b) < 2*HOUSE_BOUNDING_RADIUS) ||
				(c.distanceTo(d) < 2*HOUSE_BOUNDING_RADIUS) )
			{ // vertical line of houses
				a = a.midPointTo( b ); 
				d = d.midPointTo( c ); 
				
				if(	a.distanceTo(d) < 2*HOUSE_BOUNDING_RADIUS )
					addHouse( a.midPointTo(d), [0,1,2,3] );
				else
				{
					addHouse( a, [0,1,2] );
					addHouse( d, [2,3,0] );

					addHousesBetween( a, d, [0,2] );
				}
			}
			else
			if(	(a.distanceTo(d) < 2*HOUSE_BOUNDING_RADIUS) ||
				(b.distanceTo(c) < 2*HOUSE_BOUNDING_RADIUS) )
			{ // horizontal line of houses
				a = a.midPointTo( d ); 
				b = b.midPointTo( c ); 
				
				if(	a.distanceTo(b) < 2*HOUSE_BOUNDING_RADIUS )
					addHouse( a.midPointTo(b), [0,1,2,3] );
				else
				{
					addHouse( a, [1,2,3] );
					addHouse( b, [0,1,3] );

					addHousesBetween( a, b, [1,3] );
				}
			}
			else
			{	// a hollow matrix of houses
				addHouse( a, [1,2] );
				addHouse( b, [0,1] );
				addHouse( c, [0,3] );
				addHouse( d, [2,3] );

				addHousesBetween( a, b, [1] );
				addHousesBetween( b, c, [0] );
				addHousesBetween( c, d, [3] );
				addHousesBetween( d, a, [2] );
			}
			
		}
		
	} // HouseBuildings.generate
	
	
	
	static image( houses, sidewalks )
	{
		
		var instances = 2*houses.length; // two wings in a house

		var geometry  = HouseBuildings.geometry(),
			material  = HouseBuildings.material(),
			mesh = new THREE.InstancedMesh( geometry, material, instances );
			
		// every house building has own grayish color
		var colors = [],
			colorR, colorG, colorB;
		for( var i=0; i<instances; i++)
		{
			if( (i%2)==0 )
			{
				colorR = DEBUG_ALL_WHITE?1:THREE.Math.randFloat(0.8,1.00);
				colorG = DEBUG_ALL_WHITE?1:THREE.Math.randFloat(0.8,1.00);
				colorB = DEBUG_ALL_WHITE?1:THREE.Math.randFloat(0.8,1.00);
			}
			colors.push( colorR, colorG, colorB );
		}
		var colorAttribute = new THREE.InstancedBufferAttribute( new Float32Array(colors), 3, false, 1 );
		geometry.setAttribute( 'color', colorAttribute );
		
		var id = [];
		for( var i=0; i<instances; i++ ) id.push( Math.random() );
		geometry.setAttribute(
			'houseId',
			new THREE.InstancedBufferAttribute(new Float32Array(id), 1, false, 1));
		
		// create a house building matrix
		var matrix = new THREE.Matrix4();
		for( var i=0, h=0; i<instances; i+=2, h++ )
		{
			var house = houses[h];
			
			// wing A
			matrix.makeScale( house.wingA.size.x, house.wingA.height, house.wingA.size.z );
			matrix.setPosition( house.wingA.center.x, 0, house.wingA.center.z );
			mesh.setMatrixAt( i, matrix );
			
			// wing B
			matrix.makeScale( house.wingB.size.x, house.wingB.height, house.wingB.size.z );
			matrix.setPosition( house.wingB.center.x, 0, house.wingB.center.z );
			mesh.setMatrixAt( i+1, matrix );
		}

		mesh.receiveShadow = true;
		mesh.castShadow = true;
		//mesh.position.y = 2;
		
		scene.add( mesh );
		
		if( SHADOWS != NO_SHADOWS )
		{
			var geometry  = HouseBuildings.geometry(),
				material  = new THREE.MeshBasicMaterial({
					side: THREE.BackSide,
					color: 'black',
					transparent: true,
					opacity: 0,
				}),
				shadowMesh = new THREE.InstancedMesh( geometry, material, instances );
			for( var i=0, h=0; i<instances; i+=2, h++ )
			{
				var house = houses[h];
				
				// wing A
				matrix.makeScale( house.wingA.size.x-0.2, house.wingA.height-0.1, house.wingA.size.z-0.2 );
				matrix.setPosition( house.wingA.center.x, -0.1, house.wingA.center.z );
				shadowMesh.setMatrixAt( i, matrix );
				
				// wing B
				matrix.makeScale( house.wingB.size.x-0.2, house.wingB.height-0.1, house.wingB.size.z-0.2 );
				matrix.setPosition( house.wingB.center.x, -0.1, house.wingB.center.z );
				shadowMesh.setMatrixAt( i+1, matrix );
			}
			shadowMesh.castShadow = true;
			//scene.add( shadowMesh );
		}
		
		HouseSidewalks.image( sidewalks );

		return mesh;
		
	} // HouseBuildings.image

	
	
} // HouseBuildings
