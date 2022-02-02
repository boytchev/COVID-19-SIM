//
//	class crossingTexture( width, height, backgroundColor )
//			draw()
//			map( uCount, vCount )
//


import {ProceduralTexture} from './proceduralTexture.js';


export class CrossingTexture extends ProceduralTexture
{
	
	draw()
	{
		
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		ctx.fillStyle = 'gainsboro';
		ctx.fillRect( 0.25*W, 0, 0.5*W, H );
		
	} // CrossingTexture.draw
	
} // CrossingTexture
