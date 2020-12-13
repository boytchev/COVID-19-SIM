//
//	class Elevator
//		constructor( center, doors, floors )
//		isClosed( floor, time )



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
		this.timeOffset = THREE.Math.randFloat(0,2*Math.PI);
		
		this.speed = ELEVATOR_SPEED.randFloat( );	// in meters/second
	} // Elevator.constructor
	
	
	// submark=0 when outside elevator and waiting to enter elevator
	// submark=1 when inside elevator and waiting to start elevating
	isClosed( floor, time = dayTimeMs )
	{
		// normalize time cycle to period of [0..1]
		time = THREE.Math.euclideanModulo( time+floor, this.timeSpan ) / this.timeSpan;
		
		// open [0,0.1]; closed (0.1,1]
		return time>0.1;
	} // Elevator.denyUsing

} // Elevator


Elevator.OUTSIDE = 0;
Elevator.INSIDE = 1;

