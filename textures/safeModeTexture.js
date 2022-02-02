//
//	class safeModeTexture( width, height, backgroundColor )
//			draw()
//			map( uCount, vCount )
//


import {ProceduralTexture} from './proceduralTexture.js';


export class SafeModeTexture extends ProceduralTexture
{
	
	draw()
	{
		
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		ctx.lineWidth = 1;
		ctx.strokeStyle = 'black';
		ctx.strokeRect( 0, 0, W, H );
		
		ctx.strokeStyle = 'gray';
		ctx.strokeRect( 2, 2, W-4, H-4 );
		
		ctx.strokeStyle = 'lightgray';
		ctx.strokeRect( 4, 4, W-8, H-8 );
		
	} // GridTexture.draw
	
} // GridTexture
