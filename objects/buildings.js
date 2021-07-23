//
//	class Buildings
//			offices[x,z,sizeX,sizeZ,height,floors,block]
//			generateOfficesImage()
//			generateOfficeDoorsImage()
//
//		generateHouses()
//			houses[x,z,sizeX,sizeZ,height,floors,block]
//			generateHousesImage()
//


import {OfficeBuildings} from './officeBuildings.js';
import {HouseBuildings} from './houseBuildings.js';
import {ApartmentBuildings} from './apartmentBuildings.js';
import {OfficeDoors} from './officeDoors.js';

export class Buildings
{



	constructor()
	{
		this.sysType = 'Buildings';

		this.offices = []; // array of OfficeBuilding
		
		var doors = []; // array of OfficeDoor
		
		OfficeBuildings.generate( this.offices, doors );
		this.officesMesh = OfficeBuildings.image( this.offices );
		
		//this.trees = []; // array of Tree
		this.houses = []; // array of HouseBuilding
		var sidewalks = []; // array of HouseSidewalk
		
		HouseBuildings.generate( this.houses, sidewalks );
		HouseBuildings.image( this.houses, sidewalks );

		this.apartments = []; // array of ApartmentBuilding
		
		ApartmentBuildings.generate( this.apartments, doors );
		ApartmentBuildings.image( this.apartments );
		
		OfficeDoors.image( doors ); // must be after apartments
		
		
		// statistics
		var statHomes = this.houses.length,
			statOffices = 0;
		for( var i=0; i<this.apartments.length; i++)
			statHomes += this.apartments[i].floors * this.apartments[i].rooms.length;
		for( var i=0; i<this.offices.length; i++)
			statOffices += (this.offices[i].floors-1) * this.offices[i].rooms.length; // first floor has no offices
		console.log(statHomes+' homes,',statOffices+' offices');
		
	} // Buildings


	
} // Buildings

