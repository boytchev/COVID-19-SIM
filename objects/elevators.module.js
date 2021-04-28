//
//	class Elevator
//		constructor( center, doors, floors )
//		isClosed( y, time )
//		isMoving( y, time )


import {Zone, timeMs} from '../core.module.js';
import {dayTimeMs} from './nature.module.js';
import {pick} from '../coreNav.module.js';
import {ELEVATOR_SIZE, ELEVATOR_SPEED} from '../config.module.js';


export class Elevator
{
	constructor( center, doors = [], floors )
	{
		this.sysType = 'Elevator';

		// size is lobby size
		this.zone = new Zone( center, ELEVATOR_SIZE );
		this.doors = doors; // list of closest doors
		
		// timing for when to enter elevator
		this.timeSpan = timeMs(0,0,pick([15, 30, 45]));
		this.timeOffset = THREE.Math.randFloat(0,this.timeSpan);
		
		this.speed = ELEVATOR_SPEED.randFloat( );	// in meters/second
	} // Elevator.constructor
	
	
	
	isClosed( y = 0, time = dayTimeMs )
	{
		// normalize time cycle to period of [0..1]
		time = THREE.Math.euclideanModulo( 1000*y+time+this.timeOffset, this.timeSpan ) / this.timeSpan;

		// open [0,0.2]; closed (0.1,1]
		return time>0.2;
	} // Elevator.isClosed



	isMoving( y = 0, time = dayTimeMs )
	{
		// normalize time cycle to period of [0..1]
		time = THREE.Math.euclideanModulo( 1000*y+time+this.timeOffset, this.timeSpan ) / this.timeSpan;
		
		// open [0,0.2]; closed (0.1,1]
		return time>0.3;
	} // Elevator.isMoving


} // Elevator


Elevator.OUTSIDE = 0;
Elevator.INSIDE = 1;

