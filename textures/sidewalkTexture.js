//
//	class sideWalkTexture( width, height )
//			draw()
//			map( uCount, vCount )
//



class SidewalkTexture extends ProceduralTexture
{
	draw()
	{
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		ctx.lineWidth = 1;
		ctx.strokeStyle = 'dimgray';
		ctx.strokeRect( 0, 0, W, H );
		
	} // SidewalkTexture.draw
	
} // SidewalkTexture
