//
//	class Block
//		constructor( zone, type, streetWidths )
//		randomPos( )
//		closestRingIndex( pos )
//		setMatrix( block )
//
//	class Blocks
//		parks[]
//		plazas[]
//		offices[]
//		residentials[]
//		streetRandom( range )
//		splitIntoBlocks(a,b,c,d)
//		constructBlockImages( blockType )
//
// block layout - at least 3 of the angles are 90 degrees
//
//		A-----------B
//		|			|
//		|			|
//		D-----------C



class Block
{
	
	constructor( zone, type = BLOCK_PARK, streetWidths = [0,0,0,0] )
	{
		this.sysType = 'Block';

		this.id = ++Block.id;
		
		this.zone = zone;
		this.zone.block = this;
		this.type = type;
		
		this.height = zone.perlinHeight( );
		
		this.streetWidths = streetWidths;
	
		this.buildings = [];
		this.ring = []; // crossings and edges
		this.crossings = []; // only crossings
	} // Block.constructor

	
	
	randomPos( )
	{
		return this.zone.randomPos();
		
	} // Block.randomPos
	
	

	// find the index of the zone in the ring,
	// which center is closest to the given position
	closestRingIndex( pos )
	{
		var index = 0,
			distance = pos.distanceToSq( this.ring[0].center );
			
		for( var i=1; i<this.ring.length; i++ )
		{
			var newDistance = pos.distanceToSq( this.ring[i].center );
			if( distance > newDistance )
			{
				distance = newDistance;
				index = i;
			}
		}
		
		return index;
	}
	
	
	setMatrix( matrix )
	{
		var u0 = this.d.x, v0 = this.d.z,
			u1 = this.c.x, v1 = this.c.z,
			u2 = this.b.x, v1 = this.b.z,
			u3 = this.a.x, v1 = this.a.z;

		var u01 = u0-u1,
			u12 = u1-u2,
			u23 = u2-u3,
			v01 = v0-v1,
			v12 = v1-v2,
			v23 = v2-v3;

		var h5 = v0,
			h2 = u0,
			h6 = (u23*(v01+v23)-(u01+u23)*v23) / (u23*v12-u12*v23),
			h0 = -u01 + u1*h6,
			h3 = -v01 + v1*h6,
			h7 = ((u01+u23)*v12 - u12*(v01+v23)) / (u12*v23-u23*v12),
			h4 = v3-v0 + v3*h7,
			h1 = u3-u0 + u3*h7;

		matrix.set(
			h0, 0, h1, h2,
			 0, 1,  0,  0,
			h3, 0, h4, h5,
			h6, 0, h7,  1
		);
	} // Block.setMatrix
	

} // Block
		
		
		
Block.id		= 0;


class Blocks
{
	constructor()
	{
		this.sysType = 'Blocks';

		this.parks = [];
		this.plazas = [];
		this.offices = [];
		this.apartments = [];
		this.houses = [];
		this.allTrueBlocks = [];
		
		var zone = new Zone(
				new Pos( -GROUND_EDGE, +GROUND_EDGE ),
				new Pos( +GROUND_EDGE, +GROUND_EDGE ),
				new Pos( +GROUND_EDGE, -GROUND_EDGE ),
				new Pos( -GROUND_EDGE, -GROUND_EDGE )
			);
			
		this.splitIntoBlocks( zone, [0,0,0,0] /* street widths */ );

		this.constructBlockImages( BLOCK_PLAZA, textures.sidewalk, SIDEWALK_TEXTURE_SCALE );
		this.constructBlockImages( BLOCK_OFFICE, textures.sidewalk, SIDEWALK_TEXTURE_SCALE );
		this.constructBlockImages( BLOCK_APARTMENTS, textures.sidewalk, SIDEWALK_TEXTURE_SCALE );
		this.constructBlockImages( BLOCK_HOUSES, textures.sidewalk, SIDEWALK_TEXTURE_SCALE );
		this.constructBlockImages( BLOCK_PARK, textures.grass, GRASS_TEXTURE_SCALE ); 
		
	} // Blocks

	
	
	// random street position at 20k //10k+5
	streetRandom( range )
	{
		var pos = THREE.Math.randFloat( range.min+BLOCK_MARGIN, range.max-BLOCK_MARGIN );
		return round( pos, 20 );
	}
	
		
	splitIntoBlocks( zone, streetWidths )
	{
		var center = zone.center,
			dX = zone.dX(),
			dZ = zone.dZ();
	
		// if zone is small enough, test whether it qualifies for a vegetation suburb
		var zoneSize = Math.max( dX, dZ )
		if ( zoneSize < SUBURB_TRESHOLD )
		{
			
			// randomizer
			var R1 = THREE.Math.randFloat( GROUND_SIZE/50, GROUND_SIZE/10 ),
				R2 = THREE.Math.randFloat( GROUND_SIZE/50, GROUND_SIZE/10 ),
				R3 = Math.sin(center.x/R1) + Math.cos(center.z/R2);
			
			var urbanRadius = THREE.Math.randFloat(0.5,0.8) * GROUND_SIZE,
				suburbRadius = R3 * URBAN_RURAL * GROUND_SIZE;
				
			var distanceToCityCenter = center.distance();
			
			if ( distanceToCityCenter > urbanRadius + suburbRadius)
			{	
				// this block is with vegetation
				var block = new Block( zone, BLOCK_PARK, streetWidths );
				block.outskirts = true;
				this.parks.push( block );
				this.allTrueBlocks.push( block );
				
				return;
			}
		}
			
			
		// decide type of the block - the type affects the splitting size
		
		var type,
			height = zone.perlinHeight();
		
		if( Math.random() < BLOCK_PARK.probability )
			type = BLOCK_PARK;
		else if( Math.random() < BLOCK_PLAZA.probability )
			type = BLOCK_PLAZA;
		else
		{
			// lower height increase chance for residential block
			if( Math.random() > height+OFFICE_VS_RESIDENTIAL )					
				type = height*MAX_FLOORS>2*FLOOR_HEIGHT ? BLOCK_APARTMENTS : BLOCK_HOUSES;
			else
				type = BLOCK_OFFICE;
		}
		var tresholdFactor = type==BLOCK_HOUSES ? 0.5 : 1;

		var types = [];
		if( DEBUG_BLOCK_WITH_ONLY_PARK ) types.push(BLOCK_PARK);
		if( DEBUG_BLOCK_WITH_ONLY_PLAZA ) types.push(BLOCK_PLAZA);
		if( DEBUG_BLOCK_WITH_ONLY_HOUSES ) types.push(BLOCK_HOUSES,BLOCK_HOUSES,BLOCK_HOUSES,BLOCK_HOUSES);
		if( DEBUG_BLOCK_WITH_ONLY_OFFICES ) types.push(BLOCK_OFFICE,BLOCK_OFFICE,BLOCK_OFFICE,BLOCK_OFFICE);
		if( DEBUG_BLOCK_WITH_ONLY_APARTMENTS ) types.push(BLOCK_APARTMENTS,BLOCK_APARTMENTS,BLOCK_APARTMENTS,BLOCK_APARTMENTS);
		if( types.length ) type = pick(types);
		
		var isSplitByAvenue = Math.min(dX,dZ)>AVENUE_TRESHOLD;
		var streetWidth = isSplitByAvenue ? AVENUE_WIDTH : STREET_WIDTH;
	
		var addVerticalStreet = dX*(0.7+Math.random()) > dZ*(0.7+Math.random()),
			addHorizontalStreet = !addVerticalStreet;
		
		var n,m,cn,cm,qm,qn,qa,qd,newStreetWidths;
		if( addVerticalStreet && (dX >= tresholdFactor*BLOCK_SPLIT_TRESHOLD) )
		{	// split left-right
			//	A---M-------B
			//	|	|		|
			//	|    \      |
			//	|	  |		|
			//	D-----N-----C
			var mx = this.streetRandom( zone.xRange ),
				nx = this.streetRandom( zone.xRange );

			if( !zone.isRectangular() || Math.abs(nx-mx)*2>dZ /*|| isSplitByAvenue*/ )
				nx = mx;

			// left block
			m = Zone.midX( zone.a, zone.b, mx-streetWidth/2 );
			n = Zone.midX( zone.d, zone.c, nx-streetWidth/2 );
			newStreetWidths = [...streetWidths];
			newStreetWidths[RIGHT] = streetWidth;
			this.splitIntoBlocks( new Zone(zone.a,m,n,zone.d), newStreetWidths );
			
			// right block
			m = Zone.midX( zone.a, zone.b, mx+streetWidth/2 );
			n = Zone.midX( zone.d, zone.c, nx+streetWidth/2 );
			newStreetWidths = [...streetWidths];
			newStreetWidths[LEFT] = streetWidth;
			this.splitIntoBlocks( new Zone(m,zone.b,zone.c,n), newStreetWidths );
		}
		else if( addHorizontalStreet && (dZ >= tresholdFactor*BLOCK_SPLIT_TRESHOLD) )
		{	// split top-bottom
			//	A-----------B
			//	|			|
			//	|     ,-----N
			//	M----'      |
			//	|			|
			//	D-----------C
			var mz = this.streetRandom( zone.zRange ),
				nz = this.streetRandom( zone.zRange );

			if( !zone.isRectangular() || Math.abs(nz-mz)*2>dX /*|| isSplitByAvenue*/ )
				nz = mz;

			// top block
			m = Zone.midZ( zone.d, zone.a, mz+streetWidth/2 );
			n = Zone.midZ( zone.c, zone.b, nz+streetWidth/2 );
			newStreetWidths = [...streetWidths];
			newStreetWidths[BOTTOM] = streetWidth;
			this.splitIntoBlocks( new Zone(zone.a,zone.b,n,m), newStreetWidths );
			
			// bottom block
			m = Zone.midZ( zone.d, zone.a, mz-streetWidth/2 );
			n = Zone.midZ( zone.c, zone.b, nz-streetWidth/2 );
			newStreetWidths = [...streetWidths];
			newStreetWidths[TOP] = streetWidth;
			this.splitIntoBlocks( new Zone(m,n,zone.c,zone.d), newStreetWidths );
		}	
		else
		{	// no split
			var block = new Block( zone, type, streetWidths );
			this[type.name].push( block );
			this.allTrueBlocks.push( block );
	
			// if block with houses, add shrinked park (yard) as overlayed block
			if( type==BLOCK_HOUSES )
			{
				var yardZone = zone.shrink( SIDEWALK_WIDTH ),
					yard = new Block( yardZone, type );
				yard.parent = block;
				
				// //yard.houseBlock = block;
				this[BLOCK_PARK.name].push( yard );
			}
		}
		
	} // splitIntoBlocks
	

	constructBlockImages( blockType, texture=textures.grid, textureScale=GROUND_TEXTURE_SCALE )
	{
		var vertices = [];
		var normals = [];
		var uvs = [];
		
		var blocks = this[blockType.name];

		for (var i=0; i<blocks.length; i++)
		{
			var zone = blocks[i].zone,
				a = zone.a,
				b = zone.b,
				c = zone.c,
				d = zone.d;
			
			vertices.push(
				a.x,0,a.z, b.x,0,b.z, d.x,0,d.z,
				d.x,0,d.z, b.x,0,b.z, c.x,0,c.z
			);

			normals.push(
				0,1,0, 0,1,0, 0,1,0,
				0,1,0, 0,1,0, 0,1,0
			);
			
			uvs.push(
				a.x,a.z, b.x,b.z, d.x,d.z,
				d.x,d.z, b.x,b.z, c.x,c.z
			);
		}
		
		var MeshClass = (SHADOWS)?THREE.MeshStandardMaterial:THREE.MeshBasicMaterial;
		
		var material = new MeshClass({
				color: blockType.color,
				map: texture.map( 1/textureScale, 1/textureScale ),
				depthTest: false,
				transparent: DEBUG_BLOCKS_OPACITY<1,
				opacity: DEBUG_BLOCKS_OPACITY,
				metalness: 0,
				roughness: 1,
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
			image.renderOrder = blockType.renderOrder;
			image.receiveShadow = true;

		scene.add(image);
		
	} // Blocks.constructBlockImages
	

	
} // Blocks
