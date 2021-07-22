//
//	class Tree
//		constructor( center )
//
//	class Trees
//		geometry( )
//		material( )
//		generate( )
//		image( )
//		occupied( pos, block )
//


import * as THREE from '../js/three.module.js';
import {blocks, scene} from '../main.js';
import {TREE_HOUSES_RATIO, TREE_HEIGHT, TREE_PARK_RATIO, TREE_COMPLEXITY, DEBUG_BUILDINGS_OPACITY, DEBUG_ALL_WHITE} from '../config.js';


class Tree
{
	
	constructor( center )
	{
		this.sysType = 'Tree';

		this.center = center;
		this.height = TREE_HEIGHT.randFloat();
		
	} // Tree.constructor
	
} // Tree
	
	
	
export class Trees
{
	
	constructor( )
	{
		this.sysType = 'Trees';

		this.trees = [];
		
		this.mesh = undefined;
		
		this.generate( );
		
		this.image( );
		
	} // Trees.constructor
	
	

	geometry()
	{
		// start with a cube
		var geometry = new THREE.BoxBufferGeometry( 1, 1, 1, TREE_COMPLEXITY, TREE_COMPLEXITY, TREE_COMPLEXITY );
		
		// expand it to a unit sphere
		var vec = new THREE.Vector3(),
			pos = geometry.getAttribute( 'position' );

		for( var i=0; i<pos.count; i++ )
		{
			vec.x = pos.getX( i );
			vec.y = pos.getY( i );
			vec.z = pos.getZ( i );
			
			vec.normalize();
			
			vec.x = vec.x/2;
			vec.y = vec.y/2+1;
			vec.z = vec.z/2;
			
			if( vec.y < 0.6 )
			{
				vec.x *= 0.4;
				vec.y = 0;
				vec.z *= 0.4;
			}
			
			if( vec.y>=0.6 && vec.y<0.75)
			{
				vec.x *= 0.15;
				vec.z *= 0.15;
			}
			
			pos.setXYZ( i, vec.x, vec.y, vec.z );
		}
		
		geometry.computeVertexNormals();
		
		return geometry;
		
	} // Trees.geometry



	material()
	{
		
		var material = new THREE.MeshPhongMaterial({
				shininess: 0,
				side: THREE.DoubleSide,
				//flatShading: true,
				vertexColors: true,
				transparent: DEBUG_BUILDINGS_OPACITY<0.9,
				opacity:     DEBUG_BUILDINGS_OPACITY*DEBUG_BUILDINGS_OPACITY,
				depthWrite:  DEBUG_BUILDINGS_OPACITY>0.9,
			});

		// inject GLSL code to fix the height of the roof
		material.onBeforeCompile = shader => {
			//console.log(shader.vertexShader);
			//console.log(shader.fragmentShader);

			shader.vertexShader =
				shader.vertexShader.replace(
					'#include <project_vertex>',

					'vec4 mvPosition = vec4( transformed, 1.0 );\n'+
					'vec3 limits = vec3(0.6, 0.75, 1.0);\n'+

					'if (mvPosition.y>=limits.y)\n'+
					'{\n'+
					'	vec2 v = vec2(12.9898,78.233); float w = 43758.5453123;\n'+
					'	float rx = fract(cos(dot(vec2(instanceMatrix[2].yz+mvPosition.zy),v))*w)-0.5;\n'+
					'	float ry = fract(sin(dot(vec2(instanceMatrix[1].zx-mvPosition.xz),v))*w)-0.5;\n'+
					'	float rz = fract(cos(dot(vec2(instanceMatrix[3].xy+mvPosition.yx),v))*w)-0.5;\n'+
					'	mvPosition.xyz = (mvPosition.xyz-vec3(0,limits.z,0))*(vec3(1)+0.6*vec3(0.8*rx,ry,0.8*rz))+vec3(0,limits.z,0);\n'+
					'}\n'+
					
					'if (mvPosition.y>limits.x)\n'+
					'{\n'+
					'	vec2 v = vec2(12.9898,78.233); float w = 43758.5453123;\n'+
					'	float rx = fract(sin(dot(vec2(instanceMatrix[2].yz+mvPosition.zy),v))*w)-0.5;\n'+
					'	float rz = fract(cos(dot(vec2(instanceMatrix[3].xy-mvPosition.yx),v))*w)-0.5;\n'+
					'	mvPosition.xz = mvPosition.xz + 0.05*vec2(rx,rz);\n'+

					'	rx = fract(sin(dot(vec2(instanceMatrix[2].yz),v))*w)-0.5;\n'+
					'	rz = fract(cos(dot(vec2(instanceMatrix[3].xy),v))*w)-0.5;\n'+
					'	mvPosition.xz = mvPosition.xz + 0.25*vec2(rx,rz);\n'+
					'}\n'+

					'vColor.xyz = vec3(mvPosition.y,0,0);\n'+
					'mvPosition = instanceMatrix * mvPosition;\n'+
					'mvPosition = modelViewMatrix * mvPosition;\n'+
					'gl_Position = projectionMatrix * mvPosition;\n'+

					''
				);

			shader.fragmentShader =
				shader.fragmentShader.replace(
					'#include <color_fragment>',

					'vec3 green = vec3('+(DEBUG_ALL_WHITE?'1.5,1.5,1.5':'0.33,0.65,0.33')+');\n'+
					'vec3 brown = vec3('+(DEBUG_ALL_WHITE?'1.5,1.5,1.5':'0.63,0.32,0.18')+');\n'+
					'float k = smoothstep(0.6, 0.7,vColor.x);\n'+
					'diffuseColor.rgb *= green*k+brown*(1.0-k);\n'+
					''
				);

			//console.log(shader.vertexShader);
		} // material.onBeforeCompile
		
		return material;
		
	} // Trees.material
	
	
	
	generate( )
	{
		
		// spread trees in parks and house areas inside the city 
		for( var i=0; i<blocks.parks.length; i++)
		{
			var park = blocks.parks[i];
			
			var	zone = park.zone.shrink( 1 ),
				density = zone.a.distanceTo( zone.c ) + zone.b.distanceTo( zone.d );
			
			// yards are parks in house blocks, yard's parent is the house block, containing the houses
			if( park.parent )
			{	// house yard park
				park = park.parent;
				for( var j=0; j<TREE_HOUSES_RATIO * density; j++ )
				{
					var pos = zone.randomPos( );
					if( !this.occupied( pos, park ) )
						this.trees.push( new Tree( pos ) );	
				}
			}
			else
			{ // normal park
				if( park.outskirts ) continue; // not inside the city
				for( var j=0; j<TREE_PARK_RATIO * density; j++ )
				{
					this.trees.push( new Tree( zone.randomPos( ) ) );
				}
			}
			
		} // for i

	} // Trees.generate
	
	
	
	image( )
	{
		
		var instances = this.trees.length;
		
		var geometry  = this.geometry(),
			material  = this.material(),
			mesh = new THREE.InstancedMesh( geometry, material, instances );
			
		// create a tree matrix
		var matrix = new THREE.Matrix4();
		for( var i=0; i<instances; i++ )
		{
			var tree = this.trees[i];
			matrix.makeScale( tree.height, tree.height, tree.height );
			matrix.setPosition( tree.center.x, 0, tree.center.z );

			mesh.setMatrixAt( i, matrix );
		}
		
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		//mesh.position.y = -0.2;
		
		scene.add( mesh );
			
		//this.mesh = mesh;
		
	} // Trees.image

	

	occupied( pos, block )
	{
		for( var i=0; i<block.buildings.length; i++ )
			if( block.buildings[i].occupied( pos ) )
				return true;
			
		return false;
	} // Trees.occupied
	
	
} // Trees
