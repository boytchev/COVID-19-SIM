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


// seed = 	
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
// time for houses						 3.271s
//							------	---- -----
//							238323	8280  5883



import * as THREE from '../js/three.module.js';
import {HouseSidewalks, HouseSidewalk, HouseSidewalkPath} from './houseSidewalks.js';
import {blocks, navmesh, textures, scene} from '../main.js';
import {round, Pos} from '../core.js';
import {pick} from '../coreNav.js';
import {CARTOON_STYLE, SIDEWALK_WIDTH, HOUSE_BOUNDING_RADIUS, FLOOR_HEIGHT, DEBUG_HIDE_ROOFS, SHADOWS, NO_SHADOWS, DEBUG_ALL_WHITE, DEBUG_BUILDINGS_OPACITY, SAFE_MODE} from '../config.js';
import * as Factory from './houseBuildingsFactory.js';



export class HouseBuilding
{
	
	constructor( id, center, facing )
	{
		this.sysType = 'HouseBuilding';
		this.id = id;

		this.floorsA = THREE.Math.randInt( 1, 2 );				// floors of wing A
		this.floorsB = THREE.Math.randInt( 1, 3-this.floorsA ); // floors of wing B
		
		center.x = round( center.x, 1 );
		center.z = round( center.z, 1 );

		this.center = center; // center of the whole house
		this.factory = Factory.get( facing ); // position in factory is relative to house center
		this.streetPos = center.clone();

		this.zoneA = undefined;
		this.zoneB = undefined;
		
	} // HouseBuilding.constructor
	
	
	randomPos( )
	{
		if( Math.random() > 0.5 )
			return this.randomPosA( );
		else
			return this.randomPosB( );
		
	} // HouseBuilding.randomPos
	
	
	randomPosA( )
	{
		return this.zoneA.randomPos();
	} // HouseBuilding.randomPosA
	
	
	randomPosB( )
	{
		return this.zoneB.randomPos();
	} // HouseBuilding.randomPosB
	
	
	// random pos inside the intersection of wingA and wingB
	randomPosAB( )
	{
		var x = THREE.Math.randFloat( 
					Math.max(this.zoneA.xRange.min,this.zoneB.xRange.min),
					Math.min(this.zoneA.xRange.max,this.zoneB.xRange.max) );
		var z = THREE.Math.randFloat( 
					Math.max(this.zoneA.zRange.min,this.zoneB.zRange.min),
					Math.min(this.zoneA.zRange.max,this.zoneB.zRange.max) );
		return new Pos(x,z,this.center.block);
		
	} // HouseBuilding.randomPos

	
	occupied( pos )
	{
		// check whether the position is forbidden for planting a tree
	
		if( this.zoneA.isInside(pos, 2) ) return true; // no tree allowed
		if( this.zoneB.isInside(pos, 2) ) return true; // no tree allowed
		/*** to do if( this.path.isInside(pos, -2) ) return true; // no tree allowed
		***/
		
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
				//shadowSide: THREE.DoubleSide,
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
					
					gl_FragColor += float(${DEBUG_BUILDINGS_OPACITY})*isWindow*(1.0-windowId)*newColor*uLampsIntensity;
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
		// in safe mode no house buildings are generated
		if( SAFE_MODE ) return;
		
		for( var i=0; i<blocks.houses.length; i++ )
		{
			var block = blocks.houses[i];
			
			function addHouse( pos, facings )
			{	
				pos.block = block;
				var facing = pick(facings);
				var house = new HouseBuilding( houses.length, pos, facing );
				
				block.buildings.push( house ); // block's list of houses
				houses.push( house ); // global list of all houses
				
				// sidewalks and path to the street
				sidewalks.push( new HouseSidewalk( house.center.add(house.factory.posA), house.factory.sizeA ) );
				sidewalks.push( new HouseSidewalk( house.center.add(house.factory.posB), house.factory.sizeB ) );
				sidewalks.push( new HouseSidewalkPath( house, facing ) );

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
		// in safe mode no house buildings are generated
		if( SAFE_MODE ) return;
		
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
			matrix.makeScale( house.factory.sizeA.x, house.floorsA*FLOOR_HEIGHT, house.factory.sizeA.z );
			matrix.setPosition( house.center.x+house.factory.posA.x, 0, house.center.z+house.factory.posA.z );
			mesh.setMatrixAt( i, matrix );
			
			// wing B
			matrix.makeScale( house.factory.sizeB.x, house.floorsB*FLOOR_HEIGHT, house.factory.sizeB.z );
			matrix.setPosition( house.center.x+house.factory.posB.x, 0, house.center.z+house.factory.posB.z );
			mesh.setMatrixAt( i+1, matrix );
		}

		mesh.visible = DEBUG_BUILDINGS_OPACITY > 0.01;

		mesh.receiveShadow = true;
		mesh.castShadow = true;
		//mesh.position.y = 2;
		
		scene.add( mesh );
		/*** maybe unused?
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
				matrix.makeScale( house.factory.sizeA.x-0.2, house.floorsA*FLOOR_HEIGHT-0.1, house.factory.sizeA.z-0.2 );
				matrix.setPosition( house.center.x+house.factory.posA.x, -0.1, house.center.z+house.factory.posA.z );
				shadowMesh.setMatrixAt( i, matrix );
				
				// wing B
				matrix.makeScale( house.factory.sizeB.x-0.2, house.floorsB*FLOOR_HEIGHT-0.1, house.factory.sizeB.z-0.2 );
				matrix.setPosition( house.center.x+house.factory.posB.x, -0.1, house.center.z+house.factory.posB.z );
				shadowMesh.setMatrixAt( i+1, matrix );
			}
			shadowMesh.castShadow = true;
			//scene.add( shadowMesh );
		} ***/
		
		HouseSidewalks.image( sidewalks );

		return mesh;
		
	} // HouseBuildings.image

	
	
} // HouseBuildings
