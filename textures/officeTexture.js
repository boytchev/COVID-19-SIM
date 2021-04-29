//
//	class officeTexture( width, height, backgroundColor )
//			draw()
//			map( uCount, vCount )
//
//	class officeNormalTexture( width, height )
//			draw()
//			map( uCount, vCount )
//
// wall:
// +--------------+
// |    | HM |    |
// +----+----+----+
// |    |    |    |
// +--------------+
// |    | HM |    |
// +--------------+



import {ProceduralTexture} from './proceduralTexture.js';


export class OfficeTexture extends ProceduralTexture
{
	
	draw()
	{
		
		super.draw();
		
		this.heightMargin = Math.round( 0.19*this.height );
		this.widthWindow  = Math.round( this.width/3 );

		var ctx = this.ctx;

		// window separator
		ctx.fillStyle = 'rgba(0,0,0,0.3)';
		ctx.fillRect( 0, 0, 1, this.height );

		// margins
		ctx.fillStyle = 'rgb(180,180,180,0.4)';
		ctx.fillRect( 0, 0, this.width, this.heightMargin );
		ctx.fillRect( 0, this.height - this.heightMargin, this.width, this.heightMargin );
		
		ctx.fillStyle = 'rgba(0,0,0,0.1)';
		for (var w=0; w<this.width; w+=this.width/16 )
		{
			var ww = Math.round( w );
			
			ctx.fillRect( ww, 0, 1, this.heightMargin );
			ctx.fillRect( ww, this.height - this.heightMargin, 1, this.heightMargin );
		}
		
	} // OfficeTexture.draw
	
} // OfficeTexture



export class OfficeNormalTexture extends OfficeTexture
{

	constructor( width, height )
	{
		
		super( width, height, 'rgb(128,128,255)' );
		
	} // OfficeNormalTexture



	draw()
	{
		
		super.draw();
		
		this.ctx.fillStyle = 'rgb(128,128,255)';
		this.ctx.fillRect( 0, 0, this.width, this.height );	

		this.convexRectangle(
			2,
			this.heightMargin + 1,
			this.width - 2,
			this.height - this.heightMargin - 2,
			0.3 );
			
	} // OfficeNormalTexture.draw
	
} // OfficeNormalTexture
