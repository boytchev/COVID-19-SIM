//
// Day and night

import * as CFG from './configurator.js';

CFG.addHeader(
	1, 'Day and night', 'daynight',
	'Prameters for the day-night light cycle in the simulation.' );
		
CFG.addHeader(
	2, 'Morning lights', '',
	'Time intervals in the morning when lights are turned on/off. The exact time for each window is picked from this interval. It is suggested to synchronize these parameters with the time of <em>Sunrise</em>.' );

CFG.addHeader(
	3, 'Houses' );

		CFG.addTimeRange(
			'lhan', 'House AM lights on', CFG.timeMs(4,30), CFG.timeMs(5,30), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
			'Time interval in the morning when house lights are turned on.' );

		CFG.addTimeRange(
			'lhaf', 'House AM lights off', CFG.timeMs(6,30), CFG.timeMs(7), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
			'Time interval in the morning when house lights are turned off.' );

		CFG.addTimeRange(
			'lhai', 'House AM lights max', CFG.timeMs(4,40), CFG.timeMs(6,50), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
			'Time interval in the morning when house lights are fully lit. This interval must be between the corresponding <em>Lights on</em> and <em>Lights off</em>. Lights outside this interval are faded.' );

CFG.addHeader(
	3, 'Apartments' );

		CFG.addTimeRange(
			'laan', 'Apartment AM lights on', CFG.timeMs(4,30), CFG.timeMs(5,30), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
			'Time interval in the morning when apartment lights are turned on.' );

		CFG.addTimeRange(
			'laaf', 'Apartment AM lights off', CFG.timeMs(6,30), CFG.timeMs(7), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
			'Time interval in the morning when apartment lights are turned off.' );

		CFG.addTimeRange(
			'laai', 'Apartment AM lights max', CFG.timeMs(4,40), CFG.timeMs(6,50), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
			'Time interval in the morning when apartment lights are fully lit. This interval must be between the corresponding <em>Lights on</em> and <em>Lights off</em>. Lights outside this interval are faded.' );

CFG.addHeader(
	3, 'Offices' );

		CFG.addTimeRange(
			'loan', 'Office AM lights on', CFG.timeMs(5,30), CFG.timeMs(6,10), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
			'Time interval in the morning when office lights are turned on.' );

		CFG.addTimeRange(
			'loaf', 'Office AM lights off', CFG.timeMs(6,10), CFG.timeMs(6,30), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
			'Time interval in the morning when office lights are turned off. ' );

		CFG.addTimeRange(
			'loai', 'Office AM lights max', CFG.timeMs(5,40), CFG.timeMs(6), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,10),},
			'Time interval in the morning, when office lights are fully lit. This interval must be between the corresponding <em>Lights on</em> and <em>Lights off</em>. Lights outside this interval are faded.' );




CFG.addHeader(
	2, 'Evening lights', '',
	'Time intervals in the evening when lights are turned on/off. The exact time for each window is picked from this interval. It is suggested to synchronize these parameters with the time of <em>Sunset</em>.' );

CFG.addHeader(
	3, 'Houses' );

		CFG.addTimeRange(
			'lhpn', 'House PM lights on', CFG.timeMs(17,45), CFG.timeMs(18,30), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
			'Time interval in the evening when house lights are turned on.' );

		CFG.addTimeRange(
			'lhpf', 'House PM lights off', CFG.timeMs(21), CFG.timeMs(23,30), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
			'Time interval in the evening when house lights are turned off.' );

		CFG.addTimeRange(
			'lhpi', 'House PM lights max', CFG.timeMs(17,55), CFG.timeMs(22,50), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
			'Time interval in the evening when house lights are fully lit. This interval must be between the corresponding <em>Lights on</em> and <em>Lights off</em>. Lights outside this interval are faded.' );

CFG.addHeader(
	3, 'Apartments' );

		CFG.addTimeRange(
			'lapn', 'Apartment PM lights on', CFG.timeMs(17,45), CFG.timeMs(18,30), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
			'Time interval in the evening when apartment lights are turned on.' );

		CFG.addTimeRange(
			'lapf', 'Apartment PM lights off', CFG.timeMs(21), CFG.timeMs(23,30), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
			'Time interval in the evening when apartment lights are turned off.' );

		CFG.addTimeRange(
			'lapi', 'Apartment PM lights max', CFG.timeMs(17,55), CFG.timeMs(22,50), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
			'Time interval in the evening when apartment lights are fully lit. This interval must be between the corresponding <em>Lights on</em> and <em>Lights off</em>. Lights outside this interval are faded.' );

CFG.addHeader(
	3, 'Offices' );

		CFG.addTimeRange(
			'lopn', 'Office PM lights on', CFG.timeMs(17), CFG.timeMs(17,30), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
			'Time interval in the evening when office lights are turned on.' );

		CFG.addTimeRange(
			'lopf', 'Office PM lights off', CFG.timeMs(18), CFG.timeMs(22), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
			'Time interval in the evening when office lights are turned off.' );

		CFG.addTimeRange(
			'lopi', 'Office PM lights max', CFG.timeMs(18), CFG.timeMs(22,50), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,10),},
			'Time interval in the evening, when office lights are fully lit. This interval must be between the corresponding <em>Lights on</em> and <em>Lights off</em>. Lights outside this interval are faded.' );

