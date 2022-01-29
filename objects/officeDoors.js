//
//	class OfficeDoor
//		constructor ( center, wings, rotation )
//
//	class OfficeDoors
//		static geometry( )
//		static material( )
//		static image( )


import * as THREE from '../js/three.module.js';
import {DEBUG_ALL_WHITE, OFFICE_DOOR_WIDTH, OFFICE_DOOR_TEXTURE_SCALE, DEBUG_BUILDINGS_OPACITY, FLOOR_HEIGHT} from '../config.js';
import {navmesh, textures, scene} from '../main.js';


export class OfficeDoor
{
	
	constructor( center, wings, rotation )
	{
		this.sysType = 'OfficeDoor';
		
		this.center = center;
		this.width = wings * OFFICE_DOOR_WIDTH;
		this.rotation = rotation;
	
		this.insideZone = undefined;
		this.outsideZone = undefined;
		
		navmesh.addOfficeDoor( this );

	} // OfficeDoor.constructor
	
} // OfficeDoor



export class OfficeDoors
{
	constructor()
	{
		this.sysType = 'OfficeDoors';
	}
	
	
	// geometry with specific normal
	static geometry( nx, nz)
	{
		var geometry = new THREE.InstancedBufferGeometry();
		
		// x,y,z, nx,ny,nz, u,v
		var vertexBuffer = new THREE.InterleavedBuffer( new Float32Array( [
			 // Front (facing Z+) 
			 -1/2, 1,  0,	0, 0, 1,	0, 1,
			 -1/2, 0,  0,	0, 0, 1, 	0, 0,
			  1/2, 0,  0, 	0, 0, 1, 	1, 0, 
			 -1/2, 1,  0,	0, 0, 1,	0, 1,
			  1/2, 0,  0, 	0, 0, 1, 	1, 0, 
			  1/2, 1,  0,	0, 0, 1, 	1, 1,
		]), 8);
	
		var positions = new THREE.InterleavedBufferAttribute( vertexBuffer, 3/*values*/, 0/*offset*/ );
		var normals   = new THREE.InterleavedBufferAttribute( vertexBuffer, 3/*values*/, 3/*offset*/ );
		var uvs       = new THREE.InterleavedBufferAttribute( vertexBuffer, 2/*values*/, 6/*offset*/ );
		
		geometry.setAttribute( 'normal', normals);
		geometry.setAttribute( 'position', positions );
		geometry.setAttribute( 'uv', uvs);
		geometry.setAttribute( 'uv2', uvs);
		
		return geometry;
		
	} // OfficeDoors.geometry



	static material()
	{
		var material = new THREE.MeshLambertMaterial({
				//flatShading: true,
				vertexColors: true,
				map: textures.officeDoor.map( 1/OFFICE_DOOR_TEXTURE_SCALE, 1 ),
				polygonOffset: true,
				polygonOffsetFactor: -1,
				polygonOffsetUnits: -1,
				transparent: DEBUG_BUILDINGS_OPACITY<0.9,
				opacity:     DEBUG_BUILDINGS_OPACITY,
				depthWrite:  DEBUG_BUILDINGS_OPACITY>0.9,
				side: THREE.DoubleSide, // makes doors visible from inside
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
					
					'varying vec2 vTextureScale;\n'+
					'void main() {\n'+
					'	float m1 = max( abs(instanceMatrix[0][0]), abs(instanceMatrix[2][2]) );\n'+
					'	float m2 = max( abs(instanceMatrix[2][0]), abs(instanceMatrix[0][2]) );\n'+
					'	vTextureScale.x = max(m1, m2);\n'+
					'	vTextureScale.y = 1.0;\n'+
					''
				);


			shader.fragmentShader =
				shader.fragmentShader.replace(
					'void main() {\n',
					
					'varying vec2 vTextureScale;\n'+
					'void main() {\n'
				);
		
			shader.fragmentShader =
				shader.fragmentShader.replace(
				  '#include <map_fragment>',
				  
				  'vec4 texelColor = texture2D( map, vUv*vTextureScale );\n'+
				  'texelColor = mapTexelToLinear( texelColor );\n'+
				  'diffuseColor *= texelColor;'
				);

				
			//console.log(shader.vertexShader);
		} // material.onBeforeCompile
		
		return material;
		
	} // OfficeDoors.material
	
	
	
	static image( doors )
	{
		// no doors if buildings are fully transparent
		if( DEBUG_BUILDINGS_OPACITY < 0.01 ) return;

		var instances = doors.length;
		
		var geometry  = OfficeDoors.geometry(),
			material  = OfficeDoors.material(),
			mesh = new THREE.InstancedMesh( geometry, material, instances );
			
		// every office building door has own grayish color
		var colors = [];
		for( var i=0; i<instances; i++)
		{
			if( DEBUG_ALL_WHITE )
				colors.push( 3/4, 3/4, 3/4 )
			else
			{
				var intensity = Math.pow( THREE.Math.randFloat(0.5,1), 1/10 );
				colors.push( intensity, intensity, intensity );
			}
		}
		var colorAttribute = new THREE.InstancedBufferAttribute( new Float32Array(colors), 3, false, 1 );
		geometry.setAttribute( 'color', colorAttribute );
		
		
		// create an office doors matrix
		var matrix = new THREE.Matrix4();
		var scale = new THREE.Vector3();
		
		for( var i=0; i<instances; i++ )
		{
			matrix.makeRotationY( doors[i].rotation * Math.PI/2 );
			
			scale.set( doors[i].width, FLOOR_HEIGHT, doors[i].width );
			matrix.scale( scale );
			
			matrix.setPosition( doors[i].center.x, 0, doors[i].center.z );

			mesh.setMatrixAt( i, matrix );
		}

		mesh.receiveShadow = true;
		scene.add( mesh );
		
	} // OfficeDoors.imageDoors
	
} // OfficeDoors
