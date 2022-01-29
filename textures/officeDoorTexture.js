//
//	class OfficeDoorTexture( width, height, backgroundColor )
//			draw()
//			map( uCount, vCount )
//


import * as THREE from '../js/three.module.js';
import {ProceduralTexture} from './proceduralTexture.js';


export class OfficeDoorTexture extends ProceduralTexture
{
	
	draw()
	{
		
		super.draw();
		
		var ctx = this.ctx,
			W = this.width,
			H = this.height;
			
		var FW = Math.round( 5*H/64 ),		// door frame width
			FH = Math.round( 2.5*H/64 ),	// door frame height
			
			DT = Math.round( 0.3*H ),	// door top
			DB = Math.round( 0.8*H ),	// door bottom
			DL = Math.round( 0.8*W ),	// door left
			DR = Math.round( 0.9*W ),	// door right
			
			GH = Math.round( 0.1*H/64 );
			
			

		// glass
		ctx.fillStyle = 'white'; 	// https://www.w3schools.com/colors/colors_mixer.asp?colorbottom=6495ED&colortop=FFFFFF
		ctx.fillRect( FW, FH, W-2*FW-1, H-FH-GH-1 );
		
		// thing vertical edge
		ctx.fillStyle = 'lightgray';
		ctx.fillRect( 1, 0, 1, H );
		ctx.fillRect( W-2, 0, 1, H );
		
		// door handle
		ctx.fillStyle = 'gray';
		ctx.fillRect( DL-2, DT-1, DR-DL+1+4, DB-DT+1+2 );
		ctx.fillStyle = 'lightgray';
		ctx.fillRect( DL, DT, DR-DL+1, DB-DT+1 );
		
		
		this.repeatU = THREE.MirroredRepeatWrapping;
		this.repeatV = THREE.MirroredRepeatWrapping;
		
	} // OfficeDoorTexture.draw
	
} // OfficeDoorTexture

