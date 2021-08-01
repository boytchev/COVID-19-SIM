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
	
	
	draw()
	{
		
		super.draw();
		this.drawCheckered();
		this.drawChessboard();
		
	} // AgentTexture.draw
	
} // AgentTexture
