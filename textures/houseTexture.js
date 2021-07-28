//
//	class houseTexture( width, height )
//			draw()
//			map( uCount, vCount )
//


import * as THREE from '../js/three.module.js';
import {ProceduralTexture} from './proceduralTexture.js';
import {DEBUG_ALL_WHITE} from '../config.js';


export class HouseTexture extends ProceduralTexture
{
	
	draw()
	{
		
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		// roof
		ctx.fillStyle = DEBUG_ALL_WHITE?'white':'rgb(255,160,150)';
		ctx.fillRect( 0, 0.9*H, W, 0.1*H );

		// door
		var dw = 0.09*W; // window width
		ctx.fillStyle = DEBUG_ALL_WHITE?'white':'rgba(100,0,0,0.8)';
		ctx.fillRect( 0.1*W-dw/2, 0.6*H, dw, 0.3*H );
		ctx.fillStyle = 'rgba(255,255,255,0.3)';
		ctx.fillRect( 0.1*W-dw/2+dw/10, 0.6*H+dw/7, dw-2*dw/10, 0.3*H-dw/7 );
		
		// windows
		var windowWidth = 0.115*W;
		var windowHeight = 0.2*H;
		var windowBaseWidth = 0.145*W;
		var windowBaseHeight = 0.03*H;
		function window( x, y )
		{
			// window frame
			ctx.strokeStyle = 'rgba(0,0,0,0.1)';
			ctx.strokeRect( Math.round(x-windowWidth/2)+0.5, Math.round(y-windowHeight/2)+0.5, Math.round(windowWidth), Math.round(windowHeight) );
			
			// window glass
			//ctx.fillStyle = DEBUG_ALL_WHITE?'rgba(255,255,255,0.95)':'rgba(180,210,255,0.5)';
			//ctx.fillRect( x-windowWidth/2+1, y-windowHeight/2+1, windowWidth-1, windowHeight-1 );
			ctx.clearRect( x-windowWidth/2+1, y-windowHeight/2+1, windowWidth-1, windowHeight-1 );
			
			// window base
			ctx.fillStyle = 'rgba(0,0,0,0.2)';
			ctx.fillRect( x-windowBaseWidth/2, y+windowHeight/2, windowBaseWidth, windowBaseHeight );
/*						
			// left curtain
			ctx.fillStyle = 'rgba(255,255,255,0.1)';
			ctx.beginPath();
			ctx.moveTo( x-windowWidth/2,               y-windowHeight/2 );
			ctx.lineTo( x-windowWidth/2+windowWidth/3, y-windowHeight/2 );
			ctx.quadraticCurveTo( x-windowWidth/2+windowWidth/3, y, x-windowWidth/2+windowWidth/16, y+windowHeight/4 );
			ctx.lineTo( x-windowWidth/2+windowWidth/8, y+windowHeight/2 );
			ctx.lineTo( x-windowWidth/2,               y+windowHeight/2 );
			ctx.fill();
			// right curtain
			ctx.beginPath();
			ctx.moveTo( x+windowWidth/2,               y-windowHeight/2 );
			ctx.lineTo( x+windowWidth/2-windowWidth/3, y-windowHeight/2 );
			ctx.quadraticCurveTo( x+windowWidth/2-windowWidth/3, y, x+windowWidth/2-windowWidth/16, y+windowHeight/4 );
			ctx.lineTo( x+windowWidth/2-windowWidth/8, y+windowHeight/2 );
			ctx.lineTo( x+windowWidth/2,               y+windowHeight/2 );
			ctx.fill();
*/			
		}
		
		ctx.fillStyle = DEBUG_ALL_WHITE?'white':'rgba(100,0,0,0.2)';
		ctx.strokeStyle = DEBUG_ALL_WHITE?'white':'rgba(100,0,0,0.2)';
		
		for( var i=0; i<5; i++ )
		{
			if (i) window( 0.1*W+i*0.2*W, 0.65*H );
			window( 0.1*W+i*0.2*W, 0.25*H );
		}

		
		this.repeatU = THREE.RepeatWrapping;
		this.repeatV = THREE.RepeatWrapping;
		
		// document.body.appendChild(this.canvas);
		// this.canvas.style="position:fixed; top:10em; left:1em; z-index:100;";
		
	} // HouseTexture.draw
	
} // HouseTexture



export class HouseBumpTexture extends ProceduralTexture
{

	constructor( width, height )
	{
		
		super( width, height, 'rgb(128,128,128)' );
		
	} // HouseNormalTexture



	draw()
	{
		
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		// roof
		ctx.fillStyle = 'rgb(140,140,140)';
		for( var i=0.9*H; i<H; i+=4)
		{
			ctx.fillRect( 0, i, W, 1 );
		}
		for( var i=0; i<W; i+=20)
		{
			ctx.fillRect( i, 0.9*H, 1, 0.1*H );
		}
		
		// door
		var dw = 0.09*W; // window width
		ctx.fillStyle = 'rgb(155,155,155)';
		ctx.fillRect( 0.1*W-dw/2, 0.6*H, dw, 0.3*H );
		ctx.fillStyle = 'rgb(90,90,90)';
		ctx.fillRect( 0.1*W-dw/2+dw/10, 0.6*H+dw/7, dw-2*dw/10, 0.3*H-dw/7 );

		// windows
		var windowWidth = 0.115*W;
		var windowHeight = 0.2*H;
		var windowBaseWidth = 0.145*W;
		var windowBaseHeight = 0.03*H;
		function window( x, y )
		{
			// window frame
			ctx.strokeStyle = 'rgb(140,140,140)';
			ctx.strokeRect( Math.round(x-windowWidth/2)+0.5, Math.round(y-windowHeight/2)+0.5, Math.round(windowWidth), Math.round(windowHeight) );
			
			// window glass
			ctx.fillStyle = 'rgb(110,110,110)';
			ctx.fillRect( x-windowWidth/2+1, y-windowHeight/2+1, windowWidth-1, windowHeight-1 );
			
			// window base
			ctx.fillStyle = 'rgb(135,135,135)';
			ctx.fillRect( x-windowBaseWidth/2, y+windowHeight/2, windowBaseWidth, windowBaseHeight );
		}
		for( var i=0; i<5; i++ )
		{
			if (i) window( 0.1*W+i*0.2*W, 0.65*H );
			window( 0.1*W+i*0.2*W, 0.25*H );
		}
	
		this.repeat = THREE.MirroredRepeatWrapping;
		
	} // HouseNormalTexture.draw
	
} // HouseNormalTexture
