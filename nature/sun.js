//
//	class SunLight(shadowMapShift)
//	class Sun( )
//


import * as THREE from '../js/three.module.js';
import {EARTH_SIZE, SUN, SHADOWS, FULL_SHADOWS, SUN_HORIZONTAL_ANGLE, SHADOWS_MAP_SIZE, GROUND_SIZE} from '../config.js';
import {scene,textures} from '../main.js';

const SUN_SIN = Math.sin(SUN_HORIZONTAL_ANGLE);
const SUN_COS = Math.cos(SUN_HORIZONTAL_ANGLE);

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
		
		//controls.maxDistance = 5*GROUND_SIZE; // TODO: remove this, temporary added to debug shadows
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


export { SunLight, Sun, SUN_SIN, SUN_COS };