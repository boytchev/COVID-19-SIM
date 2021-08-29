//
// People
//	- General
//	- Graphics
//	- Monitoring


import * as CFG from './configurator.js';

CFG.addHeader(
	1, 'People', 'people',
	'Prameters describing the population and individual people.',
	'people,home,fashion,motion,tracking,adult,house,child,apartment,male,female,age' );

CFG.addHeader(
	2, 'Demographics', '', '',
	'people,male,female,adult,child,age' );

		CFG.addNumeric(
			'damc', 'People count', 100, {min:0, max:50000, step:100, fav:true},
			'The maximal number of people in the simulation. Their number might be smaller if the amount of houses and apartments are not sufficient for all of them.',
			'people' );

		CFG.addNumeric(
			'mr', 'Males', 1, {min:0, max:10, step:1},
			'Fraction of population that manifests biological male appearance, including clothing. This parameter affects adults and children alike. The actual proportion is <em>Males:Females</em> and 2:3 would mean approximately 2 out of 5 people are males. Proportion 0:0 is considered as 1:1.',
			'people,male' );

		CFG.addNumeric(
			'fr', 'Females', 1, {min:0, max:10, step:1},
			'Fraction of population that manifests biological female appearance, including clothing. This parameter affects adults and children alike. The actual proportion is <em>Males:Females</em> and 2:3 would mean approximately 2 out of 5 people are female. Proportion 0:0 is considered as 1:1.',
			'people,female' );

		CFG.addNumericRange(
			'aay', 'Person age', 0, 100, {min:0, max:100, step:10, unit: 'years'},
			'The age of each person is picked from this range depending on the age distribution curve, shown by <em>Age diagram</em>. Note that the actual number of adults and children are controlled by <em>Adults per house</em>, <em>Adults per apartment</em>, <em>Children per house</em> and <em>Children per apartment</em>.',
			'people,adult,child,age' );

		CFG.addBoolean(
			'dsaad', 'Age diagram', false, {},
			'If checked, shows a diagram of age distribution of people (number of people per age in years). The theoretical distribution is shown in crimson, the actual distribution is shown in blue. The curve may break between children and adults, because their number depends on the number of houses and apartments, and on the values of <em>Adults per house</em>, <em>Children per house</em>, <em>Adults per apartment</em> and <em>Children per apartment</em>. Click on the diagram to hide it.',
			'people,age' );

		CFG.addNumericRange(
			'aha', 'Adult height', 1.8, 1.4, {min:1.0, max:2.5, step:0.1, unit: 'm'},
			'The proposed height of an adult, the first value is the height of a 18 year old, the second &ndash; of a 100 years old. The actual height is picked randomly within the &plusmn;10% variance of the values.',
			'people,adult' );

		CFG.addNumericRange(
			'ahc', 'Child height', 0.5, 1.7, {min:0.4, max:2, step:0.1, unit: 'm'},
			'The proposed height of a child, the first value is the height of a newborn, the second &ndash; of a 17 years old. The actual height is picked randomly within the &plusmn;15% variance of the values.',
			'people,child' );

CFG.addHeader(
	2, 'Homes', '', '',
	'people,home,tracking,adult,house,child,apartment' );

		CFG.addNumericRange(
			'aph', 'Adults per house', 1, 4, {min:1, max:10, step:1},
			'The number of adults in a house. The actual number is randomly picked from this interval.',
			'people,home,adult,house' );

		CFG.addNumericRange(
			'cph', 'Children per house', 0, 3, {min:0, max:10, step:1},
			'The number of children in a house. The actual number is randomly picked from this interval.',
			'people,home,child,house' );


		CFG.addNumericRange(
			'apa', 'Adults per apartment', 1, 3, {min:1, max:10, step:1},
			'The number of adults in an apartment. The actual number is randomly picked from this interval.',
			'people,home,adult,apartment' );

		CFG.addNumericRange(
			'cpa', 'Children per apartment', 0, 2, {min:0, max:10, step:1},
			'The number of children in an apartment. The actual number is randomly picked from this interval.',
			'people,home,child,apartment' );

		CFG.addBoolean(
			'dal', 'Population whereabouts', false, {},
			'If checked, once per second prints in the JS console the number of people at home, commuting and at work.',
			'people,tracking' );

		CFG.addBoolean(
			'dcvoa', 'Look at people', false, {},
			'If checked, when the simulation starts, sets the view point on the people. This can be used to find people if they are a small compact group in a large city.',
			'people','tracking' );

CFG.addHeader(
	2, 'MOTION', '', '',
	'people,motion,tracking' );

		CFG.addNumericRange(
			'aws', 'Walking speed', 0.8, 2.0, {min:0.6, max:2.6, step:0.2, unit: 'm/s'},
			'Speed of walking of people. This speed defines how fast people walk. The observed speed also depends on the height of a person.',
			'people,motion' );

		CFG.addBoolean(
			'dfal', 'Line formation', false, {},
			'If checked, the people are positioned in lines and columns. If not checked, the people are positioned in buildings.',
			'people,motion' );

		CFG.addBoolean(
			'drw', 'Random wandering', false, {},
			'If checked, the people are walking in random directions and they do not follow any routine. If not checked, the people follow their daily routine.',
			'people,motion' );

		CFG.addNumeric(
			'dfa', 'Follow person', -1, {min:-1, max:50000, step:1},
			'Each person has an id number starting from 0. If this parameter cointains an existing person id, then the view point automatically follows this person as if spied from a drone. If the value is -1, such following is turned off.',
			'people,motion,tracking' );

		CFG.addNumeric(
			'daa', 'Follow person actions', -1, {min:-1, max:50000, step:1},
			'If this parameter cointains an existing person id, then the timestamped actions of  this person are printed in the JS console. If the value is -1, such printing is turned off.',
			'people,motion,tracking' );
			
			
CFG.addHeader(
	2, 'Fashion', '', '',
	'people,fashion,male,female' );

		CFG.addNumericList(
			'adm', 'People clothes', 7, {values:[7,'CLOTHES',0,'WHITE',1,'CHECKERED',2,'CHESSBOARD',3,'CRIMSON',4,'BORDERS',5,'PATCHES',6,'RANDOM']},
			'The clothes on people. The only clothes option is <em>CLOTHES</em>, the others are used for development &ndash; <em>WHITE</em> for all white, <em>CHECKERED</em> for colorful squares, <em>CHESSBOARD</em> for black and white squares, <em>CRIMSON</em> for black body with crimson stripes, <em>BORDERS</em> for white body with lines for clothes patches, <em>PATCHES</em> - for grayscale patches with topology codes, and <em>RANDOM</em> for randomly colored patches.',
			'people,fashion,male,female' );

		CFG.addNumeric(
			'fcr', 'Formal clothing', 1, {min:0, max:10, step:1},
			'Fraction of population that wears formal business clothing. The actual proportion is <em>Formal:casual:intimate</em> and 5:3:2 would mean approximately 5 out of 10 people wear formal clothing. Proportion 0:0:0 is considered as 1:1:0.',
			'people,fashion,male,female' );

		CFG.addNumeric(
			'ccr', 'Casual clothing', 1, {min:0, max:10, step:1},
			'Fraction of population that wears casual clothing. The actual proportion is <em>Formal:casual:intimate</em> and 5:3:2 would mean approximately 3 out of 10 people wear casual clothing. Proportion 0:0:0 is considered as 1:1:0.',
			'people,fashion,male,female' );

		CFG.addNumeric(
			'icr', 'Intimate clothing', 0, {min:0, max:10, step:1},
			'Fraction of population that wears intimate clothing. The actual proportion is <em>Formal:casual:intimate</em> and 5:3:2 would mean approximately 2 out of 10 people wear casual clothing. Proportion 0:0:0 is considered as 1:1:0.',
			'people,fashion,male,female' );





			

