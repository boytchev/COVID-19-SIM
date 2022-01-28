//
// People
//	- General
//	- Graphics
//	- Monitoring


import * as CFG from './configurator.js';

CFG.addHeader(
	1, 'People', 'people',
	'Prameters describing the population and individual people.',
	'people,home,fashion,motion,tracking,adult,house,child,apartment,male,female,age,debug' );

CFG.addHeader(
	2, 'Demographics', '', '',
	'people,male,female,adult,child,age' );

		CFG.addNumericListSlider(
			'damc', 'People count', 100, {values:[0,1,2,5,10,20,50,100,200,500,1000,2000,5000,10000], labels:['no|people'],	fav:true},
			'The maximal number of people in the simulation. Their number might be smaller if the amount of houses and apartments are not sufficient for all of them.',
			'people,debug' );

		CFG.addNumericListSlider(
			'fmr', 'Female / male ratio', 0.5, {
				values:[0,0.2,0.25,0.33,0.5,0.67,0.75,0.8,1],
				labels:['only|females','4:1','3:1','2:1','equal|1:1','1:2','1:3','1:4','only|males'],
				display:function(x){return Math.round(100-100*x)+'% / '+Math.round(100*x)+'%';},
				displayWidth: 5.25,
				internal:true},
			'Population proportions that manifests biological male or female appearance, including clothing. This parameter affects adults and children alike.',
			'people,male' );

		CFG.addNumericRangeSlider(
			'aay', 'Person age', 0, 100, {min:0, max:100, step:1, labelStep:10, unit: 'years', internal:true},
			'The age of each person is picked from this range depending on the age distribution curve, shown by <em>Age diagram</em>. Note that the actual number of adults and children are controlled by <em>Adults per house</em>, <em>Adults per apartment</em>, <em>Children per house</em> and <em>Children per apartment</em>.',
			'people,adult,child,age' );

		CFG.addBoolean(
			'dsaad', 'Age diagram', false, {internal:true},
			'If checked, shows a diagram of age distribution of people (number of people per age in years). The theoretical distribution is shown in crimson, the actual distribution is shown in blue. The curve may break between children and adults, because their number depends on the number of houses and apartments, and on the values of <em>Adults per house</em>, <em>Children per house</em>, <em>Adults per apartment</em> and <em>Children per apartment</em>. Click on the diagram to hide it.',
			'people,age' );

		CFG.addNumericRangeSlider(
			'aha', 'Adult height', 1.6, 1.9, {min:1.0, max:2.4, step:0.1, labelStep:0.2, unit: 'm', internal:true},
			'The proposed height of an adult.',
			'people,adult' );

		CFG.addNumericRangeSlider(
			'ahc', 'Child height', 0.5, 1.7, {min:0.4, max:2, step:0.1, labelStep:0.2, unit: 'm', internal:true},
			'The proposed height of a child, the first value is the height of a newborn, the second &ndash; of a 17 years old. The actual height is picked randomly within the &plusmn;15% variance of the values.',
			'people,child' );

CFG.addHeader(
	2, 'Homes', '', '',
	'people,home,tracking,adult,house,child,apartment', {internal:true} );

		CFG.addNumericRangeSlider(
			'pph', 'People per house', 1, 6, {min:1, max:10, step:1, internal:true},
			'The number of people in a house. The actual number is randomly picked from this interval.',
			'people,home,house' );

		CFG.addNumericRangeSlider(
			'ppa', 'People per apartment', 1, 5, {min:1, max:10, step:1, internal:true},
			'The number of people in an apartment. The actual number is randomly picked from this interval.',
			'people,home,apartment' );
/*
		CFG.addNumericRangeSlider(
			'aph', 'Adults per house', 1, 4, {min:1, max:10, step:1, internal:true},
			'The number of adults in a house. The actual number is randomly picked from this interval.',
			'people,home,adult,house' );

		CFG.addNumericRangeSlider(
			'cph', 'Children per house', 0, 3, {min:0, max:10, step:1, internal:true},
			'The number of children in a house. The actual number is randomly picked from this interval.',
			'people,home,child,house' );


		CFG.addNumericRangeSlider(
			'apa', 'Adults per apartment', 1, 3, {min:1, max:10, step:1, internal:true},
			'The number of adults in an apartment. The actual number is randomly picked from this interval.',
			'people,home,adult,apartment' );

		CFG.addNumericRangeSlider(
			'cpa', 'Children per apartment', 0, 2, {min:0, max:10, step:1, internal:true},
			'The number of children in an apartment. The actual number is randomly picked from this interval.',
			'people,home,child,apartment' );
*/
		CFG.addBoolean(
			'dal', 'Population whereabouts', false, {internal:true},
			'If checked, once per second prints in the JS console the number of people at home, commuting and at work.',
			'people,tracking' );

		CFG.addBoolean(
			'dcvoa', 'Look at people', false, {internal:true},
			'If checked, when the simulation starts, sets the view point on the people. This can be used to find people if they are a small compact group in a large city.',
			'people','tracking' );

CFG.addHeader(
	2, 'Daily schedule', '',
	'These parameters define the timing of the major activities of virtual people.',
	'people, adult, child', {internal:true} );
	
CFG.addHeader(
	3, 'Adult\' schedule', '', '',
	'people, adult', {internal:true} );
	
		CFG.addTimeRangeSlider(
			'awu', 'Adult wake up', CFG.timeMs(5,30), CFG.timeMs(7), {min: CFG.timeMs(4),max: CFG.timeMs(8), step: CFG.timeMs(0,5), seconds: false, labelStep: CFG.timeMs(1), dotStep: CFG.timeMs(0,30), labelSeconds: false,labelMinutes:true, internal:true },
			'Time interval when adults wake up.',
			'people,adult,morning' );

		CFG.addTimeRangeSlider(
			'agts', 'Adult go to sleep', CFG.timeMs(21), CFG.timeMs(23), {min: CFG.timeMs(20),max: CFG.timeMs(24), step: CFG.timeMs(0,5), seconds: false, days: false, labelStep: CFG.timeMs(1), dotStep: CFG.timeMs(0,30), labelSeconds: false,labelMinutes:true, internal:true },
			'Time interval when adults go to bed.',
			'people,adult,evening' );

		CFG.addTimeRangeSlider(
			'alh', 'Adult leave home', CFG.timeMs(6), CFG.timeMs(8), {min: CFG.timeMs(4),max: CFG.timeMs(10), step: CFG.timeMs(0,5), seconds: false, labelStep: CFG.timeMs(1), dotStep: CFG.timeMs(0,30), labelSeconds: false,labelMinutes:true, internal:true },
			'Time interval when adults leave home and go to work.',
			'people,adult,morning' );

		CFG.addTimeRangeSlider(
			'alw', 'Adult leave work', CFG.timeMs(17), CFG.timeMs(20), {min: CFG.timeMs(16),max: CFG.timeMs(22), step: CFG.timeMs(0,5), seconds: false, labelStep: CFG.timeMs(1), dotStep: CFG.timeMs(0,30), labelSeconds: false,labelMinutes:true, internal:true },
			'Time interval when adults leave work and return home.',
			'people,adult,evening' );
			
		CFG.addTimeRangeSlider(
			'apth', 'Adult pause at home', CFG.timeMs(0,0), CFG.timeMs(0,10), {min: CFG.timeMs(0), max: CFG.timeMs(2), step: CFG.timeMs(0,5), seconds: false, labelStep: CFG.timeMs(0,30), dotStep: CFG.timeMs(0,30), labelSeconds: false,labelMinutes:true, internal:true },
			'Time interval when adults stay in one place while at home. When this time elapses, the adult walks to another location in the house or the apartment.',
			'people,adult' );

		CFG.addTimeRangeSlider(
			'aptw', 'Adult pause at work', CFG.timeMs(0,0), CFG.timeMs(0,20), {min: CFG.timeMs(0), max: CFG.timeMs(2), step: CFG.timeMs(0,5), seconds: false, labelStep: CFG.timeMs(0,30), dotStep: CFG.timeMs(0,30), labelSeconds: false,labelMinutes:true, internal:true },
			'Time interval when adults stay in one place while working. When this time elapses, the adult walks to another location in the office.',
			'people,adult' );

CFG.addHeader(
	3, 'Child\'s schedule', '', '',
	'people, adult', {internal:true} );

		CFG.addTimeRangeSlider(
			'cwu', 'Child wake up', CFG.timeMs(6), CFG.timeMs(7,30), {min: CFG.timeMs(5),max: CFG.timeMs(9), step: CFG.timeMs(0,5), seconds: false, labelStep: CFG.timeMs(1), dotStep: CFG.timeMs(0,30), labelSeconds: false,labelMinutes:true, internal:true },
			'Time interval when children wake up.',
			'people,child,morning' );

		CFG.addTimeRangeSlider(
			'cgts', 'Child go to sleep', CFG.timeMs(19), CFG.timeMs(21), {min: CFG.timeMs(17),max: CFG.timeMs(23), step: CFG.timeMs(0,5), seconds: false, labelStep: CFG.timeMs(1), dotStep: CFG.timeMs(0,30), labelSeconds: false,labelMinutes:true, internal:true },
			'Time interval when children go to bed.',
			'people,child,evening' );

			
CFG.addHeader(
	2, 'MOTION', '', '',
	'people,motion,tracking', {internal:true} );

		CFG.addNumericRangeSlider(
			'aws', 'Walking speed', 0.8, 2.0, {min:0.6, max:2.6, step:0.1, labelStep:0.2, unit: 'm/s', internal:true},
			'Speed of walking of people. This speed defines how fast people walk. The observed speed also depends on the height of a person.',
			'people,motion' );

		CFG.addNumericList(
			'dfal', 'Formation', 0, {values: [0,'Random',1,'Line',2,'Circle'], internal:true},
			'Initial formation of people. <em>Random</em> positions people randomly, <em>Line</em> orders them in one or more rows, <em>Circle</em> places them in a circle.',
			'people,motion,debug' );

		CFG.addBoolean(
			'drw', 'Random wandering', false, {internal:true},
			'If checked, the people are walking in random directions and they do not follow any routine. If not checked, the people follow their daily routine.',
			'people,motion,debug' );

		CFG.addNumericSlider(
			'dlodd', 'Level of detail distance', 100, {min:10, max:1000, step:50, labelStep: 100, internal:true, unit: 'm'},
			'Distance (measured in meters) where the level of details is activated. People closer to the viewer than this distance are shown with full motion and body transformation. People beyond this distance have only basic motion and body transformations, thus reducing required processing power.',
			'people,motion,debug' );

		CFG.addNumericSlider(
			'dfa', 'Follow person', -1, {min:-1, max:20, step:1, internal:true, labels:[-1,"no|one",0,0,5,5,10,10,15,15,20,20]},
			'Each person has an id number starting from 0. If this parameter cointains an existing person id, then the view point automatically follows this person as if spied from a drone. If the value is -1, such following is turned off. Note, that only one of the first 20 persons can be followed.',
			'people,motion,tracking' );

		CFG.addNumericSlider(
			'daa', 'Follow person actions', -1, {min:-1, max:20, step:1, internal:true, labels:[-1,"no|one",0,0,5,5,10,10,15,15,20,20]},
			'If this parameter cointains an existing person id, then the timestamped actions of  this person are printed in the JS console. If the value is -1, such printing is turned off. Note, that only one of the first 20 persons can be followed.',
			'people,motion,tracking' );
			
			
CFG.addHeader(
	2, 'Fashion', '', '',
	'people,fashion,male,female', {internal:true} );

		CFG.addNumericList(
			'adm', 'People clothes', 7, {values:[7,'CLOTHES',0,'WHITE',1,'CHECKERED',2,'CHESSBOARD',3,'CRIMSON',4,'BORDERS',5,'PATCHES',6,'RANDOM'], internal:true},
			'The clothes on people. The only clothes option is <em>CLOTHES</em>, the others are used for development &ndash; <em>WHITE</em> for all white, <em>CHECKERED</em> for colorful squares, <em>CHESSBOARD</em> for black and white squares, <em>CRIMSON</em> for black body with crimson stripes, <em>BORDERS</em> for white body with lines for clothes patches, <em>PATCHES</em> - for grayscale patches with topology codes, and <em>RANDOM</em> for randomly colored patches.',
			'people,fashion,male,female,debug' );

		CFG.addNumericListSlider(
			'fcr', 'Formal / casual', 0.5, {
				values:[0,0.33,0.5,0.67,1],
				labels:['only|formal','2:1','1:1','1:2','only|casual'],
				display:function(x){return Math.round(100-100*x)+'% / '+Math.round(100*x)+'%';},
				displayWidth: 5.25,
				internal:true},
			'Fraction of population that wears formal business clothing. The actual proportion is also dependent on the <em>Dressed / undressed</em> parameter.',
			'people,fashion,debug' );

		CFG.addNumericListSlider(
			'dur', 'Dressed / undressed', 0, {
				values:[0,0.33,0.5,0.67,1],
				labels:['dressed','2:1','1:1','1:2','undressed'],
				display:function(x){return Math.round(100-100*x)+'% / '+Math.round(100*x)+'%';},
				displayWidth: 5.25,
				internal:true},
			'Fraction of population that wears is dressed.',
			'people,fashion,debug' );





			

