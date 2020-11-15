//
// class Zone( a, b, c, d )
//		constructor Zone( a, b, c, d )		→ Zone
//		constructor Zone( center, size )	→ Zone
//		dX()								→ float
//		dZ()								→ float
//		center								→ Pos
//		perlinHeight()						→ [0,1]
//		randomPos( )						→ Pos
//		shrink( margin )					→ Zone
//		isRectangular( )					→ boolean
//		static midX( a, b, x )				→ Pos
//		static midZ( a, b, z )				→ Pos
//		randomPos( )						→ Pos
//		maxX( )								→ float
//		minX( )								→ float
//		maxZ( )								→ float
//		minZ( )								→ float
//
// class Pos
//		constructor( x, z, block, y )		→ Pos
//		distanceTo( b )						→ float
//		distanceToSq( b )					→ float
//		distance( )							→ float
//		manhattanDistanceTo( b )			→ float
//		midPointTo( b, k )					→ Pos
//		addXZ( x, z )						→ Pos
//		addY( y )							→ Pos
//		setFloor( floor )					→ Pos
//		add( b, k )							→ Pos
//		dot( b )							→ float
//		to( b )								→ Pos
//		lenX( dX )							→ Pos
//		lenZ( dZ )							→ Pos
//		closest( a, b )						→ Pos
//		closestTo( a, b )					→ Pos
//		closestRingIndex( )					→ integer
//		closestArrayIndex( array )			→ integer
//		normalize( )						→ Pos
//		vector( )							→ THREE.Vector3
//		clone( )							→ Pos
//
// class Size
//		constructor( x, z )					→ Size
//		shrink( margin )					→ Size
//
// class Range
//		constructor( min, max )				→ Range
//		randFloat( margin )					→ float
//		randTime( )							→ float
//		randInt()							→ int
//		mid()								→ float
//		diff()								→ float
//		inside( x, margin )					→ float
//
// timeMs( hours, minutes, seconds )		→ ms
// msToString( ms ) 						→ string
//
// round( x, modulo ) 						→ float
// almostEqual( x, y, epsilon )				→ boolean
//
// random() 								→ [0,1]
// gaussRandom() 							→ [0,1]
// pick( array ) 							→ elem
// pickDirection( fromPosition, toPositions, finalPosition, avoidPositions ) → elem
// pickDistance( fromPosition, toPositions, finalPosition, avoidPosition ) → elem
// pickClosest( fromPosition, viaPositions, finalPosition ) → elem
// sortRing( ring, center )					→ nothing
// findRingIndex( ring, position, closeness ) → int
// drawArrow( from, to, color )
// drawText( pos, text, color )
// clipLine( from, to, obstacles, margin )		→ {pos:Pos, clipped:boolean}
// clipLineRoute( from, to, obstacles, margin )	→ [pos]
// debugBlock( pos )
// debugPos( pos )



class Pos 
{
	constructor( x = 0, z = 0, block = undefined, y = 0 )
	{
		this.sysType = 'Pos';
		
		this.x = x;
		this.y = y;
		this.z = z;
		
		this.block = block;
		this.zone = undefined;
		
	} // Pos.constructor

	
	clone( )
	{
		return new Pos( this.x, this.z, this.block, this.y );
	} // Pos.clone
	
	
	distanceTo( b ) // 2D distance
	{
		return Math.sqrt( (this.x-b.x)*(this.x-b.x) + (this.z-b.z)*(this.z-b.z) );
	} // Pos.distanceTo

	
	distanceToSq( b ) // 2D distance^2
	{
		return (this.x-b.x)*(this.x-b.x) + (this.z-b.z)*(this.z-b.z);
	} // Pos.distanceToSq

	
	distance( ) // 3D distance
	{
		return Math.sqrt( this.x*this.x + this.z*this.z + this.y*this.y );
	} // Pos.distance

	
	normalize( ) // 2D distance
	{
		var length = this.distance();
		
		this.x /=length;
		this.z /= length;
		
		return this;
		
	} // Pos.normalize

	
	vector( )
	{
		return new THREE.Vector3( this.x, this.y||0, this.z);
		
	} // Pos.vector

	
	manhattanDistanceTo( b ) // 2D distance
	{
		return Math.max( Math.abs(this.x-b.x), Math.abs(this.z-b.z) );
	} // Pos.manhattanDistanceTo


	midPointTo( b, k = 0.5 ) // 2D
	{
		var x = this.x*(1-k) + k*b.x,
			z = this.z*(1-k) + k*b.z;
		
		if( this.block===b.block )
			return new Pos( x, z, this.x.block ); // same block
		else
			return new Pos( x, z );
	} // Pos.midPointTo


	addXZ( x, z ) // 2D
	{
		return new Pos( this.x+x, this.z+z, this.block, this.y );
	} // Pos.addXZ
	
	
	addY( y )
	{
		return new Pos( this.x, this.z, this.block, this.y+y );
	} // Pos.addY
	
	
	setFloor( floor )
	{
		this.y = floor * FLOOR_HEIGHT;
		return this;
	} // Pos.setFloor
	
	
	add( b, k=1 )
	{
		return new Pos( this.x+k*b.x, this.z+k*b.z, this.block, this.y+k*(b.y||0 ) );
	} // Pos.add
	
	
	dot( b )
	{
		return new Pos( this.x*b.x, this.z*b.z, this.block, this.y*(b.y||0) );
	} // Pos.dot
	
	
	to( b )
	{
		return new Pos( b.x-this.x, b.z-this.z, this.block, b.y-this.y );
	} // Pos.add
	
	
	lenX( dX )
	{
		var k = dX/Math.abs(this.x);
		this.z *= k;
		this.x *= k;
		
		return this;
	} // Pos.setDX
	
	
	lenZ( dZ )
	{
		var k = dZ/Math.abs(this.z);
		this.x *= k;
		this.z *= k;
		
		return this;
	} // Pos.setDX

	
	// dot (scalar) product two vectors
	dot( b )
	{
		return this.x*b.x + this.z*b.z;
	}
	
	// closest point from line AB
	closest( a, b )
	{
		var ab = a.to(b);
		var k = -ab.dot( this.to(a) ) / ab.dot(ab);
		return a.add( ab, k );
	}

	// vector to closest point from line AB
	closestTo( a, b )
	{
		var ab = a.to(b);
		var k = -ab.dot( this.to(a) ) / ab.dot(ab);
		return this.to(a.add( ab, k ));
	}

	closestRingIndex( )
	{
		return this.block.closestRingIndex( this );
	}
	
	closestArrayIndex( array )
	{
		var index = 0,
			distance = this.distanceToSq( array[0].center || array[0].zone.center || array[0].outerZone.center );
			
		for( var i=1; i<array.length; i++ )
		{
			var newDistance = this.distanceToSq( array[i].center || array[i].zone.center || array[i].outerZone.center );
			if( distance > newDistance )
			{
				distance = newDistance;
				index = i;
			}
		}
		
		return index;
	}
	
} // Pos



class Size
{
	constructor( x, z )
	{
		this.sysType = 'Size';
		
		this.x = x;
		this.z = z;
	} // Size.constructor
	
	
	shrink( margin )
	{
		return new Size( this.x-margin, this.z-margin );
	} // Size.constructor
	
} // Size



class Range
{
	constructor( min, max )
	{
		this.sysType = 'Range';
		
		this.min = min;
		this.max = max;
	} // Range.constructor
	
	
	randFloat( margin = 0 )
	{
		return THREE.Math.randFloat( this.min+margin, this.max-margin );
	} // Range.randFloat
	
	
	randTime( )
	{
		return THREE.Math.randFloat( this.min, this.max ) % HOURS_24_MS;
	} // Range.randFloat
	
	
	randInt()
	{
		return THREE.Math.randInt( Math.round(this.min), Math.round(this.max) );
	} // Range.randInt
	
	
	mid()
	{
		return (this.min + this.max)/2;
	} // Range.mid
	
	
	diff()
	{
		return this.max - this.min;
	} // Range.diff
	
	
	inside( x, margin = 0 )
	{
		return (this.min+margin <= x) && (x <= this.max-margin);
	} // Range.inside
	
} // Range



class Zone
{
	constructor( a, b, c, d )
	{
		this.sysType = 'Zone';
		this.id = Zone.id++;

		if( d instanceof Pos )
		{	// Zone(a,b,c,d)
			this.a = a;
			this.b = b;
			this.c = c;
			this.d = d;
			
			this.xRange = new Range( Math.max( this.a.x, this.d.x ), Math.min( this.b.x, this.c.x ) );
			this.zRange = new Range( Math.max( this.d.z, this.c.z ), Math.min( this.a.z, this.b.z ) );
			this.center = new Pos( this.xRange.mid(), this.zRange.mid(), this.block || this.a.block );
		}
		else
		{	// Zone(center,size)
			this.center = a
			
			var size = b;
			
			this.a = this.center.addXZ( -size.x/2,  size.z/2 );
			this.b = this.center.addXZ(  size.x/2,  size.z/2 );
			this.c = this.center.addXZ(  size.x/2, -size.z/2 );
			this.d = this.center.addXZ( -size.x/2, -size.z/2 );
			
			this.xRange = new Range( this.a.x, this.b.x );
			this.zRange = new Range( this.d.z, this.a.z );
		}
		
	} // Zone.constructor


	dX()
	{
		return this.xRange.diff();
	} // Zone.dX
	
	
	dZ()
	{
		return this.zRange.diff();
	} // Zone.dZ

	
	
	perlinHeight( )
	{
		var center = this.center;
		
		// perlin sheet made of overlapping noises
		var k = 0.1/Math.sqrt(GROUND_SIZE);
		var h =   (4/7)*(perlin.get(center.x*k,center.z*k))
				+ (2/7)*(perlin.get	(center.x*2*k,center.z*2*k))
				+ (1/7)*(perlin.get(center.x*4*k,center.z*4*k));
				
		// normalize by clamping
		h = THREE.Math.clamp(3*h+SKYSCRAPERS,0,1);
		
		// cosine attenuation - imitation of normal distibution
		// reduces upto 50% the buildings heights in the outskirts
		var aX = 0.75 + 0.25*Math.cos( Math.PI*center.x/GROUND_EDGE ),
			aZ = 0.75 + 0.25*Math.cos( Math.PI*center.z/GROUND_EDGE );
		h = aX*aZ*h;
		
		// randomize the height ±30% and normalize again
		h = THREE.Math.randFloat( 1-0.3, 1+0.3 ) * h;
		h = THREE.Math.clamp(h,0,1);
		
		// increase the spikiness of skyscraper districts
		h = Math.pow(h,2);
		
		return h;
	} // Zone.perlinHeight
	
	
	randomPos( )
	{
		var kx = THREE.Math.randFloat(0,1),
			kz = THREE.Math.randFloat(0,1),
			ka = (1-kx)*kz,
			kb = kx*kz,
			kc = kx*(1-kz),
			kd = (1-kx)*(1-kz);
			
		var pos = new Pos(
			this.a.x*ka + this.b.x*kb + this.c.x*kc + this.d.x*kd,
			this.a.z*ka + this.b.z*kb + this.c.z*kc + this.d.z*kd,
			this.block || this.a.block
		);
		
		pos.zone = this;
		
		return pos;

	} // Zone.randomPos

	
	isRectangular( )
	{
		return  almostEqual(this.a.x,this.d.x) &&
				almostEqual(this.b.x,this.c.x) &&
				almostEqual(this.a.z,this.b.z) &&
				almostEqual(this.c.z,this.d.z);
				
	} // Zone.isRectangular
	
	
	shrink( margin )
	{
		// shrink along X
		var a = Zone.midX( this.a, this.b, this.a.x + margin ),
			b = Zone.midX( this.a, this.b, this.b.x - margin ),
			c = Zone.midX( this.d, this.c, this.c.x - margin ),
			d = Zone.midX( this.d, this.c, this.d.x + margin );
		
		// shrink along Z
		return new Zone(
			Zone.midZ( d, a, a.z - margin ),
			Zone.midZ( c, b, b.z - margin ),
			Zone.midZ( c, b, c.z + margin ),
			Zone.midZ( d, a, d.z + margin )
		);
		
	} // Zone.shrinkBlock


	// midpoint on "horizontal" segment
	static midX( a, b, x )
	{
		//  ....x
		//      |
		//	a---?---b
		var k = (x-a.x)/(b.x-a.x);
		return new Pos(
			x,
			THREE.Math.lerp( a.z, b.z, k),
			a.block
		);
	} // Zone.midX
	
	
	
	// midpoint on "vertical" segment
	static midZ( a, b, z )
	{
		//	b
		//	|
		//	?---z
		//	|   :
		//	a   :
		var k = (z-a.z)/(b.z-a.z);
		return new Pos(
			THREE.Math.lerp( a.x, b.x, k ),
			z,
			a.block
		);
	} // Zone.midZ
	
	
	
	minX( ) { return this.xRange.min; }
	maxX( ) { return this.xRange.max; }
	minZ( ) { return this.zRange.min; }
	maxZ( ) { return this.zRange.max; }
	
	
} // Zone

Zone.id = 0;


function timeMs( hours, minutes=0, seconds=0 )
{
	return 1000*(seconds + 60*minutes + 60*60*hours);
} // timeMs



function msToString( ms )
{
	var seconds = Math.floor( ms/1000 ) % SECONDS_IN_DAY;
	
	var hours = Math.floor( seconds / SECONDS_IN_HOUR ),
		minutes = Math.floor( (seconds%SECONDS_IN_HOUR) / SECONDS_IN_MINUTE ),
		seconds = seconds % SECONDS_IN_MINUTE;
		
	return (hours<10?'0':'')+hours+(minutes<10?':0':':')+minutes+(seconds<10?':0':':')+seconds;
} // msToString
		
		
		
function round( x, modulo = 0.1 )
{
	// return x as integer number of modulos
	if( modulo >= 1 )
		return Math.round( x / modulo ) * modulo;
	else
	{	// this reduses rounding errors
		modulo = Math.round( 1 / modulo );			
		return Math.round( x * modulo ) / modulo; 
	}
} // round



function random()
{
	return Math.random();
} // random



function gaussRandom()
{
	return (random()+random()+random()+random()+random())/5;
} // gaussRandom



function pick( array )
{
	var index = THREE.Math.randInt( 0, array.length-1 );
	return array[index];
} // pick



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
function pickDistance( fromPosition, viaPositions, finalPosition )
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
		pickIndex = THREE.Math.randInt( 0, n-1 );
	
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




function pickDirection( fromPosition, viaPositions, finalPosition, avoidPositions = [] )
{
	// calculate probabilities intervals
	var cosines = [],
		maxCosine = -1,
		probabilities = [0],
		n = viaPositions.length;

	// vector to the final position
	var vecFinal = fromPosition.to( finalPosition ),
		lenFinal = vecFinal.dot( vecFinal );
	
	for( var i=0; i<n; i++)
	{	
		var midPosition = getPosition( viaPositions[i] );

		// vectors to a possible position
		var vecPossible = fromPosition.to( midPosition ),
			lenPossible = vecPossible.dot( vecPossible );

		var cosine;
		if( lenPossible<1 || avoidPositions.indexOf(viaPositions[i])>-1 )
			cosine = -1;
		else
			cosine = vecFinal.dot( vecPossible ) / Math.sqrt( lenFinal * lenPossible );
		
		// convert [-1..1] -> [0..1]
		cosine = (cosine+1)/2; // [0..1]

		cosines[i] = cosine;
		maxCosine = Math.max( maxCosine, cosine );
	}

	// set probability value like this:
	// 		100 - for items up to 10% from the maximal cosine
	//		1   - for items up to 30%
	//		0.1	- all other items
	var value;
	for( var i=0; i<n; i++)
	{	
		if( cosines[i]>0.9*maxCosine ) value = 100;
		else if( cosines[i]>0.7*maxCosine ) value = 1;
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

//	console.log('pickDirection------------');
//	for( var i=0; i<n; i++ )
//		console.log('opt['+i+'] =', (probabilities[i+1]-probabilities[i]).toFixed(2), i==pickedIndex?'*':'' );
	
	return viaPositions[pickedIndex]; 
	
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



function almostEqual( x, y, epsilon = 0.0001 )
{
	return Math.abs(x-y) < epsilon;
} // almostEqual



function distanceBetween( a, b )
{
	console.warn('function distanceBetween is deprecated, use pos.distanceTo');
	return Math.sqrt( (a.x-b.x)*(a.x-b.x) + (a.z-b.z)*(a.z-b.z) );
}

function distanceManhattan( a, b )
{
	console.warn('function distanceManhattan is deprecated, use pos.manhattanDistanceTo');
	return Math.max( Math.abs(a.x-b.x), Math.abs(a.z-b.z) );
}



function midPointBetween( a, b )
{
	console.warn('function midPointBetween is deprecated, use pos.midPointTo');
	return {x: (a.x+b.x)/2, z: (a.z+b.z)/2 };
}



function sortRing( ring, center )
{
	// calculate polar angle of each ring element
	for( var i=0; i<ring.length; i++)
	{
		var v = center.to(ring[i].center);
		ring[i].polarAngle = Math.atan2( v.z, v.x );
	}
	
	ring.sort((a,b)=>(a.polarAngle > b.polarAngle) ? 1 : -1);

	for( var i=0; i<ring.length; i++)
	{
		if( ring[i].parent )
			ring[i].parent.ringIndex = i;
		
		if( DEBUG_NAVMESH_SHOW_LINES )
		{
			var from = ring[i].center;
			var to = ring[(i+1)%ring.length].center;
			navmesh.addLine( from, to );
		}
	}
} // sortRing



function findRingIndex( ring, position, closeness = 1 )
{
	for( var i=0; i<ring.length; i++)
	{
		if( position.manhattanDistanceTo(ring[i].center) < closeness )
			return i;
	}
	
	return -1;
} // findRingIndex




function drawArrow( from, to, color = 'crimson' )
{
	from = from.vector();
	to = to.vector();
	
	var dir = to.sub( from ),
		len = dir.length();
	
	
	var arrowHelper = new THREE.ArrowHelper( dir.normalize(), from, len, color, 1, 1/2 );
	scene.add( arrowHelper );
}


function drawText( pos, text, color = 'black' )
{
	var textMaterial = new THREE.MeshBasicMaterial({color:color}),
		textStyle = {
					font: font.font,
					size: 2,
					height: 0.03,
					curveSegments: 4,
					bevelEnabled: false,
				},
		textGeometry = new THREE.TextGeometry( text, textStyle ),
		text = new THREE.Mesh( textGeometry, textMaterial );
		
	text.position.x = pos.x;
	text.position.y = pos.y||2;
	text.position.z = pos.z;
	text.rotation.set(-Math.PI/2,Math.PI/2,0,'YXZ');
	scene.add( text );
}



function clipLineRoute( from, to, obstacles, margin = 1 )
{
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
		route.push( from );
		clipData = clipLine( from, to, obstacles, margin, route );
	}
	
	route.push( clipData.pos );
	
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
	
	

function debugBlock( pos, label = '' )
{
	if( pos.block )
	{
		console.trace(label,'Good block',this.doing);
	}
	else
	{
		console.error(label,'Bad block',this.doing);
	}
} // debugBlock()



function debugPos( pos, label = '' )
{
	console.log(label,'x='+pos.x.toFixed(1),/*pos.y.toFixed(2),*/'z='+pos.z.toFixed(1));
} // debugBlock()



	
RIGHT 	= 0;		// X+, east
TOP 	= 1;		// Z+, north
LEFT	= 2;		// X-, west
BOTTOM	= 3;		// Z-, south
