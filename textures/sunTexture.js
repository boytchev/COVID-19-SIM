//
//	class sunTexture( width, height )
//			draw()
//			map( uCount, vCount )
//


import * as THREE from '../js/three.module.js';
import {ProceduralTexture} from './proceduralTexture.js';
import {DEBUG_ALL_WHITE} from '../config.js';


export class SunTexture extends ProceduralTexture
{
	
	draw()
	{
		
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		var gradient = ctx.createLinearGradient( 0, 0, 0, H );
			gradient.addColorStop( 0.02, 'white' );
			gradient.addColorStop( 0.021, '#E0E0E0' );
			gradient.addColorStop( 0.6, 'black' );
			gradient.addColorStop( 1, 'black' );
			
		ctx.fillStyle = DEBUG_ALL_WHITE?'white':gradient;

		ctx.fillRect( 0, 0, W, H );
		
		this.repeatU = THREE.RepeatWrapping;
		this.repeatV = THREE.ClampToEdgeWrapping;
		
	} // SunTexture.draw
	
} // SunTexture
