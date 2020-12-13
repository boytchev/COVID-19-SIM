//
//	class Elevator
//		constructor( center, doors, floors )
//		isClosed( floor, time )
//		isMoving( floor, time )



class Elevator
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
	
	
	isClosed( time = dayTimeMs )
	{
		// normalize time cycle to period of [0..1]
		time = THREE.Math.euclideanModulo( time+this.timeOffset, this.timeSpan ) / this.timeSpan;

		// open [0,0.2]; closed (0.1,1]
		return time>0.2;
	} // Elevator.isClosed


	isMoving( time = dayTimeMs )
	{
		// normalize time cycle to period of [0..1]
		time = THREE.Math.euclideanModulo( time+this.timeOffset, this.timeSpan ) / this.timeSpan;
		
		// open [0,0.2]; closed (0.1,1]
		return time>0.3;
	} // Elevator.isMoving


} // Elevator


Elevator.OUTSIDE = 0;
Elevator.INSIDE = 1;

