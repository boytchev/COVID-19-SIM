//
//	class agentTexture( width )
//			draw()
//			map( uCount, vCount )
//


import * as THREE from '../js/three.module.js';
import {ProceduralTexture} from './proceduralTexture.js';


// number of cells in U and V directions
// this number is used to make the mapping
// so it might be not good to change it
const N = 32; 

export class AgentTexture extends ProceduralTexture
{

	// a texture of 32x32 color cells with black dots
	drawCheckered()
	{
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		// cells with dots
		for (var i=0; i<N; i++)
		for (var j=0; j<N; j++)
		{
			var x = i/N*H;
			var y = j/N*W;
			ctx.fillStyle = 'rgb('+THREE.Math.randInt(0,255)+','+THREE.Math.randInt(0,255)+','+THREE.Math.randInt(0,255)+')';
			ctx.fillRect( x, y, H/N, W/N );
			ctx.fillStyle = 'black';
			ctx.beginPath();
			ctx.arc( x+W/N/2, y+H/N/2, H/N/10, 0, 2*Math.PI );
			ctx.fill();
		}

		// lines
		ctx.strokeStyle = 'black';
		ctx.beginPath();
		for (var i=0; i<=N; i++)
		{
			var p = i/N*W;
			ctx.moveTo( 0, p);
			ctx.lineTo( W, p);
			ctx.moveTo( p, 0);
			ctx.lineTo( p, W);
		}
		ctx.stroke();
		
	} // AgentTexture.drawCheckered

	
	
	// a texture of 32x32 black-and-white chessboard
	drawChessboard()
	{
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		// cells
		for (var i=0; i<N; i++)
		for (var j=0; j<N; j++)
		{
			var x = i/N*H;
			var y = j/N*W;
			
			if( (i+j)%2 )
				ctx.fillStyle = 'rgb(255,255,255)';
			else
				ctx.fillStyle = 'rgb(0,0,0)';
			
			ctx.fillRect( x, y, H/N, W/N );
		}
		
	} // AgentTexture.drawChessboard

	
	// a black-crimson texture
	drawBlackCrimson()
	{
		function X( x ) {return x/N*W;}
		function Y( y ) {return y/N*H;}
		function fill( x1, y1, x2, y2 )
		{
			ctx.fillRect( X(x1), Y(y1), X(x2-x1), Y(y2-y1) );
		}
		function line( x1, y1, x2, y2 )
		{
			ctx.beginPath();
			ctx.moveTo( X(x1), Y(y1) );
			ctx.lineTo( X(x2), Y(y2) );
			ctx.stroke();
		}
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		ctx.fillStyle = 'black';
		ctx.fillRect( 0, 0, H, W );
		
		ctx.fillStyle = 'cornflowerblue';
		fill( 4, 8, 6, 13 );
		
		ctx.fillStyle = 'crimson';
		fill( 1, 6-0.2, 11, 6+0.2 );
		fill( 1, 5.5-0.1, 11, 5.5+0.1 );
		fill( 1, 6.5-0.1, 11, 6.5+0.1 );
		
		fill( 10, 14-0.2, 22, 14+0.2 );
		fill( 10, 20, 22, 20.5 );
		fill( 13-0.2, 1, 13+0.2, 27 );
		fill( 19-0.2, 1, 19+0.2, 27 );
		fill( 13, 11, 19, 1.4 );
		fill( 13, 27, 19, 30 );
		fill( 0, 30, 32, 31 );
		fill( 1, 26, 9, 29 );
		fill( 10, 27.5, 12, 29.5 );
		fill( 23, 26, 31, 29 );
		fill( 20, 27.5, 22, 29.5 );
		fill( 1, 21.5, 9, 22 );
		fill( 23, 21.5, 31, 22 );
		fill( 5-0.2, 17, 5+0.2, 26 );
		fill( 27-0.2, 17, 27+0.2, 26 );
		
		ctx.strokeStyle = 'crimson';
		ctx.lineWidth = X(0.4);
		line( 13, 14.5, 16, 17 );
		line( 19, 14.5, 16, 17 );
		line( 10, 9, 10, 17 );
		line( 22, 9, 22, 17 );
	} // AgentTexture.drawBlackCrimson
	
	
	draw()
	{
		
		super.draw();
		//this.drawCheckered();
		//this.drawChessboard();
		this.drawBlackCrimson();
		
	} // AgentTexture.draw
	
} // AgentTexture
