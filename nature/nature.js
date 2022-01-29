//
//	Classes to control the visual effects of nature
//
//	class SunLight( intensity, shadowMapShift )
//
//	class Nature
//		update();
//



import * as THREE from '../js/three.module.js';
import {INFECTION_PATTERNS_COUNT, DEBUG_TIME_SPEED, START_TIME, HOURS_24_MS, DEBUG_SHOW_VIRAL_SHEDDING} from '../config.js';
import {Ground} from './ground.js';
import {Sky} from './sky.js';


var clock = new THREE.Clock();
export var deltaTimeReal = clock.getDelta();
export var deltaTime = DEBUG_TIME_SPEED*deltaTimeReal;


export var currentTimeMs = START_TIME;
export var dayTimeMs = currentTimeMs % HOURS_24_MS;
export var previousDayTimeMs = dayTimeMs;
var trueCurrentTimeMs = START_TIME;

export var simulationPlaying = true;

export var NatureMaterial = THREE.MeshStandardMaterial;


export class Nature
{

	constructor()
	{
	
		this.sysType = 'Nature';
		
		this.ground = new Ground();
		this.sky = new Sky();

		if( DEBUG_SHOW_VIRAL_SHEDDING ) 
			this.debugShowViralShedding();

	} // Nature


	update()
	{		
		// update time markers
		deltaTimeReal = (simulationPlaying?1:0) * clock.getDelta(),
		deltaTime = DEBUG_TIME_SPEED*deltaTimeReal;
		trueCurrentTimeMs += 1000*deltaTime;
		currentTimeMs = THREE.Math.lerp( currentTimeMs, trueCurrentTimeMs, 0.1 );
		previousDayTimeMs = dayTimeMs;
		dayTimeMs = currentTimeMs % HOURS_24_MS;

		this.sky.update();
	} // Nature.update
	
	
	
	debugShowViralShedding()
	{
		var totalDays = INFECTION_PATTERNS_COUNT+1,
			peakDay = Math.round(INFECTION_PATTERNS_COUNT/3);
			
		var viralShedding = new THREE.SplineCurve( [
				new THREE.Vector2( 0, 0 ),
				new THREE.Vector2( peakDay/2, 0.15 ),
				new THREE.Vector2( peakDay, 1 ),
				new THREE.Vector2( totalDays/2+peakDay/2, 0.15 ),
				new THREE.Vector2( totalDays, 0 )
			] );
			
		var W = window.innerWidth-100,
			H = window.innerHeight-100;
			
		var canvas = document.createElement( 'canvas' );
			canvas.width = W;
			canvas.height = H;
		
		var ctx = canvas.getContext( '2d' );
			ctx.fillStyle = 'white';
			ctx.fillRect( 0, 0, W, H );	
			ctx.font = '12px sans-serif';
		

		// draw curves
		
		//ctx.strokeStyle = 'crimson';
		ctx.lineWidth = 2;
		//ctx.fillStyle = 'crimson';
		ctx.textAlign = 'center';
		var dX = (W-80)/(30*totalDays);
		for( var j = 0; j<INFECTION_PATTERNS_COUNT; j++ )
		{
			var peakDay = j+1;
			
			viralShedding = new THREE.SplineCurve( [
				new THREE.Vector2( 0, 0 ),
				new THREE.Vector2( peakDay/2, 0.15 ),
				new THREE.Vector2( peakDay, 1 ),
				new THREE.Vector2( (totalDays+peakDay)/2, 0.15 ),
				new THREE.Vector2( totalDays, 0 )
			] );
		
			var oldY = -100,
				captioned = false;
			
			ctx.strokeStyle = `hsl(${360*(j-1)/(INFECTION_PATTERNS_COUNT-1)}, 100%, 35%)`;
			ctx.fillStyle = ctx.strokeStyle;
			
			ctx.beginPath();
			for( var i=0; i<=30*totalDays; i++ )
			{
				var xx = i/30/totalDays;

				var x = 50+dX*i+dX/2,
					y = H-20-(H-60)*viralShedding.getPointAt( xx ).y;
		
				if( i )
					ctx.lineTo( x, y );
				else
					ctx.moveTo( x, y );

				// pattern caption
				if( i>30 && y>oldY && !captioned )
				{
					ctx.fillText('Pattern', x, 20 );
					ctx.fillText('№'+peakDay, x, 35 );
					captioned = true;
				}
				
				oldY = y;
			}
			ctx.stroke();
		}


		ctx.fillStyle = 'black';
		ctx.textAlign = 'right';
		ctx.fillText('Time:', 45, H-5 );
		ctx.fillText('Infect:', 45, 20 );
		
		
		// draw grid
		ctx.fillStyle = 'black';
		ctx.fillRect( 50, 20, 2, H-40 );	
		ctx.fillRect( 20, H-20, W-40, 2 );	

		ctx.fillStyle = 'gray';
		for( var i=1; i<=10; i++ )
		{
			var y = H-20-(H-60)*i/10-1;
			ctx.fillText( (10*i)+'%', 35, y+5 );
			ctx.fillRect( 40, y, W-60-10, 1 );
		}
		
		ctx.textAlign = 'center';
		for( var i=1; i<=10; i++ )
		{
			var x = 50+(W-80)*i/10;
			ctx.fillText( (10*i)+'%', x, H-5 );
			ctx.fillRect( x, 40, 1, H-60+5 );
		}
		
		document.body.appendChild( canvas );
		canvas.style = "position:fixed; top:50px; left:50px; z-index:120000; border:solid 1px black;";
		
		canvas.onclick = function() { canvas.style.display = 'none'; }
	} // Agents.debugShowViralShedding
	
} // Nature




export function toggleSimulationPlayPause()
{

	simulationPlaying = !simulationPlaying;

	document.getElementById('play').style.display = simulationPlaying ? 'inline' : 'none';
	document.getElementById('pause').style.display = simulationPlaying ? 'none' : 'inline';

 	if( simulationPlaying )
	{
		// consume elapsed time during a pause
		clock.getDelta();
	}

} // toggleSimulationPlayPause