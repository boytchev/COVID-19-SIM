//
//	class Elevator
//		constructor( center, doors )



class Elevator
{
	constructor( center, doors = [] )
	{
		this.sysType = 'Elevator';

		// size is lobby size
		this.zone = new Zone( center, ELEVATOR_SIZE );
		this.doors = doors; // list of closest doors
		
	} // Elevator.constructor
	
} // Elevator


