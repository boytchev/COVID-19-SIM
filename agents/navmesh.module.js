//	class NavMeshZone
//		constructor( center, size, block, parent )
//		constructor( zone, block, parent )
//
//	class NavMesh
//		constructor( )
//		pairZones( inside, outside )
//		addOfficeBuilding( officeBuilding )
//		addApartmentBuilding( apartmentBuilding )
//		addOfficeDoor( door )
//		addHouse( house )
//		addCrossing( crossing )
//		addLine( from, to )
//		imageMesh( ) - for debug purposes only
//			imageMeshZones( color ) - for debug purposes only
//			imageMeshLines( color ) - for debug purposes only
//			imageMeshZonesVertical( color ) - for debug purposes only
//
// // //		route( ) - for debug purposes only
// // //		static pickNextGate( block, here, target )
// // //
// // //



import {DEBUG_NAVMESH_SHOW_LINES, DEBUG_NAVMESH_SHOW_MESHES, DEBUG_NAVMESH_SHOW_FLOORS, SIDEWALK_WIDTH, DEBUG_NAVMESH_OPACITY, DEBUG_NAVMESH_SHOW_ELEVATORS, OFFICE_ELEVATOR_SHAFT_WIDTH, FLOOR_HEIGHT} from '../config.module.js';
import {scene, buildings} from '../main.module.js';
import {Zone, Size, Pos, TOP, RIGHT, LEFT, BOTTOM, sortRing} from '../core.module.js';



class NavMeshZone extends Zone
{
	constructor( center, size, block = undefined, parent = undefined )
	{
		if( center instanceof Zone )
		{	// NavMeshZone( center, size,  block, parent )	
			//                |       |       |
			// NavMeshZone(  zone,  block, parent )	
			parent = block;
			block = size;
			var zone = center;

			zone.a.block = block;
			zone.b.block = block;
			zone.c.block = block;
			zone.d.block = block;
			super( zone.a, zone.b, zone.c, zone.d );
		}
		else
		{	// NavMeshZone( center, size, block, parent )	
			var sx = size.x/2,
				sz = size.z/2;
				
			super( 
				center.addXZ( -sx, +sz ),
				center.addXZ( +sx, +sz ),
				center.addXZ( +sx, -sz ),
				center.addXZ( -sx, -sz )
			);
		}

		this.sysType = 'NavMeshZone';
		
		this.pairZone = undefined; // zone paired with this zone
		this.block = block;

if( !this.center.block || !block || this.center.block.id!=block.id)		
console.error(this.center.block?this.center.block.id:'null',block?block.id:'null');

		this.parent = parent;
	} // NavMeshZone.constructor
	
} // NavMeshZone



export class NavMeshCrossingZone extends NavMeshZone
{
	constructor( center, size, block = undefined )
	{
		super( center, size, block );
		
		this.parent = this; // thus block ringIndex will be stored in the crossing's zone
		this.sysType = 'NavMeshCrossingZone';
		
	} // NavMeshCrossingZone.constructor
	
} // NavMeshCrossingZone



class NavMeshHouseZone extends NavMeshZone
{
	constructor( center, size, block = undefined, parent = undefined )
	{
		super( center, size, block, parent );
		this.sysType = 'NavMeshHouseZone';
		
	} // NavMeshHouseZone.constructor
	
} // NavMeshHouseZone



export class NavMesh
{
	
	constructor( )
	{
		this.sysType = 'NavMesh';
		
		// // this.gates = [];
		// // this.paths = [];
		this.zones = [];
		
		if( DEBUG_NAVMESH_SHOW_LINES )
		{
			this.lines = [];
		}
		
		// directional vectors
		//
		//    1,3               0
		//     ↑		        ↑
		//   ← u → 0,2		1 ← v → 3
		//     ↓			    ↓
		//					    2
		//
		this.u = [ new Size(1,0), new Size(0,1), new Size(1,0), new Size(0,1) ];
		this.w = [ new Size(1,0), new Size(0,1), new Size(-1,0), new Size(0,-1) ];
		this.v = [ new Pos(0,1), new Pos(1,0), new Pos(0,-1), new Pos(-1,0) ];
		
	} // NavMesh.constructor

	

	addLine( from, to )
	{
		this.lines.push( from.x, from.y, from.z, to.x, to.y, to.z );
	} // NavMesh.addLine
	
	
	
	pairZones( inside, outside )
	{
		outside.pairZone = inside;
		inside.pairZone = outside;
		
		if( DEBUG_NAVMESH_SHOW_LINES )
			this.addLine( inside.center, outside.center );
		
	} // NavMesh.pairZones
	
	
	
	addOfficeDoor( door )
	{
		//        center
		// inside   |           out
		// [--------+--------]   |
		// outside				 V
		
		var size = this.u[ door.rotation ],
			out = this.v[ door.rotation ];
			
		// scale size
		size = new Size( size.x*(door.width-2)+1, size.z*(door.width-2)+1 );

		// set door outer navmesh
		door.outsideZone = new NavMeshZone( door.center.add(out,+1), size, door.center.block );
		door.insideZone  = new NavMeshZone( door.center.add(out,-1), size, door.center.block );
		
		this.pairZones( door.insideZone, door.outsideZone );

		this.zones.push( door.insideZone, door.outsideZone );
		
	} // NavMesh.addOfficeDoor


	
	addCrossing( crossing )
	{
		var v, insideZone, outsideZone;
	
		var a = crossing.zone.a,
			b = crossing.zone.b,
			c = crossing.zone.c,
			d = crossing.zone.d;
			
		switch( crossing.type )
		{
			case TOP:
				v = d.to(a).normalize(); //vector across the street
				
				insideZone = new NavMeshCrossingZone( new Zone(a.add(v,2),b.add(v,2),b,a).shrink(1/2), crossing.blockB );
				outsideZone  = new NavMeshCrossingZone( new Zone(d,c,c.add(v,-2),d.add(v,-2)).shrink(1/2), crossing.blockA );
				break;
				
			case BOTTOM:
				v = d.to(a).normalize(); //vector across the street
				
				insideZone = new NavMeshCrossingZone( new Zone(a.add(v,2),b.add(v,2),b,a).shrink(1/2), crossing.blockA );
				outsideZone  = new NavMeshCrossingZone( new Zone(d,c,c.add(v,-2),d.add(v,-2)).shrink(1/2), crossing.blockB );
				break;

			case LEFT:
				v = a.to(b).normalize(); //vector across the street
				
				insideZone = new NavMeshCrossingZone( new Zone(b,b.add(v,2),c.add(v,2),c).shrink(1/2), crossing.blockA );
				outsideZone  = new NavMeshCrossingZone( new Zone(a.add(v,-2),a,d,d.add(v,-2)).shrink(1/2), crossing.blockB );
				break;				
				
			case RIGHT:
				v = a.to(b).normalize(); //vector across the street
				
				insideZone = new NavMeshCrossingZone( new Zone(b,b.add(v,2),c.add(v,2),c).shrink(1/2), crossing.blockB );
				outsideZone  = new NavMeshCrossingZone( new Zone(a.add(v,-2),a,d,d.add(v,-2)).shrink(1/2), crossing.blockA );
				break;				
		}
		
		if( insideZone && outsideZone )
		{
			insideZone.block.ring.push( insideZone );
			outsideZone.block.ring.push( outsideZone );

			insideZone.block.crossings.push( insideZone );
			outsideZone.block.crossings.push( outsideZone );
			
			this.pairZones( insideZone, outsideZone );
		
			this.zones.push( insideZone, outsideZone );

			insideZone.crossing = crossing;
			outsideZone.crossing = crossing;
		}
		
	}  // NavMesh.addCrossing
	
	
	
	addHouse( house )
	{		
		var zone,
			sizeHalf = new Size( 1/2, 1/2 ),
			size;
		
		// house floor of wingA
		size = house.wingA.size.shrink(1);
		zone = new NavMeshZone( house.wingA.center, size, house.block );
		house.wingA.insideZone = zone;
		this.zones.push( zone );
		
		// house floors of wingB
		size = house.wingB.size.shrink(1);
		zone = new NavMeshZone( house.wingB.center, size, house.block );
		house.wingB.insideZone = zone;
		this.zones.push( zone );
		
		// house doors
		for( var i=0; i<house.doors.length; i++ )
		{
			var door = house.doors[i];

			var out = this.v[ door.rotation ];

			// set door outer navmesh
			door.outsideZone = new NavMeshZone( door.center.add(out,+1/2), sizeHalf, house.block, door );
			door.insideZone  = new NavMeshZone( door.center.add(out,-1/2), sizeHalf, house.block, door );
			
			this.pairZones( door.insideZone, door.outsideZone );
		
			this.zones.push( door.insideZone, door.outsideZone );
			house.ring.push( door.outsideZone );
		}
		
		// house sidewalk path
		size = new Size( (house.path.rotation%2)?1/2:SIDEWALK_WIDTH-1, (house.path.rotation%2)?SIDEWALK_WIDTH-1:1/2 );
		out = this.w[ house.path.rotation ];

		// set path outer navmesh
		house.path.outsideZone = new NavMeshHouseZone( house.path.center.add(out,+house.path.length/2), size, house.block, house );
		house.path.insideZone  = new NavMeshZone( house.path.center.add(out,-house.path.length/2), sizeHalf, house.block, house.path );
		
		house.block.ring.push( house.path.outsideZone );
		house.ring.push( house.path.insideZone );
		
		this.pairZones( house.path.insideZone, house.path.outsideZone );
	
		this.zones.push( house.path.insideZone, house.path.outsideZone );

		// sort house rings
		var x = ( Math.max(house.wingA.zone.xRange.min,house.wingB.zone.xRange.min)
				  + Math.min(house.wingA.zone.xRange.max,house.wingB.zone.xRange.max) ) / 2;
		var z = ( Math.max(house.wingA.zone.zRange.min,house.wingB.zone.zRange.min)
				  + Math.min(house.wingA.zone.zRange.max,house.wingB.zone.zRange.max) ) / 2;

		sortRing( house.ring, new Pos(x,z) );

//drawArrow( house.wingA.center, house.ring[house.path.ringIndex].center, 'navy');
		
	} // NavMesh.addHouse


	
	addOfficeBuilding( officeBuilding )
	{		
		var zone, pos;

		// office rooms - draw floor map only
		for( var i=0; i<officeBuilding.rooms.length; i++ )
		{
			var room = officeBuilding.rooms[i];
			
			if( DEBUG_NAVMESH_SHOW_MESHES && DEBUG_NAVMESH_SHOW_FLOORS )
			{
				zone = new NavMeshZone( room.zone, officeBuilding.block );
				this.zones.push( zone );	
			}
			
			var center = room.zone.center,
				sizeX = room.zone.dX()/2,
				sizeZ = room.zone.dZ()/2,
				doorSize = NavMesh.OFFICE_DOOR_SIZES[ room.facing ];
				
			switch( room.facing )
			{
				case TOP:
						room.outsideZone = new NavMeshZone( center.addXZ(0,sizeZ+1/2), doorSize, officeBuilding.block );
						room.insideZone  = new NavMeshZone( center.addXZ(0,sizeZ-1/2), doorSize, officeBuilding.block );
						break;
				case BOTTOM:
						room.outsideZone = new NavMeshZone( center.addXZ(0,-sizeZ-1/2), doorSize, officeBuilding.block );
						room.insideZone  = new NavMeshZone( center.addXZ(0,-sizeZ+1/2), doorSize, officeBuilding.block );
						break;
				case LEFT:
						room.outsideZone = new NavMeshZone( center.addXZ(-sizeX-1/2,0), doorSize, officeBuilding.block );
						room.insideZone  = new NavMeshZone( center.addXZ(-sizeX+1/2,0), doorSize, officeBuilding.block );
						break;
				case RIGHT:
						room.outsideZone = new NavMeshZone( center.addXZ(sizeX+1/2,0), doorSize, officeBuilding.block );
						room.insideZone  = new NavMeshZone( center.addXZ(sizeX-1/2,0), doorSize, officeBuilding.block );
						break;
				default: console.error( 'Missing apartment room facing. Code 1024.' );
			}
			
			this.pairZones( room.insideZone, room.outsideZone );
		
			this.zones.push( room.insideZone, room.outsideZone );
		}
		
		// office elevators 
		for( var i=0; i<officeBuilding.elevators.length; i++ )
		{
			zone = new NavMeshZone( officeBuilding.elevators[i].zone, officeBuilding.block );
			
			this.zones.push( zone );	
		}
		
	} // NavMesh.addOfficeBuilding


	
	addApartmentBuilding( apartmentBuilding )
	{		
		// corner zones
		var center = apartmentBuilding.center,
			size = apartmentBuilding.size;
			
//		apartmentBuilding.cornerZones.a = new NavMeshZone( center.addXZ(-size.x/2-1,+size.z/2+1), NavMesh.CORNER_SIZE, apartmentBuilding.block, apartmentBuilding );
//		apartmentBuilding.cornerZones.b = new NavMeshZone( center.addXZ(+size.x/2+1,+size.z/2+1), NavMesh.CORNER_SIZE, apartmentBuilding.block, apartmentBuilding );
//		apartmentBuilding.cornerZones.c = new NavMeshZone( center.addXZ(+size.x/2+1,-size.z/2-1), NavMesh.CORNER_SIZE, apartmentBuilding.block, apartmentBuilding );
//		apartmentBuilding.cornerZones.d = new NavMeshZone( center.addXZ(-size.x/2-1,-size.z/2-1), NavMesh.CORNER_SIZE, apartmentBuilding.block, apartmentBuilding );
		
//		this.zones.push( apartmentBuilding.cornerZones.a,
//						 apartmentBuilding.cornerZones.b,
//						 apartmentBuilding.cornerZones.c,
//						 apartmentBuilding.cornerZones.d );
		
		var zone, pos;
		
		// rooms - draw floor map only
		for( var i=0; i<apartmentBuilding.rooms.length; i++ )
		{
			var room = apartmentBuilding.rooms[i];

			if( DEBUG_NAVMESH_SHOW_MESHES && DEBUG_NAVMESH_SHOW_FLOORS )
			{
				zone = new NavMeshZone( room.zone, apartmentBuilding.block );
				this.zones.push( zone );	
			}
		
			var center = room.zone.center,
				sizeX = room.zone.dX()/2,
				sizeZ = room.zone.dZ()/2,
				doorSize = NavMesh.APARTMENT_DOOR_SIZES[ room.facing ];
				
			switch( room.facing )
			{
				case TOP:
						room.outsideZone = new NavMeshZone( center.addXZ(0,sizeZ+1/2), doorSize, apartmentBuilding.block );
						room.insideZone  = new NavMeshZone( center.addXZ(0,sizeZ-1/2), doorSize, apartmentBuilding.block );
						break;
				case BOTTOM:
						room.outsideZone = new NavMeshZone( center.addXZ(0,-sizeZ-1/2), doorSize, apartmentBuilding.block );
						room.insideZone  = new NavMeshZone( center.addXZ(0,-sizeZ+1/2), doorSize, apartmentBuilding.block );
						break;
				case LEFT:
						room.outsideZone = new NavMeshZone( center.addXZ(-sizeX-1/2,0), doorSize, apartmentBuilding.block );
						room.insideZone  = new NavMeshZone( center.addXZ(-sizeX+1/2,0), doorSize, apartmentBuilding.block );
						break;
				case RIGHT:
						room.outsideZone = new NavMeshZone( center.addXZ(sizeX+1/2,0), doorSize, apartmentBuilding.block );
						room.insideZone  = new NavMeshZone( center.addXZ(sizeX-1/2,0), doorSize, apartmentBuilding.block );
						break;
				default: console.error( 'Missing apartment room facing. Code 1024.' );
			}
			
			this.pairZones( room.insideZone, room.outsideZone );
		
			this.zones.push( room.insideZone, room.outsideZone );
		}
		
		// elevators 
		//for( var i=0; i<apartmentBuilding.elevators.length; i++ )
		//{
		//	zone = new NavMeshZone( apartmentBuilding.elevators[i].zone, apartmentBuilding.block );
		//	
		//	this.zones.push( zone );	
		//}
		
	} // NavMesh.addOfficeBuilding


	

	imageMeshZones( instance, color = 'crimson' )
	{
		var vertices = [];
		
		var zones = this.zones;

		for (var i=0; i<zones.length; i++)
		{
			var zone = zones[i];
			
			if( zone instanceof instance )
				vertices.push(
					zone.a.x,zone.a.y,zone.a.z, zone.b.x,zone.b.y,zone.b.z, zone.d.x,zone.d.y,zone.d.z,
					zone.d.x,zone.d.y,zone.d.z, zone.b.x,zone.b.y,zone.b.z, zone.c.x,zone.c.y,zone.c.z
				);
		}

		var material = new THREE.MeshBasicMaterial({
				color: color,
				side: THREE.DoubleSide,
				depthTest: false,
				depthWrite: false,
				transparent: DEBUG_NAVMESH_OPACITY<1,
				opacity: DEBUG_NAVMESH_OPACITY
			});
	
		var geometry = new THREE.BufferGeometry();
			geometry.setAttribute(
				'position',
				new THREE.BufferAttribute(new Float32Array(vertices),3));
			
		var image = new THREE.Mesh(geometry, material);
			image.updateMatrix();
			image.matrixAutoUpdate = false;
			image.renderOrder = -50;

		scene.add(image);
	} // navMesh.imageMeshZones


	
	imageMeshLines( color = 'crimson' )
	{
		var material = new THREE.LineBasicMaterial({
				color: color,
				side: THREE.DoubleSide,
				depthTest: false,
				depthWrite: false,
				transparent: DEBUG_NAVMESH_OPACITY<1,
				opacity: DEBUG_NAVMESH_OPACITY
			});

		var geometry = new THREE.BufferGeometry();
			geometry.setAttribute(
				'position',
				new THREE.BufferAttribute(new Float32Array(this.lines),3));
			
		var image = new THREE.LineSegments(geometry, material);
			image.updateMatrix();
			image.matrixAutoUpdate = false;
			image.renderOrder = -45;

		scene.add(image);
		
		
		var material = new THREE.MeshLambertMaterial({
				side: THREE.FrontSide,
				color: 'yellow',
				transparent: DEBUG_NAVMESH_OPACITY<1,
				opacity: DEBUG_NAVMESH_OPACITY
			}),
			geometry = new THREE.BoxBufferGeometry( 1/5, 1/2, 1/5 );
			
		var instances = this.lines.length/3,
			mesh = new THREE.InstancedMesh( geometry, material, instances ),
			matrix = new THREE.Matrix4();
			
		for( var i=0; i<instances; i++ )
		{
			matrix.makeScale( 1, 1, 1 );
			matrix.setPosition( this.lines[3*i], 1/4, this.lines[3*i+2] );
			mesh.setMatrixAt( i, matrix );
		}

		scene.add( mesh );



	} // navMesh.imageLines


	
	imageMeshZonesVertical( color )
	{
		var material = new THREE.MeshBasicMaterial({
				color: color,
				//side: THREE.DoubleSide,
				depthTest: false,
				depthWrite: false,
				transparent: DEBUG_NAVMESH_OPACITY<1,
				opacity: DEBUG_NAVMESH_OPACITY
			});
	
		var geometry = new THREE.BoxBufferGeometry( OFFICE_ELEVATOR_SHAFT_WIDTH, 1, OFFICE_ELEVATOR_SHAFT_WIDTH );
			
		for( var j=0; j<buildings.offices.length; j++ )
		for( var i=0; i<buildings.offices[j].elevators.length; i++ )
		{
			var elevator = buildings.offices[j].elevators[i]; 
			
			var mesh = new THREE.Mesh( geometry, material );
			mesh.scale.y = buildings.offices[j].floors * FLOOR_HEIGHT;
			mesh.position.set( elevator.zone.center.x, mesh.scale.y/2, elevator.zone.center.z );

			scene.add( mesh );	
		}
		
		for( var j=0; j<buildings.apartments.length; j++ )
		for( var i=0; i<buildings.apartments[j].elevators.length; i++ )
		{
			var elevator = buildings.apartments[j].elevators[i]; 
			
			var mesh = new THREE.Mesh( geometry, material );
			mesh.scale.y = buildings.apartments[j].floors * FLOOR_HEIGHT;
			mesh.position.set( elevator.zone.center.x, mesh.scale.y/2, elevator.zone.center.z );

			scene.add( mesh );	
		}
		
	} // navMesh.imageMeshZonesVertical


	
	imageMesh( )
	{
		this.imageMeshZones( NavMeshZone, 'crimson' );
		this.imageMeshZones( NavMeshCrossingZone, 'orange' );
		this.imageMeshZones( NavMeshHouseZone, 'cornflowerblue' );
		
		if( DEBUG_NAVMESH_SHOW_ELEVATORS )
		{
			this.imageMeshZonesVertical( 'crimson' );
		}
		
		if( DEBUG_NAVMESH_SHOW_LINES )
		{
			navmesh.imageMeshLines();
		}
		
	} // navMesh.imageMesh
	
	
	// // route( fromBlock, toBlock )
	// // {
		// // // debug routing
		
		// // //console.log('DEBUG ROUTE FROM BLOCK',fromBlock.id,'TO BLOCK',toBlock.id);
		
		// // // make a route between the two blocks
		// // var here = {x:fromBlock.x, z:fromBlock.z},
			// // block = fromBlock,
			// // target = {x:toBlock.x, z:toBlock.z};
			
		// // var path = new THREE.Path();
			// // path.moveTo( block.x, block.z );
			
		// // while( block != toBlock )
		// // {
			// // // find a gate (crossing) to exit this block
			// // var nextGateIdx = NavMesh.pickNextGate( block, here, target ),
				// // nextGatePos = block.gatesPos[nextGateIdx];
				
			// // // go to the end of the gate
			// // here = nextGatePos;
			// // path.lineTo( here.x, here.z );
			
			// // // go to the other end of the gate (crossing) this is in a neighbouring block
			// // here = here.otherEnd;
			// // path.lineTo( here.x, here.z );

			// // // we are in the new block
			// // block = here.block;
		// // }
		
		// // // we reached the destination block
		// // path.lineTo( toBlock.x, toBlock.z );
			
		// // var points = path.getPoints(),
			// // positions = [];
			
		// // for( var i=0; i<points.length; i++) positions.push(points[i].x,0,points[i].y);

		// // var geometry = new THREE.LineGeometry().setPositions( positions ),
			// // material = new THREE.LineMaterial( { color: 'crimson', linewidth: 0.005, transparent: true, opacity: 0.2 } );

		// // var line = new THREE.Line2( geometry, material );
			// // line.position.y = 0;
			// // line.renderOrder = 1;
		// // scene.add( line );

	// // } // NavMesh.route
	
	
/*	
	  static pickNextGate( block, here, target )
	  {
		   calculate probabilities intervals
		  var probabilities = [0];
			
		  for( var i=0; i<block.gatesPos.length; i++)
		  {	
			   vectors to the final target and to another gate in the block
			  var v1 = Blocks.fromTo( here, target ),
				  v2 = Blocks.fromTo( here, block.gatesPos[i] );

			   lengths
			  var len1 = Blocks.dot(v1,v1),
				  len2 = Blocks.dot(v2,v2);

			  if( almostEqual( len2, 0 ) )
			  {
				   we are at the same gate, i.e. here = block.gatesPos[i]
				  probabilities[i+1] = probabilities[i];
			  }
			  else
			  {
				  v2 = Blocks.fromTo( here, block.gatesPos[i].otherEnd );
				  len2 = Blocks.dot(v2,v2);
				
				  var cos = Blocks.dot( v1, v2 ) / Math.sqrt( len1 * len2 );
					  cos = Math.pow(cos+1,20)+0.0001;

				  probabilities[i+1] = probabilities[i]+cos;
			  }
		  }
		
		   pick next gate acording to probabilities
		  var randomPick = THREE.Math.randFloat( 0, probabilities[block.gatesPos.length] );

		  for( var i=0; i<block.gatesPos.length; i++ )
			  if( randomPick < probabilities[i+1] )
			  {
				  return i;  this is the picked gate index
			  }
			
		  console.error( 'This should never happen [code: 0922]' );
		  return 0;  no selection, pick the first one
			
	  }  NavMesh.pickNextGate
	*/
} // NavMesh


NavMesh.APARTMENT_DOOR_SIZES = [ new Size(1/2,1), new Size(1,1/2), new Size(1/2,1), new Size(1,1/2) ];
NavMesh.CORNER_SIZE = new Size(1,1);
NavMesh.OFFICE_DOOR_SIZES = [ new Size(1/2,3/2), new Size(3/2,1/2), new Size(1/2,3/2), new Size(3/2,1/2) ];