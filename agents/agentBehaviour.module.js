//
//  class AgentDailySchedule
//		constructor()
//		reset( isAdult )
//
//
//
//	class AgentBehaviour
//		constructor()
//		shouldBeAwake()
//
//				pleaseGoTo( target, block )			// initiate going to somewhere
//				pleaseStayHome(  )					// initiate staying at home
//				pleaseSleepHome(  )					// initiate staying at home
//
//		stepTo( target )
//				closeTo( target ) 
//				inHouse( )
//				debugBlock( pos )
//
//		walkRoute( nextAction )
//		addToRoute( pos/zone )
//		addRingToRoute( ring, fromIndex, toIndex )
//		noRoute( )
//
//		router( from, to )
//			routerExitHouse( house )
//			routerExitApartmentBuilding( address, toAddress )
//
//		AGENT_DOING_NOTHING()
//		AGENT_WORKING_IN_OFFICE()
//		AGENT_STAYING_AT_HOME()
//		AGENT_WALKING_AT_HOME()
//		AGENT_WALKING_IN_OFFICE()
//		AGENT_SLEEPING_AT_HOME()
//		AGENT_WALKING_ROUTE()
//


import {timeMs, Pos, Range, Zone, almostEqual} from '../core.module.js';
import {pick, pickDirection, clipLineRoute, pickDistance} from '../coreNav.module.js';
import {dayTimeMs, deltaTime} from '../objects/nature.module.js';
import {Crossing} from '../objects/crossings.module.js';
import {Elevator} from '../objects/elevators.module.js';
import {DEBUG_ROUTES_PER_AGENT, BLOCK_PARK, BLOCK_PLAZA, BLOCK_HOUSES, BLOCK_APARTMENTS, BLOCK_OFFICE, DEBUG_SHOW_ROUTES, DEBUG_DUMP_ROUTES, ELEVATOR_SIZE} from '../config.module.js';



const AGENT_CHILD_SLEEP_TIME_MS  = new Range( timeMs(19), timeMs(21) );		// in milliseconds (19:00-21:00)
const AGENT_CHILD_WAKEUP_TIME_MS = new Range( timeMs(6), timeMs(7,30) );	// in milliseconds (06:00-07:30)
const AGENT_ADULT_SLEEP_TIME_MS  = new Range( timeMs(21), timeMs(26) );		// in milliseconds (21:00-02:00)
//const AGENT_ADULT_WAKEUP_TIME_MS = new Range( timeMs(5,30), timeMs(7) );	// in milliseconds (05:30-07:00)
//const AGENT_LEAVE_HOME_TIME_MS	 = new Range( timeMs(6), timeMs(8) );		// in milliseconds (06:00-08:00)
const AGENT_LEAVE_WORK_TIME_MS	 = new Range( timeMs(17), timeMs(20) );		// in milliseconds (17:00-20:00)

//const AGENT_REST_TIME_AT_HOME_MS = new Range( 0, timeMs(0,5) );	// in milliseconds (0-5 min), time to rest between walkings at home
//const AGENT_STILL_TIME_AT_OFFICE_MS = new Range( 0, timeMs(1,0) );	// in milliseconds (0-5 min), time to work on one place in the office
const AGENT_REST_TIME_AT_HOME_MS = new Range( 0, timeMs(0,5) );	// in milliseconds (0-5 min), time to rest between walkings at home
const AGENT_STILL_TIME_AT_OFFICE_MS = new Range( 0, timeMs(0,10) );	// in milliseconds (0-5 min), time to work on one place in the office



const AGENT_ADULT_WAKEUP_TIME_MS = new Range( timeMs(6,0,1), timeMs(6,0,2) );	// in milliseconds (05:30-07:00)
const AGENT_LEAVE_HOME_TIME_MS	 = new Range( timeMs(6,0,0), timeMs(6,10) );		// in milliseconds (06:00-08:00)



class AgentDailySchedule
{
	constructor()
	{
		this.sysType = 'AgentDailySchedule';

		this.timeToWakeupMs = undefined;
		this.timeToSleepTimeMs = undefined;
		this.timeToStayStillMs = undefined;
		this.timeToGoToWorkMs = undefined;
		this.timeToGoHomeTimeMs = undefined;
		
		this.alreadyWorkedToday = false;
		this.alreadyElevating = false;
		
	} // AgentDailySchedule.constructor
	
	
	
	reset( isAdult )
	{
		if( isAdult )
		{
			this.timeToWakeupMs = AGENT_ADULT_WAKEUP_TIME_MS.randTime( );
			this.timeToSleepTimeMs = AGENT_ADULT_SLEEP_TIME_MS.randTime( );
			this.timeToGoToWorkMs = AGENT_LEAVE_HOME_TIME_MS.randFloat( );
			this.timeToGoToHomeMs = AGENT_LEAVE_WORK_TIME_MS.randFloat( );
		}
		else
		{
			this.timeToWakeupMs = AGENT_CHILD_WAKEUP_TIME_MS.randTime( );
			this.timeToSleepTimeMs = AGENT_CHILD_SLEEP_TIME_MS.randTime( );
			this.timeToGoToWorkMs = undefined;
			this.timeToGoToHomeMs = undefined;
			//this.timeToGoToWorkMs = AGENT_LEAVE_HOME_TIME_MS.randFloat( );// todo: temporary allow children to go to work
		}

		this.timeToStayStillMs = AGENT_REST_TIME_AT_HOME_MS.randTime();
		this.alreadyWorkedToday = false;
		
	} // AgentDailySchedule.reset
	
	
} // AgentDailySchedule



export class AgentBehaviour
{
	
	constructor( )
	{
		this.sysType = 'AgentBehaviour';

		this.position = new Pos(0,0);

		this.doing = this.AGENT_DOING_NOTHING;
		this.doingNext = this.AGENT_DOING_NOTHING;
		
		this.dailySchedule = new AgentDailySchedule();
		this.gotoPosition = undefined;			// xyz+block coordinates
		this.routePosition = undefined;
		this.gotoCrossing = undefined;
		this.walkingDirection = new Pos(0,0);
		
		this.goal = undefined;	// ultimate final gotoPosition
		
		// assume agent is at home
		if( this.shouldBeAwake() )
			this.doing = this.AGENT_STAYING_AT_HOME;
		else
			this.doing = this.AGENT_SLEEPING_AT_HOME;
		
//this.doing = this.AGENT_DOING_NOTHING; // todo
				
	} // AgentBehaviour.constructor

	
	
	
	routerExitHouse( house )
	{
		// go to house center
		this.addToRoute( house.randomPosAB() ); 
		
		// then go to a door and exit trough it
		var door = pick( house.doors );
		this.addToRoute( door.insideZone ); 
		this.addToRoute( door.outsideZone ); 
		
		// go around the house
		this.addRingToRoute( house.ring, door.ringIndex, house.path.ringIndex );

		// go to the street sidewalk
		this.addToRoute( house.path.outsideZone ); 
		
	} // AgentBehaviour.routerExitHouse

	
	
	routerGoToHouse( fromHouse, toHouse )
	{	// assume we are on the sidewalk of the house block
	
		var ring = this.routePosition.block.ring;
		this.addRingToRoute( ring, fromHouse.ringIndex, toHouse.ringIndex );
		
	} // AgentBehaviour.routerGoToHouse

	
	
	routerGoToIndex( fromIndex, toIndex, mark )
	{	// assume we are on the sidewalk of the house block
	
		var ring = this.routePosition.block.ring;
		this.addRingToRoute( ring, fromIndex, toIndex, mark );
		
	} // AgentBehaviour.routerGoToHouse
	
	
	
	routerEnterHouse( house )
	{	// assume we are at the house
		
		// go to the end of the path (it is next to the house)
		this.addToRoute( house.path.insideZone ); 
		
		// pick a door and go round the house to that door
		var door = pick( house.doors );
		this.addRingToRoute( house.ring, house.path.ringIndex, door.ringIndex );

		// go through the door
		this.addToRoute( door.insideZone ); 
		
		// go to the central area
		this.addToRoute( house.randomPosAB() ); 
			
	} // AgentBehaviour.routerGoToHouse
	
	
	
	routerExitApartmentBuilding( address, toAddress )
	{
		var apartment = address.building.rooms[address.number];
		
		// go to the door and exit trough it
		this.addToRoute( apartment.insideZone.randomPos().setFloor(address.floor) ); 
		this.addToRoute( apartment.outsideZone.randomPos().setFloor(address.floor) ); 
		
		// go to the nearest elevator
		var elevator = apartment.closestElevator;
		this.addToRoute( elevator.zone.randomPos().setFloor(address.floor), elevator, Elevator.OUTSIDE ); 
	
		// go to the ground floor if not there
		if( address.floor )
			this.addToRoute( elevator.zone, elevator, Elevator.INSIDE ); 

		// pick a crossings (as mid-target) which is suitable
		// for reaching the final location, if there are no crossing,
		// then use the destination
		
		if( address.building.block.crossings.length )
		{
			var crossing = pickDirection( this.routePosition, address.building.block.crossings, toAddress.position );
		
			// go to one of the doors, prefer the door which is suitable
			// for reaching the crossing
			var door = pickDirection( this.routePosition, elevator.doors, crossing.center );
		}
		else
		{
			var door = pickDirection( this.routePosition, elevator.doors, toAddress );
		}
		this.addToRoute( door.insideZone ); 
		this.addToRoute( door.outsideZone ); 
			
	} // AgentBehaviour.routerExitApartmentBuilding
	
	
	
	routerEnterApartmentBuilding( position, to )
	{
		var apartment = to.building.rooms[to.number];
		
		// find suitable elevator and door
		var elevator = pickClosest( position, to.building.elevators, to.position );
		var door = pickClosest( position, to.building.doors, elevator.zone.center );
		
		// go to the door, then to elevator, then to floor
		this.addToRoute( clipLineRoute( this.routePosition, door.outsideZone.randomPos(), to.block.buildings ) );
		this.addToRoute( door.insideZone );
		this.addToRoute( elevator.zone, elevator, Elevator.OUTSIDE ); 
		this.addToRoute( elevator.zone.randomPos().setFloor(to.floor), elevator, Elevator.INSIDE ); 
		
		// go to the door and enter trough it
		this.addToRoute( apartment.outsideZone.randomPos().setFloor(to.floor) ); 
		this.addToRoute( apartment.insideZone.randomPos().setFloor(to.floor) ); 
		this.addToRoute( to.position ); 
			
	} // AgentBehaviour.routerExitApartmentBuilding
	
	
	
	router( from, to ) //@@
	{
// in same park/plaza
//		var from = new BlockAddress( pick(blocks.plazas) );
//		var	to = new BlockAddress(from.block);
		
// in different park/plaza
//		var from = new BlockAddress( pick(blocks.plazas) );
//		var	to = new BlockAddress( pick(blocks.plazas) );

		
// in same house 		
//		var from = new Address(buildings.houses[0], 0, 0, buildings.houses[0].wingA.randomPos());
//		var	to = new Address(buildings.houses[0], 0, 0, buildings.houses[0].wingB.randomPos());

// in different houses, same block
//		var block = pick( blocks.houses );
//		if( !from) from = new Address( pick(block.buildings) ); from.position = from.randomPos();
//		if( !to) to = new Address( pick(block.buildings) ); to.position = to.randomPos();

// in different houses
//		if( !from) from = new Address( pick(buildings.houses) ); from.position = from.randomPos();
//		if( !to) to = new Address( pick(buildings.houses) ); to.position = to.randomPos();

// in different appartment buildings
//		if( !from) from = new Address( pick(buildings.apartments) ); from.position = from.randomPos();
//		if( !to) to = new Address( pick(buildings.houses) ); to.position = to.randomPos();
		
// in same appartments
//		if( !from) from = new Address( pick(buildings.apartments) ); from.position = from.randomPos();
//		if( !to) to = new Address( from.building, from.floor, from.number ); to.position = to.randomPos();
		
// appartments in same floor
//		if( !from) from = new Address( pick(buildings.apartments) ); from.position = from.randomPos();
//		if( !to) to = new Address( from.building, from.floor, THREE.Math.randInt(0,from.building.rooms.length-1) ); to.position = to.randomPos();
		
// appartments in same building
//		if( !from) from = new Address( pick(buildings.apartments) ); from.position = from.randomPos();
//		if( !to) to = new Address( from.building ); to.position = to.randomPos();
		
// appartments in same block
//		var block = pick( blocks.apartments );
//		if( !from) from = new Address( pick(block.buildings) ); from.position = from.randomPos();
//		if( !to) to = new Address( pick(block.buildings) ); to.position = to.randomPos();

// different appartments
//		if( !from) from = new Address( pick(buildings.apartments) ); from.position = from.randomPos();
//		if( !to) to = new Address( pick(buildings.apartments) ); to.position = to.randomPos();

// in same offices
//		if( !from) from = new Address( pick(buildings.offices) ); from.position = from.randomPos();
//		if( !to) to = new Address( from.building, from.floor, from.number ); to.position = to.randomPos();

// offices in same floor
//		if( !from) from = new Address( pick(buildings.offices) ); from.position = from.randomPos();
//		if( !to) to = new Address( from.building, from.floor, THREE.Math.randInt(0,from.building.rooms.length-1) ); to.position = to.randomPos();

// offices in different floors
//		if( !from) from = new Address( pick(buildings.offices) ); from.position = from.randomPos();
//		if( !to) to = new Address( from.building ); to.position = to.randomPos();

// offices in different buildings
//		if( !from) from = new Address( pick(buildings.offices) ); from.position = from.randomPos();
//		if( !to) to = new Address( pick(buildings.offices) ); to.position = to.randomPos();

//		drawArrow( from.position, to.position );


		this.addToRoute( from.position );
		this.routePosition = from.position;
		//this.gotoPosition = [];
		
		
		var that = this;

		if( from.block === to.block )
		{ // 1 - same blocks
	
			switch( from.block.type )
			{
				case BLOCK_PARK:
						// 1.1 - park
						this.addToRoute( to.position );
						break;
				case BLOCK_PLAZA:
						// 1.2 - plaza
						this.addToRoute( to.position );
						break;
				case BLOCK_HOUSES:
						// 1.3 - house
						var house = from.building;
						
						if( from.building === to.building )
						{ // 1.3.1 - same house
							var	fromInWingA  = house.wingA.isInside( from.position ),
								toInWingA = house.wingA.isInside( to.position );
								
							if( fromInWingA == toInWingA )
							{ // 1.3.1.1 - same wings
								this.addToRoute( to.position );
							}
							else
							{ // 1.3.1.2 - different wings
								this.addToRoute( house.randomPosAB() );
								this.addToRoute( to.position );
							}
						}
						else
						{ // 1.3.2 - different house
							var toHouse = to.building;
							
							this.routerExitHouse( house );
							this.routerGoToHouse( house, toHouse );
							this.routerEnterHouse( toHouse );
							this.addToRoute( to.position );
						}
						break;
				case BLOCK_APARTMENTS:
						// 1.4
						var fromApartment = from.building.rooms[from.number],
							toApartment = to.building.rooms[to.number];
							
						if( from.building === to.building )
						{ // 1.4.1 - same building
							if( from.floor == to.floor )
							{ // 1.4.1.1 - same floor
								if( from.number == to.number )
								{ // 1.4.1.1.1 - same apartment/room
									this.addToRoute( to.position );
								}
								else
								{ // 1.4.1.1.2 - different apartment/room
									this.addToRoute( fromApartment.insideZone.randomPos().setFloor(from.floor) ); 
									this.addToRoute( fromApartment.outsideZone.randomPos().setFloor(from.floor) ); 

									this.addToRoute( toApartment.outsideZone.randomPos().setFloor(to.floor) ); 
									this.addToRoute( toApartment.insideZone.randomPos().setFloor(to.floor) ); 
									this.addToRoute( to.position ); 											
								}
							}
							else
							{ // 1.4.1.2 - different floor
								this.addToRoute( fromApartment.insideZone.randomPos().setFloor(from.floor) ); 
								this.addToRoute( fromApartment.outsideZone.randomPos().setFloor(from.floor) ); 

								var elevator = pickDirection( from.position, from.building.elevators, to.position );
								this.addToRoute( elevator.zone.randomPos().setFloor(from.floor), elevator, Elevator.OUTSIDE );
								this.addToRoute( elevator.zone.randomPos().setFloor(to.floor), elevator, Elevator.INSIDE );
								
								this.addToRoute( toApartment.outsideZone.randomPos().setFloor(to.floor) ); 
								this.addToRoute( toApartment.insideZone.randomPos().setFloor(to.floor) ); 
								this.addToRoute( to.position ); 											
							}
						}
						else
						{ // 1.4.2 = different building
							this.routerExitApartmentBuilding( from, to );
							this.routerEnterApartmentBuilding( this.routePosition, to );
						}
						break;
				case BLOCK_OFFICE:
						// 1.5 - same block and same building
						var fromOffice = from.building.rooms[from.number],
							toOffice = to.building.rooms[to.number];
							
						if( from.floor == to.floor )
						{ // 1.5.1 - same floor
							if( from.number == to.number )
							{ // 1.5.1.1 - same apartment/room
								this.addToRoute( to.position );
							}
							else
							{ // 1.5.1.2 - different office/room
								this.addToRoute( fromOffice.insideZone.randomPos().setFloor(from.floor) ); 
								this.addToRoute( fromOffice.outsideZone.randomPos().setFloor(from.floor) ); 

								this.addToRoute( clipLineRoute( this.routePosition, toOffice.outsideZone.randomPos().setFloor(to.floor), to.building.rooms, 1/2 ) );

								this.addToRoute( toOffice.insideZone.randomPos().setFloor(to.floor) ); 
								this.addToRoute( to.position ); 											
							}
						}
						else
						{ // 1.5.1.2 - different floor
							this.addToRoute( fromOffice.insideZone.randomPos().setFloor(from.floor) ); 
							this.addToRoute( fromOffice.outsideZone.randomPos().setFloor(from.floor) ); 

							var elevator = pickDirection( this.routePosition, from.building.elevators, to.position );
							this.addToRoute( clipLineRoute( this.routePosition, elevator.zone.randomPos().setFloor(from.floor), to.building.rooms, 1/2 ), elevator, Elevator.OUTSIDE );
							this.addToRoute( elevator.zone.randomPos().setFloor(to.floor), elevator, Elevator.INSIDE );

							this.addToRoute( clipLineRoute( this.routePosition, toOffice.outsideZone.randomPos().setFloor(to.floor), to.building.rooms, 1/2 ) );
							this.addToRoute( toOffice.insideZone.randomPos().setFloor(to.floor) ); 
							this.addToRoute( to.position ); 											
						}
						break;
				default:
					console.error('Unknown block type in router. Code 1050.');
			}
			
			
		}
		else
		{ // 2 - different blocks

			// exit the current building
			switch( from.block.type )
			{
				case BLOCK_PARK:
				case BLOCK_PLAZA:
						// 2.1.1 - park
						// 2.2.1 - plaza
						break;
				case BLOCK_HOUSES:
						// 2.3.1 - house
						var house = from.building,
							ringIndex = house.ringIndex;
						this.routerExitHouse( house );
						break;
				case BLOCK_APARTMENTS:
						// 2.4.1 todo
						this.routerExitApartmentBuilding( from, to );
						break;
				case BLOCK_OFFICE:
						// 2.5.1 todo
						var fromOffice = from.building.rooms[from.number];
							
						this.addToRoute( fromOffice.insideZone.randomPos().setFloor(from.floor) ); 
						this.addToRoute( fromOffice.outsideZone.randomPos().setFloor(from.floor) ); 
						
						// pick a crossings (as mid-target) which is suitable
						// for reaching the final location
						var crossing = pickDirection( this.routePosition, from.building.block.crossings, to.position );
						var door = pickDirection( this.routePosition, from.building.doors, crossing.center );
						var elevator = pickDirection( this.routePosition, from.building.elevators, door.insideZone.center );
						
						this.addToRoute( clipLineRoute( this.routePosition, elevator.zone.randomPos().setFloor(from.floor), from.building.rooms, 1/2 ), elevator, Elevator.OUTSIDE );
						this.addToRoute( elevator.zone.randomPos().setFloor(0), elevator, Elevator.INSIDE );
						this.addToRoute( door.insideZone );
						this.addToRoute( door.outsideZone );
						break;
				default:
					console.error('Unknown block type in router. Code 1050.');
			}
			
			// while the final block is not reached
			// cross a block to a crossing, and then cross that crossing
			var countProtection = 0;
			var lastCrossings = [undefined, undefined, undefined];
			var blocks = []; // blocks[i]=n -> block i starts from position n in the route
			var loopIndex = -1; // index in the route
			
			blocks[this.routePosition.block.id] = this.gotoPosition.length-1;
//console.log('start loop-check area',(this.gotoPosition.length-1));
			
			while( this.routePosition.block !== to.block )
			{
				// find the next crossing
				var block = this.routePosition.block,
					crossing = pickDirection( this.routePosition, block.crossings, to.position, lastCrossings );
//console.log(block.id,'#'+(this.gotoPosition.length-1));
				lastCrossings[2] = lastCrossings[1];
				lastCrossings[1] = lastCrossings[0];
				lastCrossings[0] = crossing;
				
				// go to it
				switch( block.type )
				{
					case BLOCK_PARK:
					case BLOCK_PLAZA:
							// 2.1.2 - park
							// 2.2.2 - plaza
							this.addToRoute( crossing, '1020' );
							break;
					case BLOCK_HOUSES:
							// 2.3.2 - house
							this.routerGoToIndex( ringIndex, crossing.ringIndex, '1022' );
							break;
					case BLOCK_APARTMENTS:
					case BLOCK_OFFICE:
							// 2.4.2 - apartments
							// 2.5.2 - offices
							//debugger;
							this.addToRoute( clipLineRoute( this.routePosition, crossing.randomPos(), block.buildings ), '1021' );
							break;
					default:
						console.error('Unknown block type in router. Code 1050.');
				}
				
				// add marker for "this" side of the crossing
				// it will be used to force the agents to stop
				this.gotoPosition[this.gotoPosition.length-1].mark = crossing.crossing;
//console.log('add to route',crossing.crossing);
				
				// cross the crossing
				this.addToRoute( crossing.pairZone, '521' );
				ringIndex = crossing.pairZone.ringIndex;
				
				if( blocks[this.routePosition.block.id] )
				{
//console.log('Possible loop from #'+blocks[this.routePosition.block.id]);
					if( loopIndex<0 )
						loopIndex = blocks[this.routePosition.block.id];
					else
						loopIndex = Math.min(loopIndex,blocks[this.routePosition.block.id]);
				}
				else
				{
					blocks[this.routePosition.block.id] = this.gotoPosition.length-1;
				}
				
				countProtection++;
				if( countProtection>1000 )
				{
					console.error('Too many loops in the router. Code 1130.');
					break;
				}
			} // while final block not reached
			
//console.log('actual loop-check area',loopIndex);
//console.log('end loop-check area',(this.gotoPosition.length-1));

			// if there is loop, remove it now, do not check for Y position, it should be all 0
			// loops are checked only for the block-to-block route
			// loops are not checked for route in the beginning or ending block
			if( loopIndex>=0 )
			{
				//console.log('check for loops from',loopIndex,'to',this.gotoPosition.length-1);
				var end = this.gotoPosition.length-1;
				while( loopIndex < end )
				{
					var zone = this.gotoPosition[loopIndex].zone;
					if( zone )
					{
						while( end-- > loopIndex )
						{
							if( zone===this.gotoPosition[end].zone )
								break;
						}
						if( end>loopIndex )
						{
							//console.log('remove loop from',loopIndex,'to',end);
							this.gotoPosition.splice( loopIndex, end-loopIndex );
						}
					}
					end = this.gotoPosition.length-1;
					loopIndex++;
				}
			}


			// reached the final block
			switch( to.block.type )
			{
				case BLOCK_PARK:
				case BLOCK_PLAZA:
						// 2.1.3 - park
						// 2.2.3 - plaza
						
						this.addToRoute( to.position,'541' );
						break;
				case BLOCK_HOUSES:
						// 2.3.3 - house
						
						var house = to.building;
						this.routerGoToIndex( ringIndex, house.ringIndex );
						this.routerEnterHouse( house, '548' );
						this.addToRoute( to.position );
						break;
				case BLOCK_APARTMENTS:

						// 2.4.3 - apartment
						this.routerEnterApartmentBuilding( this.routePosition, to );
						break;
				case BLOCK_OFFICE:
						// 2.5.3 todo

						var toOffice = to.building.rooms[to.number];
//DEBUG_FLAG_1 = true;						
						var door = pickDistance( this.routePosition, to.building.doors, to.position );
//DEBUG_FLAG_1 = false;
						var elevator = pickDistance( door.insideZone.center, to.building.elevators, toOffice.outsideZone.center );
						
						this.addToRoute( clipLineRoute( this.routePosition, door.outsideZone.randomPos(), to.block.buildings ) );
						this.addToRoute( door.insideZone );
						this.addToRoute( elevator.zone.randomPos(), elevator, Elevator.OUTSIDE );
						this.addToRoute( elevator.zone.randomPos().setFloor(to.floor), elevator, Elevator.INSIDE );

						this.addToRoute( clipLineRoute( this.routePosition.setFloor(to.floor), toOffice.outsideZone.randomPos().setFloor(to.floor), to.building.rooms, 1/2 ) );
						
						this.addToRoute( toOffice.insideZone.randomPos().setFloor(to.floor) ); 
						this.addToRoute( to.position ); 

						break;
				default:
					console.error('Unknown block type in router. Code 1050.');
			}
		}
//console.log('total points',(this.gotoPosition.length-1));
		
		if( DEBUG_SHOW_ROUTES )
		{
			var color = 'crimson',//new THREE.Color(Math.random(),Math.random()/3,Math.random()/2),
				offset = 0.1;
			
			for( var i=0; i<this.gotoPosition.length; i++)
			{
				
				if( i )
					drawArrow( this.gotoPosition[i-1].addY(offset), this.gotoPosition[i].addY(offset),color );
				else
					drawArrow( from.position.addY(offset), this.gotoPosition[i].addY(offset),color );
			}
		} // if( DEBUG_SHOW_ROUTES )
		
		if( DEBUG_DUMP_ROUTES )
		{
			console.group('New route');
			console.log('from\t',from);
			console.log('to\t',to);
			
			//console.log('current\t',this.position.x.toFixed(2),this.position.z.toFixed(2));

			for( var i=0; i<this.gotoPosition.length; i++)
			{
				// vertical black arrows
				//if( this.gotoPosition[i].zone )
				//	drawArrow( this.gotoPosition[i].zone.center.addY(this.gotoPosition[i].y+0.2), this.gotoPosition[i].zone.center.addY(this.gotoPosition[i].y+5), 'black' );
			
				var s = '#'+i+'\t'+
					'zn='+(this.gotoPosition[i].zone?this.gotoPosition[i].zone.id:'    ')+'\t'+
					'bl='+(this.gotoPosition[i].block?this.gotoPosition[i].block.id:'    ')+'\t'+
					'fl='+this.gotoPosition[i].y/FLOOR_HEIGHT+'\t';
				if( this.gotoPosition[i].mark )
				{
					if( this.gotoPosition[i].mark instanceof Object )
					{
						s += this.gotoPosition[i].mark.constructor.name;
					}
					else
					{
						s += this.gotoPosition[i].mark;
					}
				}
				console.log(s);
			}
			console.groupEnd('New route');
		} // if( DEBUG_DUMP_ROUTES )
		
//		if( this.id==0 )
//		{
//			for( var i=0; i<this.gotoPosition.length; i++)
//			{
//				console.log(i,'\t',this.gotoPosition[i].y );
//			}
//		}
		
		//this.doing = this.AGENT_WALKING_ROUTE; // todo
		this.doing = this.AGENT_STAYING_AT_HOME; // todo
	}
	
	
	
	AGENT_WALKING_ROUTE()
	{
		this.walkRoute( this.doingNext );
							
	} // AgentBehaviour.AGENT_WALKING_ROUTE



	shouldBeAwake()
	{
		// times are modulo 24-hour, there are two cases (S=sleep A-awake)
		
		var sleep = this.dailySchedule.timeToSleepTimeMs,
			awake = this.dailySchedule.timeToWakeupMs;
			
		if( sleep < awake )
		{
			//	+++++++S-------A+++++++
			return (awake <= dayTimeMs) || (dayTimeMs <= sleep); 
		}
		else
		{
			//  -------A+++++++S-------
			return (awake <= dayTimeMs) && (dayTimeMs <= sleep);
		}
		
	} // AgentBehaviour.shouldBeAwake
	

	
	// make a horizontal step towards a position, return TRUE if position is reached
	stepTo( target = this.gotoPosition )
	{
//		console.log('current\t',this.position.x.toFixed(2),this.position.z.toFixed(2));
			
		var v = this.position.to( target ),
			distance = v.distance( ), // distance to target
			walkDistance = this.walkingSpeed * deltaTime; // distance to be walked

		// if target is ouside an elevator, then approach it,
		// but enter only of door is open
		if( target.mark instanceof Elevator )
		{
			if( target.submark == Elevator.OUTSIDE )
			{
				this.alreadyElevating = false;
				if( distance < 1.5*Math.max(ELEVATOR_SIZE.x,ELEVATOR_SIZE.z) )
				if( distance > 1.0*Math.max(ELEVATOR_SIZE.x,ELEVATOR_SIZE.z) )
					if( target.mark.isClosed( this.position.y ) )
					{
						return false;
					}
			}
			if( target.submark == Elevator.INSIDE )
			{
				if( !this.alreadyElevating && !target.mark.isMoving( this.position.y ) )
					return false;
					
				this.alreadyElevating = true;
				//this.debugColor( 2 );
				walkDistance = target.mark.speed * deltaTime;
			}
		}
		
		// set walking vector
		if( !almostEqual(distance,0,0.0001) )
		{
			this.walkingDirection.x = v.x/distance;
			this.walkingDirection.z = v.z/distance;
		}
		
		// target too close, go directly to target
		if( walkDistance > distance )
		{
			if( this.position.block != target.block )
			{
				// agent moves from this.position.block to target.block
				
				target.block.agents.push( this );
				
				var idx = this.position.block.agents.indexOf( this );
				console.assert( idx>=0 );
				this.position.block.agents.splice( idx, 1 );
	//			console.log('agent change blocks',(this.position.block?this.position.block.id:'?')+'→'+(target.block?target.block.id:'?'));
			}
			this.position = target;
			return true;
		}
		
		// make one step to target
		this.position = this.position.add( v, walkDistance/distance );		

		return false;
		
	} // AgentBehaviour.stepTo

	

	addToRoute( pos, mark, submark )
	{
		if( !this.gotoPosition )
			this.gotoPosition = [];

		if( pos instanceof Array )
			this.gotoPosition.push( ...pos );
		else
		if( pos.randomPos )
			this.gotoPosition.push( pos.randomPos() );
		else
			this.gotoPosition.push( pos );
		
		this.routePosition = this.gotoPosition[ this.gotoPosition.length-1 ];
		
		if( pos instanceof Zone )
			this.routePosition.zone = pos;
		
		this.routePosition.mark = mark;
		this.routePosition.submark = submark;
		//console.log('route len =',this.gotoPosition.length);
	}
	
	
	
	walkRoute( nextAction = this.AGENT_DOING_NOTHING )
	{
//console.log('walkRoute',this.position.x.toFixed(2),this.position.z.toFixed(2));
/* if( this.position.block )
	console.log('walk in block',this.position.block.id);
else
	console.log('walk in unknown block');
 */
		// if there are position in the route
		if( this.gotoPosition.length )
		{
			
			// make a step and return if the target is not reached
			if( !this.stepTo(this.gotoPosition[0]) )
				return
		}

		// if at crossing that is red-light, then wait
		if( this.gotoPosition[0].mark )
			if( this.gotoPosition[0].mark instanceof Crossing )
				if( this.gotoPosition[0].mark.denyCrossing() )
				{
					return;
				}
		// otherwise remove the reached target
		this.gotoPosition.shift();


		// if there are no more targets, continue with the next action
		if( this.gotoPosition.length == 0 )
		{
			this.gotoPosition = null;
			this.doing = nextAction;
		}
	}
	
	
	
	addRingToRoute( ring, fromIndex, toIndex, mark )
	{
		// check if we are already there
		if( fromIndex == toIndex )
		{
			this.addToRoute( ring[fromIndex], mark ); 
			return;
		}
		
		var n = ring.length;
		
		// find shorter direction
		var dir = ((toIndex-fromIndex+n)%n <= (fromIndex-toIndex+n)%n) ? 1 : -1;
		
		while( fromIndex != toIndex )
		{
			fromIndex = (fromIndex+n+dir) % n;
			this.addToRoute( ring[fromIndex], '727' ); 
		}
	}
	
	
	
	get noRoute( )
	{
		return this.gotoPosition === null;
	}
	
	
	
	// return TRUE if position is reached
	closeTo( target )
	{
		var v = this.position.to( target ),
			distance = v.distance( ),
			walkDistance = this.walkingSpeed * deltaTime;
		
		// target too close, go directly to target
		return walkDistance > distance;
		
	} // AgentBehaviour.closeTo
	

	
	debugBlock( pos = this.position, label = '' )
	{
		debugBlock( pos, label );
	} // AgentBehaviour.debugBlock()

	
	
	AGENT_DOING_NOTHING()
	{
		return;
		
	} // AgentBehaviour.AGENT_DOING_NOTHING
	
	

	AGENT_STAYING_AT_HOME()
	{
		// ignore request if the agent has no home
		if( !this.home.building )
			return;
		
		// is it time to sleep?
		if( !this.shouldBeAwake() )
		{
			this.doing = this.AGENT_SLEEPING_AT_HOME;
			return;
		}

		// is it time to leave for work/school?
//console.log(msToString(this.dailySchedule.timeToGoToWorkMs) );
		if( dayTimeMs > this.dailySchedule.timeToGoToWorkMs && !this.dailySchedule.alreadyWorkedToday )
		{			
			for( var i=0; i<DEBUG_ROUTES_PER_AGENT; i++)
				this.router( this.home, this.work );
			this.doing = this.AGENT_WALKING_ROUTE;
			this.doingNext = this.AGENT_WORKING_IN_OFFICE;
			
			return;
		}

		// is it still resting?
		if( this.timeToStayStillMs > 0 )
		{
			this.timeToStayStillMs -= 1000*deltaTime;
			return; // stay without moving
		}
		
		this.timeToStayStillMs = AGENT_REST_TIME_AT_HOME_MS.randTime();

		this.gotoPosition = null;
		this.doing = this.AGENT_WALKING_AT_HOME;
			
	} // AgentBehaviour.AGENT_STAYING_AT_HOME
	
	
	
	AGENT_WORKING_IN_OFFICE()
	{
		// is it time to leave for home?
		if( dayTimeMs > this.dailySchedule.timeToGoToHomeMs )
		{			
			for( var i=0; i<DEBUG_ROUTES_PER_AGENT; i++)
				this.router( this.work, this.home );
			this.doing = this.AGENT_WALKING_ROUTE;
			this.doingNext = this.AGENT_STAYING_AT_HOME;
			this.dailySchedule.alreadyWorkedToday = true;
			
			return;
		}

		// is it still resting?
		if( this.timeToStayStillMs > 0 )
		{
			this.timeToStayStillMs -= 1000*deltaTime;
			return; // stay without moving
		}

		this.timeToStayStillMs = AGENT_STILL_TIME_AT_OFFICE_MS.randTime();

		this.gotoPosition = null;
		this.doing = this.AGENT_WALKING_IN_OFFICE;
			
	} // AgentBehaviour.AGENT_WORKING_IN_OFFICE
	
	
	
	AGENT_WALKING_AT_HOME()
	{
		if( this.noRoute )
		{
			this.addToRoute( this.home.randomPos(this.position) );
		}
		
		this.walkRoute( this.AGENT_STAYING_AT_HOME );

	} // AgentBehaviour.AGENT_WALKING_AT_HOME
	
	
	
	AGENT_WALKING_IN_OFFICE()
	{
		if( this.noRoute )
		{
			this.addToRoute( this.work.randomPos(this.position) );
		}
		
		this.walkRoute( this.AGENT_WORKING_IN_OFFICE );

	} // AgentBehaviour.AGENT_WALKING_IN_OFFICE
	

	
	AGENT_SLEEPING_AT_HOME()
	{
		if( this.shouldBeAwake() )
		{
			this.doing = this.AGENT_STAYING_AT_HOME;
			return;
		}
		
	} // AgentBehaviour.AGENT_SLEEPING_AT_HOME
	
	
		
} // AgentBehaviour
