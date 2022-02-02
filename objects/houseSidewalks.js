//
//	class HouseSidewalk
//		constructor( houseWing )
//
//	class HouseSidewalkPath
//		constructor( house )
//		isInside( margin )
//
//	class HouseSidewalks
//		static geometry( )
//		static material( )
//		static image( sidewalks )
//


import * as THREE from '../js/three.module.js';
import {SAFE_MODE, SIDEWALK_TEXTURE_SCALE,DEBUG_ALL_WHITE, SIDEWALK_WIDTH, DEBUG_BLOCKS_OPACITY} from '../config.js';
import {RIGHT, TOP, LEFT, BOTTOM, Size} from '../core.js';
import {NatureMaterial} from '../nature/nature.js';
import {textures, scene} from '../main.js';


// sidewalk around a house
export class HouseSidewalk
{
	
	constructor( pos, size )
	{
		this.sysType = 'HouseSidewalk';
		
		this.center = pos;
		this.size = size.shrink( -2 ); // i.e. expand by 2
		
	} // HouseSidewalk.constructor
	
} // HouseSidewalk
	
	
	
// sidewalk from house to street
export class HouseSidewalkPath
{
	// the house's route latest two positions show the direction of the path
	constructor(  house, facing )
	{
		this.sysType = 'HouseSidewalkPath';
		
		var route = house.factory.route,
			lastPos = route[route.length-1];
		
		house.streetPos.x += lastPos.x;
		house.streetPos.z += lastPos.z;
			
		this.center = house.center.add( lastPos );

		var blockZone = house.center.block.zone;

		// build a path from house sidewalk to the street sidewalk
		// also move the last position to reach the street sidewalk
		var length;
		switch( facing )
		{
			case RIGHT:
				length = this.distanceX( blockZone.b, blockZone.c );
				this.size = new Size( length, 1 );
				this.center.x += length/2;
				house.streetPos.x += length;
				break;
			case TOP:
				length = this.distanceZ( blockZone.a, blockZone.b );
				this.size = new Size( 1, length );
				this.center.z += length/2;
				house.streetPos.z += length;
				break;
			case LEFT:
				length = this.distanceX( blockZone.a, blockZone.d );
				this.size = new Size( length, 1 );
				this.center.x -= length/2;
				house.streetPos.x -= length;
				break;
			case BOTTOM:
				length = this.distanceZ( blockZone.d, blockZone.c );
				this.size = new Size( 1, length );
				this.center.z -= length/2;
				house.streetPos.z -= length;
				break;
			default:
				console.error( 'A house without array of possible facings. Should not happen. Code 1608.');
				return;
		}
		house.path = this;

	} // HouseSidewalkPath.constructor
	
	
	
	distanceX( to1, to2 )
	{
		//            (to1)
		//	           /
		//  (from)----+
		//           /
		//        (to2)
		var from = this.center;
		return Math.abs( THREE.Math.mapLinear( from.z, to1.z, to2.z, to1.x-from.x, to2.x-from.x ) ) - SIDEWALK_WIDTH/2;
		
	} // HouseSidewalkPath.distanceX
	
	
	
	distanceZ( to1, to2 )
	{
		//  (to1)
		//       \
		//	      +
		//        |\
		//		  | (to2)
		//        |
		//     (from)
		var from = this.center;
		return Math.abs( THREE.Math.mapLinear( from.x, to1.x, to2.x, to1.z-from.z, to2.z-from.z ) ) - SIDEWALK_WIDTH/2;
		
	} // HouseSidewalkPath.distanceX
	
	
	
	isInside( pos, margin = 0 )
	{
		return (
			this.center.x-this.size.x/2+margin <= pos.x && pos.x <= this.center.x+this.size.x/2-margin &&
			this.center.z-this.size.z/2+margin <= pos.z && pos.z <= this.center.z+this.size.z/2-margin );
	} // HouseSidewalkPath.isInside
	
} // HouseSidewalkPath
	
	
	
export class HouseSidewalks
{
	
	constructor( )
	{
		this.sysType = 'HouseSidewalks';
	} // HouseSidewalks.constructor
	
	

	static geometry()
	{
		var geometry = new THREE.InstancedBufferGeometry();

		// x,y,z, u,v
		
		var vertexBuffer = new THREE.InterleavedBuffer( new Float32Array( [
			// Top (from Y+)
			+0.5, 0, -0.5,		1, 0,	0, 1, 0,
			-0.5, 0, -0.5,		0, 0,	0, 1, 0,
			+0.5, 0, +0.5,		1, 1,	0, 1, 0,
			
			-0.5, 0, -0.5,		0, 0,	0, 1, 0,
			-0.5, 0, +0.5,		0, 1,	0, 1, 0,
			+0.5, 0, +0.5,		1, 1,	0, 1, 0,
		]), 8);
	
		var positions = new THREE.InterleavedBufferAttribute( vertexBuffer, 3/*values*/, 0/*offset*/ );
		var normals   = new THREE.InterleavedBufferAttribute( vertexBuffer, 3/*values*/, 5/*offset*/ );
		var uvs       = new THREE.InterleavedBufferAttribute( vertexBuffer, 2/*values*/, 3/*offset*/ );
		
		geometry.setAttribute( 'position', positions );
		geometry.setAttribute( 'normal', normals );
		geometry.setAttribute( 'uv', uvs);
		
		return geometry;
		
	} // HouseSidewalks.geometry



	static material()
	{
		
		var material = new NatureMaterial({
				color: 'white',
				map: textures.sidewalk.map( 1/SIDEWALK_TEXTURE_SCALE, 1/SIDEWALK_TEXTURE_SCALE ),
				depthTest: false,
				transparent: DEBUG_BLOCKS_OPACITY<1,
				opacity: DEBUG_BLOCKS_OPACITY,
			});

		// inject GLSL code to fix scaling
		material.onBeforeCompile = shader => {
			//console.log(shader.vertexShader);
			//console.log(shader.fragmentShader);

			shader.vertexShader =
				shader.vertexShader.replace(
					'void main() {\n',
					
					'vec2 textureScale = vec2(1.0);\n'+
					'void main() {\n'+
					'	textureScale.x = instanceMatrix[0][0];\n'+
					'	textureScale.y = instanceMatrix[2][2];\n'+
					''
				);

			shader.vertexShader =
				shader.vertexShader.replace(
					'#include <uv_vertex>',
					
					'vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n'+
					'vUv = vUv*textureScale;\n'+
					''
				);
		
			//console.log(shader.vertexShader);
		} // material.onBeforeCompile
		
		return material;
		
	} // HouseSidewalks.material
	
	
	
	
	static image( sidewalks )
	{
		// no images of sidewalks in safe mode
		if( SAFE_MODE ) return;

		var instances = sidewalks.length;
		
		var geometry  = HouseSidewalks.geometry(),
			material  = HouseSidewalks.material(),
			mesh = new THREE.InstancedMesh( geometry, material, instances );
			
		// create a house sidewalk building matrix
		var matrix = new THREE.Matrix4();
		for( var i=0; i<instances; i++ )
		{
			matrix.makeScale( sidewalks[i].size.x, 1, sidewalks[i].size.z );
			matrix.setPosition( sidewalks[i].center.x, 0, sidewalks[i].center.z );

			mesh.setMatrixAt( i, matrix );
		}

		mesh.receiveShadow = true;
		mesh.renderOrder = -80;
		
		scene.add( mesh );
		
	} // HouseSidewalks.image

	
	
} // HouseSidewalks
