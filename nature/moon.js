//
//	class MoonLight( )
//	class Moon( )
//


import * as THREE from '../js/three.module.js';
import {EARTH_SIZE} from '../config.js';
import {scene,textures} from '../main.js';


class MoonLight extends THREE.DirectionalLight
{
	constructor( )
	{
		super( 0x202040, 0.6 );
		
		this.name = 'moon';
		
		scene.add( this );
	} // MoonLight.constructor
	
} // MoonLight


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


export { MoonLight, Moon };