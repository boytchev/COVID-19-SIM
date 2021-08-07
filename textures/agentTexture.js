//
//	class agentTexture( width )
//			draw()
//			map( uCount, vCount )
//


import * as THREE from '../js/three.module.js';
import {ProceduralTexture} from './proceduralTexture.js';


const AGENT_DRAW_MODE_CHECKERED  = 1; // color squares with dots in centers
const AGENT_DRAW_MODE_CHESSBOARD = 2; // black and white squares
const AGENT_DRAW_MODE_CRIMSON    = 3; // a black-crimson texture
const AGENT_DRAW_MODE_BORDERS    = 4; // white character with border lines only
const AGENT_DRAW_MODE_PATCHES    = 5; // black-gray-white patches
export const AGENT_DRAW_MODE_CLOTHES    = 6; // shader-defined clothes

//export const AGENT_DRAW_MODE = AGENT_DRAW_MODE_PATCHES;
export const AGENT_DRAW_MODE = AGENT_DRAW_MODE_CLOTHES;

// number of cells in U and V directions
// this number is used to make the mapping
// so it might be not good to change it
const N = 32; 

export class AgentTexture extends ProceduralTexture
{
	map( uCount=1, vCount=1 )
	{
		var texture = new THREE.CanvasTexture(this.canvas, THREE.UVMapping, this.repeatU, this.repeatV, THREE.NearestFilter, THREE.NearestFilter );
			texture.anisotropy = 1; // do not want AF
			texture.repeat.set( uCount, vCount );
			
		return texture;
		
	} // AgentTexture.map

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
		function poly( data )
		{
			ctx.beginPath();
			ctx.moveTo( X(data[0]), Y(data[1]) );
			for( var i=2; i<data.length; i+=2 )
				ctx.lineTo( X(data[i]), Y(data[i+1]) );
			ctx.fill();
		}
		function curveTo( x2, y2, x3, y3 )
		{
			ctx.quadraticCurveTo( X(x2), Y(y2), X(x3), Y(y3) );
		}
		function quadTo( x2, y2, x3, y3, x4, y4 )
		{
			ctx.bezierCurveTo( X(x2), Y(y2), X(x3), Y(y3), X(x4), Y(y4) );
		}
		function path( x1, y1 )
		{
			ctx.beginPath();
			ctx.moveTo( X(x1), Y(y1) );
		}
		function to( x1, y1 )
		{
			ctx.lineTo( X(x1), Y(y1) );
		}
		function end( )
		{
			ctx.fill();
		}
		
		var patchColor = 0,
			patchStep = 25;
			
		function colorIndex( n )
		{
			if( AGENT_DRAW_MODE == AGENT_DRAW_MODE_CLOTHES )
			{
				ctx.fillStyle = 'hsl(0,0%,'+n+'%)';
			}
			
			if( AGENT_DRAW_MODE == AGENT_DRAW_MODE_PATCHES )
			{
				patchColor += patchStep;
				ctx.fillStyle = 'rgb('+patchColor+','+patchColor+','+patchColor+')';
				if( patchColor > 230 ) patchStep = -patchStep;
			}
		}
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		const e=0.5;
		
		ctx.fillStyle = 'white';
		ctx.fillRect( 0, 0, H, W );

/*01*/	colorIndex( 1 );
		fill( 4-e, 30.7, 28+e, 31+e );
		fill( 0, 30, 3.5+e, 32 );
		fill( 28.5-e, 30, 32, 32 );
		
/*02*/	colorIndex( 2 );
		fill( 4-e, 30-e, 28+e, 30.7 );
		fill( 13-e, 28, 19+e, 30 );
		
/*03*/	colorIndex( 3 );
		fill( 13-e, 27, 19+e, 28 );
		poly( [6-e, 30-e, 7, 30.25, 10, 30.30, 11+e, 30-e] );
		poly( [21-e, 30-e, 22, 30.30, 25, 30.25, 26+e, 30-e] );
		
/*04*/	colorIndex( 4 );
		poly( [10-e, 26.5, 10-e, 27+e, 13-e, 27+e, 13, 27, 19, 27, 19+e, 27+e, 22+e, 27+e, 22+e, 26.5] );

/*05*/	colorIndex( 5 );
		fill( 10-e, 25, 22+e, 26.5 );

/*06*/	colorIndex( 6 );
		fill( 10-e, 21.5, 22+e, 25 );

/*07*/	colorIndex( 7 );
		poly( [10-e, 22, 13, 22+1/4, 16, 22, 19, 22+1/4, 22+e, 22, 22+e, 19.5, 10-e, 19.5] );
		
/*08*/	colorIndex( 8 );
		fill( 10-e, 18, 22+e, 19.5 );

/*09*/	colorIndex( 9 );
		fill( 10-e, 15.2, 22+e, 18 );
		
/*10*/	colorIndex( 10 );
		path( 10-e, 15 );
			to( 10-e, 17 );
			quadTo( 12, 17, 13, 15, 16, 17.1 );
			quadTo( 19, 15, 21, 17, 22+e, 17);
			to( 22+e, 15 );
			end( );
			
/*11*/	colorIndex( 11 );
		fill( 10-e, 14+3/4, 22+e, 15 );
		
/*12*/	colorIndex( 12 );
		fill( 10-e, 14, 22+e, 14+3/4 );
		
/*13*/	colorIndex( 13 );
		fill( 10-e, 12.2, 22+e, 14 );

/*14*/	colorIndex( 14 );
		path( 10-e, 12+3/4 );
			to( 10, 12+3/4 );
			quadTo( 11, 12+1/4, 13, 12+3/4, 16, 12+1/4 );
			quadTo( 19, 12+3/4, 21, 12+1/4, 22, 12+3/4 );
			to( 22+e, 12+3/4 );
			to( 22+e, 11-e );
			to( 19+e, 5-e );
			to( 13-e, 5-e );
			to( 10-e, 11-e );
			end( );
			
/*15*/	colorIndex( 15 );
		path( 14, 5-e );
			to( 14, 5 );
			curveTo( 14-1/4, 12, 13, 12 ); 
			curveTo( 12+1/4, 12, 12-1/4, 12 );
			curveTo( 11, 12, 11, 11 );
			to( 11, 11-e );
			to( 13, 5-e );
			end( );
		path( 18, 5-e );
			to( 18, 5 );
			curveTo( 18+1/4, 12, 19, 12 ); 
			curveTo( 19+3/4, 12, 20+1/4, 12 );
			curveTo( 21, 12, 21, 11 );
			to( 21, 11-e );
			to( 19, 5-e );
			end( );
			
/*16*/	colorIndex( 16 );
		fill( 23-e, 16.5-e, 31+e, 18 );
		fill( 1-e, 16.5-e, 9+e, 18 );

/*17*/	colorIndex( 17 );
		poly( [23-e, 17.5, 27, 18, 31+e, 17.5, 31+e, 23, 23-e, 23] );
		poly( [1-e, 17.5, 5, 18, 9+e, 17.5, 9+e, 23, 1-e, 23] );

/*18*/	colorIndex( 18 );
		poly( [23-e, 19.5, 27, 20, 31+e, 19.5, 31+e, 25, 23-e, 25] );
		poly( [1-e, 19.5, 5, 20, 9+e, 19.5, 9+e, 25, 1-e, 25] );
		
/*19*/	colorIndex( 19 );
		fill( 23-e, 25, 31+e, 29+e );
		fill( 20-e, 28-e, 22+e, 29+e );
		fill( 1-e, 25, 9+e, 29+e );
		fill( 10-e, 28-e, 12+e, 29+e );
		
		patchColor = 150;
		
/*20*/	colorIndex( 20 );
		path( 14+1/4, 5-e );
			to( 14, 10 );
			curveTo( 16, 13+3/4, 18, 10 );
			to( 18-1/4, 5 );
			to( 18-1/4, 5-e );
			end( );
		path( 10-e, 11-e );
			to( 10-e, 11+3/4 );
			to( 10, 11+4/4 );
			curveTo( 11-1/4, 11+3/4, 11-1/4, 11 );
			to( 11-1/4, 11-e );
			end( );
		path( 10-e, 11-e );
			to( 10-e, 11+3/4 );
			to( 10, 11+4/4 );
			curveTo( 11-1/4, 11+3/4, 11-1/4, 11 );
			to( 11-1/4, 11-e );
			end( );
		path( 22+e, 11-e );
			to( 21+1/4, 11-e );
			to( 21+1/4, 11 );
			curveTo( 21+1/4, 11+3/4, 22, 11+4/4 );
			to( 22+e, 11+4/4 );
			end( );

/*21*/	colorIndex( 21 );
		poly( [14+7/8, 8+7/8, 16, 11.5, 18-7/8, 8+7/8] );

/*22*/	colorIndex( 22 );
		path( 15, 8 );
			quadTo( 14, 9+3/4, 18, 9+3/4, 17, 8 );
			curveTo( 16, 7-2/4, 15, 8 );
			end( );
		fill( 9, 5-e, 11+e, 7+e );
		fill( 3-e, 13.5-e, 7+e, 16+e );



		return
//------------------------------			

		patchColor = 0;
		patchStep = 15;

		colorIndex( 41 );
		poly( [4-e, 14-e, 5, 15, 6+e, 14-e] ); // 41 (must be before 42)
		
		colorIndex( 42 );
		poly( [4.5-e, 14-e, 5, 15, 5.5+e, 14-e, 5, 13+3/4-e] ); // 42 
		
		colorIndex( 19/*51*/ );
		poly( [4-e, 5-e, 9, 5-e, 9, 5, 9.5, 6, 9, 7, 9, 7+e, 4-e, 7+e, 4-e, 5-e] ); // 19/*51*/

		colorIndex( 20/*54*/ );
		fill( 1-e, 5-e, 4, 7+e ); // 20/*54*/

		colorIndex( 30/*52*/ );
		fill( 1-e, 8-e, 9+e, 13+e ); // 30/*52*/ (must be before 43..53 w/o 51)

		colorIndex( 34/*45*/ );
		poly( [1-e, 13+e, 2.5, 11.5, 7.5, 11.5, 9+e, 13+e] );//34/*45*/ (must be before 43 & 44)
		
		colorIndex( 44 );
		poly( [2.5-e, 13+e, 3.5, 12, 6.5, 12, 7.5+e, 13+e] );//44 (must be before 43)
		
		colorIndex( 43 );
		poly( [4.5, 13+e, 4.5, 13, 4+1/4, 12+1/4, 5+3/4, 12+1/4, 5.5, 13, 5.5, 13+e] ); //43

		colorIndex( 31/*49*/ );
		poly( [4, 8-e, 4, 8, 2.5, 11.5, 7.5, 11.5, 6, 8, 6, 8-e] ); //31/*49*/ (must be before 46, 47, 48 50, 53)

		colorIndex( 21/*50*/ );
		fill( 4, 8-e, 6, 8+3/4 ); //21 /*50*/
		
		colorIndex( 32/*47*/ );
		poly( [4, 8+3/4, 2.5, 11.5, 7.5, 11.5, 6, 8+3/4] ); //32/*47*/ (must be before 48)
		
		colorIndex( 22/*48*/ );
		fill( 4, 8+3/4, 6, 9.5 ); //22 /*48*/
		
		colorIndex( 33/*46*/ );
		poly( [2.5, 11.5, 4, 9.5, 6, 9.5, 7, 11.5] ); //33/*46*/ (must be before 53)
		
		colorIndex( 23/*53*/ );
		poly( [4, 9.5, 3+1/4, 11.5, 3.5, 12, 4+1/4, 12+1/4, 5+3/4, 12+1/4, 6.5, 12, 6+3/4, 11.5, 6, 9.5] ); //23 /*53*/

	} // AgentTexture.drawClothesTags


	// add crimson borders
	addBorders()
	{
		function X( x ) {return Math.round(x/N*W);}
		function Y( y ) {return Math.round(y/N*H);}
		function line( data )
		{
			ctx.beginPath();
			ctx.moveTo( X(data[0]), Y(data[1]) );
			for( var i=2; i<data.length; i+=2 )
				ctx.lineTo( X(data[i]), Y(data[i+1]) );
			ctx.stroke();
		}
		function curve( x1, y1, x2, y2, x3, y3 )
		{
			ctx.beginPath();
			ctx.moveTo( X(x1), Y(y1) );
			ctx.quadraticCurveTo( X(x2), Y(y2), X(x3), Y(y3) );
			ctx.stroke();
		}
		function quad( x1, y1, x2, y2, x3, y3, x4, y4 )
		{
			ctx.beginPath();
			ctx.moveTo( X(x1), Y(y1) );
			ctx.bezierCurveTo( X(x2), Y(y2), X(x3), Y(y3), X(x4), Y(y4) );
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
		function end( )
		{
			ctx.stroke();
		}
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;


		//ctx.fillStyle = 'white';
		//ctx.fillRect( 0, 0, H, W );
		
		ctx.strokeStyle = 'crimson';
		ctx.strokeStyle = 'rgba(0,0,0,20%)';
		ctx.lineWidth = 1;

		
		// 								// border between texture zones
		line( [4, 31, 28, 31] );		// 00-01
		line( [4, 30.7, 28, 30.7] ); 	// 01-02
		line( [13, 28, 19, 28] ); 		// 02-03
		line( [6, 30, 7, 30.25, 10, 30.30, 11, 30] );
		line( [21, 30, 22, 30.30, 25, 30.25, 26, 30] );
		line( [10, 27, 22, 27] ); 		// 03-04
		line( [10, 26.5, 22, 26.5] ); 	// 04-05
		line( [10, 25, 22, 25] ); 		// 05-06
		line( [10, 22, 13, 22+1/4, 16, 22, 19, 22+1/4, 22, 22] ); 		// 06-07
		line( [10, 19.5, 22, 19.5] ); 	// 07-08
		line( [10, 18, 22, 18] ); 		// 08-09

		quad( 10, 17, 12, 17, 13, 15, 16, 17.1 );	// 09-10
		quad( 22, 17, 21, 17, 19, 15, 16, 17.1 );
		line( [10, 15, 22, 15] ); 					// 10-11
		line( [10, 14+3/4, 22, 14+3/4] ); 			// 11-12
		line( [10, 14, 22, 14] ); 					// 12-13
		
		quad( 10, 12+3/4, 11, 12+1/4, 13, 12+3/4, 16, 12+1/4 ); // 13-14 A
		quad( 22, 12+3/4, 21, 12+1/4, 19, 12+3/4, 16, 12+1/4 );

		
		line( [14+1/4, 5, 14, 10] ); // 14-15 B
		line( [18-1/4, 5, 18, 10] );
		curve( 14, 10, 16, 13+3/4, 18, 10 );
		
		curve( 14, 5, 14-1/4, 12, 13, 12 ); // 14-16 C
		curve( 18, 5, 18+1/4, 12, 19, 12 ); 

		curve( 13, 12+1/4-1/4, 12+1/4, 12, 12-1/4, 12 ); // C2
		curve( 12-1/4, 12, 11, 12, 11, 11 );
		curve( 19, 12+1/4-1/4, 19+3/4, 12, 20+1/4, 12 ); // C2
		curve( 20+1/4, 12, 21, 12, 21, 11 );
		
		curve( 11-1/4, 11, 11-1/4, 11+3/4, 10, 11+4/4 ); //C1
		curve( 21+1/4, 11, 21+1/4, 11+3/4, 22, 11+4/4 ); //C1
		
		quad( 15, 8, 14, 9+3/4, 18, 9+3/4, 17, 7+4/4 ) // 15-18 & 17-18 D
		curve( 15, 8, 16, 7-2/4, 17, 8 );
		
		line( [14+7/8, 8+7/8, 16, 11.5, 18-7/8, 8+7/8] ); // 15-17 E

		line( [1, 25, 9, 25] ); // 31-32 H1
		line( [23, 25, 31, 25] );

		line( [1, 19.5, 5, 20, 9, 19.5] ); // 30-31 H2
		line( [23, 19.5, 27, 20, 31, 19.5] );

		line( [1, 17.5, 5, 18, 9, 17.5] ); // 29-30 H3
		line( [23, 17.5, 27, 18, 31, 17.5] );
		
		//line( [1, 17, 9, 17] ); // 16-29 H4
		//line( [23, 17, 31, 17] );
		
		
		line( [9, 5, 9.5, 6, 9, 7] ); // X1
		line( [4, 14, 5, 15, 6, 14] ); // X2
		line( [5, 15, 5.5, 14, 5, 13+3/4, 4.5, 14, 5, 15] ); // X3
		line( [4, 8, 6, 8, 7.5, 11.5, 9, 13, 1, 13, 2.5, 11.5, 4, 8] ); // X4
		line( [6, 8+3/4, 7.5, 11.5, 6, 9.5, 4, 9.5, 2.5, 11.5, 4, 8+3/4, 6, 8+3/4] ); // X5
		line( [6, 8, 6, 9.5, 6+3/4, 11.5, 6.5, 12, 5+3/4, 12+1/4, 4+1/4, 12+1/4, 3.5, 12, 3+1/4, 11.5, 4, 9.5, 4, 8] ); // X6
		line( [2.5, 13, 3.5, 12] ); // X7
		line( [4.5, 13, 4+1/4, 12+1/4] ); // X8
		line( [5.5, 13, 5+3/4, 12+1/4] ); // X9
		line( [7.5, 13, 6.5, 12] ); // X10
		line( [6+3/4, 11.5, 7.5, 11.5] ); // X11
		line( [3+1/4, 11.5, 2.5, 11.5] ); // X12
		line( [1, 5, 4, 5, 4, 7, 1, 7] ); // X13
		line( [9, 5, 5, 5] );
		line( [9, 7, 5, 7] );
		
		
	} // AgentTexture.addBorders


	draw()
	{
		super.draw();
		switch( AGENT_DRAW_MODE )
		{
			case AGENT_DRAW_MODE_CHECKERED:
					this.drawCheckered();
					break;
			case AGENT_DRAW_MODE_CHESSBOARD:
					this.drawChessboard();
					break;
			case AGENT_DRAW_MODE_CRIMSON:
					this.drawBlackCrimson();
					break;
			case AGENT_DRAW_MODE_BORDERS:
					this.addBorders();
					break;
			case AGENT_DRAW_MODE_PATCHES:
					this.drawClothesTags();
					this.addBorders();
					break;
			case AGENT_DRAW_MODE_CLOTHES:
					this.drawClothesTags();
					break;
		}

		//this.drawClothesTags();
		//this.addBorders();
		
	} // AgentTexture.draw
	
} // AgentTexture
