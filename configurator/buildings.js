//
// Buildings
//	- General
//	- Houses
//	- Apartments
//	- Elevators

import * as CFG from './configurator.js';


// BUILDINGS ===================================

CFG.addHeader(
	1, 'Buildings', 'buildings',
	'Prameters for the buildings in the city.<hr>THE PARAMETERS BELOW ARE NOT GROUPED WELL YET' );


// BUILDINGS.General ===================================

CFG.addHeader(
	2, 'General' );

CFG.addPercentage(
	'sks', 'Skyscrapers', 0.2, {min:-1, max:1, step:0.1},
	'The probability of a skyscaper depends on the computed maximal height of the block. <em>Skyscrapers</em> contributes to this probability by increasig or decreasing it. Value 100% generates mostly skyscrapers; value -100% tries to avoid them.</em>.' );

CFG.addNumeric(
	'fh', 'Floor height', 2.5, {min:1, max:4, step:0.1, unit:'m'},
	'Height of a floor (storey) in meters. The same height is used for all buildings &ndash; residential and business.' );

CFG.addNumeric(
	'mf', 'Maximal floors', 120, {min:10, max:400, step:10},
	'Maximal number of floors (storey) in the tallest buildings. The actual number of floors in a particular building depends on a random number bound by this value.' );

CFG.addPercentage(
	'dbuo', 'Building opacity', 1, {min:0, max:1, step:0.25},
	'Percentage of opacity of all buildings &ndash; houses, apartments and offices. At 100% the buildings are fully opaque, while at 0% they are fully transparent.' );
	
	
CFG.addBoolean(
	'dhr', 'Hide roofs', false, {},
	'If checked, buildings are drawn without roofs and it is possible to see people inside.' );


// BUILDINGS.Houses ===================================

CFG.addHeader(
	2, 'Houses' );

CFG.addNumeric(
	'hbr', 'House bounding radius', 5, {min:4, max:20, step:1},
	'The radius of invisible circle around a house. It determins how wide a house can be, how close it to neghtbour houses and how it is positioned in a block. Larger radius makes sparse house distribution.' );

CFG.addNumericRange(
	'aph', 'Adults per house', 1, 4, {min:1, max:10, step:1},
	'The number of adults in a house. The actual number is randomly picked from this interval.' );

CFG.addNumericRange(
	'cph', 'Children per house', 0, 3, {min:0, max:10, step:1},
	'The number of children in a house. The actual number is randomly picked from this interval.' );

CFG.addTimeRange(
	'lhan', 'House lamps on (morning)', CFG.timeMs(4,30), CFG.timeMs(5,30), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
	'Time interval in the morning when house lamps are turned on. All house lamps are turned on randomly, but within this interval. It is suggested that this time adheres to the setting of <em>Sunrise</em>.' );

CFG.addTimeRange(
	'lhaf', 'House lamps off (morning)', CFG.timeMs(6,30), CFG.timeMs(7), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
	'Time interval in the morning when house lamps are turned off. All house lamps are turned off randomly, but within this interval. It is suggested that this time adheres to the setting of <em>Sunrise</em>.' );

CFG.addTimeRange(
	'lhai', 'House lamps max intensity (morning)', CFG.timeMs(4,40), CFG.timeMs(6,50), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
	'Time interval in the morning, when house lamps are fully lit. This interval must be between <em>House lamps on (morning)</em> and <em>House lamps off (morning)</em>. This parameter is used to fade in or out the lights.' );

CFG.addTimeRange(
	'lhpn', 'House lamps on (evening)', CFG.timeMs(17,45), CFG.timeMs(18,30), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
	'Time interval in the evening when house lamps are turned on. All house lamps are turned on randomly, but within this interval. It is suggested that this time adheres to the setting of <em>Sunset</em>.' );

CFG.addTimeRange(
	'lhpf', 'House lamps off (evening)', CFG.timeMs(21), CFG.timeMs(23,30), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
	'Time interval in the evening when house lamps are turned off. All house lamps are turned off randomly, but within this interval. It is suggested that this time adheres to the setting of <em>Sunset</em>.' );

CFG.addTimeRange(
	'lhpi', 'House lamps max intensity (evening)', CFG.timeMs(17,55), CFG.timeMs(22,50), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
	'Time interval in the evening, when house lamps are fully lit. This interval must be between <em>House lamps on (evening)</em> and <em>House lamps off (evening)</em>. This parameter is used to fade in or out the lights.' );


// BUILDINGS.Apartments ===================================

CFG.addHeader(
	2, 'Apartments' );

CFG.addBoolean(
	'daaf', 'Apartment floors', false, {},
	'If checked, the floors of the apartment building are drawn. To see the floors the view point should be inside the building or <em>Building opacity</em> should be less than 100%.' );

CFG.addNumeric(
	'CFG.add', 'Apartment building entrances span', 20, {min:10, max:40, step:2, unit:'m'},
	'The distance allocated for one entrance. If a wall is long 60 meters, it will have 3 entrances.' );

CFG.addNumericRange(
	'abw', 'Apartment building width', 8, 16, {min:4, max:30, step:2, unit: 'm'},
	'The range for the length (in meters) of the smaller wall of an apartment building. The length of the longer wall is restricted by the block size.' );
	
CFG.addNumeric(
	'abd', 'Apartment building distance', 24, {min:16, max:40, step:2, unit: 'm'},
	'The desired distance between centers of apartment buildings. This value my be ignored if it is too small (i.e. at least <em>Apartment building width+8</em> meters) and the buildings are too big.' );
	
CFG.addNumeric(
	'mabf', 'Max additional apartment building floors', 30, {min:0, max:120, step:2},
	'Every apartment building has two default floors. This value indicates the maximal number of additional floors. The actual height also depends on a random number and on the calculated building height for the block.' );
	
CFG.addNumeric(
	'ars', 'Apartment room size', 7, {min:3, max:20, step:1},
	'The desired size of an apartment room in meters. The actual size may vary depending on the building size.' );

CFG.addNumericRange(
	'apa', 'Adults per apartment', 1, 3, {min:1, max:10, step:1},
	'The number of adults in an apartment. The actual number is randomly picked from this interval.' );

CFG.addNumericRange(
	'cpa', 'Children per apartment', 0, 2, {min:0, max:10, step:1},
	'The number of children in an apartment. The actual number is randomly picked from this interval.' );

CFG.addTimeRange(
	'laan', 'Apartment lamps on (morning)', CFG.timeMs(4,30), CFG.timeMs(5,30), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
	'Time interval in the morning when apartment lamps are turned on. All apartment lamps are turned on randomly, but within this interval. It is suggested that this time adheres to the setting of <em>Sunrise</em>.' );

CFG.addTimeRange(
	'laaf', 'Apartment lamps off (morning)', CFG.timeMs(6,30), CFG.timeMs(7), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
	'Time interval in the morning when apartment lamps are turned off. All apartment lamps are turned off randomly, but within this interval. It is suggested that this time adheres to the setting of <em>Sunrise</em>.' );

CFG.addTimeRange(
	'laai', 'Apartment lamps max intensity (morning)', CFG.timeMs(4,40), CFG.timeMs(6,50), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
	'Time interval in the morning, when apartment lamps are fully lit. This interval must be between <em>Apartment lamps on (morning)</em> and <em>Apartment lamps off (morning)</em>. This parameter is used to fade in or out the lights.' );

CFG.addTimeRange(
	'lapn', 'Apartment lamps on (evening)', CFG.timeMs(17,45), CFG.timeMs(18,30), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
	'Time interval in the evening when apartment lamps are turned on. All apartment lamps are turned on randomly, but within this interval. It is suggested that this time adheres to the setting of <em>Sunset</em>.' );

CFG.addTimeRange(
	'lapf', 'Apartment lamps off (evening)', CFG.timeMs(21), CFG.timeMs(23,30), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
	'Time interval in the evening when apartment lamps are turned off. All apartment lamps are turned off randomly, but within this interval. It is suggested that this time adheres to the setting of <em>Sunset</em>.' );

CFG.addTimeRange(
	'lapi', 'Apartment lamps max intensity (evening)', CFG.timeMs(17,55), CFG.timeMs(22,50), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
	'Time interval in the evening, when apartment lamps are fully lit. This interval must be between <em>Apartment lamps on (evening)</em> and <em>Apartment lamps off (evening)</em>. This parameter is used to fade in or out the lights.' );


// BUILDINGS.Offices ===================================

CFG.addHeader(
	2, 'Offices' );

CFG.addNumeric(
	'odw', 'Office entrance width', 2, {min:2, max:8, step:2, unit:'m'},
	'The width factor of office entrances (section of doors) in meters. If the width is 2 meters, then the entrance could be 2 meters, 4 meters, 6 meters wide.' );
	
CFG.addNumeric(
	'odd', 'Office entrances distance', 10, {min:2, max:20, step:2, unit:'m'},
	'The distance between two entrances on one side of an office building. This distance is only suggestion, is some circumstances it might be ignored.' );

CFG.addNumericRange(
	'ors', 'Office room size', 5, 10, {min:3, max:20, step:1, unit:'m'},
	'The desired range for an office room size. The actual size is calculated from the building size.' );
	
CFG.addNumeric(
	'ocw', 'Office corridor width', 1, {min:1, max:5, step:1, unit:'m'},
	'The width of corridors in office building. Wider corridors may reduce the amount of rooms.' );
	
CFG.addNumericRange(
	'orc', 'Office room count', 2, 9, {min:2, max:15, step:1},
	'The desired number of office rooms. The actual number depends on this value, as well of building size and <em>Office room size</em>. Larger count results in smaller rooms and vice versa.' );

CFG.addTimeRange(
	'loan', 'Office lamps on (morning)', CFG.timeMs(5,30), CFG.timeMs(6,10), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
	'Time interval in the morning when office lamps are turned on. All office lamps are turned on randomly, but within this interval. It is suggested that this time adheres to the setting of <em>Sunrise</em>.' );

CFG.addTimeRange(
	'loaf', 'Office lamps off (morning)', CFG.timeMs(6,10), CFG.timeMs(6,30), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
	'Time interval in the morning when office lamps are turned off. All office lamps are turned off randomly, but within this interval. It is suggested that this time adheres to the setting of <em>Sunrise</em>.' );

CFG.addTimeRange(
	'loai', 'Office lamps max intensity (morning)', CFG.timeMs(5,40), CFG.timeMs(6), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
	'Time interval in the morning, when office lamps are fully lit. This interval must be between <em>Office lamps on (morning)</em> and <em>Office lamps off (morning)</em>. This parameter is used to fade in or out the lights.' );

CFG.addTimeRange(
	'lopn', 'Office lamps on (evening)', CFG.timeMs(17), CFG.timeMs(17,30), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
	'Time interval in the evening when office lamps are turned on. All office lamps are turned on randomly, but within this interval. It is suggested that this time adheres to the setting of <em>Sunset</em>.' );

CFG.addTimeRange(
	'lopf', 'Office lamps off (evening)', CFG.timeMs(18), CFG.timeMs(22), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
	'Time interval in the evening when office lamps are turned off. All office lamps are turned off randomly, but within this interval. It is suggested that this time adheres to the setting of <em>Sunset</em>.' );

CFG.addTimeRange(
	'lopi', 'Office lamps max intensity (evening)', CFG.timeMs(18), CFG.timeMs(22,50), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
	'Time interval in the evening, when office lamps are fully lit. This interval must be between <em>Office lamps on (evening)</em> and <em>Office lamps off (evening)</em>. This parameter is used to fade in or out the lights.' );


// BUILDINGS.Elevators ===================================

CFG.addHeader(
	2, 'Elevators' );

CFG.addNumeric(
	'elsz', 'Elevator size', 2, {min:1, max:4, step:1, unit:'m'},
	'The size of elevators. Elevators shafts are square with side length equal to this value. When people use elevators they group outside them at some distance.' );
	
CFG.addNumericRange(
	'elsp', 'Elevator speed', 0.8, 2.4, {min:0.5, max:4, step:0.5, unit: 'm/s'},
	'Speed of elevators in meters per second. This speed defines how fast people go to a different floor in apartment and office buildings.' );
