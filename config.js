// size of the simulated world

import {timeMs, Size, Range} from './core.js';

export const VR = false;

export const GROUND_SIZE = 80; 				// in meters
export const GROUND_EDGE = GROUND_SIZE/2; 		// in meters
export const EARTH_SIZE = 50000;

	
// debug flags
var R = 1+Math.floor(Math.random()*100000);
//R = 21436;
console.log('seed=',R);

export var DEBUG_RANDOM_SEED = R;
export const DEBUG_AGENT_MAX_COUNT = 7500;
export const DEBUG_RANDOM_WANDERING = !false;
export const DEBUG_FORM_A_LINE = false;

export const DEBUG_TIME_SPEED = timeMs(0,0,1)/1000;	// time ellapsed for 1 second
export const START_TIME = timeMs(16);			// start time

export const DEBUG_BLOCK_WITH_ONLY_HOUSES = false;
export const DEBUG_BLOCK_WITH_ONLY_APARTMENTS = false;
export const DEBUG_BLOCK_WITH_ONLY_OFFICES = false;
export const DEBUG_BLOCK_WITH_ONLY_PARK = false;
export const DEBUG_BLOCK_WITH_ONLY_PLAZA = !false;
export const DEBUG_AUTOROTATE = false;
export const DEBUG_AUTOROTATE_SPEED = 0.5;
export const DEBUG_RENDERER_INFO = false;
export const DEBUG_BUILDINGS_OPACITY = 4/4;	// for buildings and trees
export const DEBUG_BLOCKS_OPACITY = 0/4;		// for blocks
export const DEBUG_NAVMESH_OPACITY = 0/4;		// for navmesh blocks
export const DEBUG_NAVMESH_SHOW_MESHES = !false;
export const DEBUG_NAVMESH_SHOW_FLOORS = !false;
export const DEBUG_NAVMESH_SHOW_LINES = false;
export const DEBUG_NAVMESH_SHOW_ELEVATORS = !false;
export const DEBUG_SHOW_AGENTS_AGE_DISTRIBUTION = false;
export const DEBUG_SHOW_VIRAL_SHEDDING = false;
export const DEBUG_HIDE_ROOFS = false;
export const DEBUG_CENTER_VIEW_ON_AGENTS = false;
export const DEBUG_FOLLOW_AGENT = -1;	// -1 for not following any
export const DEBUG_FOLLOW_AGENT_HEALTH = -1;	// -1 for not following any
export const DEBUG_SHOW_DIRECTIONS = false;
export const DEBUG_APARTMENT_ADD_FLOORS = false;
export const DEBUG_SHOW_HOME_TO_WORK_ARROW = false;
export const DEBUG_SHOW_ROUTES = false;
export const DEBUG_DUMP_ROUTES = false;
export const DEBUG_ROUTES_PER_AGENT = 1; // default 1
export const DEBUG_AGENT_ACTIONS = -1; // agent id or -1 for no debug
export const DEBUG_AGENT_LOCATIONS = false; // count agents at home, at work or outside
export const DEBUG_AGENT_HEALTH = false; // count infected agents
export const DEBUG_SUN_POSITION_GUI = false;
//export const DEBUG_BLOCK_COLOR = false;
export const DEBUG_ALL_WHITE = false;
export var DEBUG_FLAG_1 = false;


export const CARTOON_STYLE = false; // only of agents


// a block is not split if smaller than the treshold, but if
// it is split, the split is not in the margins 

export const BLOCK_SPLIT_TRESHOLD = 110; 		// in meters
export const BLOCK_MARGIN = 30; 				// in meters



// types of blocks and their probabilities

export const BLOCK_PARK = {name:'parks', probability:0.05, color:(DEBUG_ALL_WHITE?'white':'darkseagreen'), renderOrder:-80};
export const BLOCK_PLAZA = {name:'plazas', probability:0.03, color:'white', renderOrder:-90};
export const BLOCK_OFFICE = {name:'offices', probability:1.00, color:'white', renderOrder:-90};
export const BLOCK_APARTMENTS = {name:'apartments', probability:1.00, color:'white', renderOrder:-90};
export const BLOCK_HOUSES = {name:'houses', probability:1.00, color:'white', renderOrder:-90};
export const OFFICE_VS_RESIDENTIAL = 0.05;		// -1=only houses; 0=mixed; 1=only offices



// widths of streets, if block is larger then the treshold,
// it is split by an avenue, otherwise - by a street

export const STREET_WIDTH = 6; 				// in meters
export const AVENUE_WIDTH = 18; 				// in meters
export const AVENUE_TRESHOLD = 1000; 			// in meters



// urban and suburb areas, suburb generation is activated
// for block size smaller that a treshold

export const SUBURB_TRESHOLD = GROUND_SIZE/6;	// in meters
export const URBAN_RURAL = Math.pow(0.3,2);	// 0.0=megapolis 0.3=city 0.5=town 0.7=small town 1.0=vilages
export const SKYSCRAPERS = 0.2;				// -1.0=minimal number +1.0 almost all is skyscrapers
export const FLOOR_HEIGHT = 2.5;				// in meters
export const MAX_FLOORS = 120;					// maximal number of floors in a building
export const HOUSE_BOUNDING_RADIUS = 5;		// in meters, house bounding circle radius


// texture scaling factor (for ground and buildings)

export const GROUND_TEXTURE_SCALE = 10.0;				// 1 tile = 10x10 meters (i.e. minor grid is 1x1m)
export const BUILDING_TEXTURE_SCALE = FLOOR_HEIGHT;	// 1 tile = 2.5x2.5 meters
export const APARTMENT_TEXTURE_SCALE_U = 2;			// 1 tile = 2x2.5 meters
export const OFFICE_TEXTURE_SCALE_U = 1;				// 1 tile = 1x2.5 meters
export const OFFICE_DOOR_TEXTURE_SCALE = 2;			// 1 door - 2 meter wide
export const SIDEWALK_TEXTURE_SCALE = 0.25;			// 1 tile = 25x25 cm
export const GRASS_TEXTURE_SCALE = 5;				// 1 tile = 50x50 cm
export const CROSSING_TEXTURE_SCALE = 1.0;

export const SIDEWALK_WIDTH = 3;		// in meters
export const OFFICE_DOOR_WIDTH = 2;	// in meters
export const HOUSE_DOOR_WIDTH = 2;		// in meters
export const OFFICE_DOOR_DISTANCE = 10;// in meters, suggested distance between doors
export const APARTMENT_DOOR_DISTANCE = 20;// in meters, suggested distance between doors
export const CROSSING_MINIMAL_CLOSENESS = 15; // in meters, do not allow crossings thus close

export const OFFICE_ROOM_SIZE = new Range( 5, 10 );	// in meters (desired size)
export const OFFICE_CORRIDOR_WIDTH = 1;				// in meters
export const OFFICE_ELEVATOR_SHAFT_WIDTH = 2;				// in meters
export const OFFICE_ROOM_COUNT = new Range( 2, 9 );


// Apartment buildings
export const APARTMENT_BUILDING_WIDTH = new Range( 8, 16 );	// in meters
export const APARTMENT_BUILDING_DISTANCE = 24;				// in meters
export const MAX_APARTMENT_BUILDING_FLOORS = 30;				// maximal number of floors in an apartment building
export const APARTMENT_ROOM_SIZE = 7;							// in meters (desired size)
export const ELEVATOR_SIZE = new Size( 2, 2 );					// in meters

export const ELEVATOR_SPEED = new Range( 0.8, 2.4 );			// in meters/second


// trees
export const TREE_HEIGHT = new Range( 3, 4 );		// in meters
export const TREE_COMPLEXITY = 4; // 12*n^2 triangles, 2=48, 3=108, 4=192, 5=300
export const TREE_PARK_RATIO = 0.2; // percentage of trees in parks
export const TREE_HOUSES_RATIO = 0.15; // percentage of trees in house blocks


export const HOURS_4_MS = timeMs( 4 );
export const HOURS_12_MS = timeMs( 12 );
export const HOURS_24_MS = timeMs( 24 );
export const SECONDS_IN_DAY = 24*60*60;
export const SECONDS_IN_HOUR = 60*60;
export const SECONDS_IN_MINUTE = 60;

// agents
export const AGENT_MAX_COUNT = DEBUG_AGENT_MAX_COUNT;			// max number of virtual people
export const AGENT_AGE_YEARS = new Range( 0, 100 );			// in years

//TODO-TEMP export const AGENT_WALKING_SPEED = new Range( 0.8, 2.0 );		// in meters/second
export const AGENT_HEIGHT_CHILD = new Range( 0.5, 1.7 );		// in meters
//export const AGENT_HEIGHT_ADULT = new Range( 1.7, 1.4 );		// in meters
export const AGENT_WALKING_SPEED = new Range( 0.6, 0.6 );		// in meters/second
//export const AGENT_HEIGHT_CHILD = new Range( 1.7, 1.7 );		// in meters
export const AGENT_HEIGHT_ADULT = new Range( 1, 2 );		// in meters

export const AGENT_ADULTS_PER_HOUSE 	 = new Range( 1, 4 );
export const AGENT_CHILDREN_PER_HOUSE   = new Range( 0, 2 );
export const AGENT_ADULTS_PER_APARTMENT = new Range( 1, 3 );
export const AGENT_CHILDREN_PER_APARTMENT = new Range( 0, 1 );

// nature
export const NO_SUN = 0;
export const STATIC_SUN = 1;
export const DYNAMIC_SUN = 2;

export const NO_SHADOWS = 0;
export const TOP_SHADOWS = 1;
export const FULL_SHADOWS = 2;

export const AGENTS_CAST_SHADOWS = !true;


// time with lamps on
export const LAMP_OFFICE_AM_MS = new Range(
				new Range( timeMs(5,30), timeMs(6,10) ),
				new Range( timeMs(6,10), timeMs(6,30) ) );
export const LAMP_OFFICE_AM_INTENSITY_MS = new Range(
				new Range( timeMs(5,30), timeMs(5,50) ),
				new Range( timeMs(5,50), timeMs(6,20) ) );
export const LAMP_OFFICE_PM_MS = new Range(
				new Range( timeMs(17), timeMs(17,30) ),
				new Range( timeMs(18), timeMs(22) ) );
export const LAMP_OFFICE_PM_INTENSITY_MS = new Range(
				new Range( timeMs(17), timeMs(18) ),
				new Range( timeMs(21), timeMs(22) ) );

export const LAMP_APARTMENT_AM_MS = new Range(
				new Range( timeMs(4,30), timeMs(5,30) ),
				new Range( timeMs(6,30), timeMs(7) ) );
export const LAMP_APARTMENT_AM_INTENSITY_MS = new Range(
				new Range( timeMs(4,30), timeMs(5) ),
				new Range( timeMs(6,0), timeMs(6,15) ) );
export const LAMP_APARTMENT_PM_MS = new Range(
				new Range( timeMs(17,45), timeMs(18,30) ),
				new Range( timeMs(21), timeMs(24) ) );
export const LAMP_APARTMENT_PM_INTENSITY_MS = new Range(
				new Range( timeMs(17,15), timeMs(18) ),
				new Range( timeMs(22,30), timeMs(24) ) );

export const LAMP_HOUSE_AM_MS = new Range(
				new Range( timeMs(4,30), timeMs(5,30) ),
				new Range( timeMs(6,30), timeMs(7) ) );
export const LAMP_HOUSE_AM_INTENSITY_MS = new Range(
				new Range( timeMs(4,30), timeMs(5) ),
				new Range( timeMs(6,0), timeMs(6,15) ) );
export const LAMP_HOUSE_PM_MS = new Range(
				new Range( timeMs(17,45), timeMs(18,30) ),
				new Range( timeMs(21), timeMs(24) ) );
export const LAMP_HOUSE_PM_INTENSITY_MS = new Range(
				new Range( timeMs(17,15), timeMs(18) ),
				new Range( timeMs(22,30), timeMs(24) ) );

export const SUN = NO_SUN;
//export const SUN = STATIC_SUN;
//export const SUN = DYNAMIC_SUN;
export const SUNRISE_MS = timeMs(6);
export const SUNSET_MS = timeMs(18);
export const STATIC_SUN_POSITION_MS = timeMs(16,0,0);
console.assert(SUNRISE_MS<timeMs(12),'Sunrise must be before 12:00 [0955]');
console.assert(SUNSET_MS>timeMs(12),'Sunset must be after 12:00 [0956]');

export const SUN_HORIZONTAL_ANGLE = Math.PI/6;
export const SUN_SIN = Math.sin(SUN_HORIZONTAL_ANGLE);
export const SUN_COS = Math.cos(SUN_HORIZONTAL_ANGLE);
		


export const SHADOWS = NO_SHADOWS;
//export const SHADOWS = TOP_SHADOWS;
//export const SHADOWS = FULL_SHADOWS;
export const SHADOWS_MAP_SIZE = 1024*4*2;
export const SHADOWS_MAX_COUNT = 3;




export const INFECTION_PATTERNS_COUNT = 10;
//const INFECTION_TOTAL_MS = new Range( 14*HOURS_24_MS, 28*HOURS_24_MS ); // 14-28 days in ms
export const INFECTION_TOTAL_MS = new Range( timeMs(0), timeMs(0,10,0) ); // 40 min - 10 hours
//export const INFECTION_OVERHEAD_INDICATOR = false;
export const INFECTION_COLOR_INDICATOR = !false;
export const INFECTION_STEP = 200;
export const INFECTION_DISTANCE = 1; // in meters
export const INFECTION_STRENGTH = 0.5; // factor of how fast is the infection
export const IMMUNE_STRENGTH = new Range( 100, 200 );
export const IMMUNE_RECOVERY_FACTOR = 0.001; // recovery of immune per second
export const IMMUNE_CURE_FACTOR = new Range( 1.0, 1.2 ); // increase of immunity after cure
export const PERCENTAGE_INITIAL_INFECTED = 0.05; // 0.05=5%

/*

// https://math.stackexchange.com/questions/296794/finding-the-transform-matrix-from-4-projected-points-with-javascript/339033#339033
// http://jsfiddle.net/dFrHS/1/
function trapezoidMatrix(x1d, y1d,
	  x2d, y2d,
	  x3d, y3d,
	  x4d, y4d)
{
	function adj(m) { // Compute the adjugate of m
	  return [
		m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
		m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
		m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
	  ];
	}
	function multmm(a, b) { // multiply two matrices
	  var c = Array(9);
	  for (var i = 0; i != 3; ++i) {
		for (var j = 0; j != 3; ++j) {
		  var cij = 0;
		  for (var k = 0; k != 3; ++k) {
			cij += a[3*i + k]*b[3*k + j];
		  }
		  c[3*i + j] = cij;
		}
	  }
	  return c;
	}
	function multmv(m, v) { // multiply matrix and vector
	  return [
		m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
		m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
		m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
	  ];
	}
	function basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
	  var m = [
		x1, x2, x3,
		y1, y2, y3,
		 1,  1,  1
	  ];
	  var v = multmv(adj(m), [x4, y4, 1]);
	  return multmm(m, [
		v[0], 0, 0,
		0, v[1], 0,
		0, 0, v[2]
	  ]);
	}
	
	
	  var adjs = [-1, -1, 1, -1, 0, 0, 0, -1, 0];
	  var d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
	  return multmm(d, adjs);
}
//                          Ax Ay Bx By Dx Dy Cx Cy
console.log(trapezoidMatrix(20,20,40,20,20,10,30,10));
*/
