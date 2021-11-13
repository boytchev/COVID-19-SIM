//
//	class Sky( scene )
//		constructSkyImage( scene )
//


import * as THREE from '../js/three.module.js';
import {EARTH_SIZE, GROUND_EDGE, DEBUG_ALL_WHITE, DEBUG_BLOCKS_OPACITY, SUN, STATIC_SUN, STATIC_SUN_POSITION_MS, DEBUG_SUN_POSITION_GUI, SUNRISE_MS, SUNSET_MS, GROUND_SIZE, SHADOWS, NO_SHADOWS, FULL_SHADOWS, SHADOWS_MAP_SIZE, SHADOWS_MAX_COUNT, AGENTS_CAST_SHADOWS, SUN_HORIZONTAL_ANGLE, HOURS_24_MS } from '../config.js';
import {NatureMaterial, dayTimeMs} from './nature.js';
import {agents, scene, guiObject, renderer, controls, camera, textures} from '../main.js';
import {timeMs} from '../core.js';


const SUN_SIN = Math.sin(SUN_HORIZONTAL_ANGLE);
const SUN_COS = Math.cos(SUN_HORIZONTAL_ANGLE);

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
		
		this.position.set( 0, GROUND_SIZE, 0 );
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
		
		//this.position.set( GROUND_EDGE, 2*GROUND_EDGE, GROUND_EDGE );
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
		
		//controls.maxDistance = 5*GROUND_SIZE; // TODO: remove this, temporary added to debug shadows
	}
}


class MoonLight extends THREE.DirectionalLight
{
	constructor( )
	{
		super( 0x202040, 0.6 );
		
		this.name = 'moon';
		
		scene.add( this );
	}
}


class Sun extends THREE.Group
{
	
	constructor( )
	{
		
		super();
		
		const
			DISTANCE = 0.55*EARTH_SIZE,
			SIZE = 0.016*DISTANCE;
		
		this.body = new THREE.Mesh(
			new THREE.CircleGeometry( SIZE, 32 ).translate(0,0,DISTANCE),
			new THREE.MeshBasicMaterial( {
					color: 'white',
					side: THREE.BackSide,
					side: THREE.DoubleSide,
					polygonOffset: true,
					polygonOffsetUnits: -5,
					polygonOffsetFactor: -5,
				} )
		);
		
		// the sun halo
		this.halo = new THREE.Mesh(
			new THREE.ConeGeometry( DISTANCE, 0, 32, 1, true ).translate(0,DISTANCE,0).rotateX( Math.PI/2 ),
			new THREE.MeshBasicMaterial( {
					color: 'white',
					side: THREE.BackSide,
					side: THREE.DoubleSide,
					alphaMap: textures.sun.map(),
					transparent: true,
				} )
		);
		
		this.add( this.body, this.halo );
		scene.add( this );
		
	} // Sun.constructor
	
} // Sun



class Moon extends THREE.Group
{
	
	constructor( )
	{
		
		super();

		const
			DISTANCE = 0.55*EARTH_SIZE,
			SIZE = 0.016*DISTANCE;
		
		this.body = new THREE.Mesh(
			new THREE.CircleGeometry( SIZE, 32 ).translate(0,0,DISTANCE),
			new THREE.MeshBasicMaterial( {
					color: 'white',
					side: THREE.BackSide,
					side: THREE.DoubleSide,
					polygonOffset: true,
					polygonOffsetUnits: -5,
					polygonOffsetFactor: -5,
				} )
		);
		
		// the moon halo
		this.halo = new THREE.Mesh(
			new THREE.ConeGeometry( DISTANCE, 0, 32, 1, true ).translate(0,DISTANCE,0).rotateX( Math.PI/2 ),
			new THREE.MeshBasicMaterial( {
					color: 'white',
					side: THREE.BackSide,
					side: THREE.DoubleSide,
					alphaMap: textures.moon.map(),
					transparent: true,
				} )
		);
			
		this.add( this.body, this.halo );
		scene.add( this );
		
	} // Moon.constructor
	
} // Moon



class Sky
{
	
	
	constructor( )
	{
		this.sysType = 'Sky';
		
		// the sun and the moon
		this.sun = new Sun();
		this.moon = new Moon();
		if( SUN ) scene.add( this.sun, this.moon );
		
//scene.scale.set(0.1,0.1,0.1);			
	
		
		this.skyColorNight = DEBUG_ALL_WHITE ? new THREE.Color( 'dimgray' ) : new THREE.Color( 'darkblue' );
		this.skyColorDay = DEBUG_ALL_WHITE ? new THREE.Color( 'lightgray' ) : new THREE.Color( 'skyblue' );
	
		scene.background = new THREE.Color( 'skyblue' );

		this.sunPosition = new THREE.Vector3();
		
		this.sunLights = [];

		this.sunTarget = new THREE.Object3D(); // for shadows
		scene.add( this.sunTarget );
		
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

		this.moonLight = new MoonLight();
		if( !SUN ) this.moonLight.visible = false;
			
	} // Sky.constructor

	
	update( )
	{
		if( SUN )
		{
			// calculate sun position
			var sunAngle = this.getSunAngularPosition(),
				cos = Math.cos( sunAngle ),
				sin = Math.sin( sunAngle );
			this.sunPosition.set( EARTH_SIZE*cos*SUN_SIN, EARTH_SIZE*sin, EARTH_SIZE*cos*SUN_COS );
			
			// set the sun position
			this.sun.lookAt( this.sunPosition );

			// set the moon position - opposite of the sun
			this.moonLight.position.set( -this.sunPosition.x, -this.sunPosition.y, -this.sunPosition.z );
			this.moon.lookAt( this.moonLight.position );


			// light strength from sun and moon
			var lightness, hue;
			
			// set sun light
			lightness = THREE.Math.clamp( 5*sin, 0, 1 ); // 0=night, 1=day
			hue = THREE.Math.clamp( sin, 0, 0.25 ); // 0=red, 0.2 = yellow
			for( var i=0; i<this.sunLights.length; i++)
			{
				this.sunLights[i].color.setHSL( hue, DEBUG_ALL_WHITE?0:1, lightness );
			}
			
			// set sun color
			this.sun.body.material.color.setHSL( hue+0.05, DEBUG_ALL_WHITE?0:1, 0.5+1.5*lightness );
			this.sun.halo.material.color.setHSL( hue, DEBUG_ALL_WHITE?0:1, 0.3+lightness );

			// set moon color
			lightness = THREE.Math.clamp( 0.2-10*sin, 0.4, 1 ); // 0=day, 1=night
			this.moon.halo.material.opacity = lightness;

			// set ambient light
			hue = THREE.Math.clamp( sin, -0.5, 0.5 ); // 0=red, 0.2 = yellow
			lightness = THREE.Math.clamp( 7*sin, 0, 1 ); // 0=night, 1=day
			this.ambientLight.color.setHSL( hue, DEBUG_ALL_WHITE?0:1, lightness );
/*			
			// set top light
			if( this.topLight )
			{
				this.topLight.color.copy( this.ambientLight.color );
			}
*/			
			// sky color
			lightness = THREE.Math.clamp( 5*sin, 0, 1 ); // 0=day, 1=night
			scene.background.lerpColors( this.skyColorNight, this.skyColorDay, lightness ).multiplyScalar( 0.2+0.8*lightness );
		}
		else
		{
			camera.getWorldDirection( this.sunPosition );
			this.sunPosition.multiplyScalar( -1 );
		}

		// set light (sun) positions
		for( var i=0; i<this.sunLights.length; i++)
		{
			this.sunLights[i].position.copy( this.sunPosition ).setLength( GROUND_SIZE );
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

		
	} // Sky.update
	
	
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
	} // Sky.getSunAngularPosition
	
	

} // Sky


export { Sky };