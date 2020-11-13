//
//	class Crossing
//		constructor( a, b, c, d, type, length, block, otherBlock, priority )
//
//	class Crossings
//		constructor( )
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


class Crossing
{

	constructor( zone, type, length, blockA, blockB, priority )
	{
		this.sysType = 'Crossing';
		
		this.zone = zone;
		this.center = zone.center; // remember it, because it will be used alot

		this.type = type;
		this.scale = length;
		this.priority = priority;
	
		this.blockA = blockA;
		this.blockB = blockB;

	} // Crossing.constructor
	
} // Crossing




class Crossings
{
	
	constructor( )
	{
		this.sysType = 'Crossings';

		this.xCrossings = [];
		this.zCrossings = [];
		
		// generate all crossings
		for( var i=0; i<blocks.allTrueBlocks.length; i++ )
			this.generate( blocks.allTrueBlocks[i] );

		// generate meshes for x-crosses
		for (var i=0; i<this.xCrossings.length; i++)
			navmesh.addCrossing( this.xCrossings[i] );

		// generate meshes for z-crosses
		for (var i=0; i<this.zCrossings.length; i++)
			navmesh.addCrossing( this.zCrossings[i] );

		// reorder crosses for each block
		for( var i=0; i<blocks.allTrueBlocks.length; i++ )
			this.reorder( blocks.allTrueBlocks[i] );
		
		this.image( this.xCrossings );
		this.image( this.zCrossings );
		
	} // Crossings.constructor
	
	
	
	// generate crossings from a block to neighbouring blocks
	generate( block )
	{
		var that = this,
			zone = block.zone;

		function add( crossings, crossing )
		{
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

			// add
			crossings.push( crossing );
		}
		
		
		function findBlock( vertex )
		{
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
			
			for( var i=0; i<blocks.allTrueBlocks.length; i++ )
			{
				var block = blocks.allTrueBlocks[i],
					zone = block.zone;
				if( betweenX(vertex,zone.a,zone.b) && zeroArea(vertex,zone.a,zone.b) ) return block;
				if( betweenZ(vertex,zone.b,zone.c) && zeroArea(vertex,zone.b,zone.c) ) return block;
				if( betweenX(vertex,zone.c,zone.d) && zeroArea(vertex,zone.c,zone.d) ) return block;
				if( betweenZ(vertex,zone.d,zone.a) && zeroArea(vertex,zone.d,zone.a) ) return block;
			}
			
			return null;
		}
		
		function existsBlockA( vertex )
		{
			for( var i=0; i<blocks.allTrueBlocks.length; i++ )
			{
				if( vertex.manhattanDistanceTo(blocks.allTrueBlocks[i].zone.a) < 0.2 )
					return blocks.allTrueBlocks[i];
			}
			
			return null;
		}
		
		function existsBlockB( vertex )
		{
			for( var i=0; i<blocks.allTrueBlocks.length; i++ )
			{
				if( vertex.manhattanDistanceTo(blocks.allTrueBlocks[i].zone.b) < 0.2 )
					return blocks.allTrueBlocks[i];
			}
			
			return null;
		}
		
		function existsBlockC( vertex )
		{
			for( var i=0; i<blocks.allTrueBlocks.length; i++ )
			{
				if( vertex.manhattanDistanceTo(blocks.allTrueBlocks[i].zone.c) < 0.2 )
					return blocks.allTrueBlocks[i];
			}
			
			return null;
		}
		
		function existsBlockD( vertex )
		{
			for( var i=0; i<blocks.allTrueBlocks.length; i++ )
			{
				if( vertex.manhattanDistanceTo(blocks.allTrueBlocks[i].zone.d) < 0.2 )
					return blocks.allTrueBlocks[i];
			}
			
			return null;
		}
		
		// vertical crossing	
		var streetWidth = block.streetWidths[TOP];
		if( streetWidth )
		{
			// from A to top -----------------------------------

			var u = zone.a.to(zone.b).lenX(SIDEWALK_WIDTH),
				v = zone.d.to(zone.a).lenZ(streetWidth),
				d = zone.a,
				c = d.add(u),
				a = d.add(v),
				b = c.add(v);
			
			var otherBlock = existsBlockD( a );
			if( otherBlock )
			{	// crossing continues the sidewalk
				add( this.xCrossings, new Crossing( new Zone(a,b,c,d), TOP, streetWidth, block, otherBlock, 2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock( a );
				if( otherBlock )
				{
					v = zone.a.closestTo( a, b );
					a = d.add(v);
					b = c.add(v);
					add( this.xCrossings, new Crossing( new Zone(a,b,c,d), TOP, streetWidth, block, otherBlock, 1 ) );
				}
			}

			// from B to top -----------------------------------
			var u = zone.b.to(zone.a).lenX(SIDEWALK_WIDTH),
				v = zone.c.to(zone.b).lenZ(streetWidth),
				c = zone.b,
				d = c.add(u),
				a = d.add(v),
				b = c.add(v);
		
			var otherBlock = existsBlockC( b );
			if( otherBlock )
			{	// crossing contines the sidewalk
				add( this.xCrossings, new Crossing( new Zone(a,b,c,d), TOP, streetWidth, block, otherBlock,2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock( b );
				if( otherBlock )
				{
					v = zone.b.closestTo( a, b );
					a = d.add(v);
					b = c.add(v);
					add( this.xCrossings, new Crossing( new Zone(a,b,c,d), TOP, streetWidth, block, otherBlock,1 ) );
				}
			}
		}

		var streetWidth = block.streetWidths[BOTTOM];
		if( streetWidth )
		{
			// from D to bottom --------------------------------
			
			var u = zone.d.to(zone.c).lenX(SIDEWALK_WIDTH),
				v = zone.a.to(zone.d).lenZ(streetWidth),
				a = zone.d,
				b = a.add(u),
				d = a.add(v),
				c = b.add(v);
		
			var otherBlock = existsBlockA( d );
			if( otherBlock )
			{	// crossing contines the sidewalk
				add( this.xCrossings, new Crossing( new Zone(a,b,c,d), BOTTOM, streetWidth, block, otherBlock, 2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock(d);
				if( otherBlock )
				{
					v = zone.d.closestTo( c, d );
					c = b.add(v);
					d = a.add(v);
					add( this.xCrossings, new Crossing( new Zone(a,b,c,d), BOTTOM, streetWidth, block, otherBlock, 1 ) );
				}
			}


			// from C to bottom --------------------------------
			
			var u = zone.c.to(zone.d).lenX(SIDEWALK_WIDTH),
				v = zone.a.to(zone.d).lenZ(streetWidth),
				b = zone.c,
				a = b.add(u),
				c = b.add(v),
				d = a.add(v);
			
			var otherBlock = existsBlockB( c );
			if( otherBlock )
			{	// crossing contines the sidewalk
				add( this.xCrossings, new Crossing( new Zone(a,b,c,d), BOTTOM, streetWidth, block, otherBlock, 2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock(c);
				if( otherBlock )
				{
					v = zone.d.closestTo( d, c );
					c = b.add(v),
					d = a.add(v);
					add( this.xCrossings, new Crossing( new Zone(a,b,c,d), BOTTOM, streetWidth, block, otherBlock, 1 ) );
				}
			}
		}


		// horizontal crossing
		
		var streetWidth = block.streetWidths[LEFT];
		if( streetWidth )
		{
			// from A to left ----------------------------------
			
			var u = zone.a.to(zone.d).lenZ(SIDEWALK_WIDTH),
				v = zone.b.to(zone.a).lenX(streetWidth),
				b = zone.a,
				c = b.add(u),
				a = b.add(v),
				d = c.add(v);
		
			var otherBlock = existsBlockB( a );
			if( otherBlock )
			{	// crossing contines the sidewalk
				add( this.zCrossings, new Crossing( new Zone(a,b,c,d), LEFT, streetWidth, block, otherBlock, 2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock(a);
				if( otherBlock )
				{
					v = zone.a.closestTo( a, d );
					a = b.add(v),
					d = c.add(v);
					add( this.zCrossings, new Crossing( new Zone(a,b,c,d), LEFT, streetWidth, block, otherBlock, 1 ) );
				}
			}


			// from D to left ----------------------------------
			
			var u = zone.d.to(zone.a).lenZ(SIDEWALK_WIDTH),
				v = zone.c.to(zone.d).lenX(streetWidth),
				c = zone.d,
				b = c.add(u),
				a = b.add(v),
				d = c.add(v);
		
			var otherBlock = existsBlockC( d );
			if( otherBlock )
			{	// crossing contines the sidewalk
				add( this.zCrossings, new Crossing( new Zone(a,b,c,d), LEFT, streetWidth, block, otherBlock, 2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock(d);
				if( otherBlock )
				{
					v = zone.d.closestTo( a, d );
					a = b.add(v),
					d = c.add(v);
					add( this.zCrossings, new Crossing( new Zone(a,b,c,d), LEFT, streetWidth, block, otherBlock, 1 ) );
				}
			}
			
		}		


		var streetWidth = block.streetWidths[RIGHT];
		if( streetWidth )
		{
			// from B to right ---------------------------------
			
			var u = zone.b.to(zone.c).lenZ(SIDEWALK_WIDTH),
				v = zone.a.to(zone.b).lenX(streetWidth),
				a = zone.b,
				d = a.add(u),
				b = a.add(v),
				c = d.add(v);

			var otherBlock = existsBlockA( b );
			if( otherBlock )
			{	// crossing contines the sidewalk
				add( this.zCrossings, new Crossing( new Zone(a,b,c,d), RIGHT, streetWidth, block, otherBlock, 2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock(b);
				if( otherBlock )
				{
					v = zone.b.closestTo( b, c );
					b = a.add(v);
					c = d.add(v);
					add( this.zCrossings, new Crossing( new Zone(a,b,c,d), RIGHT, streetWidth, block, otherBlock, 1 ) );
				}
			}

			// from C to right ---------------------------------
			
			var u = zone.c.to(zone.b).lenZ(SIDEWALK_WIDTH),
				v = zone.d.to(zone.c).lenX(streetWidth),
				d = zone.c,
				a = d.add(u),
				b = a.add(v),
				c = d.add(v);
		
			var otherBlock = existsBlockD( c );
			if( otherBlock )
			{	// crossing contines the sidewalk
				add( this.zCrossings, new Crossing( new Zone(a,b,c,d), RIGHT, streetWidth, block, otherBlock, 2 ) );
			}
			else
			{	// crossing is orthogonal to the street
				otherBlock = findBlock(c);
				if( otherBlock )
				{
					v = zone.c.closestTo( b, c );
					b = a.add(v);
					c = d.add(v);
					add( this.zCrossings, new Crossing( new Zone(a,b,c,d), RIGHT, streetWidth, block, otherBlock, 1 ) );
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
			
			vertices.push(
				crossing.zone.a.x,0,crossing.zone.a.z, crossing.zone.b.x,0,crossing.zone.b.z, crossing.zone.d.x,0,crossing.zone.d.z,
				crossing.zone.d.x,0,crossing.zone.d.z, crossing.zone.b.x,0,crossing.zone.b.z, crossing.zone.c.x,0,crossing.zone.c.z
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
		
		var material = new THREE.MeshLambertMaterial({
				map: textures.crossing.map( 1/CROSSING_TEXTURE_SCALE, 1/CROSSING_TEXTURE_SCALE ),
				depthTest: false,
				transparent: DEBUG_BLOCKS_OPACITY<1,
				opacity: DEBUG_BLOCKS_OPACITY
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
		
		if( missingInRing(shrinkedZone.a) ) block.ring.push( new Zone( shrinkedZone.a, size ) );
		if( missingInRing(shrinkedZone.b) ) block.ring.push( new Zone( shrinkedZone.b, size ) );
		if( missingInRing(shrinkedZone.c) ) block.ring.push( new Zone( shrinkedZone.c, size ) );
		if( missingInRing(shrinkedZone.d) ) block.ring.push( new Zone( shrinkedZone.d, size ) );

		sortRing( block.ring, block.zone.center );
		//console.log(block.ring);		
		
	} // Crossings.reorder
	
	
	
} // Crossings
