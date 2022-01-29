//
//	class SunLight(shadowMapShift)
//	class Sun( )
//		update( phase )
//		getAngularPosition( )
//


import * as THREE from '../js/three.module.js';
import {EARTH_SIZE, SUN, SHADOWS, FULL_SHADOWS, SHADOWS_MAP_SIZE, GROUND_SIZE, STATIC_SUN, STATIC_SUN_POSITION_MS, DEBUG_SUN_POSITION_GUI, SUNRISE_MS, SUNSET_MS, HOURS_24_MS, DEBUG_ALL_WHITE, SHADOWS_MAX_COUNT} from '../config.js';
import {scene, textures, guiObject} from '../main.js';
import {dayTimeMs} from './nature.js';
import {timeMs} from '../core.js';


var sunIntensities = [
		//NO  TOP  FULL_SHADOW
		[1.0, 1.0, 1.0],// NO_SUN
		[1.0, 1.0, 1.0],// STATIC_SUN
		[1.0, 1.0, 1.0]	// SYNAMIC_SUN
	];
	
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

	} // Sun.constructor
	
} // SunLight.constructor


class Sun extends THREE.Group
{
	
	constructor( )
	{
		
		super();
		
		const
			DISTANCE = 0.55*EARTH_SIZE,
			SIZE = 0.016*DISTANCE;
		
		// sun lights - they are several for better shadows
		this.lights = [];
		var n = (SHADOWS==FULL_SHADOWS) ? SHADOWS_MAX_COUNT : 1;
		for( var i=0; i<n; i++)
		{
			this.lights[i] = new SunLight( i );
			this.lights[i].position.set( 0, 0, DISTANCE );
			this.lights[i].target = scene;
		}

		// sun body
		this.body = new THREE.Mesh(
			new THREE.CircleGeometry( SIZE, 32 ).translate(0,0,DISTANCE),
			new THREE.MeshBasicMaterial( {
					color: 'white',
					side: THREE.BackSide,
					polygonOffset: true,
					polygonOffsetUnits: -5,
					polygonOffsetFactor: -5,
				} )
		);
		
		// sun halo
		this.halo = new THREE.Mesh(
			new THREE.ConeGeometry( DISTANCE, 0, 32, 1, true ).translate(0,DISTANCE,0).rotateX( Math.PI/2 ),
			new THREE.MeshBasicMaterial( {
					color: 'white',
					side: THREE.BackSide,
					alphaMap: textures.sun.map(),
					transparent: true,
				} )
		);
		
		this.add( this.body, this.halo, ...this.lights );
		
		scene.add( this );
		
	} // Sun.constructor
	
		
	update( sunPhase )
	{
		// sunPhase [-1,1]
		//  >0 if above horizon, sun is visible
		//  <0 if below horizon, sun is not visible
		
		var lightness, hue;

		// set sun light
		lightness = THREE.Math.clamp( 5*sunPhase, 0, 1 ); // 0=night, 1=day
		hue = THREE.Math.clamp( sunPhase, 0, 0.25 ); // 0=red, 0.2 = yellow
		for( var light of this.lights )
		{
			light.color.setHSL( hue, DEBUG_ALL_WHITE?0:1, lightness );
		}
		
		// set sun color
		this.body.material.color.setHSL( hue+0.05, DEBUG_ALL_WHITE?0:1, 0.5+1.5*lightness );
		this.halo.material.color.setHSL( hue, DEBUG_ALL_WHITE?0:1, 0.3+lightness );

	} // Sun.update
	
	

	// calculate sun position at given time of the day
	getAngularPosition()
	{
		
		var t = dayTimeMs;
		
		if( SUN == STATIC_SUN ) t = STATIC_SUN_POSITION_MS;
		if( DEBUG_SUN_POSITION_GUI ) t = timeMs(guiObject.sunPos);
			
		// check relative time position rT in respect to sunrise(rT=0) and sunset(rT=1)
		var rT = THREE.Math.mapLinear( t, SUNRISE_MS, SUNSET_MS, 0, 1 );

		if( rT<0 || rT>1)
		{
			// it is nighttime, calculate how much of the night has passed
			if( t<SUNRISE_MS ) t += HOURS_24_MS;
			rT = THREE.Math.mapLinear( t, SUNSET_MS, SUNRISE_MS+HOURS_24_MS, 1, 2 );
		}

		return rT*Math.PI;
		
	} // Sky.getAngularPosition
	
	
} // Sun


export { Sun };