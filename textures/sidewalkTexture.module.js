//
//	class sideWalkTexture( width, height )
//			draw()
//			map( uCount, vCount )
//



import {ProceduralTexture} from './proceduralTexture.module.js';


export class SidewalkTexture extends ProceduralTexture
{
	
	draw()
	{
		
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		ctx.lineWidth = 1;
		ctx.strokeStyle = DEBUG_ALL_WHITE?'white':'dimgray';
		ctx.strokeRect( 0, 0, W, H );
		
	} // SidewalkTexture.draw
	
} // SidewalkTexture
