// size of the simulated world

const GROUND_SIZE = 400; 				// in meters
const GROUND_EDGE = GROUND_SIZE/2; 		// in meters
const EARTH_SIZE = 50000;

	

// debug flags
R = 1+Math.floor(Math.random()*100000);
//R = 99746;
console.log('seed=',R);
var DEBUG_RANDOM_SEED = R;
const DEBUG_AGENT_MAX_COUNT = 30000;
const DEBUG_TIME_SPEED = timeMs(0,0,1)/1000;	// time ellapsed for 1 second
const DEBUG_BLOCK_WITH_ONLY_HOUSES = !false;
const DEBUG_BLOCK_WITH_ONLY_APARTMENTS = false;
const DEBUG_BLOCK_WITH_ONLY_OFFICES = !false;
const DEBUG_BLOCK_WITH_ONLY_PARK = false;
const DEBUG_BLOCK_WITH_ONLY_PLAZA = false;
const DEBUG_AUTOROTATE = false;
const DEBUG_AUTOROTATE_SPEED = 0.1;
const DEBUG_RENDERER_INFO = false;
const DEBUG_BUILDINGS_OPACITY = 4/4;				// for buildings and trees
const DEBUG_BLOCKS_OPACITY = 4/4;					// for blocks
const DEBUG_NAVMESH_OPACITY = 0/4;			// for navmesh blocks
const DEBUG_NAVMESH_SHOW_MESHES = !false;
const DEBUG_NAVMESH_SHOW_FLOORS = !false;
const DEBUG_NAVMESH_SHOW_LINES = false;
const DEBUG_NAVMESH_SHOW_ELEVATORS = !false;
const DEBUG_SHOW_AGENTS_AGE_DISTRIBUTION = false;
const DEBUG_HIDE_ROOFS = false;
const DEBUG_CENTER_VIEW_ON_AGENTS = false;
const DEBUG_FOLLOW_AGENT = -1;	// -1 for not following any
const DEBUG_SHOW_DIRECTIONS = false;
const DEBUG_APARTMENT_ADD_FLOORS = false;
const DEBUG_SHOW_HOME_TO_WORK_ARROW = false;
const DEBUG_SHOW_ROUTES = false;
const DEBUG_ROUTES_PER_AGENT = 1; // default 1
const DEBUG_AGENT_ACTIONS = -1; // agent id or -1 for no debug
const DEBUG_AGENT_LOCATIONS = false; // count agents at home, at work or outside
const DEBUG_SUN_POSITION_GUI = false;
var DEBUG_FLAG_1 = false;



// a block is not split if smaller than the treshold, but if
// it is split, the split is not in the margins 

const BLOCK_SPLIT_TRESHOLD = 110; 		// in meters
const BLOCK_MARGIN = 30; 				// in meters



// types of blocks and their probabilities

const BLOCK_PARK = {name:'parks', probability:0.05, color:'darkseagreen', renderOrder:-80};
const BLOCK_PLAZA = {name:'plazas', probability:0.03, color:'white', renderOrder:-90};
const BLOCK_OFFICE = {name:'offices', probability:1.00, color:'white', renderOrder:-90};
const BLOCK_APARTMENTS = {name:'apartments', probability:1.00, color:'white', renderOrder:-90};
const BLOCK_HOUSES = {name:'houses', probability:1.00, color:'white', renderOrder:-90};
const OFFICE_VS_RESIDENTIAL = 0.05;		// -1=only houses; 0=mixed; 1=only offices



// widths of streets, if block is larger then the treshold,
// it is split by an avenue, otherwise - by a street

const STREET_WIDTH = 6; 				// in meters
const AVENUE_WIDTH = 18; 				// in meters
const AVENUE_TRESHOLD = 1000; 			// in meters



// urban and suburb areas, suburb generation is activated
// for block size smaller that a treshold

const SUBURB_TRESHOLD = GROUND_SIZE/6;	// in meters
const URBAN_RURAL = Math.pow(0.3,2);	// 0.0=megapolis 0.3=city 0.5=town 0.7=small town 1.0=vilages
const SKYSCRAPERS = 0.2;				// -1.0=minimal number +1.0 almost all is skyscrapers
const FLOOR_HEIGHT = 2.5;				// in meters
const MAX_FLOORS = 120;					// maximal number of floors in a building
const HOUSE_BOUNDING_RADIUS = 5;		// in meters, house bounding circle radius


// texture scaling factor (for ground and buildings)

const GROUND_TEXTURE_SCALE = 10.0;				// 1 tile = 10x10 meters (i.e. minor grid is 1x1m)
const BUILDING_TEXTURE_SCALE = FLOOR_HEIGHT;	// 1 tile = 2.5x2.5 meters
const APARTMENT_TEXTURE_SCALE_U = 2;			// 1 tile = 2x2.5 meters
const OFFICE_TEXTURE_SCALE_U = 1;				// 1 tile = 1x2.5 meters
const OFFICE_DOOR_TEXTURE_SCALE = 2;			// 1 door - 2 meter wide
const SIDEWALK_TEXTURE_SCALE = 0.25;			// 1 tile = 25x25 cm
const GRASS_TEXTURE_SCALE = 5;				// 1 tile = 50x50 cm
const CROSSING_TEXTURE_SCALE = 1.0;

const SIDEWALK_WIDTH = 3;		// in meters
const OFFICE_DOOR_WIDTH = 2;	// in meters
const HOUSE_DOOR_WIDTH = 2;		// in meters
const OFFICE_DOOR_DISTANCE = 10;// in meters, suggested distance between doors
const APARTMENT_DOOR_DISTANCE = 20;// in meters, suggested distance between doors
const CROSSING_MINIMAL_CLOSENESS = 15; // in meters, do not allow crossings thus close

const OFFICE_ROOM_SIZE = new Range( 5, 10 );	// in meters (desired size)
const OFFICE_CORRIDOR_WIDTH = 1;				// in meters
const OFFICE_ELEVATOR_SHAFT_WIDTH = 2;				// in meters
const OFFICE_ROOM_COUNT = new Range( 2, 9 );


// Apartment buildings
const APARTMENT_BUILDING_WIDTH = new Range( 8, 16 );	// in meters
const APARTMENT_BUILDING_DISTANCE = 24;				// in meters
const MAX_APARTMENT_BUILDING_FLOORS = 50;				// maximal number of floors in an apartment building
const APARTMENT_ROOM_SIZE = 7;							// in meters (desired size)
const ELEVATOR_SIZE = new Size( 2, 2 );					// in meters



// trees
const TREE_HEIGHT = new Range( 3, 4 );		// in meters
const TREE_COMPLEXITY = 4; // 12*n^2 triangles, 2=48, 3=108, 4=192, 5=300
const TREE_PARK_RATIO = 0.2; // percentage of trees in parks
const TREE_HOUSES_RATIO = 0.15; // percentage of trees in house blocks


const HOURS_4_MS = timeMs( 4 );
const HOURS_12_MS = timeMs( 12 );
const HOURS_24_MS = timeMs( 24 );
const SECONDS_IN_DAY = 24*60*60;
const SECONDS_IN_HOUR = 60*60;
const SECONDS_IN_MINUTE = 60;

// agents
const AGENT_MAX_COUNT = DEBUG_AGENT_MAX_COUNT;					// max number of virtual people
const AGENT_WALKING_SPEED = new Range( 1.0, 1.8 );			// in meters/second
const AGENT_AGE_YEARS = new Range( 0, 100 );			// in years
const AGENT_HEIGHT_CHILD = new Range( 0.5, 1.7 );			// in meters
const AGENT_HEIGHT_ADULT = new Range( 1.7, 1.5 );			// in meters
const AGENT_ADULTS_PER_HOUSE 	 = new Range( 1, 4 );
const AGENT_CHILDREN_PER_HOUSE   = new Range( 0, 3 );
const AGENT_ADULTS_PER_APARTMENT = new Range( 1, 3 );
const AGENT_CHILDREN_PER_APARTMENT = new Range( 0, 2 );

// nature
const NO_SUN = 0;
const STATIC_SUN = 1;
const DYNAMIC_SUN = 2;

const NO_SHADOWS = 0;
const TOP_SHADOWS = 1;
const FULL_SHADOWS = 2;


//const SUN = NO_SUN;
const SUN = STATIC_SUN;
//const SUN = DYNAMIC_SUN;
const SUNRISE_MS = timeMs(6);
const SUNSET_MS = timeMs(18);
const STATIC_SUN_POSITION_MS = timeMs(6,30);
console.assert(SUNRISE_MS<timeMs(12),'Sunrise must be before 12:00 [0955]');
console.assert(SUNSET_MS>timeMs(12),'Sunset must be after 12:00 [0956]');

const SUN_HORIZONTAL_ANGLE = Math.PI/6;
const SUN_SIN = Math.sin(SUN_HORIZONTAL_ANGLE);
const SUN_COS = Math.cos(SUN_HORIZONTAL_ANGLE);
		


//const SHADOWS = NO_SHADOWS;
//const SHADOWS = TOP_SHADOWS;
const SHADOWS = FULL_SHADOWS;
const SHADOWS_MAP_SIZE = 1024*4;
const SHADOWS_MAX_COUNT = 3;


const START_TIME = timeMs(5);			// start time





// global simulation time
//const START_TIME = timeMs(19);			// start time


/*
u0=1, v0=1
u1=2, v1=1 
u2=2, v2=2
u3=0, v3=2

//orig 01234567
//now  02461357

h5 = v0
h2 = u0 
h6 = ((u0-u1+u2-u3)*(v3-v2) - (u3-u2)*(v0-v1+v2-v3)) / ((u1-u2)*(v3-v2) - (u3-u2)*(v1-v2))
h0 = u1-u0 + u1*h6
h3 = v1-v0 + v1*h6
h7 = ((u0-u1+u2-u3)*(v1-v2) - (u1-u2)*(v0-v1+v2-v3)) / ((u3-u2)*(v1-v2) - (u1-u2)*(v3-v2))
h4 = v3-v0 + v3*h7
h1 = u3-u0 + u3*h7

h5 = v0
h2 = u0 

u01 = u0-u1
u12 = u1-u2
u23 = u2-u3
v01 = v0-v1
v12 = v1-v2
v23 = v2-v3

h6 = (u23*(v01+v23)-(u01+u23)*v23) / (u23*v12-u12*v23)
h0 = -u01 + u1*h6
h3 = -v01 + v1*h6
h7 = ((u01+u23)*v12 - u12*(v01+v23)) / (u12*v23-u23*v12)
h4 = v3-v0 + v3*h7
h1 = u3-u0 + u3*h7

// 1 -1 1
// 0 0 1
// 0 -0.5 1

console.log(h0,h1,h2);
console.log(h3,h4,h5);
console.log(h6,h7,1);
*/

