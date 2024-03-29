//
// Buildings
//	- General
//	- Houses
//	- Apartments
//	- Elevators

import * as CFG from './configurator.js';


CFG.addHeader(
	1, 'Buildings', 'buildings',
	'Prameters for the buildings in the city.',
	'building,floor,skyscraper,elevator,office,door,room,corridor,apartment,house,roof,debug' );




CFG.addHeader(
	2, 'Skyscrapers', '',
	'Skyscapers are tall buildings with offices or apartments.',
	'building,floor,skyscraper,elevator', {internal:true} );

		CFG.addNumericSlider(
			'mf', 'Maximal floors', 120, {min:10, max:400, step:10, labelStep:50},
			'Maximal number of floors (storeys) in the tallest buildings. The actual number of floors in a particular building depends on a random number bound by this value.',
			'building,skyscraper,floor' );
			
		CFG.addNumericSlider(
			'sks', 'Skyscrapers', 20, {min:-100, max:100, step:10, labelStep:50, percentage:true, unit:'%', labels:[-100,'no|skyscrapers',100,'many|skyscapers',-50,'-50%',0,'0%',50,'50%']},
			'The probability of a skyscaper depends on the computed maximal height of the block. <em>Skyscrapers</em> contributes to this probability by increasig or decreasing it. Value 100% generates mostly skyscrapers; value -100% tries to avoid them.</em>.',
			'building,skyscraper' );
			
		CFG.addNumericSlider(
			'elsz', 'Elevator size', 2, {min:1, max:4, step:0.5, unit:'m', internal:true},
			'The size of elevators. Elevators shafts are square with side length equal to this value. When people use elevators they group outside them at some distance relative to the elevator\'s size.',
			'building,skyscraper,elevator' );
			
		CFG.addNumericRangeSlider(
			'elsp', 'Elevator speed', 0.8, 2.4, {min:0.5, max:4, step:0.5, unit: 'm/s', internal:true},
			'Speed of elevators in meters per second. This speed defines how fast people go to a different floor in apartment and office buildings.',
			'building,skyscraper,elevator' );

			
CFG.addHeader(
	2, 'Offices', '', '',
	'building,office,door,room,corridor', {internal:true} );

		CFG.addNumericSlider(
			'odd', 'Office entrances distance', 10, {min:2, max:20, step:2, unit:'m', internal:true},
			'The distance between two entrances on one side of an office building. This distance is only a suggestion.',
			'building,office,door' );

		CFG.addNumericSlider(
			'odw', 'Office entrance width', 2, {min:2, max:8, step:2, unit:'m', internal:true},
			'The width factor of office entrances (section of doors) in meters. If the width is 2 meters, then the entrance could be 2 meters, 4 meters, 6 meters wide.',
			'building,office,door' );
			
		CFG.addNumericRangeSlider(
			'ors', 'Office room size', 5, 10, {min:3, max:20, step:1, unit:'m', internal:true},
			'The desired range for an office room size. The actual size is calculated from the building size.',
			'building,office,room' );
			
		CFG.addNumericRangeSlider(
			'orc', 'Office room count', 2, 9, {min:2, max:15, step:1, internal:true},
			'The desired number of office rooms. The actual number depends on this value, as well of building size and <em>Office room size</em>. Larger count results in smaller rooms and vice versa.',
			'building,office,room' );
			
		CFG.addNumericSlider(
			'ocw', 'Office corridor width', 1, {min:1, max:5, step:0.5, unit:'m', internal:true},
			'The width of corridors in office building. Wider corridors may reduce the amount of rooms.',
			'building,office,corridor' );
			
CFG.addHeader(
	2, 'Apartments', '', '',
	'building,apartment,floor,room,door', {internal:true} );

		CFG.addNumericRangeSlider(
			'abw', 'Apartment building width', 8, 16, {min:4, max:32, step:2, labelStep: 4,unit: 'm', internal:true},
			'The range for the length (in meters) of the smaller wall of an apartment building. The length of the longer wall is restricted by the block size.',
			'building,apartment' );
			
		CFG.addNumericSlider(
			'abd', 'Apartment building distance', 24, {min:16, max:40, step:2, labelStep: 4, unit: 'm', internal:true},
			'The desired distance between centers of apartment buildings. This value my be ignored if it is too small (i.e. at least <em>Apartment building width+8</em> meters) and the buildings are too big.',
			'building,apartment' );
			
		CFG.addNumericSlider(
			'mabf', 'Additional floors', 20, {min:0, max:40, step:1, labelStep:5, internal:true},
			'Every apartment building has at least two floors. This value indicates the maximal number of additional floors. The actual height also depends on a random number and on the calculated building height for the block.',
			'building,apartment,floor' );

		CFG.addNumericSlider(
			'ars', 'Apartment room size', 7, {min:3, max:19, step:1, labelStep: 2, internal:true},
			'The desired size of an apartment room in meters. The actual size may vary depending on the building size.',
			'building,apartment,room' );

		CFG.addNumericSlider(
			'CFG.add', 'Apartment building entrances distance', 20, {min:10, max:40, step:2, labelStep: 10, unit:'m', internal:true},
			'The distance between two entrances on one side of an apartment building. This distance is only a suggestion.',
			'building,apartment,door' );
			
		CFG.addBoolean(
			'daaf', 'Draw apartment floors', false, {internal:true},
			'If checked, the floors of the apartment building are drawn. To see the floors the view point should be inside the building or <em>Building opacity</em> should be less than 100%.',
			'building,apartment,floor' );


CFG.addHeader(
	2, 'Houses', '', '',
	'building,house', {internal:true} );

		CFG.addNumericSlider(
			'hbr', 'House distance', 6, {min:6, max:20, step:1, labelStep:2, internal:true},
			'The radius of invisible circle around a house. It determins how close are neghtbour houses and how it is positioned in a block. Larger radius makes sparser house distribution.',
			'building,house' );


CFG.addHeader(
	2, 'Style', '', '',
	'building,floor,roof', {internal:true} );

		CFG.addNumericSlider(
			'fh', 'Floor height', 2.5, {min:1, max:4, step:0.1, labelStep:0.5, unit:'m', internal:true},
			'Height of a floor (storey) in meters. The same height is used for all buildings &ndash; residential and business.',
			'building,floor' );
			
		CFG.addNumericSlider(
			'dbuo', 'Building opacity', 100, {min:0, max:100, step:25, percentage: true, unit:'%', fav:true, internal:true, labels:[0, 'transparent', 25, 25, 50, 50,75, 75, 100, 'opaque']},
			'Percentage of opacity of all buildings &ndash; houses, apartments and offices. At 100% the buildings are fully opaque, while at 0% they are fully transparent.',
			'building,debug' );
			
			
		CFG.addBoolean(
			'dhr', 'Hide roofs', false, {internal:true},
			'If checked, buildings are drawn without roofs and it is possible to see people inside.',
			'building,roof' );

