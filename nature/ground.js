//
//	class Ground( scene )
//		constructGroundImage( scene )
//


import * as THREE from '../js/three.module.js';
import {TextGeometry} from '../js/TextGeometry.js';
import {EARTH_SIZE, GROUND_SIZE, BLOCK_PARK, DEBUG_ALL_WHITE, DEBUG_BLOCKS_OPACITY, GRASS_TEXTURE_SCALE, DEBUG_SHOW_DIRECTIONS, DEBUG_RANDOM_SEED, SAFE_MODE} from '../config.js';
import {NatureMaterial} from './nature.js';
import {scene, textures} from '../main.js';
import {font} from '../font.js';


class Ground
{
	
	
	constructor( )
	{
		
		this.sysType = 'Ground';
		
		// in safe mode no ground is generated
		if( SAFE_MODE ) return;

		this.constructGroundImage( );
		
	} // constructor

	
	constructGroundImage( )
	{

		// add black ground -- it imitates street asphalt
		var geometry = new THREE.PlaneGeometry( GROUND_SIZE, GROUND_SIZE );

		var material = new NatureMaterial( {
				color: DEBUG_ALL_WHITE?'lightgray':'#303030',
				depthTest: false,
				// map: textures.grid.map( Math.round(GROUND_SIZE/GROUND_TEXTURE_SCALE), Math.round(GROUND_SIZE/GROUND_TEXTURE_SCALE) )
				transparent: DEBUG_BLOCKS_OPACITY<1,
				opacity: DEBUG_BLOCKS_OPACITY,
			} );
		
		var image = new THREE.Mesh( geometry, material );
			image.renderOrder = -100;
			image.rotation.x = -Math.PI/2;
			image.updateMatrix();
			image.matrixAutoUpdate = false;
			image.receiveShadow = false;
			image.castShadow = true;
		
		scene.add( image );

		// add green ground around the city
		var geometry = new THREE.RingGeometry( 0, EARTH_SIZE/2, 128, 5, true ).rotateX( -Math.PI/2 );
		var material = new NatureMaterial( {
				color: DEBUG_ALL_WHITE?'lightgray':BLOCK_PARK.color,
				//depthTest: false,
				map: textures.grass.map( Math.round(EARTH_SIZE/GRASS_TEXTURE_SCALE), Math.round(EARTH_SIZE/GRASS_TEXTURE_SCALE) ),
				transparent: DEBUG_BLOCKS_OPACITY<1,
				opacity: DEBUG_BLOCKS_OPACITY,
				//wireframe: true,
				vertexColors: true,
			} );
		
		// add mountains
		var colors = [];
		var pos = geometry.getAttribute( 'position' ),
			uv  = geometry.getAttribute( 'uv' );
		var limit = EARTH_SIZE*EARTH_SIZE/2/2;
		const RND = (DEBUG_RANDOM_SEED/1000)%1;
		for( var i=0; i<pos.count; i++ )
		{
			var x = pos.getX( i ),
				z = pos.getZ( i ),
				dist = x*x+z*z;

			var r = 0.8+0.1*Math.cos(x+z);

			if( dist > 0.5*limit )
			{
				var y = 120+70*Math.sin(x/21.232+RND)+60*Math.sin(z/213.912+RND);
				pos.setXYZ( i, x, y*GROUND_SIZE/500, z );
				uv.setXY( i, x/EARTH_SIZE, z/EARTH_SIZE );
				
				if( DEBUG_ALL_WHITE )
					colors.push( 0.3, 0.3, 0.3 );
				else
					colors.push( 0.15, 0.3, 0.15 );
			}
			else
			if( dist > 0.1*limit )
			{
				var y = 120+70*Math.sin(z/121.232+RND)+60*Math.sin(x/73.912+RND);
				pos.setXYZ( i, x*r, y*GROUND_SIZE/1000, z*r );
				uv.setXY( i, x*r/EARTH_SIZE, z*r/EARTH_SIZE );
				if( DEBUG_ALL_WHITE )
					colors.push( 0.8, 0.8, 0.8 );
				else
					colors.push( 0.5, 0.8, 0.5 );
			}
			else
			{
				pos.setXYZ( i, x*r, 0, z*r );
				uv.setXY( i, x*r/EARTH_SIZE, z*r/EARTH_SIZE );
				colors.push( 1, 1, 1 );
			}

		} // for( var i=0; i<pos.count; i++ )
		
		
		var colorAttribute = new THREE.BufferAttribute( new Float32Array(colors), 3, false );
		geometry.setAttribute( 'color', colorAttribute );


		var image = new THREE.Mesh( geometry, material );
			image.renderOrder = -110;
			image.updateMatrix();
			image.matrixAutoUpdate = false;
			image.receiveShadow = true;
			image.castShadow = true;
			
		scene.add( image );
	
		if( DEBUG_SHOW_DIRECTIONS )
		{
			// marker "TOP"
			var textMaterial = new THREE.MeshBasicMaterial({color:'white'}),
				textStyle = {
							font: font.font,
							size: GROUND_SIZE/30,
							height: 0.03,
							curveSegments: 4,
							bevelEnabled: false,
						};
						
			var textGeometry = new TextGeometry( 'TOP / Z+', textStyle );
			var text = new THREE.Mesh( textGeometry, textMaterial );
			text.position.x = -GROUND_SIZE/10;
			text.position.z = GROUND_SIZE/2 + GROUND_SIZE/30;
			text.rotation.x = -Math.PI/2;
			scene.add( text );
			
			var textGeometry = new TextGeometry( 'BOTTOM / Z-', textStyle );
			var text = new THREE.Mesh( textGeometry, textMaterial );
			text.position.x = -GROUND_SIZE/8;
			text.position.z = -GROUND_SIZE/2;
			text.rotation.x = -Math.PI/2;
			scene.add( text );
			
			var textGeometry = new TextGeometry( 'LEFT / X-', textStyle );
			var text = new THREE.Mesh( textGeometry, textMaterial );
			text.position.x = -GROUND_SIZE/2;
			text.position.z = GROUND_SIZE/20;
			text.rotation.set(-Math.PI/2,Math.PI/2,0,'YXZ');
			scene.add( text );
			
			var textGeometry = new TextGeometry( 'RIGHT / X+', textStyle );
			var text = new THREE.Mesh( textGeometry, textMaterial );
			text.position.x = GROUND_SIZE/2+GROUND_SIZE/30;
			text.position.z = GROUND_SIZE/20;
			text.rotation.set(-Math.PI/2,Math.PI/2,0,'YXZ');
			scene.add( text );
		}
	} // constructGroundImage
	
	
	
} // Ground


export { Ground };