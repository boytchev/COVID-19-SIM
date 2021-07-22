//
//	class agentTexture( width )
//			draw()
//			map( uCount, vCount )
//


import {ProceduralTexture} from './proceduralTexture.js';


export class AgentTexture extends ProceduralTexture
{
	
	draw()
	{
		
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;

		// crimson dots
		for (var i=0; i<=	0; i++)
		{
			var x = Math.random()*W,
				y = Math.random()*H;
			
			ctx.fillStyle = i%2 ? 'crimson' : 'cornflowerblue';
			ctx.beginPath();
				ctx.arc( x, y, W/50, 0, 2*Math.PI );
			ctx.fill();
		}
		
	} // AgentTexture.draw
	
} // AgentTexture
