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
import {INFECTION_PATTERNS_COUNT, DEBUG_TIME_SPEED, START_TIME, HOURS_24_MS, SHADOWS, NO_SHADOWS, SUN, FULL_SHADOWS, GROUND_EDGE, DEBUG_ALL_WHITE, EARTH_SIZE, DEBUG_SHOW_VIRAL_SHEDDING, STATIC_SUN, SHADOWS_MAP_SIZE, STATIC_SUN_POSITION_MS, DEBUG_SUN_POSITION_GUI, SUNRISE_MS, SUNSET_MS, GROUND_SIZE, SUN_SIN, SUN_COS, SHADOWS_MAX_COUNT, AGENTS_CAST_SHADOWS} from '../config.js';
import {agents, scene, camera, renderer, guiObject, controls} from '../main.js';
import {timeMs} from '../core.js';


var clock = new THREE.Clock();
export var deltaTimeReal = clock.getDelta();
export var deltaTime = DEBUG_TIME_SPEED*deltaTimeReal;
export var	frame = 0;


export var currentTimeMs = START_TIME;
export var dayTimeMs = currentTimeMs % HOURS_24_MS;
export var previousDayTimeMs = dayTimeMs;
var trueCurrentTimeMs = START_TIME;


export var NatureMaterial = THREE.MeshStandardMaterial;

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
			this.shadow.camera.near = 10;
			this.shadow.camera.far = 10000;
			this.shadow.camera.left = -GROUND_SIZE;
			this.shadow.camera.right = GROUND_SIZE;
			this.shadow.camera.bottom = -GROUND_SIZE;
			this.shadow.camera.top = GROUND_SIZE;
			this.shadow.bias = 0;//0.00001;//-0.001;
			this.shadow.normalBias = 0.15;//-0.001;
			this.shadow.radius = 10;
		}
		
		scene.add( this );
		
		controls.maxDistance = 5*GROUND_SIZE; // TODO: remove this, temporary added to debug shadows
	}
}

export class Nature
{



	constructor()
	{
		this.sysType = 'Nature';
		this.sunLights = [];
		this.sunPosition = new THREE.Vector3();
		this.sunTarget = new THREE.Object3D(); // for shadows
		
		scene.add( this.sunTarget );
		
		this.skyColorNight = DEBUG_ALL_WHITE ? new THREE.Color( 'dimgray' ) : new THREE.Color( 'darkblue' );
		this.skyColorDay = DEBUG_ALL_WHITE ? new THREE.Color( 'lightgray' ) : new THREE.Color( 'skyblue' );
		
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
			this.sunLights[i].target = this.sunTarget;
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


//		this.debugSpot = new THREE.Mesh( new THREE.BoxGeometry(1,0.1,1), new THREE.MeshLambertMaterial({color:'white'}));
//		this.debugSpot.receiveShadow = true;
//		scene.add( this.debugSpot );

	} // Nature


	update()
	{
//		this.debugSpot.position.set((controls.target.x),0,(controls.target.z));
//		var shadowSize = 4*controls.target.distanceTo(camera.position);
//		this.debugSpot.scale.set(shadowSize,1,shadowSize);
/*
		for( var i=0; i<this.sunLights.length; i++)
		{
			this.sunLights[i].shadow.camera.left = -shadowSize;
			this.sunLights[i].shadow.camera.right = shadowSize;
			this.sunLights[i].shadow.camera.bottom = -shadowSize;
			this.sunLights[i].shadow.camera.top = shadowSize;
			this.sunLights[i].shadow.camera.updateProjectionMatrix();
			shadowSize = shadowSize*0.7;
		}
*/
		
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
				this.sunLights[i].color.setHSL( hue, DEBUG_ALL_WHITE?0:1/*saturation*/, lightness );
			}
			
			var lightness = THREE.Math.clamp( 8*sin, 0, 1 ); // 0=night, 1=day, 10=speed at morning light-up 
			var hue = THREE.Math.clamp( sin, 0, 0.2 ); // 0=red, 0.2 = yellow
			this.ambientLight.color.setHSL( hue, DEBUG_ALL_WHITE?0:1/*saturation*/, lightness );
			
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
		{
			//this.sunLights[i].position.copy( this.sunPosition );
			this.sunTarget.position.copy( controls.target );
			this.sunLights[i].position.addVectors( controls.target, this.sunPosition );
		}
		
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

