//
// Map
//	- General
//	- Blocks
//	- Streets
//	- Trees


import * as CFG from './configurator.js';



	

// MAP ===================================

CFG.addHeader( 1, 'Map', 'map', 'A general map of the city and its areas.', 'map,ground,block,office,residential,park,plaza,house,apartment,avenue,street,sidewalk,crossing,tree' );


CFG.addHeader( 2, 'Dimensions', '', '', 'map,ground', {internal:true} );

			
		CFG.addNumericListSlider(
			'gs', 'Ground size', 500, {values: [10,20,50,100,200,500,1000,2000,5000,10000], unit:'m', fav:true},
			'The active area of the simulation in meters. Buildings and people will be bound to a square of this size.',
			'map,ground,debug' );

		CFG.addNumeric(
			'rs', 'Layout', 0, {min:0, max:100000, step:1, internal:true},
			'A number that determines the layout of streets and buildings. If 0, the simulator will pick an arbitrary layout. It not 0, the simulator will use that specific layout if the other configuration parameters are the same.',
			'map,block,debug' );

		CFG.addNumericSlider(
			'bst', 'Split treshold', 110, {min:50, max:500, step:10, labelStep:100, unit:'m', internal:true},
			'This parameter is used when the city layout is generated. If a block is larger than this value, then it is considered for splitting into smaller blocks.',
			'map,block' );

		CFG.addNumericSlider(
			'bm', 'Split margin', 30, {min:10, max:100, step:10, unit:'m', internal:true},
			'If a block is split into smaller blocks, they must be larger than this number. <em>Split margin</em> should not exceed <em>Split treshold/3</em>, if it exeeds it, then <em>Split treshold/3</em> will be used. If the value is too small, it may prevent the formation of sloped streets in the city.',
			'map,block' );


CFG.addHeader(
	2, 'Block types', '', '', 'map,office,residential,block,park,plaza', {internal:true} );

		CFG.addNumericSlider(
			'ovr', 'Office &ndash; residential', 5, {min:-100, max:100, step:5, labelStep:50, percentage:true, unit:'%', labels:[-100,'residential|buildings',100,'office|buildings',-50,'-50%',0,'0%',50,'50%']},
			'The probability of a block to be for office buildings or for residential buildings depends on the computed maximal height of the block. This parameter contributes to this probability by increasig or decreasing it. Value 100% generates only office buildings; value -100% generates only residential buildings; value 0% keeps the originally computed probability.',
			'map,office,residential,block' );

		CFG.addNumericSlider(
			'urru', 'Rural &ndash; urban', 30, {min: 0, max: 100, step:10, labelStep: 10, labels:[0,'megapolis',30,'city',70,'town',100,'village'], unit: '%', percentage: true},
			'Percentage of how rural or urban is the generated area. Approximate values are: 100% for villages, 70% for small towns, 50% for towns, 30% for cities and 0% for megalopolises. The effect is visible when <em>Ground size</em> is larger (at least a few kilometers).',
			'map,block' );

		CFG.addNumericSlider(
			'sut', 'Suburbs', 15, {min:0, max:40, step:5, percentage:true, unit:'%', internal:true},
			'Percentage of <em>Ground size</em>. If a block is smaller than this size and it is in the suburbs of the city, it might be made as park. This makes the shape of the city less squarish.',
			'map,block' );
	
		CFG.addNumericSlider(
			'bpp', 'Parks', 5, {min:0, max:50, step:1, labelStep:5, percentage:true, unit:'%', internal:true},
			'Probability of a block to be generated as a park. Larger values make more green open areas in the city. Too small residential blocks will be turned into parks independent on this parameter.',
			'map,block,park' );

		CFG.addNumericSlider(
			'bzp', 'Plazas', 3, {min:0, max:20, step:1, labelStep:5, percentage:true, unit:'%', internal:true},
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

		CFG.addNumericSlider(
			'at', 'Avenue treshold', 1000, {min:100, max:2000, step:100, labelStep:500, unit:'m', internal:true},
			'If a block is larger than this size, it might be split by an avenue, otherwise &ndash; by a street.',
			'map,avenue' );
			
		CFG.addNumericSlider(
			'aw', 'Avenue width', 18, {min:1, max:40, step:1, labelStep:5, unit:'m', internal:true},
			'Avenue width in meters. Exceptionally large blocks are initially split by avenues of this size.',
			'map,avenue' );
			
		CFG.addNumericSlider(
			'sw', 'Street width', 6, {min:1, max:20, step:1, labelStep:2, unit:'m', internal:true},
			'Street width in meters. Blocks are split by streets of this size.',
			'map,street' );

		CFG.addNumericSlider(
			'sww', 'Sidewalk width', 3, {min:1, max:10, step:1, unit:'m', offset:4.8, internal:true},
			'The width of the sidewalk in meters. Sidewalks are areas around each block, where people can walk. It is also the width of pedestrian crossings.',
			'map,sidewalk,block' );			
			
		CFG.addNumericSlider(
			'cmc', 'Minimal crossing distance', 15, {min:5, max:20, step:1, labelStep:2, unit:'m', internal:true},
			'The minimal distance between two pedestrian crossing in the same direction. If the Manhattan distance between them is smaller, one of the crossing is not generated. The distance must consider <em>Street width</em> as this width indicates the theoretical closeness of crossings.',
			'map,street,crossing' );



CFG.addHeader(
	2, 'Style', '', '', 'map,ground', {internal:true} );
	
		CFG.addNumericSlider(
			'dblo', 'Ground opacity', 100, {min:0, max:100, step:25, percentage: true, unit:'%', fav:true, internal:true, labels:[0, 'transparent', 25, 25, 50, 50,75, 75, 100, 'opaque']},
			'Percentage of opacity of the ground &ndash; pavements, streets, grass. At 100% the ground is fully opaque, while at 0% it is fully transparent.',
			'map,ground' );



CFG.addHeader(
	2, 'Trees', '', '', 'map,tree,park,house', {internal:true} );

		CFG.addNumericRangeSlider(
			'th', 'Tree height', 3, 4, {min:2, max:8, step:0.5, labelStep:1, unit: 'm', internal:true},
			'Height of trees in meters. Actual height is randomly picked from this range. It applies to all trees &ndash; in parks and around houses.',
			'map,tree' );
			
		CFG.addNumericSlider(
			'tc', 'Tree complexity', 4, {min:2, max:8, step:1, internal:true, labels:[2,'simple',8,'complex']},
			'The complexity factor for trees. For value <em>n</em> the tree contains <em>2(n+1)<sup>2</sup></em> polygons (e.g. 150 polygons for complexity 4).',
			'map,tree' );

		CFG.addNumericSlider(
			'tpr', 'Trees in parks', 20, {min:0, max:100, step:5, labelStep:20, percentage: true, unit:'%', internal:true},
			'The ratio of generated trees in parks in respect to the maximal number of trees for parks of this size.',
			'map,tree,park' );

		CFG.addNumericSlider(
			'thr', 'Trees around houses', 15, {min:0, max:100, step:5, labelStep:20, percentage: true, unit:'%', internal:true},
			'The ratio of generated trees in house blocks in respect to the maximal number of trees for blocks of this size.',
			'map,tree,house' );

/*
CFG.addHeader( 1, 'Test', '', 'Testing custom input elements.', 'map' );

CFG.addTimeRangeSlider(
	'test-ntrsam', '7. Time Range Slider', CFG.timeMs(6), CFG.timeMs(9,45), {min:CFG.timeMs(0), max:CFG.timeMs(12), step:CFG.timeMs(0,10), seconds: false, labelStep:CFG.timeMs(2), dotStep:CFG.timeMs(1), labelSeconds:false, labelMinutes:true},
	'This is a dummy parameter.',
	'map' );


CFG.addTimeSlider(
	'test-ntm', '6. Time Slider', CFG.timeMs(6), {min:CFG.timeMs(0), max:CFG.timeMs(12), step:CFG.timeMs(0,30), seconds: false, labelStep:CFG.timeMs(2), dotStep:CFG.timeMs(1), labelSeconds:false, labelMinutes:true},
	'This is a dummy parameter.',
	'map' );


CFG.addNumericSlider(
	'test-ns', '1. Numeric Slider', 350, {
			min: 10,
			max: 1100,
			step: 10,
			dotStep: 50,
			labelStep: 100,
			unit: 'm/s'
		},
	'Singe number in a range.',
	'map' );
	
CFG.addNumericSlider(
	'test-nslab', '2. Numeric Labels Slider', 50, {
			min: 0,
			max: 100,
			step:10,
			labelStep: 10,
			labels:[0,'megapolis',30,'city',70,'town',100,'village'],
			unit: '%',
			percentage: true,
		},
	'Single number with predefined labels.',
	'map' );

CFG.addNumericListSlider(
	'test-nsl', '3. Numeric List Slider', 50, {values: [5,10,20,50,100,200,500,1000,2000,5000,10000], unit: 'm'},
	'This is a dummy parameter.',
	'map' );

CFG.addNumericSlider(
	'test-nperslab', '4. Numeric Percentage Slider', 55, {
			min: 30,
			max: 70,
			step:5,
			labelStep: 10,
			unit: '%',
			percentage: true,
		},
	'Single number with predefined labels.',
	'map' );

CFG.addNumericRangeSlider(
	'test-nrs', '5. Numeric Range Slider', 250, 450, {
		min: 10,
		max: 1100,
		step: 50,
		labelStep: 200,
		unit:'m/s'
	},
	'Test with double numeric slider.',
	'map' );
*/
