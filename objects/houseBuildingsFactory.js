//
// House Factory
//
// Houses have 4 directions (0,1,2,3)
//
// House structure (two wings):
//		posA{x,z}  - center of wing A
//		sizeA{x,z} - size of wing A
//		posB{x,z}  - center of wing B
//		sizeB{x,z} - size of wing B
//		route[ {x,z}, ...] - from from inside the house, to outside, to street
//
// Global methods:
// 		count( dir )	- get the number of houses with given direction
//	 	get( dir )		- get random house with direction dir
//	 	get( dir, n )	- get house n with direction dir
//


console.time( 'House Factory' );

import {Size} from '../core.js';

// return list of door positions and orientations
// for a house wing at (px,pz) and size (sx,sz)
function wingDoors( px, pz, sx, sz )
{
	switch( 10*sx+sz )
	{
		case 44:
			return [
				[px+1,pz+2,0]
			];
		case 48:
			return [
				[px+1,pz+4,0],
				[px+2,pz-3,1],
				[px-2,pz+3,3]
			];
		case 84:
			return [
				[px+1,pz+2,0],
				[px-3,pz-2,2]
			];
		case 88:
			return [
				[px+1,pz+4,0],
				[px+4,pz-3,1],
				[px-4,pz+3,3],
				[px-3,pz-4,2]
			];
	}
	throw 'Wing size must be 4 or 8';
} // wingDoors
		

// generate list of house templates with given direction
function houseTemplates( dir )
{
	var houses = [];
	
	for( var sizeAX=4; sizeAX<=8; sizeAX+=4 )
	for( var sizeAZ=4; sizeAZ<=8; sizeAZ+=4 )
	for( var sizeBX=4; sizeBX<=8; sizeBX+=4 )
	for( var sizeBZ=4; sizeBZ<=8; sizeBZ+=4 )
	for( var posBX=-4; posBX<=4; posBX+=2 )
	for( var posBZ=-4; posBZ<=4; posBZ+=2 )
	{
		
		var minAX = -sizeAX/2,
			minAZ = -sizeAZ/2,
			maxAX = +sizeAX/2,
			maxAZ = +sizeAZ/2;

		var minBX = posBX-sizeBX/2,
			minBZ = posBZ-sizeBZ/2,
			maxBX = posBX+sizeBX/2,
			maxBZ = posBZ+sizeBZ/2;
		
		// check for coliding wallks
		if( minAX==minBX || minAZ==minBZ || maxAX==maxBX || maxAZ==maxBZ || minAX==maxBX || minAZ==maxBZ || maxAX==minBX || maxAZ==minBZ )
		{
			continue;
		}
		
		// check for nesting
		if( minAX<minBX && minAZ<minBZ && maxAX>maxBX && maxAZ>maxBZ )
		{
			continue;
		}
		if( minAX>minBX && minAZ>minBZ && maxAX<maxBX && maxAZ<maxBZ )
		{
			continue;
		}
		
		var dX = Math.round( Math.max(maxAX,maxBX)/2 + Math.min(minAX,minBX)/2 ),
			dZ = Math.round( Math.max(maxAZ,maxBZ)/2 + Math.min(minAZ,minBZ)/2 );
			
		var posA  = {x:-dX,		z:-dZ},
			sizeA = new Size(sizeAX,sizeAZ),
			posB  = {x:posBX-dX,z:posBZ-dZ},
			sizeB = new Size(sizeBX,sizeBZ);

		// doors of wings
		var doorsA = wingDoors( 0, 0, sizeAX, sizeAZ ),
			doorsB = wingDoors( posBX, posBZ, sizeBX, sizeBZ );

		// doors of house
		var doors = [];
		
		for( var door of doorsA )
			if( door[0]<minBX || door[0]>maxBX || door[1]<minBZ || door[1]>maxBZ )
				doors.push( door );
		for( var door of doorsB )
			if( door[0]<minAX || door[0]>maxAX || door[1]<minAZ || door[1]>maxAZ )
				doors.push( door );
				
		// finding the one door -- closest to the street
		var outX = 0, // out - vector pointing from inside the door to outside
			outZ = 0;
		var closestDoorIdx = 0;
		switch( dir )
		{
			case 3/**0**/:
				outZ = -1;
				for( var i = 1; i<doors.length; i++ )
					if( doors[i][1] < doors[closestDoorIdx][1] )
						closestDoorIdx = i;
				break;
			case 0/**1**/:
				outX = 1;
				for( var i = 1; i<doors.length; i++ )
					if( doors[i][0] > doors[closestDoorIdx][0] )
						closestDoorIdx = i;
				break;
			case 1/**2**/:
				outZ = 1;
				for( var i = 1; i<doors.length; i++ )
					if( doors[i][1] > doors[closestDoorIdx][1] )
						closestDoorIdx = i;
				break;
			case 2/**3**/:
				outX = -1;
				for( var i = 1; i<doors.length; i++ )
					if( doors[i][0] < doors[closestDoorIdx][0] )
						closestDoorIdx = i;
				break;
		}

		// wing A and B should be sorted (to remove duplicates)
		if( posA.x > posB.x ) continue; // skip this house
		if( posA.x == posB.x )
		{
			if( posA.z > posB.z ) continue; // skip this house
			if( posA.z == posB.z )
			{
				if( sizeA.x > sizeB.x ) continue; // skip this house
				if( sizeA.x == sizeB.z )
				{
					if( sizeA.z > sizeB.z ) continue; // skip this house
				}
			}
		}
		
		
		var door = doors[closestDoorIdx];
			door[0] -= dX;
			door[1] -= dZ;
		
		outX = 0, // out - vector pointing from inside the door to outside
		outZ = 0;
		switch( door[2] )
		{
			case 0:	outZ =  1; break;
			case 1: outX =  1; break;
			case 2: outZ = -1; break;
			case 3: outX = -1; break;
		}

		var streetX = 0, // vector pointing toward street
			streetZ = 0;
		switch( dir )
		{
			case 3/**0**/: streetZ = -1; break;
			case 0/**1**/: streetX = +1; break;
			case 1/**2**/: streetZ = +1; break;
			case 2/**3**/: streetX = -1; break;
		}
	
		// route position inside door
		var x = door[0]-outX/2,
			z = door[1]-outZ/2;
		var route = [ {x:x,z:z} ];
		
		// route position outside door
		if( outX!=streetX || outZ!=streetZ )
		{
			x += outX;
			z += outZ;
			route.push( {x:x,z:z} );
		}
		
		// route position path to street (optional)
		if( dir==3/**0**/ && door[2]==0 )
		{
			var span = 0.5+Math.max( -dX+sizeAX/2, -dX+posBX+sizeBX/2 ) - door[0];
			x += span;
			route.push( {x:x,z:z} );
		}


		// route position street
		x += streetX;
		z += streetZ;
		route.push( {x:x,z:z} );

		var house = {
			posA:  posA,
			sizeA: sizeA,
			posB:  posB,
			sizeB: sizeB,
			route: route // [inside, outside, ... street]
		};

		houses.push( house );
	}
	
	return houses;
} // houseTemplates


// pregenerated house templates
var houses = [
		houseTemplates(0),
		houseTemplates(1),
		houseTemplates(2),
		houseTemplates(3)
	];
	

// return the number of house templates with giver direction
export function count( dir )
{
	return houses[dir].length;
}

// return a house template by number and direction
export function get( dir, n=-1 )
{
	if( n<0 || n>=houses[dir].length )
	{
		n = Math.floor( houses[dir].length*Math.random() );
	}
	
	return houses[dir][n];
}

console.timeEnd( 'House Factory' );
