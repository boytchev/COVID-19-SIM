//
// Day and night

import * as CFG from './configurator.js';

CFG.addHeader(
	1, 'Day and night', 'daynight',
	'Prameters for the day-night light cycle in the simulation.' );
		
CFG.addHeader(
	2, 'Time' );

		CFG.addTime(
			'dts', 'Time speed', CFG.timeMs(0,0,1), {min:CFG.timeMs(0,0,1), max:CFG.timeMs(1,0,0), step:CFG.timeMs(0,0,1),},
			'How much virtual time passes for 1 second of real time. For example, 00:00:01 is for realtime simulation, 00:00:05 is for simulation 5 times faster.' );

		CFG.addTime(
			'st', 'Start time', CFG.timeMs(6,20), {min:CFG.timeMs(0,0,0), max:CFG.timeMs(23,59,59), step:CFG.timeMs(0,10,0),},
			'The virtual time at which the simulation starts.' );

	
CFG.addHeader(
	2, 'Sun' );

		CFG.addNumericList(
			'su', 'Sun', 0, {values:[0,'no',1,'static',2,'dynamic']},
			'The motion of sun. <em>No</em> indicates there is no sun and light comes from everywhere. <em>Static</em> means the sun does not move, but stays as a position in the sky, defined by <em>STATIC SUN POSITION</em>. When the sun is <em>Dynamic</em>, it moves around the city, simulating day-night cycles.' );

		CFG.addTime(
			'srm', 'Sunrise', CFG.timeMs(6), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,0,1),},
			'Time of the sunrise. At sunrise the sun steps above the horizon. Together with <em>sunset</em> it defines the day-night cycle.' );

		CFG.addTime(
			'ssm', 'Sunset', CFG.timeMs(18), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,0,1),},
			'Time of the sunset. At sunset the sun steps below the horizon. Together with <em>sunrise</em> it defines the day-night cycle.' );

		CFG.addTime(
			'sspm', 'Static sun position', CFG.timeMs(10,0,0), {min:CFG.timeMs(0,0,0), max:CFG.timeMs(23,59,0), step:CFG.timeMs(0,30,0),},
			'Position of the sun when <em>sun = static</em> measured as time of the day. The sun stays at this position, affecting shadows and color of sunlight.' );

		CFG.addNumeric(
			'sha', 'Sun angle', 30, {min:0, max:360, step:15, unit:'&deg;'},
			'Angle (in degrees) of how the sun path in the sky is horizontally rotated in respect to the ground. This can be used to adjust North, East, South and West directions. Angles 0&deg;, 90&deg;, 180&deg;, 270&deg; and 360&deg; will make the sun trajectory aligned with the city streets.' );

		CFG.addBoolean(
			'dspg', 'Manual sun', false, {},
			'If checked, adds a control for manually changing the sun position. This affects lightings and shadows (if they are turned on). The position is set as hours &ndash; i.e. 18.5 corresponds to 18:30.' );
	
CFG.addHeader(
	2, 'Shadows' );
	
		CFG.addNumericList(
			'sh', 'Shadows', 0, {values:[0,'no',1,'top',2,'full']},
			'The type of shadows. This parameter is affective only when <em>sun = static</em> or <em>dynamic</em>. Value <em>No</em> indicates there are no shadows, this has highest performance. <em>Top</em> shadows are static as if the sun light comes from above. <em>Full</em> shadows are generated depending on the sun position. If the <em>sun = dynamic</em> then shadows are continuously recalculated, which negatively impacts performance.' );

		CFG.addNumericList(
			'shms', 'Shadow size', 4096, {values:[128,128,256,256,512,512,1024,1024,2048,2048,4096,4096,8192,8192,16384,16384], unit:'px'},
			'The size of the shadow map measured in pixels. Larger maps makes more accurate shadows, but require more memory and time. Not all values are supported for all platforms, as the maximal size depends on the GPU.' );
			
		CFG.addNumeric(
			'shmc', 'Shadow count', 3, {min:1, max:10, step:1},
			'Number of overlapping shadows. These shadows are at different resolutions, providing better softness of shadows. However, more number of shadows slows the performance. ' );

		CFG.addBoolean(
			'acs', 'People shadows', false, {},
			'If checked, people have shadows. The current implementation of shadows in walking people is static and does not depend on body posture.' );


	
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


CFG.addHeader(	2, '<div style="background:crimson; color:white; padding: 0.5em 3em;">PARAMETERS BELOW ARE NOT GROUPED YET</div>' );
