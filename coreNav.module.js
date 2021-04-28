


import {GROUND_SIZE} from '../config.module.js';
import {Zone, Pos, almostEqual, TOP, RIGHT, LEFT, BOTTOM} from '../core.module.js';
import {OfficeDoor} from './objects/officeDoors.module.js';
import {Room} from './objects/rooms.module.js';
import {Elevator} from './objects/elevators.module.js';
import {NavMeshCrossingZone} from './agents/navmesh.module.js';



function getPosition( something )
{
	if( something instanceof OfficeDoor )
		return something.outsideZone.center;
	
	if( something instanceof NavMeshCrossingZone )
		return something.center;
	
	if( something instanceof Elevator )
		return something.zone.center;
	
	console.error( 'This should never happen [code: 1523] - undefined type',viaPositions[i].constructor.name );
	
	return something;
	
} // getPosition



// pick a position which has (almost) shortest distance
export function pickDistance( fromPosition, viaPositions, finalPosition )
{
	// calculate probabilities intervals
	var distances = [],
		minDistance = Number.POSITIVE_INFINITY,
		probabilities = [0],
		n = viaPositions.length;

	for( var i=0; i<n; i++)
	{	
		var midPosition = getPosition( viaPositions[i] );
		
		// distance to mid position and then to final position
		var dist1 = fromPosition.distanceToSq( midPosition ),
			dist2 = midPosition.distanceToSq( finalPosition );
			
		// if the first distance is too small, there is no need to consider it
		if( dist1<1 ) dist1 = 10000;
		
		distances[i] = dist1+dist2;

		distances[i] = Math.max( distances[i], 10 );
		minDistance = Math.min( minDistance, distances[i] );
	}
	
	// set probability value like this:
	// 		100 - for items up to 10% from the minimal distance
	//		1   - for items up to 30%
	//		0.1	- all other items
	var value;
	for( var i=0; i<n; i++)
	{	
		if( distances[i]<1.1*minDistance ) value = 100;
		else if( distances[i]<1.3*minDistance ) value = 1;
		else value = 0.1;
			
		probabilities[i+1] = probabilities[i] + value;
	}

	// pick position according to probabilities
	var randomPick = THREE.Math.randFloat( 0, probabilities[n] ),
		pickedIndex = THREE.Math.randInt( 0, n-1 );
	
	for( var i=0; i<n; i++ )
	  if( randomPick < probabilities[i+1] )
	  {
		  pickedIndex = i;
		  break;
	  }

//	console.log('pickDistance------------');
//	for( var i=0; i<n; i++ )
//		console.log('opt['+i+'] =', (probabilities[i+1]-probabilities[i]).toFixed(2), i==pickedIndex?'*':'' );
	
	return viaPositions[pickedIndex]; 
	
} // pickDistance



export function pick( array )
{
	var index = THREE.Math.randInt( 0, array.length-1 );
	return array[index];
} // pick





export function pickDirection( fromPosition, viaPositions, finalPosition, avoidPositions = [] )
{
	// calculate probabilities intervals
	var scores = [],
		minDistance = Number.POSITIVE_INFINITY,
		n = viaPositions.length;

	// vector to the final position
	var vecFinal = fromPosition.to( finalPosition ),
		lenFinal = vecFinal.dot( vecFinal );
	
	for( var i=0; i<n; i++)
	{	
		var midPosition = getPosition( viaPositions[i] );

		if( avoidPositions.indexOf(midPosition)<0 )
		{
			// distance to mid position and then to final position
			var distance = fromPosition.distanceToSq( midPosition )+midPosition.distanceToSq( finalPosition );
			minDistance = Math.min( minDistance, distance );
				
			// vectors to a possible position
			var vecPossible = fromPosition.to( midPosition ),
				lenPossible = vecPossible.dot( vecPossible );

			var cosine;
			if( lenPossible<1 )
				cosine = -1;
			else
				cosine = vecFinal.dot( vecPossible ) / Math.sqrt( lenFinal * lenPossible );
		}
		else
		{
			var distance = 2*GROUND_SIZE;
			var cosine = -1;
		}
		
		scores[i] = {index: i, cos: cosine, dist: distance};
	}

	for( var i=0; i<n; i++)
		scores[i].value = (scores[i].cos+1) + 5*minDistance/scores[i].dist;
	scores.sort( (a,b)=>b.value-a.value );

	var pickedIndex = 0;
	for( var i=0; i<n; i++)
		if( Math.random()<0.8 )
		{
			pickedIndex = i;
			break;
		}

	return viaPositions[scores[pickedIndex].index];
	
} // pickDirection




function pickClosest( fromPosition, viaPositions, finalPosition )
{
	var closest = viaPositions[0],
		distance = Number.POSITIVE_INFINITY;
	
	for( var i=0; i<viaPositions.length; i++)
	{	
		var vector = undefined;
		
		if( viaPositions[i] instanceof OfficeDoor )
			vector = viaPositions[i].outsideZone.center;
		else
		if( viaPositions[i] instanceof NavMeshCrossingZone )
			vector = viaPositions[i].center;
		else
		if( viaPositions[i] instanceof Elevator )
			vector = viaPositions[i].zone.center;
		else
			console.error( 'This should never happen [code: 1523] - undefined type',viaPositions[i].constructor.name );
		
		var dist = fromPosition.distanceToSq( vector ) + vector.distanceToSq( finalPosition );

		if( distance > dist )
		{
			distance = dist;
			closest = viaPositions[i];
		}
	}

	return closest;
	
} // pickClosest



export function clipLineRoute( from, to, obstacles, margin = 1 )
{
//	console.log('clipLineRoute',from.block, to.block);
	var route = [];

	var clipData = clipLine( from, to, obstacles, margin, route );

	var countProtection = 0;

	while( clipData.clipped )
	{
		if( countProtection++ > 30 )
		{
			console.error('Too many loops in clipLineRoute. Code 1152.');
			break;
		}
		from = clipData.pos;
		from.y = to.y; // take the vertical position of the target
		if( !from.block ) from.block = to.block;
		route.push( from );
		clipData = clipLine( from, to, obstacles, margin, route );
	}
	
	route.push( clipData.pos );

//for(var i=0; i<route.length; i++)
//	console.log('\t#'+i,route[i].block);
	
	return route;
}



function clipLine( from, to, obstacles, margin = 1, avoidPositions = [] )
{
	var toPoint = undefined,
		toDistance = GROUND_SIZE*GROUND_SIZE; // because we use distanceToSq
		
	function intersects( from, to, obstacle )
	{
		var minX = obstacle.center.x - obstacle.size.x/2,
			maxX = obstacle.center.x + obstacle.size.x/2,
			minZ = obstacle.center.z - obstacle.size.z/2,
			maxZ = obstacle.center.z + obstacle.size.z/2;
		
		if( to.x<maxX && maxX<from.x )
		{
			// a line right-to-left, test intersection with bc
			var q = Zone.midX( from, to, maxX );
			if( minZ<=q.z && q.z<=maxZ ) return true;
		}

		if( from.x<minX && minX<to.x )
		{
			// a line left-to-right, test intersection with ad
			var q = Zone.midX( from, to, minX );
			if( minZ<=q.z && q.z<=maxZ ) return true;
		}
		
		if( to.z<maxZ && maxZ<from.z )
		{
			// a line top-to-bottom, test intersection with ab
			var q = Zone.midZ( from, to, maxZ );
			if( minX<=q.x && q.x<=maxX ) return true;
		}

		if( from.z<minZ && minZ<to.z )
		{
			// a line bottom-to-top, test intersection with dc
			var q = Zone.midZ( from, to, minZ );
			if( minX<=q.x && q.x<=maxX ) return true;
		}

		return false;
	}
	
	function processPos( newTo )
	{
		if( avoidPositions.find( function(element){
			return almostEqual(element.x,newTo.x,0.01) && almostEqual(element.z,newTo.z,0.01);
		} ) )
			return; // do nothing, avoid this NEWTO
		
		// if FROM-TO does not intersect any obstacle,
		// and NEWTO is closer to TO than TOPOINT,
		// then remember NEWTO into TOPOINT
		
		for( var i=0; i<obstacles.length; i++ )
			if( intersects(from,newTo,obstacles[i]) )
				return; // do nothing, ignore this NEWTO
			
		// no intersection, is it closer to TO?
		var dist1 = from.distanceToSq( newTo ),
			dist2 = newTo.distanceToSq( to ),
			dist  = dist1+dist2;
		if( dist1 && dist<toDistance )
		{	// NEWTO is better than TOPOINT, so remember it
			toDistance = dist;
			toPoint = newTo;
		}
	}
	
	// if the target point is accessible without problem
	// then this is the solution, no need to check other points
	processPos( to );
	if( toPoint ) return {pos:toPoint, clipped:false};
	
	// collect all obstacle vertices
	for( var i = 0; i<obstacles.length; i++ )
	{
		var b = obstacles[i];
		
		if( b instanceof Room )
		{
			// when rooms are obstacles, skip test position which are at the building walls
			if( !b.outerWall[LEFT] && !b.outerWall[TOP] )
				processPos( new Pos(b.center.x-b.size.x/2-margin, b.center.z+b.size.z/2+margin) );
			if( !b.outerWall[RIGHT] && !b.outerWall[TOP] )
				processPos( new Pos(b.center.x+b.size.x/2+margin, b.center.z+b.size.z/2+margin) );
			if( !b.outerWall[RIGHT] && !b.outerWall[BOTTOM] )
				processPos( new Pos(b.center.x+b.size.x/2+margin, b.center.z-b.size.z/2-margin) );
			if( !b.outerWall[LEFT] && !b.outerWall[BOTTOM] )
				processPos( new Pos(b.center.x-b.size.x/2-margin, b.center.z-b.size.z/2-margin) );
		}
		else
		{
			processPos( new Pos(b.center.x-b.size.x/2-margin, b.center.z+b.size.z/2+margin) );
			processPos( new Pos(b.center.x+b.size.x/2+margin, b.center.z+b.size.z/2+margin) );
			processPos( new Pos(b.center.x+b.size.x/2+margin, b.center.z-b.size.z/2-margin) );
			processPos( new Pos(b.center.x-b.size.x/2-margin, b.center.z-b.size.z/2-margin) );
		}
	}
	
	return {pos:toPoint, clipped:true};
	
} // clipLine
