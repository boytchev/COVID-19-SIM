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



class GrassBumpTexture extends ProceduralTexture
{

	constructor( width, height )
	{
		super( width, height, 'rgb(128,128,128)' );
	} // GrassBumpTexture



	draw()
	{
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		for( var i=0; i<W+H; i++ )
		{
			var color = THREE.Math.randInt(0,255);
			ctx.fillStyle = 'rgb('+color+','+color+','+color+')';
			ctx.fillRect( THREE.Math.randInt(0,W-1), THREE.Math.randInt(0,H-1), 1, 1 );
		}
		
		this.repeatU = THREE.RepeatWrapping;
		this.repeatV = THREE.RepeatWrapping;
		
	} // GrassBumpTexture.draw
	
} // GrassBumpTexture
