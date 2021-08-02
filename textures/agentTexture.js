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
	
	

	
	// a black-crimson texture
	drawClothesTags()
	{
		function X( x ) {return Math.round(x/N*W);}
		function Y( y ) {return Math.round(y/N*H);}
		function fill( x1, y1, x2, y2 )
		{
			ctx.fillRect( X(x1), Y(y1), X(x2)-X(x1), Y(y2)-Y(y1) );
		}
		function line( x1, y1, x2, y2, width = 0.1 )
		{
			ctx.lineWidth = X(width);
			ctx.beginPath();
			ctx.moveTo( X(x1), Y(y1) );
			ctx.lineTo( X(x2), Y(y2) );
			ctx.stroke();
		}
		function path( x1, y1, width = 0.1 )
		{
			ctx.lineWidth = X(width);
			ctx.beginPath();
			ctx.moveTo( X(x1), Y(y1) );
		}
		function to( x1, y1 )
		{
			ctx.lineTo( X(x1), Y(y1) );
		}
		function end( x1, y1 )
		{
			ctx.lineTo( X(x1), Y(y1) );
			ctx.stroke();
		}
		function colorIndex( n )
		{
			//var n = Math.round(2.55*n);
			ctx.fillStyle = 'hsl(0,0%,'+Math.round(n)+'%)';
			//ctx.fillStyle = 'rgb('+n+','+n+','+n+')';
		}
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		const e=0.25;
		
		ctx.fillStyle = 'white';
		ctx.fillRect( 0, 0, H, W );
		
		// shoe rubber sole
		ctx.fillStyle = colorIndex( 1 );
		fill( 4-e, 30.7, 28+e, 31+e ); // sides both shoes
		fill( 0.5-e, 30-e,  3.5+e, 31+e); // bottom right shoe
		fill( 28.5-e, 30-e,  31.5+e, 31+e); // bottom left shoe

		// shoe leather
		ctx.fillStyle = colorIndex( 2 );
		fill( 13-e, 28, 19+e, 30.7 ); // top and side both shoes
		fill( 3.5-e, 30-e, 28+e, 30.7 ); // back of both shoes

		// ankle (must be before shoe neckline to set proper epsilon area)
		ctx.fillStyle = colorIndex( 4 );
		fill( 10-e, 26.5, 22+e, 27+e );
		
		// shoe neckline
		ctx.fillStyle = colorIndex( 3 );
		fill( 13-e, 27, 19+e, 28 ); // front and side both shoes
		ctx.moveTo( X(6-e), Y(30-e) ); // right shoe
			ctx.lineTo( X(7), Y(30.25) );
			ctx.lineTo( X(10), Y(30.30) );
			ctx.lineTo( X(11+e), Y(30-e) );
			ctx.lineTo( X(6-e), Y(30-e) );
			ctx.fill();
		ctx.moveTo( X(21-e), Y(30-e) ); // left shoe
			ctx.lineTo( X(22), Y(30.30) );
			ctx.lineTo( X(25), Y(30.25) );
			ctx.lineTo( X(26+e), Y(30-e) );
			ctx.fill();
			
		// above ankle
		ctx.fillStyle = colorIndex( 5 );
		fill( 10-e, 25, 22+e, 26.5 );
		
		// under knee
		ctx.fillStyle = colorIndex( 6 );
		fill( 10-e, 23, 22+e, 25 );
		
		// knee
		ctx.fillStyle = colorIndex( 7 );
		fill( 10-e, 19.5, 22+e, 23 );
		
		// above knee
		ctx.fillStyle = colorIndex( 8 );
		fill( 10-e, 18, 22+e, 19.5 );
		
		// pants
		ctx.fillStyle = colorIndex( 9 );
		fill( 10-e, 16, 22+e, 18 );
		ctx.fillStyle = colorIndex( 11 );
		fill( 10-e, 15, 22+e, 16 );
		ctx.fillStyle = colorIndex( 12 );
		fill( 10-e, 14, 22+e, 15 );
				
/*	
		// panties
		ctx.fillStyle = colorIndex( 10 );
		ctx.moveTo( X(10-e), Y(15.5) ); 
			ctx.lineTo( X(10-e), Y(17) );
			ctx.lineTo( X(10.5), Y(17) );
			ctx.lineTo( X(13), Y(16.0) );
			ctx.lineTo( X(16), Y(17.2) );
			ctx.lineTo( X(19), Y(16.0) );
			ctx.lineTo( X(21.5), Y(17) );
			ctx.lineTo( X(22+e), Y(17) );
			ctx.lineTo( X(22+e), Y(15.5) );
			ctx.fill();
*/				
	} // AgentTexture.drawClothesTags


	draw()
	{
		
		super.draw();
		//this.drawCheckered();
		//this.drawChessboard();
		//this.drawBlackCrimson();
		this.drawClothesTags();
		
	} // AgentTexture.draw
	
} // AgentTexture
