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
import {CARTOON_STYLE, TREE_HOUSES_RATIO, TREE_HEIGHT, TREE_PARK_RATIO, TREE_COMPLEXITY, DEBUG_BUILDINGS_OPACITY, DEBUG_ALL_WHITE} from '../config.js';


export class Trees
{
	
	constructor( )
	{

		this.sysType = 'Trees';
		
		this.image( this.generate() );
		
	} // Trees.constructor
	
	

	geometry()
	{
		// start with a cube
		var geometry = new THREE.BoxGeometry( 1, 1, 1, TREE_COMPLEXITY, TREE_COMPLEXITY, TREE_COMPLEXITY );
		// expand it to a unit sphere
		var vec = new THREE.Vector3(),
			pos = geometry.getAttribute( 'position' );

//console.log('tree',pos.count);

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

		if( CARTOON_STYLE )
		{
			material.specular = new THREE.Color( 10, 10, 10 );
		}
		
		// inject GLSL code to fix the height of the roof
		material.onBeforeCompile = shader => {
			//console.log(shader.vertexShader);
			//console.log(shader.fragmentShader);

			shader.vertexShader =
				shader.vertexShader.replace(
					'#include <project_vertex>',

					`
						vec4 mvPosition = vec4( transformed, 1.0 );
						vec3 limits = vec3(0.6, 0.75, 1.0);

						if (mvPosition.y>=limits.y)
						{
							vec2 v = vec2(12.9898,78.233); float w = 43758.5453123;
							float rx = fract(cos(dot(vec2(instanceMatrix[2].yz+mvPosition.zy),v))*w)-0.5;
							float ry = fract(sin(dot(vec2(instanceMatrix[1].zx-mvPosition.xz),v))*w)-0.5;
							float rz = fract(cos(dot(vec2(instanceMatrix[3].xy+mvPosition.yx),v))*w)-0.5;
							mvPosition.xyz = (mvPosition.xyz-vec3(0,limits.z,0))*(vec3(1)+0.6*vec3(0.8*rx,ry,0.8*rz))+vec3(0,limits.z,0);
						}
					
						if (mvPosition.y>limits.x)
						{
							vec2 v = vec2(12.9898,78.233); float w = 43758.5453123;
							float rx = fract(sin(dot(vec2(instanceMatrix[2].yz+mvPosition.zy),v))*w)-0.5;
							float rz = fract(cos(dot(vec2(instanceMatrix[3].xy-mvPosition.yx),v))*w)-0.5;
							mvPosition.xz = mvPosition.xz + 0.05*vec2(rx,rz);

							rx = fract(sin(dot(vec2(instanceMatrix[2].yz),v))*w)-0.5;
							rz = fract(cos(dot(vec2(instanceMatrix[3].xy),v))*w)-0.5;
							mvPosition.xz = mvPosition.xz + 0.25*vec2(rx,rz);
						}

						vColor.xyz = vec3(mvPosition.y,0,0);
						mvPosition = instanceMatrix * mvPosition;
						mvPosition = modelViewMatrix * mvPosition;
						gl_Position = projectionMatrix * mvPosition;
					`
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

			if( CARTOON_STYLE )
			shader.fragmentShader =
				shader.fragmentShader.replace(
					'#include <dithering_fragment>',
					
					`
						#include <dithering_fragment>
						float bw = smoothstep(0.4, 0.5, gl_FragColor.g);
						gl_FragColor = vec4(bw,bw,bw,1.0);
					`
				);

			//console.log(shader.vertexShader);
		} // material.onBeforeCompile
		
		return material;
		
	} // Trees.material
	
	
	
	generate( )
	{
		var trees = [];
		
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
						trees.push( pos );	
				}
			}
			else
			{ // normal park
				if( park.outskirts ) continue; // not inside the city
				for( var j=0; j<TREE_PARK_RATIO * density; j++ )
				{
					trees.push( zone.randomPos( ) );
				}
			}
			
		} // for i

		return trees;
	} // Trees.generate
	
	
	
	image( trees )
	{
		
		var instances = trees.length;
		
		var geometry  = this.geometry(),
			material  = this.material(),
			mesh = new THREE.InstancedMesh( geometry, material, instances );
			
		// create a tree matrix
		var matrix = new THREE.Matrix4();
		for( var i=0; i<instances; i++ )
		{
			var height = TREE_HEIGHT.randFloat();
			
			matrix.makeScale( height, height, height );
			matrix.setPosition( trees[i].x, 0, trees[i].z );

			mesh.setMatrixAt( i, matrix );
		}
		
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		
		scene.add( mesh );
		
	} // Trees.image

	

	occupied( pos, block )
	{
		for( var i=0; i<block.buildings.length; i++ )
			if( block.buildings[i].occupied( pos ) )
				return true;
			
		return false;
	} // Trees.occupied
	
	
} // Trees
