//
//	class Sky( scene )
//		constructSkyImage( scene )
//


import * as THREE from '../js/three.module.js';
import {GROUND_EDGE, DEBUG_ALL_WHITE, SUN, STATIC_SUN, GROUND_SIZE, SHADOWS, NO_SHADOWS, FULL_SHADOWS, SHADOWS_MAP_SIZE, AGENTS_CAST_SHADOWS, DEBUG_SUN_POSITION_GUI, SUN_HORIZONTAL_ANGLE, SAFE_MODE } from '../config.js';
import {Sun} from './sun.js';
import {/*MoonLight, */Moon} from './moon.js';
import {agents, camera, scene, renderer, controls} from '../main.js';


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
			this.shadow.camera.near = 0;
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


class Sky
{
	
	
	constructor( )
	{
		this.sysType = 'Sky';


		// in safe mode no sky is drawn
		if( SAFE_MODE ) 
		{
			scene.background = new THREE.Color( 'black' );
			
			this.topLightTarget = new THREE.Object3D();
			this.topLight =  new THREE.DirectionalLight( 'white', 0.6 );
			this.topLight.target = this.topLightTarget;
				
			scene.add( this.topLight, new THREE.AmbientLight( 'white', 0.4 ), this.topLightTarget );

			return;
		}

		
		this.sun = new Sun();
		this.moon = new Moon();

		// sky dome for sun, moon, stars
		this.skyDome = new THREE.Group();
		this.skyDome.rotation.set( 3*Math.PI/2, SUN_HORIZONTAL_ANGLE, 0, 'YXZ' );
		this.skyDome.add( this.sun, this.moon );
		scene.add( this.skyDome );
		
		
		this.skyColorNight = DEBUG_ALL_WHITE ? new THREE.Color( 'dimgray' ) : new THREE.Color( 'darkblue' );
		this.skyColorDay = DEBUG_ALL_WHITE ? new THREE.Color( 'lightgray' ) : new THREE.Color( 'skyblue' );
	
		scene.background = new THREE.Color( 'skyblue' );

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
		
		
		// collect all lights (except the moon light)
		var lights = [...this.sun.lights];
		
		// set ambient light - always present
		this.ambientLight = new AmbientLight();
		lights.push( this.ambientLight );
		
		
		// set top light - present if there are any types of shadows
		if( SHADOWS != NO_SHADOWS )
		{
			this.topLight = new TopLight();
			lights.push( this.topLight );
		}
		
		
		// adjust light intensities total to be 1
		var totalIntensity = 0;
		for( let light of lights )
		{
			totalIntensity += light.intensity;
		}
		for( let light of lights )
		{
			light.intensity /= totalIntensity;
			//console.log( light.intensity.toFixed(2), light.name );
		}

	} // Sky.constructor

	
	update( )
	{
		// in safe mode no sky is drawn
		if( SAFE_MODE )
		{
			this.topLight.position.copy( camera.position );
			//this.topLight.target = this.topLightTarget;
			this.topLightTarget.position.copy( controls.target );
			return;
		}

		if( SUN )
		{
			// calculate sun position
			var sunAngle = this.sun.getAngularPosition(),
				phase = Math.sin( sunAngle );

			// set sun and moon positions
			this.sun.update( phase );
			this.moon.update( -phase );
			this.skyDome.rotation.set( sunAngle+Math.PI, SUN_HORIZONTAL_ANGLE, 0, 'YXZ' );

			// set ambient light
			var hue = THREE.Math.clamp( phase, -0.5, 0.5 ); // 0=red, 0.2 = yellow
			var lightness = THREE.Math.clamp( 7*phase, 0, 1 ); // 0=night, 1=day
			this.ambientLight.color.setHSL( hue, DEBUG_ALL_WHITE?0:1, lightness );
			
			// set top light
			if( this.topLight )
			{
				this.topLight.color.copy( this.ambientLight.color );
			}
			
			// sky color
			lightness = THREE.Math.clamp( 5*phase, 0, 1 ); // 0=day, 1=night
			scene.background.lerpColors( this.skyColorNight, this.skyColorDay, lightness ).multiplyScalar( 0.2+0.8*lightness );
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
		if( DEBUG_SUN_POSITION_GUI && SHADOWS==FULL_SHADOWS )
		{
			renderer.shadowMap.needsUpdate = true;
		}

		
	} // Sky.update

} // Sky


export { Sky };