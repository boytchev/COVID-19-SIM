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



class Buildings
{



	constructor()
	{
		this.sysType = 'Buildings';

		this.offices = []; // array of OfficeBuilding
		
		var doors = []; // array of OfficeDoor
		
		OfficeBuildings.generate( this.offices, doors );
		OfficeBuildings.image( this.offices );
		
		//this.trees = []; // array of Tree
		this.houses = []; // array of HouseBuilding
		var sidewalks = []; // array of HouseSidewalk
		
		HouseBuildings.generate( this.houses, sidewalks );
		HouseBuildings.image( this.houses, sidewalks );

		this.apartments = []; // array of ApartmentBuilding
		
		ApartmentBuildings.generate( this.apartments, doors );
		ApartmentBuildings.image( this.apartments );
		
		OfficeDoors.image( doors ); // must be after apartments
		
	} // Buildings


	
} // Buildings

