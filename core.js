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
//		smooth( x )							→ float [0,1]
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


import * as THREE from './js/three.module.js';
import {GROUND_SIZE, SKYSCRAPERS, GROUND_EDGE, DEBUG_NAVMESH_SHOW_LINES, HOURS_24_MS, SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, FLOOR_HEIGHT} from './config.js';
import {scene} from './main.js';
import {TextGeometry} from './js/TextGeometry.js';
import {font} from './font.js';



export class Pos 
{
	constructor( x = 0, z = 0, block = undefined, y = 0 )
	{
//		this.sysType = 'Pos';
		
		this.x = x;
		this.z = z;
		this.y = y;
		
		if( block ) this.block = block;
		//this.zone = undefined;
		
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
	{	// reuse the current position
		this.y = floor * FLOOR_HEIGHT;
		return this;
	} // Pos.setFloor
	
	
	newFloor( floor )
	{	// create new position
		return new Pos( this.x, this.z, this.block, floor * FLOOR_HEIGHT );
	} // Pos.newFloor
	
	
	add( b, k=1 )
	{
		return new Pos( this.x+k*b.x, this.z+k*b.z, this.block, this.y+k*(b.y||0 ) );
	} // Pos.add
	
	
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



export class Size
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



export class Range
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
	
	// min = range, max = range, result:
	//  0 before min
	//	0..1 inside min
	//	1 between min and max
	//  1..0 inside max
	//	0 after max
	smooth( x )
	{
		var on = this.min,
			off = this.max;
			
		if( x <= on.min ) return 0;
		
		if( x <= on.max ) return THREE.Math.smoothstep( x, on.min, on.max );
		
		if( x <= off.min ) return 1;
		
		if( x <= off.max ) return 1-THREE.Math.smoothstep( x, off.min, off.max );
		
		return 0;
		
	} // Range.smoothIn
	
	smoothOut( x )
	{
		return 1 - THREE.Math.smoothstep( x, this.min, this.max );
	} // Range.smoothOut
	
} // Range



export class BlockZone
{
	constructor( a, b, c, d )
	{
		this.sysType = 'Zone';
		this.id = BlockZone.id++;

		if( d instanceof Pos )
		{	// BlockZone(a,b,c,d)
			this.a = a;
			this.b = b;
			this.c = c;
			this.d = d;
			
			//this.xRange = new Range( Math.max( this.a.x, this.d.x ), Math.min( this.b.x, this.c.x ) );
			//this.zRange = new Range( Math.max( this.d.z, this.c.z ), Math.min( this.a.z, this.b.z ) );
			this.center = new Pos( this.xRange.mid(), this.zRange.mid(), this.block || this.a.block );
		}
		else
		{	// BlockZone(center,size)
			this.center = a
			
			var size = b;
			
			this.a = this.center.addXZ( -size.x/2,  size.z/2 );
			this.b = this.center.addXZ(  size.x/2,  size.z/2 );
			this.c = this.center.addXZ(  size.x/2, -size.z/2 );
			this.d = this.center.addXZ( -size.x/2, -size.z/2 );
			
			//this.xRange = new Range( this.a.x, this.b.x );
			//this.zRange = new Range( this.d.z, this.a.z );
		}
		
	} // BlockZone.constructor


	get xRange()
	{
		return new Range( Math.max( this.a.x, this.d.x ), Math.min( this.b.x, this.c.x ) );
	}
	
	get zRange()
	{
		return new Range( Math.max( this.d.z, this.c.z ), Math.min( this.a.z, this.b.z ) );
	}
	
	
	dX()
	{
		return this.xRange.diff();
	} // BlockZone.dX
	
	
	dZ()
	{
		return this.zRange.diff();
	} // BlockZone.dZ

	
	
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
	} // BlockZone.perlinHeight
	
	
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

	} // BlockZone.randomPos

	
	isRectangular( )
	{
		return  almostEqual(this.a.x,this.d.x) &&
				almostEqual(this.b.x,this.c.x) &&
				almostEqual(this.a.z,this.b.z) &&
				almostEqual(this.c.z,this.d.z);
				
	} // BlockZone.isRectangular
	
	
	shrink( margin )
	{
		// shrink along X
		var a = midX( this.a, this.b, this.a.x + margin ),
			b = midX( this.a, this.b, this.b.x - margin ),
			c = midX( this.d, this.c, this.c.x - margin ),
			d = midX( this.d, this.c, this.d.x + margin );
		
		// shrink along Z
		return new BlockZone(
			midZ( d, a, a.z - margin ),
			midZ( c, b, b.z - margin ),
			midZ( c, b, c.z + margin ),
			midZ( d, a, d.z + margin )
		);
		
	} // BlockZone.shrinkBlock



	minX( ) { return this.xRange.min; }
	maxX( ) { return this.xRange.max; }
	minZ( ) { return this.zRange.min; }
	maxZ( ) { return this.zRange.max; }
	
	
} // BlockZone

BlockZone.id = 0;


// midpoint on "horizontal" segment
export function midX( a, b, x )
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
} // midX



// midpoint on "vertical" segment
export function midZ( a, b, z )
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
} // midZ

export class RectZone
{
	constructor( center, size )
	{
//		this.sysType = 'RectZone';
		this.id = BlockZone.id++;

		this.center = center;
		this.size = size;
			
	} // RectZone.constructor

	get xRange()
	{
		return new Range( this.minX(), this.maxX() );
	}
	
	get zRange()
	{
		return new Range( this.minZ(), this.maxZ() );
	}
	
	get a()
	{
		return new Pos( this.center.x-this.size.x/2, this.center.z+this.size.z/2, this.center.block, this.center.y );
	}
	
	get b()
	{
		return new Pos( this.center.x+this.size.x/2, this.center.z+this.size.z/2, this.center.block, this.center.y );
	}
	
	get c()
	{
		return new Pos( this.center.x+this.size.x/2, this.center.z-this.size.z/2, this.center.block, this.center.y );
	}
	
	get d()
	{
		return new Pos( this.center.x-this.size.x/2, this.center.z-this.size.z/2, this.center.block, this.center.y );
	}
	
	dX()
	{
		return this.size.x;
	} // RectZone.dX
	
	
	dZ()
	{
		return this.size.z;
	} // RectZone.dZ
	
	
	randomPos( )
	{
		var rx = this.size.x * THREE.Math.randFloat(-0.5,0.5),
			rz = this.size.z * THREE.Math.randFloat(-0.5,0.5);
			
		var pos = new Pos(
			this.center.x + rx,
			this.center.z + rz,
			this.block || this.center.block
		);
		
		pos.zone = this;
		
		return pos;

	} // RectZone.randomPos

	
	shrink( margin )
	{
		var zone = new RectZone(
						this.center,
						new Size( this.size.x-2*margin, this.size.z-2*margin )
					);
		
		return zone;
		
	} // RectZone.shrinkBlock


	isInside( position, margin = 0 ) // positive margin expands the zone
	{
		if( this.minX()-margin > position.x ) return false;
		if( this.maxX()+margin < position.x ) return false;
		if( this.minZ()-margin > position.z ) return false;
		if( this.maxZ()+margin < position.z ) return false;
		
		return true;
	}
	
	
	minX( ) { return this.center.x - this.size.x/2; }
	maxX( ) { return this.center.x + this.size.x/2; }
	minZ( ) { return this.center.z - this.size.z/2; }
	maxZ( ) { return this.center.z + this.size.z/2; }
	
	
} // RectZone


export function timeMs( hours, minutes=0, seconds=0 )
{
	return 1000*(seconds + 60*minutes + 60*60*hours);
} // timeMs



export function msToString( ms )
{
	var totalSeconds = Math.floor( ms/1000 ),
		seconds = Math.floor( ms/1000 ) % SECONDS_IN_DAY;
	
	var days = Math.floor( totalSeconds / SECONDS_IN_DAY ),
		hours = Math.floor( seconds / SECONDS_IN_HOUR ),
		minutes = Math.floor( (seconds%SECONDS_IN_HOUR) / SECONDS_IN_MINUTE ),
		seconds = seconds % SECONDS_IN_MINUTE;
		
	return (days?days+'d ':'')+(hours<10?'0':'')+hours+(minutes<10?':0':':')+minutes+(seconds<10?':0':':')+seconds;
} // msToString
		
		
		
export function round( x, modulo = 0.1 )
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




export function almostEqual( x, y, epsilon = 0.0001 )
{
	return Math.abs(x-y) < epsilon;
} // almostEqual


/*
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
*/






export function drawArrow( from, to, color = 'crimson' )
{
	from = from.vector();
	to = to.vector();
	
	var dir = to.sub( from ),
		len = dir.length();
	
	
	var arrowHelper = new THREE.ArrowHelper( dir.normalize(), from, len, color, Math.min(len/4,1), Math.min(len/8,1/2) );
	scene.add( arrowHelper );
}


export function drawText( pos, text, color = 'black', scale = 1 )
{
	var textMaterial = new THREE.MeshBasicMaterial({color:color}),
		textStyle = {
					font: font.font,
					size: 2,
					height: 0.03,
					curveSegments: 4,
					bevelEnabled: false,
				},
		textGeometry = new TextGeometry( text, textStyle ),
		text = new THREE.Mesh( textGeometry, textMaterial );
		
	text.position.x = pos.x;
	text.position.y = pos.y||2;
	text.position.z = pos.z;
	text.scale.set( scale, scale, scale );
	text.rotation.set(-Math.PI/2,Math.PI/2,0,'YXZ');
	scene.add( text );
}



	
	

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



	
export var RIGHT 	= 0;		// X+, east
export var TOP 		= 1;		// Z+, north
export var LEFT		= 2;		// X-, west
export var BOTTOM	= 3;		// Z-, south
