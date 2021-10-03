//
//	class Room
//		constructor( center, size )
//


import {RectZone} from '../core.js';


export class Room
{
	constructor( center, size, facing )
	{
		this.sysType = 'Room';

		this.zone = new RectZone( center, size );
		this.facing = facing;
		this.center = center;
		this.size = size;
		
		this.outsideZone = undefined;
		this.insideZone = undefined;

		this.outerWall = [false, false, false, false]; // indices are TOP,LEFT,RIGHT,BOTTOM - true if room wall is building wall
		
	} // Room.constructor
	
} // Room