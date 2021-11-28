// size of the simulated world

import * as THREE from './js/three.module.js';
import {msToString, timeMs, Size, Range, round} from './core.js';


const LOCAL_STORAGE_PARAMS = 'covid-19-params'; // same name used in covid-19-configurator.js

const configParams = new URLSearchParams(
		window.location.search ||
		localStorage.getItem( LOCAL_STORAGE_PARAMS ) );


console.log('URL',window.location.search);
console.log('STO',localStorage.getItem( LOCAL_STORAGE_PARAMS ));

// get a parameter
function param( id, defaultValue )
{
	var value;

	// first look for the parameter in the URL
	// if not there, then check in local storage
	// eventually, return the default value
	
	if( configParams.has(id) )
		value = configParams.get( id )
	else
		value = defaultValue;
		
	if( value=='true' ) value = true;
	if( value=='false' ) value = false;
	if( !isNaN(parseFloat(value)) ) value = parseFloat(value);	
	//console.log(id,'=',value);
	
	return value;
}

function param2( id, defaultValue )
{
	var value;

	// first look for the parameter in the URL
	// if not there, then check in local storage
	// eventually, return the default value
	
	if( configParams.has(id) )
	{
		value = configParams.get( id ).split( '~' );
		value = new Range( parseFloat(value[0]), parseFloat(value[1]) );
	}
	else
		value = defaultValue;
	
	return value;
}

export const VR = param('vr', false);
export const SAFE_MODE = param('sm', false);

export const GROUND_SIZE = param('gs', 500);	// in meters
export const GROUND_EDGE = GROUND_SIZE/2;

export const EARTH_SIZE = 20*GROUND_SIZE;	// in meters

	
// debug flags
//var R = 1+Math.floor(Math.random()*100000);
//R = 21436;

export var DEBUG_RANDOM_SEED = param('rs', 0) || (1+Math.floor(Math.random()*100000));
console.log('seed=',DEBUG_RANDOM_SEED);

export const DEBUG_AGENT_MAX_COUNT = param('damc', 100);
export const DEBUG_RANDOM_WANDERING = param('drw',false);

var formation = param('dfal',0);
export const DEBUG_FORM_A_LINE = formation==1;
export const DEBUG_FORM_A_CIRCLE = formation==2;

export const DEBUG_TIME_SPEED = param('dts',timeMs(0,0,1))/1000;	// time ellapsed for 1 second
export const START_TIME = param('st',timeMs(6,20));			// start time

export const DEBUG_BLOCK_WITH_ONLY_HOUSES = param('dbwoh',false);
export const DEBUG_BLOCK_WITH_ONLY_APARTMENTS = param('dbwoa',false);
export const DEBUG_BLOCK_WITH_ONLY_OFFICES = param('dbwoo',false);
export const DEBUG_BLOCK_WITH_ONLY_PARK = param('dbwop',false);
export const DEBUG_BLOCK_WITH_ONLY_PLAZA = param('dbwoz',false);
export const DEBUG_AUTOROTATE = param('dar', false);
export const DEBUG_AUTOROTATE_SPEED = param('dars', 0.3);
export const DEBUG_RENDERER_INFO = param('dri',false);
export const DEBUG_BUILDINGS_OPACITY = param('dbuo',4/4);	// for buildings and trees
export const DEBUG_BLOCKS_OPACITY = param('dblo',4/4);		// for blocks
export const DEBUG_NAVMESH_OPACITY = param('dnmo',0/4);		// for navmesh blocks
export const DEBUG_NAVMESH_SHOW_MESHES = (DEBUG_NAVMESH_OPACITY > 0);
export const DEBUG_NAVMESH_SHOW_FLOORS = param('dnmsf',false);
export const DEBUG_NAVMESH_SHOW_LINES = param('dnmsl',false);
export const DEBUG_NAVMESH_SHOW_ELEVATORS = param('dnmse',false);
export const DEBUG_SHOW_AGENTS_AGE_DISTRIBUTION = param('dsaad',false);
export const DEBUG_SHOW_VIRAL_SHEDDING = param('dsvs',false);
export const DEBUG_HIDE_ROOFS = param('dhr',false);
export const DEBUG_CENTER_VIEW_ON_AGENTS = param('dcvoa',false);
export const DEBUG_FOLLOW_AGENT = param('dfa',-1);	// -1 for not following any
export const DEBUG_FOLLOW_AGENT_HEALTH = param('dfah',-1);	// -1 for not following any
export const DEBUG_SHOW_DIRECTIONS = param('dsd',false);
export const DEBUG_APARTMENT_ADD_FLOORS = param('daaf',false);
export const DEBUG_SHOW_HOME_TO_WORK_ARROW = param('dshtwa',false);
export const DEBUG_SHOW_ROUTES = param('dsr',false);
export const DEBUG_DUMP_ROUTES = param('ddr',false);
export const DEBUG_ROUTES_PER_AGENT = param('drpa',1); // default 1
export const DEBUG_AGENT_ACTIONS = param('daa',-1); // agent id or -1 for no debug
export const DEBUG_AGENT_LOCATIONS = param('dal',false); // count agents at home, at work or outside
export const DEBUG_AGENT_HEALTH = param('dah',false); // count infected agents
export const DEBUG_SUN_POSITION_GUI = param('dspg',false);
export const DEBUG_ALL_WHITE = param('daw',false);
export const CARTOON_STYLE = param('cs',false); // only of agents, howses, trees
export const PIXEL_ART_STYLE = param('pas',false);


// a block is not split if smaller than the treshold, but if
// it is split, the split is not in the margins 

export const BLOCK_SPLIT_TRESHOLD = param('bst',110); 		// in meters
export const BLOCK_MARGIN = Math.min(param('bm',30),Math.round(BLOCK_SPLIT_TRESHOLD/3)); 				// in meters



// types of blocks and their probabilities

export const BLOCK_PARK = {name:'parks', probability:param('bpp',0.05), color:(DEBUG_ALL_WHITE?'white':'darkseagreen'), renderOrder:-80};
export const BLOCK_PLAZA = {name:'plazas', probability:param('bzp',0.03), color:'white', renderOrder:-90};
export const BLOCK_OFFICE = {name:'offices', /*probability:1.00,*/ color:'white', renderOrder:-90};
export const BLOCK_APARTMENTS = {name:'apartments', /*probability:1.00,*/ color:'white', renderOrder:-90};
export const BLOCK_HOUSES = {name:'houses', /*probability:1.00,*/ color:'white', renderOrder:-90};
export const OFFICE_VS_RESIDENTIAL = param('ovr',0.05);		// -1=only houses; 0=mixed; 1=only offices



// widths of streets, if block is larger then the treshold,
// it is split by an avenue, otherwise - by a street

export const STREET_WIDTH = param('sw',6); 				// in meters
export const AVENUE_WIDTH = param('aw',18); 				// in meters
export const AVENUE_TRESHOLD = param('at',1000); 			// in meters



// urban and suburb areas, suburb generation is activated
// for block size smaller that a treshold

export const SUBURB_TRESHOLD = param('sut',0.16)*GROUND_SIZE;	// in meters
export const URBAN_RURAL = Math.pow(param('urru',0.3),2);	// 0.0=megapolis 0.3=city 0.5=town 0.7=small town 1.0=vilages
export const SKYSCRAPERS = param('sks',0.2);				// -1.0=minimal number +1.0 almost all is skyscrapers
export const FLOOR_HEIGHT = param('fh',2.5);				// in meters
export const MAX_FLOORS = param('mf',120);					// maximal number of floors in a building
export const HOUSE_BOUNDING_RADIUS = param('hbr',6);		// in meters, house bounding circle radius


// texture scaling factor (for ground and buildings) -- these are not user-configurable

export const BUILDING_TEXTURE_SCALE = FLOOR_HEIGHT;	// 1 tile = 2.5x2.5 meters
export const APARTMENT_TEXTURE_SCALE_U = 2;			// 1 tile = 2x2.5 meters
export const OFFICE_TEXTURE_SCALE_U = 1;				// 1 tile = 1x2.5 meters
export const OFFICE_DOOR_TEXTURE_SCALE = 2;			// 1 door - 2 meter wide
export const SIDEWALK_TEXTURE_SCALE = 0.25;			// 1 tile = 25x25 cm
export const GRASS_TEXTURE_SCALE = 2;				// 1 tile = 50x50 cm
export const CROSSING_TEXTURE_SCALE = 1.0;

export const SIDEWALK_WIDTH = param('sww',3);		// in meters
export const OFFICE_DOOR_WIDTH = param('odw',2);	// in meters
export const OFFICE_DOOR_DISTANCE = param('odd',10);// in meters, suggested distance between doors
export const APARTMENT_DOOR_DISTANCE = param('add',20);// in meters, suggested distance between doors
export const CROSSING_MINIMAL_CLOSENESS = param('cmc',15); // in meters, do not allow crossings thus close

export const OFFICE_ROOM_SIZE = param2( 'ors',new Range( 5, 10 ));	// in meters (desired size)
export const OFFICE_CORRIDOR_WIDTH = param('ocw',1);				// in meters
export const OFFICE_ROOM_COUNT = param2( 'orc', new Range( 2, 9 ) );


// Apartment buildings
export const APARTMENT_BUILDING_WIDTH = param2('abw', new Range( 8, 16 ) );	// in meters
export const APARTMENT_BUILDING_DISTANCE = Math.max( param('abd',24), round(APARTMENT_BUILDING_WIDTH.max+8),2);				// in meters
export const MAX_APARTMENT_BUILDING_FLOORS = param('mabf',30);				// maximal number of floors in an apartment building
export const APARTMENT_ROOM_SIZE = param('ars',7);							// in meters (desired size)
export const ELEVATOR_SIZE = param('elsz',2);					// in meters

export const ELEVATOR_SPEED = param2('elsp',new Range( 0.8, 2.4 ) );			// in meters/second


// trees
export const TREE_HEIGHT = param2('th',new Range( 3, 4 ));		// in meters
export const TREE_COMPLEXITY = param('tc',4); // 12*n^2 triangles, 2=54, 3=96, 4=150, 5=216
export const TREE_PARK_RATIO = param('tpr',0.2); // percentage of trees in parks
export const TREE_HOUSES_RATIO = param('thr',0.15); // percentage of trees in house blocks


export const HOURS_4_MS = timeMs( 4 );
export const HOURS_12_MS = timeMs( 12 );
export const HOURS_24_MS = timeMs( 24 );
export const SECONDS_IN_DAY = 24*60*60;
export const SECONDS_IN_HOUR = 60*60;
export const SECONDS_IN_MINUTE = 60;

// agents
export const AGENT_MAX_COUNT = DEBUG_AGENT_MAX_COUNT;			// max number of virtual people
export const AGENT_AGE_YEARS = param2('aay',new Range( 0, 100 ));			// in years

//TODO-TEMP export const AGENT_WALKING_SPEED = new Range( 0.8, 2.0 );		// in meters/second
export const AGENT_HEIGHT_CHILD = param2('ahc',new Range( 0.5, 1.7 ));		// in meters
export const AGENT_HEIGHT_ADULT = param2('aha',new Range( 1.8, 1.4 ));		// in meters

export const AGENT_ADULTS_PER_HOUSE 	= param2('aph',new Range( 1, 4 ));
export const AGENT_CHILDREN_PER_HOUSE   = param2('cph',new Range( 0, 3 ));
export const AGENT_ADULTS_PER_APARTMENT = param2('apa',new Range( 1, 3 ));
export const AGENT_CHILDREN_PER_APARTMENT = param2('cpa',new Range( 0, 2 ));

export const AGENT_WALKING_SPEED = param2('aws',new Range( 0.6, 2.6 ));		// in meters/second

// nature
export const NO_SUN = 0;
export const STATIC_SUN = 1;
export const DYNAMIC_SUN = 2;

export const SUN = param('su',NO_SUN);
export const STATIC_SUN_POSITION_MS = param('sspm',timeMs(10,0,0));

export const SUNRISE_MS = param('srm',timeMs(6));
export const SUNSET_MS = param('ssm',timeMs(18));

console.assert(SUNRISE_MS<timeMs(12),'Sunrise must be before 12:00 [0955]');
console.assert(SUNSET_MS>timeMs(12),'Sunset must be after 12:00 [0956]');


export const NO_SHADOWS = 0;
export const TOP_SHADOWS = 1;
export const FULL_SHADOWS = 2;

export const SHADOWS = param('sh',NO_SHADOWS);
export const SHADOWS_MAP_SIZE = param('shms',4096);
export const SHADOWS_MAX_COUNT = param('shmc',3);




export const SUN_HORIZONTAL_ANGLE = param('sha',30)*Math.PI/180;
		

export const AGENTS_CAST_SHADOWS = param('acs',false);


// time with lamps on
export const LAMP_OFFICE_AM_MS = new Range(
				param2('loan',new Range( timeMs(5,30), timeMs(6,10) )),
				param2('loaf',new Range( timeMs(6,10), timeMs(6,30) )) );
var INTENSITY_MS = param2('loai',new Range( timeMs(5,50), timeMs(6) ));
export const LAMP_OFFICE_AM_INTENSITY_MS = new Range(
				new Range( LAMP_OFFICE_AM_MS.min.min, INTENSITY_MS.min ),
				new Range( INTENSITY_MS.max, LAMP_OFFICE_AM_MS.max.max ) );
				
export const LAMP_OFFICE_PM_MS = new Range(
				param2('lopn',new Range( timeMs(17), timeMs(17,30) )),
				param2('lopf',new Range( timeMs(18), timeMs(22) )) );
var INTENSITY_MS = param2('lopi',new Range( timeMs(18), timeMs(21) ));
export const LAMP_OFFICE_PM_INTENSITY_MS = new Range(
				new Range( LAMP_OFFICE_PM_MS.min.min, INTENSITY_MS.min ),
				new Range( INTENSITY_MS.max, LAMP_OFFICE_PM_MS.max.max ) );


export const LAMP_APARTMENT_AM_MS = new Range(
				param2('laan',new Range( timeMs(4,30), timeMs(5,30) )),
				param2('laaf',new Range( timeMs(6,30), timeMs(7) )) );
var INTENSITY_MS = param2('laai',new Range( timeMs(4,40), timeMs(6,50) ));
export const LAMP_APARTMENT_AM_INTENSITY_MS = new Range(
				new Range( LAMP_APARTMENT_AM_MS.min.min, INTENSITY_MS.min ),
				new Range( INTENSITY_MS.max, LAMP_APARTMENT_AM_MS.max.max ) );
				
export const LAMP_APARTMENT_PM_MS = new Range(
				param2('lapn',new Range( timeMs(17,45), timeMs(18,30) )),
				param2('lapf',new Range( timeMs(21), timeMs(23,30) )) );
var INTENSITY_MS = param2('lapi',new Range( timeMs(17,55), timeMs(22,50) ));
export const LAMP_APARTMENT_PM_INTENSITY_MS = new Range(
				new Range( LAMP_APARTMENT_PM_MS.min.min, INTENSITY_MS.min ),
				new Range( INTENSITY_MS.max, LAMP_APARTMENT_PM_MS.max.max ) );

export const LAMP_HOUSE_AM_MS = new Range(
				param2('lhan',new Range( timeMs(4,30), timeMs(5,30) )),
				param2('lhaf',new Range( timeMs(6,30), timeMs(7) )) );
var INTENSITY_MS = param2('lhai',new Range( timeMs(4,40), timeMs(6,50) ));
export const LAMP_HOUSE_AM_INTENSITY_MS = new Range(
				new Range( LAMP_HOUSE_AM_MS.min.min, INTENSITY_MS.min ),
				new Range( INTENSITY_MS.max, LAMP_HOUSE_AM_MS.max.max ) );
				
export const LAMP_HOUSE_PM_MS = new Range(
				param2('lhpn',new Range( timeMs(17,45), timeMs(18,30) )),
				param2('lhpf',new Range( timeMs(21), timeMs(23,30) )) );
var INTENSITY_MS = param2('lhpi',new Range( timeMs(17,55), timeMs(22,50) ));
export const LAMP_HOUSE_PM_INTENSITY_MS = new Range(
				new Range( LAMP_HOUSE_PM_MS.min.min, INTENSITY_MS.min ),
				new Range( INTENSITY_MS.max, LAMP_HOUSE_PM_MS.max.max ) );



export const INFECTION_PATTERNS_COUNT = param('ipc',10);

var INFECTION_HOURS_MS = param2('itmh',new Range( timeMs(1), timeMs(10) )),
	INFECTION_DAYS  = param2('itmd',new Range( 14, 28 ));
export const INFECTION_TOTAL_MS = new Range( HOURS_24_MS*INFECTION_DAYS.min+INFECTION_HOURS_MS.min, HOURS_24_MS*INFECTION_DAYS.max+INFECTION_HOURS_MS.max ); // 40 min - 10 hours

export const INFECTION_OVERHEAD_INDICATOR = param('ioi',false);
export const INFECTION_COLOR_INDICATOR = param('ici',false);
export const INFECTION_STEP = param('is',200);
export const INFECTION_DISTANCE = param('id',1); // in meters
export const INFECTION_STRENGTH = param('ist',0.5); // factor of how fast is the infection
export const IMMUNE_STRENGTH = param2('ims',new Range( 100, 200 ));
export const IMMUNE_RECOVERY_FACTOR = param('imrf',0.0005); // recovery of immune per second
export const IMMUNE_CURE_FACTOR = param2('icf',new Range( 1.0, 1.2 )); // increase of immunity after cure
export const PERCENTAGE_INITIAL_INFECTED = param('pii',0.05); // 0.05=5%




export const AGENT_DRAW_MODE_WHITE  	= 0; // white color without texture
export const AGENT_DRAW_MODE_CHECKERED  = 1; // color squares with dots in centers
export const AGENT_DRAW_MODE_CHESSBOARD = 2; // black and white squares
export const AGENT_DRAW_MODE_CRIMSON    = 3; // a black-crimson texture
export const AGENT_DRAW_MODE_BORDERS    = 4; // white character with border lines only
export const AGENT_DRAW_MODE_PATCHES    = 5; // black-gray-white patches
export const AGENT_DRAW_MODE_RANDOM     = 6; // random color patches
export const AGENT_DRAW_MODE_CLOTHES	= 7; // shader-defined clothes

export const AGENT_DRAW_MODE = param('adm',AGENT_DRAW_MODE_CLOTHES);

var mr = param('mr',1), // male ratio
	fr = param('fr',1); // female ration
if( mr+fr<0.1 ) mr = fr = 1;
export const MALE_RATIO = mr/(mr+fr); // 0.5=50%

var fcr = param('fcr',1), // formal ratio
	ccr = param('ccr',1), // casual ratio
	icr = param('icr',0); // intimate ratio
if( fcr+ccr+icr<0.1 ) fcr = ccr = 1;
export const FORMAL_CLOTHING_RATIO = fcr/(fcr+ccr+icr);
export const CASUAL_CLOTHING_RATIO = (fcr+ccr)/(fcr+ccr+icr);


export const MASK_INHALE_EFFECTIVENESS = param( 'mie', 0.3 );
export const MASK_EXHALE_EFFECTIVENESS = param( 'mee', 0.9 );

export const ADULT_MASK_ON  = param2( 'amon',new Range( 2, 4 ));
export const ADULT_MASK_OFF = param2( 'amof',new Range( 1, 5 ));
export const CHILD_MASK_ON  = param2( 'cmon',new Range( 2, 4 ));
export const CHILD_MASK_OFF = param2( 'cmof',new Range( 1, 5 ));