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



import {ProceduralTexture} from './proceduralTexture.js';
import {DEBUG_ALL_WHITE} from '../config.js';


export class ApartmentTexture extends ProceduralTexture
{
	
	constructor( width, height, backgroundColor='white' )
	{
		
		super( width, height, backgroundColor );
		
	} // ApartmentTexture


	
	draw()
	{
		
		super.draw();
		
		this.heightMargin = Math.round( 0.185*this.height );
		this.widthMargin  = Math.round( 0.07*this.width );
		this.windowHeightGap = Math.round( 0.04*this.height );
		this.windowWidthGap = Math.round( 0.04*this.width );

		var ctx = this.ctx;
			
		ctx.fillStyle = 'rgb(255,0,0)';
		ctx.fillRect( 0, 0, this.width, this.height );

		// dark background (dograma)
		ctx.fillStyle = DEBUG_ALL_WHITE?'rgb(200,0,0)':'rgb(150,0,0)';
		ctx.fillRect( 0, 0, this.width, this.height );
		
		// small tiles
		ctx.fillStyle = DEBUG_ALL_WHITE?'rgb(255,0,0)':'rgba(0,0,0,0.1)';
		for (var i=0; i<this.width; i+=8)
			ctx.fillRect( i, 0, 1, this.height );
		for (var i=0; i<this.height; i+=8)
			ctx.fillRect( 0, i, this.width, 1 );

		ctx.fillStyle = DEBUG_ALL_WHITE?'rgb(200,0,0)':'rgb(150,0,0)';
		ctx.fillRect( this.widthMargin, this.heightMargin, this.width-2*this.widthMargin+1, this.height-2*this.heightMargin );

		// transparent part of window
		ctx.fillStyle = 'rgb(255,0,255)';
		ctx.fillRect(
			this.widthMargin+this.windowWidthGap, 
			this.heightMargin+this.windowHeightGap,
			this.width - 2*this.widthMargin - 2*this.windowWidthGap,
			this.height - 2*this.heightMargin - 2*this.windowHeightGap
		);

		// window separator
		ctx.fillStyle = DEBUG_ALL_WHITE?'rgb(200,0,0)':'rgb(150,0,0)';
		ctx.fillRect( this.width/2-this.windowWidthGap/2, this.heightMargin, this.windowWidthGap, this.height-2*this.heightMargin );
		ctx.fillRect(
			this.widthMargin, 
			this.heightMargin+this.windowHeightGap+0.15*this.height,
			this.width - 2*this.widthMargin,
			this.windowWidthGap/10
		);
		

	} // ApartmentTexture.draw
	
} // ApartmentTexture



export class ApartmentNormalTexture extends ApartmentTexture
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
		this.concaveRectangle(
			this.width/2 + this.windowWidthGap/2,
			this.heightMargin + this.windowHeightGap,
			this.width - this.widthMargin - this.windowWidthGap,
			this.height - this.heightMargin - this.windowHeightGap,
			0.35 );

	} // ApartmentNormalTexture.draw
	
} // ApartmentNormalTexture
