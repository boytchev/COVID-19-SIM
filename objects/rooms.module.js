//
//	class Room
//		constructor( center, size )
//


import {Zone} from '../core.module.js';


export class Room
{
	constructor( center, size, facing )
	{
		this.sysType = 'Room';

		this.zone = new Zone( center, size );
		this.facing = facing;
		this.center = center;
		this.size = size;
		
		this.outsideZone = undefined;
		this.insideZone = undefined;

		this.outerWall = [false, false, false, false]; // indices are TOP,LEFT,RIGHT,BOTTOM - true if room wall is building wall
		
	} // Room.constructor
	
} // Room