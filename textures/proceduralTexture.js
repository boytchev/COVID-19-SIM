//
//	class ProceduralTexture( width, height, backgroundColor )
//			draw()
//			map( uCount, vCount )
//			concaveRectangle( x1, y1, x2, y2, opacity )
//			convexRectangle( x1, y1, x2, y2, opacity )
//			debugShow()
//



import * as THREE from '../js/three.module.js';
import {renderer} from '../main.js';


export class ProceduralTexture
{

	
	constructor( width, height, backgroundColor='white' )
	{
		
		var W = THREE.Math.ceilPowerOfTwo( width || 64 ),
			H = THREE.Math.ceilPowerOfTwo( height || width );
		
		var canvas = document.createElement( 'canvas' );
			canvas.width = W;
			canvas.height = H;
		
		var ctx = canvas.getContext( '2d' );
			ctx.fillStyle = backgroundColor;
			ctx.fillRect( 0, 0, W, H );	
		
		this.canvas = canvas;
		this.ctx = ctx;
		this.width = W;
		this.height = H;
		
		this.draw( );

	} // ProceduralTexture



	draw( )
	{
		
		this.repeatU = THREE.RepeatWrapping;
		this.repeatV = THREE.RepeatWrapping;
		
	} // ProceduralTexture.draw


	
	map( uCount=1, vCount=1 )
	{
		
		var texture = new THREE.CanvasTexture(this.canvas, THREE.UVMapping, this.repeatU, this.repeatV);
			texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
			texture.repeat.set( uCount, vCount );
			
		return texture;
		
	} // ProceduralTexture.map
	
	
	
	// convex rectangle for normal map
	convexRectangle( x1, y1, x2, y2, opacity=1 )
	{

		//info: https://en.wikipedia.org/wiki/Normal_mapping
		
		var ctx = this.ctx;
		
		// left border
		ctx.fillStyle = 'rgba(0,128,128,'+opacity+')';
		ctx.fillRect( x1, y1+1, 1, y2-y1-1 );
		// right border
		ctx.fillStyle = 'rgba(255,128,128,'+opacity+')';
		ctx.fillRect( x2, y1+1, 1, y2-y1-1 );
		// top border
		ctx.fillStyle = 'rgba(128,255,128,'+opacity+')';
		ctx.fillRect( x1+1, y1, x2-x1-1, 1 );
		// bottom border
		ctx.fillStyle = 'rgba(128,0,128,'+opacity+')';
		ctx.fillRect( x1+1, y2, x2-x1-1, 1 );
		
		// top-left corner
		ctx.fillStyle = 'rgba(0,255,128,'+opacity+')';
		ctx.fillRect( x1, y1, 1, 1 );
		// top-right corner
		ctx.fillStyle = 'rgba(255,255,128,'+opacity+')';
		ctx.fillRect( x2, y1, 1, 1 );
		// bottom-left corner
		ctx.fillStyle = 'rgba(0,0,128,'+opacity+')';
		ctx.fillRect( x1, y2, 1, 1 );
		// bottom-right corner
		ctx.fillStyle = 'rgba(255,0,128,'+opacity+')';
		ctx.fillRect( x2, y2, 1, 1 );

	} // ProceduralTexture.convexRectangle
	
	
	
	// concave rectangle for normal map
	concaveRectangle( x1, y1, x2, y2, opacity=1 )
	{
		
		this.convexRectangle( x2, y2, x1, y1, opacity );
		
	} // ProceduralTexture.concaveRectangle

	
	
	debugShow( top = '3em', scale = 1 )
	{
		
		document.body.appendChild( this.canvas );
		this.canvas.style = "position:fixed; top:"+top+"; left:0em; z-index:10000; width:"+(scale*this.width)+"px;";

	} // ProceduralTexture.debugShow



} // ProceduralTexture
