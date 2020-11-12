//
//	class apartmentTexture( width, height, backgroundColor )
//			draw()
//			map( uCount, vCount )
//
//	class apartmentNormalTexture( width, height )
//			draw()
//			map( uCount, vCount )
//
//
// wall:				window:		
// +--------------+		+--------------+
// |      HM      |		|   HG         |
// |  +--------+  |		|  +--+  +--+  |
// |WM| window |WM|		|WG|  |WG|  |WG|
// |  +--------+  |		|  +--+  +--+  |
// |      HM      |		|   HG         |
// +--------------+		+--------------+




class ApartmentTexture extends ProceduralTexture
{
	constructor( width, height, backgroundColor='white' )
	{
		super( width, height, backgroundColor );
	}
	
	draw()
	{
		super.draw();
		
		this.heightMargin = Math.round( 0.19*this.height );
		this.widthMargin  = Math.round( 0.07*this.width );
		this.windowHeightGap = Math.round( 0.02*this.height );
		this.windowWidthGap = Math.round( 0.02*this.width );

		var ctx = this.ctx;
			
		// window separator
		ctx.strokeStyle = 'rgba(0,0,0,0.8)';
		ctx.strokeRect( -1, 0, this.width+2, this.height+1 );

		// dark background
		ctx.fillStyle = 'rgb(200,150,100,0.4)';
		ctx.fillRect( 0, 0, this.width, this.height );
		
		// small tiles
		ctx.fillStyle = 'rgba(0,0,0,0.1)';
		for (var i=0; i<this.width; i+=8)
			ctx.fillRect( i, 0, 1, this.height );
		for (var i=0; i<this.height; i+=8)
			ctx.fillRect( 0, i, this.width, 1 );
		
		// window
		ctx.fillStyle = 'white';
		ctx.fillRect(
			this.widthMargin, 
			this.heightMargin,
			this.width - 2*this.widthMargin,
			this.height - 2*this.heightMargin );
		
	} // ApartmentTexture.draw
	
} // ApartmentTexture



class ApartmentNormalTexture extends ApartmentTexture
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
						
		// all window
		this.concaveRectangle(
			this.widthMargin,
			this.heightMargin,
			this.width - this.widthMargin,
			this.height - this.heightMargin );
			
		// left wing
		this.concaveRectangle(
			this.widthMargin + this.windowWidthGap,
			this.heightMargin + this.windowHeightGap,
			this.width/2 - this.windowWidthGap/2,
			this.height - this.heightMargin - this.windowHeightGap,
			0.35 );
			
		// right wing
		this.convexRectangle(
			this.width/2 + this.windowWidthGap/2,
			this.heightMargin + this.windowHeightGap - 1,
			this.width - this.widthMargin - this.windowWidthGap,
			this.height - this.heightMargin - this.windowHeightGap + 2,
			0.35 );

	} // ApartmentNormalTexture.draw
	
} // ApartmentNormalTexture
