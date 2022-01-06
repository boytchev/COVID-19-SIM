//
// Map
//	- General
//	- Blocks
//	- Streets
//	- Trees


import * as CFG from './configurator.js';


CFG.addHeader( 1, 'Test', '', 'Testing custom input elements.', 'map' );

CFG.addTimeSlider(
	'test-ntm', '1. Numeric Slider Time', CFG.timeMs(6), {min:CFG.timeMs(0), max:CFG.timeMs(12), step:CFG.timeMs(0,30), seconds: false, labelStep:CFG.timeMs(1), dotStep:CFG.timeMs(1), labelSeconds:false, labelMinutes:false},
	'This is a dummy parameter.',
	'map' );
			
			
CFG.addNumericSlider(
	'test-ns', '2. Numeric Slider', 50, {min:10, max:1100, step:10, labelStep: 100, unit:'m/s'},
	'This is a dummy parameter.',
	'map' );
	
CFG.addNumericSlider(
	'test-ns2', '3. Numeric Slider', 50, {min:2, max:8, step:0.25, labelStep: 1, unit:'m', dotStep: 0.5},
	'This is a dummy parameter.',
	'map' );
	
CFG.addNumericSliderList(
	'test-nsl', '4. Numeric Slider List', 10, {values: [5,10,20,50,100,200,500,1000,2000,5000,10000], unit: 'deg'},
	'This is a dummy parameter.',
	'map' );
	
CFG.addNumericSlider(
	'test-nslab', '5. Numeric Slider', 50, {min:0, max:100, step:10, labelStep: 10, unit:'m/s', labels:[0,'megalopolis',30,'city',70,'town',100,'village']},
	'This is a dummy parameter.',
	'map' );

// MAP ===================================

CFG.addHeader( 1, 'Map', 'map', 'A general map of the city and its areas.', 'map,ground,block,office,residential,park,plaza,house,apartment,avenue,street,sidewalk,crossing,tree' );


CFG.addHeader( 2, 'Dimensions', '', '', 'map,ground', {internal:true} );

		// CFG.addNumeric(
			// 'gs', 'Ground size', 500, {min:10, max:10000, step:10, fav:true, unit:'m'},
			// 'The active area of the simulation in meters. Buildings and people will be bound to a square of this size.',
			// 'map,ground,debug' );
			
		CFG.addNumericList(
			'gs', 'Ground size', 500, {values: [10,'10',20,20,50,50,100,100,200,200,500,500,1000,1000,2000,2000,5000,5000,10000,10000], unit:'m', fav:true},
			'The active area of the simulation in meters. Buildings and people will be bound to a square of this size.',
			'map,ground,debug' );
			
		//CFG.addNumeric(
		//	'es', 'Earth size', 50000, {min:1000, max:100000, step:1000, unit:'m', offset: 7.4},
		//	'The area surrounding the simulation area. Its edge makes the horizon.',
		//	'map,earth' );

//CFG.addHeader( 2, 'Structure', '', '', 'map,block' );

		CFG.addNumeric(
			'rs', 'Layout', 0, {min:0, max:100000, step:1, internal:true},
			'A number that determines the layout of streets and buildings. If 0, the simulator will pick an arbitrary layout. It not 0, the simulator will use that specific layout if the other configuration parameters are the same.',
			'map,block,debug' );

		CFG.addNumeric(
			'bst', 'Split treshold', 110, {min:50, max:500, step:10, unit:'m', internal:true},
			'This parameter is used when the city layout is generated. If a block is larger than this value, then it is considered for splitting into smaller blocks.',
			'map,block' );

		CFG.addNumeric(
			'bm', 'Split margin', 30, {min:10, max:100, step:10, unit:'m', internal:true},
			'If a block is split into smaller blocks, they must be larger than this number. <em>Split margin</em> should not exceed <em>Split treshold/3</em>, if it exeeds it, then <em>Split treshold/3</em> will be used. If the value is too small, it may prevent the formation of sloped streets in the city.',
			'map,block' );


CFG.addHeader(
	2, 'Block types', '', '', 'map,office,residential,block,park,plaza', {internal:true} );

		CFG.addPercentage(
			'ovr', 'Office &ndash; residential', 0.05, {min:-1, max:1, step:0.01},
			'The probability of a block to be for office buildings or for residential buildings depends on the computed maximal height of the block. This parameter contributes to this probability by increasig or decreasing it. Value 100% generates only office buildings; value -100% generates only residential buildings; value 0% keeps the originally computed probability.',
			'map,office,residential,block' );

		CFG.addPercentage(
			'urru', 'Rural &ndash; urban', 0.3, {min:0, max:1, step:0.1},
			'Percentage of how rural or urban is the generated area. Approximate values are: 100% for villages, 70% for small towns, 50% for towns, 30% for cities and 0% for megalopolises. The effect is visible when <em>Ground size</em> is larger (at least a few kilometers).',
			'map,block' );

		CFG.addPercentage(
			'sut', 'Suburbs', 0.16, {min:0, max:0.4, step:0.01, internal:true},
			'Percentage of <em>Ground size</em>. If a block is smaller than this size and it is in the suburbs of the city, it might be made as park. This makes the shape of the city less squarish.',
			'map,block' );
	
		CFG.addPercentage(
			'bpp', 'Parks', 0.05, {min:0, max:1, step:0.01, internal:true},
			'Probability of a block to be generated as a park. Larger values make more green open areas in the city. Too small residential blocks will be turned into parks independent on this parameter.',
			'map,block,park' );

		CFG.addPercentage(
			'bzp', 'Plazas', 0.03, {min:0, max:1, step:0.01, internal:true},
			'Probability of a block to be generated as a plaza. Larger values make more open areas in the city. This probability is tested after <em>Parks</em>.',
			'map,block,plaza' );


CFG.addHeader(
	2, 'Enforced block types', '',
		'Restriction of what types of blocks are generated. If some are checked, only these types of blocks are created. If none are checked, the simulator decides what to create.',
		'map,block,house,apartment,office,park,plaza,debug', {internal:true} );

		CFG.addBoolean(
			'dbwoh', 'Only houses', false, {internal:true},
			'If checked, generate blocks with houses.',
			'map,block,house,debug' );

		CFG.addBoolean(
			'dbwoa', 'Only apartments', false, {internal:true},
			'If checked, generate blocks with apartments.',
			'map,block,apartment,debug' );

		CFG.addBoolean(
			'dbwoo', 'Only offices', false, {internal:true},
			'If checked, generate blocks with offices.',
			'map,block,office,debug' );

		CFG.addBoolean(
			'dbwop', 'Only parks', false, {internal:true},
			'If checked, generate blocks with parks.',
			'map,block,park,debug' );

		CFG.addBoolean(
			'dbwoz', 'Only plazas', false, {internal:true},
			'If checked, generate blocks with plazas.',
			'map,block,plaza,debug' );



CFG.addHeader(
	2, 'Streets and avenues', '',
	'They are indistinguishable for the simulation, except that avenues are wider than streets. Both have pedestrian crossings.',
	'map,avenue,street,sidewalk,block,crossing', {internal:true} );

		CFG.addNumeric(
			'at', 'Avenue treshold', 1000, {min:100, max:2000, step:100, unit:'m', internal:true},
			'If a block is larger than this size, it might be split by an avenue, otherwise &ndash; by a street.',
			'map,avenue' );
			
		CFG.addNumeric(
			'aw', 'Avenue width', 18, {min:1, max:40, step:1, unit:'m', internal:true},
			'Avenue width in meters. Exceptionally large blocks are initially split by avenues of this size.',
			'map,avenue' );
			
		CFG.addNumeric(
			'sw', 'Street width', 6, {min:1, max:20, step:1, unit:'m', internal:true},
			'Street width in meters. Blocks are split by streets of this size.',
			'map,street' );

		CFG.addNumeric(
			'sww', 'Sidewalk width', 3, {min:1, max:10, step:1, unit:'m', offset:4.8, internal:true},
			'The width of the sidewalk in meters. Sidewalks are areas around each block, where people can walk. It is also the width of pedestrian crossings.',
			'map,sidewalk,block' );			
			
		CFG.addNumeric(
			'cmc', 'Minimal crossing distance', 15, {min:5, max:20, step:1, unit:'m', internal:true},
			'The minimal distance between two pedestrian crossing in the same direction. If the Manhattan distance between them is smaller, one of the crossing is not generated. The distance must consider <em>Street width</em> as this width indicates the theoretical closeness of crossings.',
			'map,street,crossing' );



CFG.addHeader(
	2, 'Style', '', '', 'map,ground', {internal:true} );
	
		CFG.addPercentage(
			'dblo', 'Ground opacity', 1, {min:0, max:1, step:0.25, internal:true},
			'Percentage of opacity of the ground &ndash; pavements, streets, grass. At 100% the ground is fully opaque, while at 0% it is fully transparent.',
			'map,ground' );



CFG.addHeader(
	2, 'Trees', '', '', 'map,tree,park,house', {internal:true} );

		CFG.addNumericRange(
			'th', 'Tree height', 3, 4, {min:2, max:8, step:0.5, unit: 'm', internal:true},
			'Height of trees in meters. Actual height is randomly picked from this range. It applies to all trees &ndash; in parks and around houses.',
			'map,tree' );
			
		CFG.addNumeric(
			'tc', 'Tree complexity', 4, {min:2, max:8, step:1, internal:true},
			'The complexity factor for trees. For value <em>n</em> the tree contains <em>2(n+1)<sup>2</sup></em> polygons (e.g. 150 polygons for complexity 4).',
			'map,tree' );

		CFG.addPercentage(
			'tpr', 'Trees in parks', 0.2, {min:0, max:1, step:0.05, internal:true},
			'The ratio of generated trees in parks in respect to the maximal number of trees for parks of this size.',
			'map,tree,park' );

		CFG.addPercentage(
			'thr', 'Trees around houses', 0.15, {min:0, max:1, step:0.05, internal:true},
			'The ratio of generated trees in house blocks in respect to the maximal number of trees for blocks of this size.',
			'map,tree,house' );

