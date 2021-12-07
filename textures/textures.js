//
//	class Textures()
//

import {DEBUG_ALL_WHITE} from '../config.js';
import {ProceduralTexture} from './proceduralTexture.js';
import {ApartmentTexture, ApartmentNormalTexture} from './apartmentTexture.js';
import {CrossingTexture} from './crossingTexture.js';
import {GrassTexture} from './grassTexture.js';
import {GridTexture} from './gridTexture.js';
import {HouseTexture, HouseBumpTexture} from './houseTexture.js';
import {OfficeDoorTexture} from './officeDoorTexture.js';
import {OfficeTexture, OfficeNormalTexture} from './officeTexture.js';
import {SidewalkTexture} from './sidewalkTexture.js';
import {AgentTexture} from './agentTexture.js';
import {SunTexture} from './sunTexture.js';
import {MoonTexture} from './moonTexture.js';


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
		
		this.house = new HouseTexture( 64*8 );
		this.houseBump = new HouseBumpTexture( 64*4 );
		
		this.apartment = new ApartmentTexture( 64*2 );
		this.apartmentNormal = new ApartmentNormalTexture( 64*2, 64*2, DEBUG_ALL_WHITE?'white':'rgb(128,128,255)' );

		this.crossing = new CrossingTexture( 64*2, 2, DEBUG_ALL_WHITE?'lightgray':'#404040' );
		
		this.grass = new GrassTexture( 64 );
		
		this.agent = new AgentTexture( 1024 );
		
		this.sun = new SunTexture( 1, 1024, 'white' );
		this.moon = new MoonTexture( 1, 1024, 'white' );
		
		//this.agent.debugShow( '128px' );
		//this.apartment.debugShow( );
		//this.houseBump.debugShow( '256px' );
		//this.sun.debugShow( '1em'/*, 1/2*/ );
		
	} // Textures
	
} // Textures

