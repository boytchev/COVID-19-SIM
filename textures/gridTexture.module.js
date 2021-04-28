//
//	class gridTexture( width, height, backgroundColor )
//			draw()
//			map( uCount, vCount )
//


import {ProceduralTexture} from './proceduralTexture.module.js';


export class GridTexture extends ProceduralTexture
{
	
	draw()
	{
		
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		// minor grid 10x10
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'lightgray';
		ctx.beginPath();
		for (var i=0; i<=10; i++)
		{
			var x = i/10*W,
				y = i/10*H;
			ctx.moveTo( x, 0 );
			ctx.lineTo( x, H );
			ctx.moveTo( 0, y );
			ctx.lineTo( W, y );
		}
		ctx.stroke();
		
		// major grid 1x1
		ctx.lineWidth = 4;
		ctx.strokeStyle = 'gray';
		ctx.strokeRect( 0, 0, W, H );
		
	} // GridTexture.draw
	
} // GridTexture
