//
//	class Textures()
//

import {DEBUG_ALL_WHITE} from '../config.module.js';
import {ProceduralTexture} from './proceduralTexture.module.js';
import {ApartmentTexture, ApartmentNormalTexture} from './apartmentTexture.module.js';
import {CrossingTexture} from './crossingTexture.module.js';
import {GrassTexture} from './grassTexture.module.js';
import {GridTexture} from './gridTexture.module.js';
import {HouseTexture, HouseBumpTexture} from './houseTexture.module.js';
import {OfficeDoorTexture} from './officeDoorTexture.module.js';
import {OfficeTexture, OfficeNormalTexture} from './officeTexture.module.js';
import {SidewalkTexture} from './sidewalkTexture.module.js';


export class Textures
{
	
	constructor()
	{
		this.empty = new ProceduralTexture( 16 );
		
		this.grid = new GridTexture( 64*2 );
		
		this.sidewalk = new SidewalkTexture( 64, 64, DEBUG_ALL_WHITE?'white':'beige' );
		
		this.office = new OfficeTexture( 64, 64*2 );
		this.officeNormal = new OfficeNormalTexture( 64, 64*2, DEBUG_ALL_WHITE?'white':'rgb(128,128,255)' );
		
		this.officeDoor = new OfficeDoorTexture( 64*2, 64*2, DEBUG_ALL_WHITE?'white':'dimgray' );
		
		this.house = new HouseTexture( 64*4 );
		this.houseBump = new HouseBumpTexture( 64*4 );
		
		this.apartment = new ApartmentTexture( 64*2 );
		this.apartmentNormal = new ApartmentNormalTexture( 64*2, 64*2, DEBUG_ALL_WHITE?'white':'rgb(128,128,255)' );

		this.crossing = new CrossingTexture( 64*2, 2, DEBUG_ALL_WHITE?'lightgray':'#404040' );
		
		this.grass = new GrassTexture( 64 );
		
		//this.crossing.debugShow( '3em', 1 );
		//this.houseBump.debugShow( '256px' );
		
	} // Textures
	
} // Textures

