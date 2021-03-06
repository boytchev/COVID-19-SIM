//
//	Classes to control the visual effects of nature
//
//	class SunLight( intensity, shadowMapShift )
//
//	class Nature
//		update();
//


/* Comments:
												SHADOW	SHADOW
	LIGHT SOURCE				SUN		SHADOW	TYPE	COUNT	
	-------------------------	-------	------	-------	------
	camera, no shadows			no		no		static	0		
	camera, top shadows			no		top		static	1		
	camera, full shadows		no		full	dynamic	n+1		
	-------------------------	-------	------	-------	------	
	static sun, no shadows		static	no		static	0		
	static sun, top shadows		static	top		static	1
	static sun, full shadows	static	full	static	n+1
	-------------------------	-------	-------	-------	------	
	dynamic sun, no shadows		dynamic	no		static	0
	dynamic sun, top shadows	dynamic	top		static	1
	dynamic sun, full shadows	dynamic	full	dynamic	n+1
	-------------------------	-------	-------	-------	------	
*/

import * as THREE from '../js/three.module.js';
import {DEBUG_TIME_SPEED, START_TIME, HOURS_24_MS, SHADOWS, NO_SHADOWS, SUN, FULL_SHADOWS, GROUND_EDGE, DEBUG_ALL_WHITE, EARTH_SIZE, DEBUG_SHOW_VIRAL_SHEDDING, STATIC_SUN, SHADOWS_MAP_SIZE, STATIC_SUN_POSITION_MS, DEBUG_SUN_POSITION_GUI, SUNRISE_MS, SUNSET_MS, GROUND_SIZE, SUN_SIN, SUN_COS, SHADOWS_MAX_COUNT, AGENTS_CAST_SHADOWS} from '../config.js';
import {agents, scene, camera, renderer, guiObject} from '../main.js';
import {timeMs} from '../core.js';


var clock = new THREE.Clock();
export var deltaTimeReal = clock.getDelta();
export var deltaTime = DEBUG_TIME_SPEED*deltaTimeReal;
export var	frame = 0;


export var currentTimeMs = START_TIME;
export var dayTimeMs = currentTimeMs % HOURS_24_MS;
export var previousDayTimeMs = dayTimeMs;
var trueCurrentTimeMs = START_TIME;


export var NatureMaterial = ( SHADOWS != NO_SHADOWS ) ? THREE.MeshStandardMaterial : THREE.MeshBasicMaterial;

var ambientIntensities = [
		//NO  TOP  FULL_SHADOW
		[0.5, 0.5, 0.5],// NO_SUN
		[0.5, 0.5, 0.5],// STATIC_SUN
		[0.5, 0.5, 0.5]	// SYNAMIC_SUN
	];

var topIntensities = [
		//NO  TOP  FULL_SHADOW
		[0.1, 0.2, 0.2],// NO_SUN
		[0.1, 0.2, 0.2],// STATIC_SUN
		[0.1, 0.2, 0.2]	// SYNAMIC_SUN
	];
	
var sunIntensities = [
		//NO  TOP  FULL_SHADOW
		[1.0, 1.0, 1.0],// NO_SUN
		[1.0, 1.0, 1.0],// STATIC_SUN
		[1.0, 1.0, 1.0]	// SYNAMIC_SUN
	];


class AmbientLight extends THREE.AmbientLight
{
	constructor( intensity )
	{
		super( 'white', ambientIntensities[SUN][SHADOWS] );
		this.name = 'ambient';
		scene.add( this );
	}
}


class TopLight extends THREE.DirectionalLight
{
	constructor( intensity )
	{
		super( 'white', topIntensities[SUN][SHADOWS] );
		
		this.position.set( 0, 2*GROUND_EDGE, 0 );
		this.name = 'top';
		
		if( SHADOWS != NO_SHADOWS )
		{
			this.castShadow = true;
			this.shadow.mapSize.width = SHADOWS_MAP_SIZE>>2;
			this.shadow.mapSize.height = SHADOWS_MAP_SIZE>>2;
			this.shadow.camera.near = -10000;
			this.shadow.camera.far = 10000;
			this.shadow.camera.left = -GROUND_EDGE;
			this.shadow.camera.right = GROUND_EDGE;
			this.shadow.camera.bottom = -GROUND_EDGE;
			this.shadow.camera.top = GROUND_EDGE;
			this.shadow.bias = 0.00005;
			this.shadow.normalBias = 0.00005;
		}
		
		scene.add( this );
	}
}


class SunLight extends THREE.DirectionalLight
{
	constructor( shadowMapShift = 0 )
	{
		super( 'white', sunIntensities[SUN][SHADOWS]*Math.pow(0.7,shadowMapShift) );
		
		this.position.set( GROUND_EDGE, 2*GROUND_EDGE, GROUND_EDGE );
		this.name = 'sun_'+shadowMapShift;
		
		if( SHADOWS == FULL_SHADOWS )
		{
			this.castShadow = true;
			this.shadow.mapSize.width = SHADOWS_MAP_SIZE>>shadowMapShift;
			this.shadow.mapSize.height = SHADOWS_MAP_SIZE>>shadowMapShift;
			this.shadow.camera.near = 0;
			this.shadow.camera.far = 10000;
			this.shadow.camera.left = -GROUND_SIZE;
			this.shadow.camera.right = GROUND_SIZE;
			this.shadow.camera.bottom = -GROUND_SIZE;
			this.shadow.camera.top = GROUND_SIZE;
			this.shadow.bias = 0;//0.00001;//-0.001;
			this.shadow.normalBias = 0.15;//-0.001;
		}
		
		scene.add( this );
	}
}


export class Nature
{



	constructor()
	{
		this.sysType = 'Nature';
		this.sunLights = [];
		this.sunPosition = new THREE.Vector3();
		
		this.skyColorNight = new THREE.Color( 'darkblue' );
		this.skyColorDay = new THREE.Color( 'skyblue' );
		
		// set shadow capabilities of renderer
		if( SHADOWS != NO_SHADOWS )
		{
			renderer.shadowMap.enabled = true;
			
			//renderer.shadowMap.type = THREE.PCFShadowMap;
			renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			//renderer.shadowMap.type = THREE.BasicShadowMap;
			//renderer.shadowMap.type = THREE.VSMShadowMap;
			
			renderer.shadowMap.autoUpdate = false;
			renderer.shadowMap.needsUpdate = true;
		}
		
		
		// set ambient light - always present
		this.ambientLight = new AmbientLight();
		

		// set top light - present if there are any types of shadows
		if( SHADOWS != NO_SHADOWS )
		{
			this.topLight = new TopLight();
		}
		
		
		// set normal sun light, for full shadows there are many
		var shadowCount = (SHADOWS==FULL_SHADOWS) ? SHADOWS_MAX_COUNT : 1;
		for( var i=0; i<shadowCount; i++)
		{
			this.sunLights[i] = new SunLight( i );
		}
		
		
		// add background color
		scene.background = new THREE.Color( DEBUG_ALL_WHITE?'white':'skyblue' );
		scene.fog = new THREE.Fog( DEBUG_ALL_WHITE?'white':'skyblue', 2*GROUND_SIZE, 0.4*EARTH_SIZE );
		
		
		// adjust light intensities total to be 1
		var totalIntensity = 0;
		for( var i=0; i<scene.children.length; i++ )
			if( scene.children[i] instanceof THREE.Light )
				totalIntensity += scene.children[i].intensity;
		for( var i=0; i<scene.children.length; i++ )
			if( scene.children[i] instanceof THREE.Light )
			{
				scene.children[i].intensity /= totalIntensity;
				scene.children[i].originalIntensity = scene.children[i].intensity;
				//console.log( scene.children[i].intensity.toFixed(2), scene.children[i].name );
			}
			
		if( DEBUG_SHOW_VIRAL_SHEDDING ) 
			this.debugShowViralShedding();
	} // Nature


	update()
	{
		
		// update time markers
		deltaTimeReal = clock.getDelta(),
		deltaTime = DEBUG_TIME_SPEED*deltaTimeReal;
		trueCurrentTimeMs += 1000*deltaTime;
		currentTimeMs = THREE.Math.lerp( currentTimeMs, trueCurrentTimeMs, 0.1 );
		previousDayTimeMs = dayTimeMs;
		dayTimeMs = currentTimeMs % HOURS_24_MS;
		frame++;


		if( SUN )
		{
			var sunAngle = this.getSunAngularPosition(),
				cos = Math.cos( sunAngle ),
				sin = Math.sin( sunAngle );
			this.sunPosition.set( GROUND_SIZE*cos*SUN_SIN, GROUND_SIZE*sin, GROUND_SIZE*cos*SUN_COS );

			// set sun color
			var lightness = THREE.Math.clamp( 8*sin, 0, 1 ); // 0=night, 1=day, 10=speed at morning light-up 
			var hue = THREE.Math.clamp( 0.5*sin, 0, 0.2 ); // 0=red, 0.2 = yellow
			for( var i=0; i<this.sunLights.length; i++)
			{
				this.sunLights[i].color.setHSL( hue, 1/*saturation*/, lightness );
			}
			
			var lightness = THREE.Math.clamp( 8*sin, 0, 1 ); // 0=night, 1=day, 10=speed at morning light-up 
			var hue = THREE.Math.clamp( sin, 0, 0.2 ); // 0=red, 0.2 = yellow
			this.ambientLight.color.setHSL( hue, 1/*saturation*/, lightness );
			
			// set the sky color
			var lightness = THREE.Math.clamp( 10*sin, 0, 1 );
			var hue = THREE.Math.clamp( 1*sin, 0, 0.2 );
			scene.background.lerpColors( this.skyColorNight, this.skyColorDay, lightness );
			scene.background.multiplyScalar( lightness );
			scene.fog.color = scene.background;
		}
		else
		{
			camera.getWorldDirection( this.sunPosition );
			this.sunPosition.multiplyScalar( -1 );
		}

		// set light (sun) positions
		for( var i=0; i<this.sunLights.length; i++)
			this.sunLights[i].position.copy( this.sunPosition );
		
		// request regeneration of shadows
		if( SUN!=STATIC_SUN && SHADOWS==FULL_SHADOWS )
		{	
			renderer.shadowMap.needsUpdate = true;
		}
		if( SHADOWS==FULL_SHADOWS && AGENTS_CAST_SHADOWS && agents.agents.length )
		{	
			renderer.shadowMap.needsUpdate = true;
		}

		
	} // Nature.update
	
	
	
	// calculate sun position at given time of the day
	getSunAngularPosition()
	{
		var t = (SUN==STATIC_SUN) ? STATIC_SUN_POSITION_MS : dayTimeMs;
		
		if( DEBUG_SUN_POSITION_GUI )
		{
			t = timeMs(guiObject.sunPos);
			renderer.shadowMap.needsUpdate = true;
		}
		
		// check relative time position rT in respect to sunrise(rT=0) and sunset(rT=1)
		var rT = THREE.Math.mapLinear( t, SUNRISE_MS, SUNSET_MS, 0, 1 );

		if( rT<0 || rT>1)
		{
			// it is nighttime, calculate how much of the night has passed
			if( dayTimeMs<SUNRISE_MS ) t += HOURS_24_MS;
			rT = THREE.Math.mapLinear( t, SUNSET_MS, SUNRISE_MS+HOURS_24_MS, 1, 2 );
		}
		
		return rT*Math.PI;
	} // Nature.getSunAngularPosition
	
	
	debugShowViralShedding()
	{
		var totalDays = 14,
			peakDay = 4;
			
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
		

		var dX = (W-40)/(10*totalDays);
		
		for( var i=0; i<=10*totalDays; i++ )
		{
			ctx.fillStyle = 'cornflowerblue';
			var xx = i/10/totalDays;

			var columnHeight = (H-40)*viralShedding.getPointAt( xx ).y;
			ctx.fillRect( 20+dX*i, H-20-columnHeight, dX, columnHeight );	
		}

		var dX = (W-40)/(totalDays);
		for( var i=0; i<=totalDays; i++ )
		{
			ctx.fillStyle = 'crimson';
			var xx = i/totalDays;
			var columnHeight = (H-40);
			ctx.fillRect( 20+dX*i, H-20-columnHeight, 1, columnHeight );	
		}
		
		document.body.appendChild( canvas );
		canvas.style = "position:fixed; top:50px; left:50px; z-index:120000; border:solid 1px black;";
	} // Agents.debugShowViralShedding
	
} // Nature

