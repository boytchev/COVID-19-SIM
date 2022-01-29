//
//	class Moon( )
//		update( sunPhase )
//


import * as THREE from '../js/three.module.js';
import {EARTH_SIZE} from '../config.js';
import {scene,textures} from '../main.js';


class Moon extends THREE.Group
{
	
	constructor( )
	{
		
		super();

		const
			DISTANCE = 0.55*EARTH_SIZE,
			SIZE = 0.016*DISTANCE;

		// moonlight
		this.light = new THREE.DirectionalLight( 0x202040, 0.6 );
		this.add( this.light );
		
		// moon body
		this.body = new THREE.Mesh(
			new THREE.CircleGeometry( SIZE, 32 ).rotateX( Math.PI ).translate(0,0,-DISTANCE),
			new THREE.MeshBasicMaterial( {
					color: 'white',
					side: THREE.BackSide,
					polygonOffset: true,
					polygonOffsetUnits: -5,
					polygonOffsetFactor: -5,
				} )
		);
		
		// moon halo
		this.halo = new THREE.Mesh(
			new THREE.ConeGeometry( DISTANCE, 0, 32, 1, true ).rotateX( Math.PI ).translate(0,-DISTANCE,0).rotateX( Math.PI/2 ),
			new THREE.MeshBasicMaterial( {
					color: 'white',
					side: THREE.BackSide,
					alphaMap: textures.moon.map(),
					transparent: true,
				} )
		);
			
		this.add( this.light, this.body, this.halo );
		
		scene.add( this );
		
	} // Moon.constructor
	
	
	update( moonPhase )
	{
		// moonPhase [-1,1]
		//  >0 if above horizon, moon is visible
		//  <0 if below horizon, moon is not visible
		this.halo.material.opacity = THREE.Math.clamp( 0.2+10*moonPhase, 0.4, 1 );
		
	} // Moon.update
	
	
} // Moon


export { Moon };