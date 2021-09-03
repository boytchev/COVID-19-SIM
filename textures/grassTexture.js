//
//	class grassTexture( width, height )
//			draw()
//			map( uCount, vCount )
//


import {ProceduralTexture} from './proceduralTexture.js';
import {DEBUG_ALL_WHITE} from '../config.js';


export class GrassTexture extends ProceduralTexture
{
	
	draw()
	{
		
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		ctx.fillStyle = DEBUG_ALL_WHITE?'rgba(200,200,200,0.1)':'rgba(100,100,100,0.1)';

		for( var x=-2; x<W+2; x++ )
		for( var y=-2; y<H+2; y++ )
		{
			ctx.globalAlpha = Math.random();
			ctx.fillRect( x, y, 2, 2 );
			y+=Math.random();
		}
		
	} // GrassTexture.draw
	
} // GrassTexture
