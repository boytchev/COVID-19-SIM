//
//	class grassTexture( width, height )
//			draw()
//			map( uCount, vCount )
//



class GrassTexture extends ProceduralTexture
{
	draw()
	{
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		ctx.fillStyle = 'rgba(100,100,100,0.1)';

		for( var x=-2; x<W+2; x++ )
		for( var y=-2; y<H+2; y++ )
		{
			ctx.globalAlpha = Math.random();
			ctx.fillRect( x, y, 2, 2 );
			y+=Math.random();
		}
		
//		 document.body.appendChild(this.canvas);
//		 this.canvas.style="position:fixed; top:10em; left:1em; z-index:100;";
	} // GrassTexture.draw
	
} // GrassTexture
