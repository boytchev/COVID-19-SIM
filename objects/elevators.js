//
//	class Elevator
//		constructor( center, doors, floors )
//		denyUsing( floor, time )



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
	} // Elevator.constructor
	
	denyUsing( floor, time = dayTimeMs )
	{
		// normalize time to period of [0..1]
		time = THREE.Math.euclideanModulo( time+floor, this.timeSpan ) / this.timeSpan;
		
		// if sine<0, then it the elevator cannot be used
		return Math.sin( 2*Math.PI*time + this.timeOffset) < 0.8;
	} // Elevator.denyUsing

} // Elevator


