//
//	class Sky( scene )
//		constructSkyImage( scene )
//


import * as THREE from '../js/three.module.js';
import {EARTH_SIZE, DEBUG_ALL_WHITE, DEBUG_BLOCKS_OPACITY} from '../config.js';
import {NatureMaterial} from './nature.js';
import {scene} from '../main.js';


class Sky
{
	
	
	constructor( )
	{
		
		this.sysType = 'Sky';
		this.constructSkyImage( );
		
	} // constructor

	
	constructSkyImage( )
	{

		var geometry = new THREE.IcosahedronGeometry( EARTH_SIZE/2, 3 );
		var material = new NatureMaterial( {
				color: 'red',
				depthTest: false,
			} );
		
		var image = new THREE.Mesh( geometry, material );
			image.renderOrder = -210;
			image.updateMatrix();
			image.matrixAutoUpdate = false;
			
		scene.add( image );
	
	} // constructSkyImage
	
	
	
} // Sky


export { Sky };