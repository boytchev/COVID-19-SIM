//
//	class Crossing
//		constructor( a, b, c, d, type, length, block, otherBlock, priority )
//
//	class Crossings
//		constructor( )
//		denyCrossing( time )
//		generate( block )
//			add( crossings, crossing )
//			existsBlockA( vertex )
//			existsBlockB( vertex )
//			existsBlockC( vertex )
//			existsBlockD( vertex )
//		reorder( block )
//		image( crossings )
//

// var CROSSING_TYPE_X = 1;
// var CROSSING_TYPE_Z = 2;


import * as THREE from '../js/three.module.js';
import {/*clock,*/ blocks, scene, navmesh, textures} from '../main.js';
import {pick, sortRing} from '../coreNav.js';
import {LEFT, RIGHT, BOTTOM, TOP, Size, Zone, timeMs, almostEqual} from '../core.js';
import {SIDEWALK_WIDTH, CROSSING_MINIMAL_CLOSENESS, CROSSING_TEXTURE_SCALE, DEBUG_BLOCKS_OPACITY} from '../config.js';
import {NatureMaterial, dayTimeMs} from './nature.js';


var oldScan = 0,
	newScan = 0;
	
export class Crossing
{

	constructor( zone, type, street, blockA, blockB, priority )
	{
		this.sysType = 'Crossing';
		
		this.zone = zone;
		this.center = zone.center; // remember it, because it will be used alot

		this.type = type;
		this.scale = street.width;
		this.priority = priority;
		this.deleted = false;
	
		// the crossing is across street 
		street.crossings.push( this );
		
		// the crossing connects block A and block B
		this.blockA = blockA;
		this.blockB = blockB;
		
		// timing for green/red light - a sine curve vertically offset
		this.timeSpan = timeMs(0,0,pick([30, 45, 60, 90]));
		this.timeOffset = THREE.Math.randFloat(0,0.5);

	} // Crossing.constructor
	
	denyCrossing( time = dayTimeMs )
	{
		// normalize time to period of [0..1]
		time = THREE.Math.euclideanModulo( time, this.timeSpan ) / this.timeSpan;
		
		// if sine<0, then it is red light
		return (Math.sin( 2*Math.PI*time ) - this.timeOffset) < 0;
	}
	
} // Crossing



export class Crossings
{
	
	constructor( )
	{
		this.sysType = 'Crossings';

		this.xCrossings = [];
		this.zCrossings = [];
		
		// generate all crossings
		for( var i=0; i<blocks.allTrueBlocks.length; i++ )
			this.generate( blocks.allTrueBlocks[i] );

//console.log('all crossings\t',clock.getDelta().toFixed(3),'s');

		this.reduceCrossings();
		
//console.log('reduce crossings\t',clock.getDelta().toFixed(3),'s');

		// generate meshes for x-crosses
		for (var i=0; i<this.xCrossings.length; i++)
			navmesh.addCrossing( this.xCrossings[i] );

//console.log('x-crossings\t',clock.getDelta().toFixed(3),'s');

		// generate meshes for z-crosses
		for (var i=0; i<this.zCrossings.length; i++)
			navmesh.addCrossing( this.zCrossings[i] );

//console.log('y-crossings\t',clock.getDelta().toFixed(3),'s');


		// reorder crosses for each block
		for( var i=0; i<blocks.allTrueBlocks.length; i++ )
			this.reorder( blocks.allTrueBlocks[i] );
		
//console.log('reorder crossings\t',clock.getDelta().toFixed(3),'s');

//console.log('old',oldScan,'new',newScan,(100*newScan/oldScan).toFixed(1)+'%');

		this.image( this.xCrossings );
		this.image( this.zCrossings );
	} // Crossings.constructor
	
	
	
	// remove crosses if they are too dense
	reduceCrossings()
	{
		for( var street of blocks.streets ) if( street.crossings.length )
		{
			street.crossings.sort( (a,b)=> a.x+a.z>b.x+b.z?1:-1 );
			for( var i=0; i<street.crossings.length-1; i++ ) if( !street.crossings[i].deleted )
			for( var j=i+1; j<street.crossings.length; j++ ) if( !street.crossings[j].deleted )
			{
				var crossingA = street.crossings[i],
					crossingB = street.crossings[j];
					
				if( crossingA.deleted || crossingB.deleted ) continue;
				
				if( crossingA.center.manhattanDistanceTo( crossingB.center ) < CROSSING_MINIMAL_CLOSENESS )
				{	// either ignore the i-th or the (i-1)-st crossing
					// keep the one with the higher priority
					// if equal, then randomly pick which one to keep
					if( crossingA.priority == crossingB.priority )
						street.crossings[pick([i,j])].deleted = true;
					else if( crossingA.priority < crossingB.priority )
						street.crossings[i].deleted = true;
					else 
						street.crossings[j].deleted = true;
				}
			}				
		}

		this.xCrossings = this.xCrossings.filter( crossing => !crossing.deleted ); // remove null elements
		this.zCrossings = this.zCrossings.filter( crossing => !crossing.deleted ); // remove null elements
	} // Crossings.reduceCrossings
	
	
	// generate crossings from a block to neighbouring blocks
	generate( block )
	{
		var that = this,
			zone = block.zone;

		function add( crossings, crossing )
		{
			/*
oldScan += crossings.length;
newScan += crossings.length;

			for( var i=0; i<crossings.length; i++ )
				if( crossing.center.manhattanDistanceTo( crossings[i].center ) < CROSSING_MINIMAL_CLOSENESS )
				{	// either ignore the old or the new crossing
					// keep the one with the higher priority
					// if equal, then randomly pick which one to keep
					if( crossings[i].priority == crossing.priority )
					{
						crossings[i] = pick( [crossings[i],crossing] );
					}
					else if( crossings[i].priority < crossing.priority )
						crossings[i] = crossing;
					return; 
				}
				*/
				
			// add
			crossings.push( crossing );
		}
		
		
		function findBlock( vertex, onlyBlocks )
		{
oldScan += blocks.allTrueBlocks.length;
newScan += onlyBlocks.length;

			function betweenX( a, b, c )
			{	// a.x is between b.x and c.x
				return (a.x-b.x)*(a.x-c.x)<=0;
			}
			function betweenZ( a, b, c )
			{	// a.z is between b.z and c.z
				return (a.z-b.z)*(a.z-c.z)<=0;
			}
			function zeroArea( a, b, c )
			{	// actually twice the area, but we only need 0 area
				return almostEqual( 0, a.x*(b.z-c.z)+b.x*(c.z-a.z)+c.x*(a.z-b.z) );
			}
			
			for( var i=0; i<onlyBlocks.length; i++ )
			{
				var block = onlyBlocks[i],
					zone = block.zone;
				if( betweenX(vertex,zone.a,zone.b) && zeroArea(vertex,zone.a,zone.b) ) return block;
				if( betweenZ(vertex,zone.b,zone.c) && zeroArea(vertex,zone.b,zone.c) ) return block;
				if( betweenX(vertex,zone.c,zone.d) && zeroArea(vertex,zone.c,zone.d) ) return block;
				if( betweenZ(vertex,zone.d,zone.a) && zeroArea(vertex,zone.d,zone.a) ) return block;
			}
			
			return null;
		}
		
		function existsBlockA( vertex, onlyBlocks )
		{
oldScan += blocks.allTrueBlocks.length;
newScan += onlyBlocks.length;
			for( var i=0; i<onlyBlocks.length; i++ )
			{
				if( vertex.manhattanDistanceTo(onlyBlocks[i].zone.a) < 0.2 )
					return onlyBlocks[i];
			}
			
			return null;
		}
		
		function existsBlockB( vertex, onlyBlocks )
		{
oldScan += blocks.allTrueBlocks.length;
newScan += onlyBlocks.length;
			for( var i=0; i<onlyBlocks.length; i++ )
			{
				if( vertex.manhattanDistanceTo(onlyBlocks[i].zone.b) < 0.2 )
					return onlyBlocks[i];
			}
			
			return null;
		}
		
		function existsBlockC( vertex, onlyBlocks )
		{
oldScan += blocks.allTrueBlocks.length;
newScan += onlyBlocks.length;
			for( var i=0; i<onlyBlocks.length; i++ )
			{
				if( vertex.manhattanDistanceTo(onlyBlocks[i].zone.c) < 0.2 )
					return onlyBlocks[i];
			}
			
			return null;
		}
		
		function existsBlockD( vertex, onlyBlocks )
		{
oldScan += blocks.allTrueBlocks.length;
newScan += onlyBlocks.length;
			for( var i=0; i<onlyBlocks.length; i++ )
			{
				if( vertex.manhattanDistanceTo(onlyBlocks[i].zone.d) < 0.2 )
				{	
					return onlyBlocks[i];
				}
			}
			
			return null;
		}
		
		// vertical crossing	
		var streetWidth = block.streets[TOP].width;
		if( streetWidth )
		{
			// from A to top -----------------------------------

			var u = zone.a.to(zone.b).lenX(SIDEWALK_WIDTH),
				v = zone.d.to(zone.a).lenZ(streetWidth),
				d = zone.a,
				c = d.add(u),
				a = d.add(v),
				b = c.add(v);
			
			var otherBlock = existsBlockD( a, block.streets[TOP].blocks );
			if( otherBlock )
			{	// crossing continues the sidewalk
				add( this.xCrossings, new Crossing( new Zone(a,b,c,d), TOP, block.streets[TOP], block, otherBlock, 2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock( a, block.streets[TOP].blocks );
				if( otherBlock )
				{
					v = zone.a.closestTo( a, b );
					a = d.add(v);
					b = c.add(v);
					add( this.xCrossings, new Crossing( new Zone(a,b,c,d), TOP, block.streets[TOP], block, otherBlock, 1 ) );
				}
			}

			// from B to top -----------------------------------
			var u = zone.b.to(zone.a).lenX(SIDEWALK_WIDTH),
				v = zone.c.to(zone.b).lenZ(streetWidth),
				c = zone.b,
				d = c.add(u),
				a = d.add(v),
				b = c.add(v);
		
			var otherBlock = existsBlockC( b, block.streets[TOP].blocks );
			if( otherBlock )
			{	// crossing contines the sidewalk
				add( this.xCrossings, new Crossing( new Zone(a,b,c,d), TOP, block.streets[TOP], block, otherBlock,2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock( b, block.streets[TOP].blocks );
				if( otherBlock )
				{
					v = zone.b.closestTo( a, b );
					a = d.add(v);
					b = c.add(v);
					add( this.xCrossings, new Crossing( new Zone(a,b,c,d), TOP, block.streets[TOP], block, otherBlock,1 ) );
				}
			}
		}

		var streetWidth = block.streets[BOTTOM].width;
		if( streetWidth )
		{
			// from D to bottom --------------------------------
			
			var u = zone.d.to(zone.c).lenX(SIDEWALK_WIDTH),
				v = zone.a.to(zone.d).lenZ(streetWidth),
				a = zone.d,
				b = a.add(u),
				d = a.add(v),
				c = b.add(v);
		
			var otherBlock = existsBlockA( d, block.streets[BOTTOM].blocks );
			if( otherBlock )
			{	// crossing contines the sidewalk
				add( this.xCrossings, new Crossing( new Zone(a,b,c,d), BOTTOM, block.streets[BOTTOM], block, otherBlock, 2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock(d, block.streets[BOTTOM].blocks);
				if( otherBlock )
				{
					v = zone.d.closestTo( c, d );
					c = b.add(v);
					d = a.add(v);
					add( this.xCrossings, new Crossing( new Zone(a,b,c,d), BOTTOM, block.streets[BOTTOM], block, otherBlock, 1 ) );
				}
			}


			// from C to bottom --------------------------------
			
			var u = zone.c.to(zone.d).lenX(SIDEWALK_WIDTH),
				v = zone.a.to(zone.d).lenZ(streetWidth),
				b = zone.c,
				a = b.add(u),
				c = b.add(v),
				d = a.add(v);
			
			var otherBlock = existsBlockB( c, block.streets[BOTTOM].blocks );
			if( otherBlock )
			{	// crossing contines the sidewalk
				add( this.xCrossings, new Crossing( new Zone(a,b,c,d), BOTTOM, block.streets[BOTTOM], block, otherBlock, 2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock(c, block.streets[BOTTOM].blocks);
				if( otherBlock )
				{
					v = zone.d.closestTo( d, c );
					c = b.add(v),
					d = a.add(v);
					add( this.xCrossings, new Crossing( new Zone(a,b,c,d), BOTTOM, block.streets[BOTTOM], block, otherBlock, 1 ) );
				}
			}
		}


		// horizontal crossing
		
		var streetWidth = block.streets[LEFT].width;
		if( streetWidth )
		{
			// from A to left ----------------------------------
			
			var u = zone.a.to(zone.d).lenZ(SIDEWALK_WIDTH),
				v = zone.b.to(zone.a).lenX(streetWidth),
				b = zone.a,
				c = b.add(u),
				a = b.add(v),
				d = c.add(v);
		
			var otherBlock = existsBlockB( a, block.streets[LEFT].blocks );
			if( otherBlock )
			{	// crossing contines the sidewalk
				add( this.zCrossings, new Crossing( new Zone(a,b,c,d), LEFT, block.streets[LEFT], block, otherBlock, 2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock(a, block.streets[LEFT].blocks);
				if( otherBlock )
				{
					v = zone.a.closestTo( a, d );
					a = b.add(v),
					d = c.add(v);
					add( this.zCrossings, new Crossing( new Zone(a,b,c,d), LEFT, block.streets[LEFT], block, otherBlock, 1 ) );
				}
			}


			// from D to left ----------------------------------
			
			var u = zone.d.to(zone.a).lenZ(SIDEWALK_WIDTH),
				v = zone.c.to(zone.d).lenX(streetWidth),
				c = zone.d,
				b = c.add(u),
				a = b.add(v),
				d = c.add(v);
		
			var otherBlock = existsBlockC( d, block.streets[LEFT].blocks );
			if( otherBlock )
			{	// crossing contines the sidewalk
				add( this.zCrossings, new Crossing( new Zone(a,b,c,d), LEFT, block.streets[LEFT], block, otherBlock, 2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock(d, block.streets[LEFT].blocks);
				if( otherBlock )
				{
					v = zone.d.closestTo( a, d );
					a = b.add(v),
					d = c.add(v);
					add( this.zCrossings, new Crossing( new Zone(a,b,c,d), LEFT, block.streets[LEFT], block, otherBlock, 1 ) );
				}
			}
			
		}		


		var streetWidth = block.streets[RIGHT].width;
		if( streetWidth )
		{
			// from B to right ---------------------------------
			
			var u = zone.b.to(zone.c).lenZ(SIDEWALK_WIDTH),
				v = zone.a.to(zone.b).lenX(streetWidth),
				a = zone.b,
				d = a.add(u),
				b = a.add(v),
				c = d.add(v);

			var otherBlock = existsBlockA( b, block.streets[RIGHT].blocks );
			if( otherBlock )
			{	// crossing contines the sidewalk
				add( this.zCrossings, new Crossing( new Zone(a,b,c,d), RIGHT, block.streets[RIGHT], block, otherBlock, 2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock(b, block.streets[RIGHT].blocks);
				if( otherBlock )
				{
					v = zone.b.closestTo( b, c );
					b = a.add(v);
					c = d.add(v);
					add( this.zCrossings, new Crossing( new Zone(a,b,c,d), RIGHT, block.streets[RIGHT], block, otherBlock, 1 ) );
				}
			}

			// from C to right ---------------------------------
			
			var u = zone.c.to(zone.b).lenZ(SIDEWALK_WIDTH),
				v = zone.d.to(zone.c).lenX(streetWidth),
				d = zone.c,
				a = d.add(u),
				b = a.add(v),
				c = d.add(v);
		
			var otherBlock = existsBlockD( c, block.streets[RIGHT].blocks );
			if( otherBlock )
			{	// crossing contines the sidewalk
				add( this.zCrossings, new Crossing( new Zone(a,b,c,d), RIGHT, block.streets[RIGHT], block, otherBlock, 2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock(c, block.streets[RIGHT].blocks);
				if( otherBlock )
				{
					v = zone.c.closestTo( b, c );
					b = a.add(v);
					c = d.add(v);
					add( this.zCrossings, new Crossing( new Zone(a,b,c,d), RIGHT, block.streets[RIGHT], block, otherBlock, 1 ) );
				}
			}

		}



	} // Crossings.generate


	
	image( crossings )
	{
		var vertices = [];
		var normals = [];
		var uvs = [];
		
		for (var i=0; i<crossings.length; i++)
		{
			var crossing = crossings[i];
			var y = 0;
			
			vertices.push(
				crossing.zone.a.x,y,crossing.zone.a.z, crossing.zone.b.x,y,crossing.zone.b.z, crossing.zone.d.x,y,crossing.zone.d.z,
				crossing.zone.d.x,y,crossing.zone.d.z, crossing.zone.b.x,y,crossing.zone.b.z, crossing.zone.c.x,y,crossing.zone.c.z
			);
			
			normals.push(
				0,1,0, 0,1,0, 0,1,0,
				0,1,0, 0,1,0, 0,1,0
			);
			
			var s = crossing.scale;
			
			if( crossings === this.xCrossings )
			{
				uvs.push(
					s,s, s,0, 0,s,
					0,s, s,0, 0,0
				);
			}
			else
			{
				uvs.push(
					0,s, s,s, 0,0,
					0,0, s,s, s,0
				);
			}
		}

		var material = new NatureMaterial({
				map: textures.crossing.map( 1/CROSSING_TEXTURE_SCALE, 1/CROSSING_TEXTURE_SCALE ),
				depthTest: false,
				transparent: DEBUG_BLOCKS_OPACITY<1,
				opacity: DEBUG_BLOCKS_OPACITY,
			});
	
		var geometry = new THREE.BufferGeometry();
			geometry.setAttribute(
				'position',
				new THREE.BufferAttribute(new Float32Array(vertices),3));
			geometry.setAttribute(
				'normal',
				new THREE.BufferAttribute(new Float32Array(normals),3));
			geometry.setAttribute(
				'uv',
				new THREE.BufferAttribute(new Float32Array(uvs),2));
			
		var image = new THREE.Mesh(geometry, material);
			image.updateMatrix();
			image.matrixAutoUpdate = false;
			image.renderOrder = -70;
			image.receiveShadow = true;
			
		scene.add(image);
	} // Crossings.image
	
	
	
	// reorder block ring spots, so they form a ring
	reorder( block )
	{
		// check whether there is a ring position near given position
		function missingInRing( pos )
		{
			const MISSING_IN_RING_CLOSENESS = 1; // in meters
			
			for( var i=0; i<block.ring.length; i++)
				if( pos.manhattanDistanceTo( block.ring[i].center ) < MISSING_IN_RING_CLOSENESS )
					return false; // there is ring position near pos
			
			return true;
		} // missingInRing
		
		// generate spots for each corner in the block, if there are no crossings
		var shrinkedZone = block.zone.shrink( SIDEWALK_WIDTH/2 ),
			size = new Size( SIDEWALK_WIDTH/2, SIDEWALK_WIDTH/2 );
				
		if( missingInRing(shrinkedZone.a) ) {shrinkedZone.a.block = block; block.ring.push( new Zone( shrinkedZone.a, size ) );}
		if( missingInRing(shrinkedZone.b) ) {shrinkedZone.b.block = block; block.ring.push( new Zone( shrinkedZone.b, size ) ); }
		if( missingInRing(shrinkedZone.c) ) {shrinkedZone.c.block = block; block.ring.push( new Zone( shrinkedZone.c, size ) ); }
		if( missingInRing(shrinkedZone.d) ) {shrinkedZone.d.block = block; block.ring.push( new Zone( shrinkedZone.d, size ) ); }
		
		sortRing( block.ring, block.zone.center );
		//console.log(block.ring);		
		
	} // Crossings.reorder
	
	
	
} // Crossings
