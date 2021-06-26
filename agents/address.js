//
//	class Address
//		constructor( )
//		randomPos( currentPosition ) 
//
//	class WorkAddress
//		constructor( )
//
//	class BlockAddress
//		constructor( block, exactPosition )
//


import * as THREE from '../js/three.module.js';
import {HouseBuilding} from '../objects/houseBuildings.js';
import {ApartmentBuilding} from '../objects/apartmentBuildings.js';
import {OfficeBuilding} from '../objects/officeBuildings.js';
import {buildings, blocks} from '../main.js';
import {drawArrow} from '../core.js';
import {pick} from '../coreNav.js';
import {FLOOR_HEIGHT} from '../config.js';


export class Address
{
	
	constructor( building = undefined, floor, number, exactPosition )
	{
		this.sysType = 'Address';
	
		this.building = building;	// HouseBuilding, ApartmentBuilding or OfficeBuilding
		this.floor = floor;			// 0..(floors-1)
		this.number = number;		// 0..(rooms-1)

		this.center = undefined;
		this.block = undefined;
		
		if( this.building)
		{
			if( this.building instanceof HouseBuilding )
			{
				this.center = this.building.wingA.center.clone();
			}
			
			if( this.building instanceof ApartmentBuilding )
			{
				if( this.number === undefined ) this.number = THREE.Math.randInt(0,this.building.rooms.length-1);
				if( this.floor === undefined ) this.floor = THREE.Math.randInt(0,this.building.floors-1);
				this.center = this.building.rooms[ this.number ].zone.center.clone();
				this.center.y = this.floor * FLOOR_HEIGHT;
			}
			
			if( this.building instanceof OfficeBuilding )
			{
				if( this.number === undefined ) this.number = THREE.Math.randInt(0,this.building.rooms.length-1);
				if( this.floor === undefined ) this.floor = THREE.Math.randInt(1,this.building.floors-1);
				this.center = this.building.rooms[ this.number ].zone.center.clone();
				this.center.y = this.floor * FLOOR_HEIGHT;
			}
			
			this.block = this.building.block;
			this.center.block = this.building.block;
			this.position = exactPosition || this.center;
		}
		else
		{
			if( exactPosition ) this.block = exactPosition.block;
			this.center = exactPosition;
			this.position = exactPosition;
		}
		
		
	} // Address.constructor
	
	
	
	// random position in the current building
	randomPos( currentPosition )
	{
		var position;
		
		if( this.building instanceof HouseBuilding )
		{
			// for houses the available position depends on the current position
			if( currentPosition )
			{
				var inWingA = this.building.wingA.isInside( currentPosition ),
					inWingB = this.building.wingB.isInside( currentPosition );
					
				if( inWingA && inWingB )
					position = this.building.randomPos();
				else if( inWingA )
					position = this.building.wingA.randomPos();
				else
					position = this.building.wingB.randomPos();
			}
			else
				position = this.building.randomPos();
		}
		else
		if( this.building )
		{
			position = this.building.rooms[ this.number ].zone.randomPos();
			position.y = this.floor * FLOOR_HEIGHT;
		}
		else
		{
			position = this.block.randomPos();
			
			// agenta in line
			//position.x = (Math.random()-0.5)/5;
			//position.z = poss; poss+=0.2+0.3*Math.random();
			
			// agents in row
			//position.z = 0;
			//position.x = poss; poss+=0.4;
		}
		
		if( this.building )
			position.block = this.building.block;
		
		return position;
		
	} // Address.randomPos
} // Address
	
//var poss = -0.2;
	
class SimpleWorkAddress extends Address
{
	constructor()
	{
		var building, floor, number;
		var fake = false;
		
		// first look for office in office building
		if( blocks.offices.length )
		{
			building = pick( pick(blocks.offices).buildings );
			floor = THREE.Math.randInt(1,building.floors-1);
			number = THREE.Math.randInt(0,building.rooms.length-1);
		} else
		// then try houses
		if( blocks.houses.length )
		{
			building = pick( pick(blocks.houses).buildings );
			floor = 0;
			number = 0;
		} else
		// then try apartments
		if( blocks.apartments.length )
		{
			building = pick( pick(blocks.apartments).buildings );
			floor = THREE.Math.randInt(0,building.floors-1);
			number = THREE.Math.randInt(0,building.rooms.length-1);
		} else
		{
			fake = true;
			console.error('Cannot set work address. Code:1055.');
		}

		if( !fake )
			super( building, floor, number );
		else
			super( undefined, undefined, undefined, pick(blocks.allTrueBlocks).randomPos() );
		
	} // SimpleWorkAddress.constructor
	
} // SimpleWorkAddress



export class WorkAddress extends Address
{
	constructor()
	{
		// generate first address
		if( WorkAddress.building === undefined )
		{
			// first look for office in office building
			if( buildings.offices.length )
			{
				WorkAddress.buildingIndex = THREE.Math.randInt( 0, buildings.offices.length-1 );
				WorkAddress.building = buildings.offices[ WorkAddress.buildingIndex ];
				WorkAddress.floor = THREE.Math.randInt( 1, WorkAddress.building.floors-1 );
				WorkAddress.number = THREE.Math.randInt( 0, WorkAddress.building.rooms.length-1 );
				WorkAddress.position = undefined;
			} else
			// then try houses
			if( buildings.houses.length )
			{
				WorkAddress.buildingIndex = THREE.Math.randInt( 0, buildings.houses.length-1 );
				WorkAddress.building = buildings.houses[ WorkAddress.buildingIndex ];
				WorkAddress.floor = 0;
				WorkAddress.number = 0;
				WorkAddress.position = undefined;
			} else
			// then try apartments
			if( buildings.apartments.length )
			{
				WorkAddress.buildingIndex = THREE.Math.randInt( 0, buildings.apartments.length-1 );
				WorkAddress.building = buildings.apartments[ WorkAddress.buildingIndex ];
				WorkAddress.floor = THREE.Math.randInt( 1, WorkAddress.building.floors-1 );
				WorkAddress.number = THREE.Math.randInt( 0, WorkAddress.building.rooms.length-1 );
				WorkAddress.position = undefined;
			} else
			{
				WorkAddress.buildingIndex = undefined;
				WorkAddress.building = undefined;
				WorkAddress.floor = undefined;
				WorkAddress.number = undefined;
				WorkAddress.position = pick(blocks.allTrueBlocks).randomPos();
			}
		}
		else
		{
			// first look for office in office building
			if( buildings.offices.length )
			{
				WorkAddress.number++;

				if( WorkAddress.number >= WorkAddress.building.rooms.length )
				{
					WorkAddress.number = 0;
					WorkAddress.floor++;
					
					if( WorkAddress.floor >= WorkAddress.building.floors )
					{
						WorkAddress.floor = 1;
						WorkAddress.buildingIndex++;
						
						if( WorkAddress.buildingIndex >= buildings.offices.length )
							WorkAddress.buildingIndex = 0;
						
						WorkAddress.building = buildings.offices[ WorkAddress.buildingIndex ];
					}
				}
				WorkAddress.position = undefined;
			} else
			// then try houses
			if( buildings.houses.length )
			{
				WorkAddress.buildingIndex++;
						
				if( WorkAddress.buildingIndex >= buildings.houses.length )
					WorkAddress.buildingIndex = 0;
						
				WorkAddress.building = buildings.houses[ WorkAddress.buildingIndex ];

				WorkAddress.floor = 0;
				WorkAddress.number = 0;
				WorkAddress.position = undefined;
			} else
			// then try apartments
			if( buildings.apartments.length )
			{
				WorkAddress.number++;

				if( WorkAddress.number >= WorkAddress.building.rooms.length )
				{
					WorkAddress.number = 0;
					WorkAddress.floor++;
					
					if( WorkAddress.floor >= WorkAddress.building.floors )
					{
						WorkAddress.floor = 0;
						WorkAddress.buildingIndex++;
						
						if( WorkAddress.buildingIndex >= buildings.apartments.length )
							WorkAddress.buildingIndex = 0;
						
						WorkAddress.building = buildings.apartments[ WorkAddress.buildingIndex ];
					}
				}
				WorkAddress.position = undefined;
			} else
			{
				WorkAddress.buildingIndex = undefined;
				WorkAddress.building = undefined;
				WorkAddress.floor = undefined;
				WorkAddress.number = undefined;
				WorkAddress.position = pick(blocks.allTrueBlocks).randomPos();
			}
		} // WorkAddress.prepareRrandomAddress
		
		super( WorkAddress.building, WorkAddress.floor, WorkAddress.number, WorkAddress.position );
		
	} // WorkAddress.constructor


} // WorkAddress

WorkAddress.buildingIndex = undefined;
WorkAddress.building = undefined;
WorkAddress.floor = undefined;
WorkAddress.room = undefined;
WorkAddress.position = undefined;
	
	
	
export class BlockAddress extends Address
{
	constructor( block )
	{
		if( !block )
			block = pick( blocks.allTrueBlocks );
		
		var pos = block.randomPos();
		
		super( undefined, undefined, undefined, pos );
		
	} // BlockAddress.constructor
	
} // BlockAddress
