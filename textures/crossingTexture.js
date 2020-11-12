//
//	class crossingTexture( width, height, backgroundColor )
//			draw()
//			map( uCount, vCount )
//



class CrossingTexture extends ProceduralTexture
{
	draw()
	{
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		ctx.fillStyle = 'white';
		ctx.fillRect( 0.25*W, 0, 0.5*W, H );
		
	} // CrossingTexture.draw
	
} // CrossingTexture
