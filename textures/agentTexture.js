//
//	class agentTexture( width )
//			draw()
//			map( uCount, vCount )
//


import * as THREE from '../js/three.module.js';
import {ProceduralTexture} from './proceduralTexture.js';


export class AgentTexture extends ProceduralTexture
{
	
	draw()
	{
		
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		var n = 32; // details

		// dots
		for (var i=0; i<n; i++)
		for (var j=0; j<n; j++)
		{
			var x = i/n*H;
			var y = j/n*W;
			ctx.fillStyle = 'rgb('+THREE.Math.randInt(0,255)+','+THREE.Math.randInt(0,255)+','+THREE.Math.randInt(0,255)+')';
			ctx.fillRect( x, y, H/n, W/n );
			ctx.fillStyle = 'black';
			ctx.beginPath();
			ctx.arc( x+W/n/2, y+H/n/2, H/n/10, 0, 2*Math.PI );
			ctx.fill();
		}

		// lines
		ctx.strokeStyle = 'black';
		ctx.beginPath();
		for (var i=0; i<=n; i++)
		{
			var p = i/n*W;
			ctx.moveTo( 0, p);
			ctx.lineTo( W, p);
			ctx.moveTo( p, 0);
			ctx.lineTo( p, W);
		}
		ctx.stroke();
		
	} // AgentTexture.draw
	
} // AgentTexture
