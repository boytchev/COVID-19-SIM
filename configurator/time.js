//
// Day and night

import * as CFG from './configurator.js';

CFG.addHeader(
	1, 'Time', 'time',
	'Prameters for the day-night light cycle in the simulation.',
	'time,sun,moon,shadow,light,morning,evening,house,apartment,office' );
		
CFG.addHeader(
	2, 'Virtual time', '', '',
	'time' );

		CFG.addNumericListSlider(
			'dts', 'Time speed', CFG.timeMs(0,0,1), {fav:true, 
				values: [
					CFG.timeMs(0,0,1),
					CFG.timeMs(0,0,2),
					CFG.timeMs(0,0,5),
					CFG.timeMs(0,0,10),
					CFG.timeMs(0,0,30),
					CFG.timeMs(0,1),
					CFG.timeMs(0,2),
					CFG.timeMs(0,5),
					CFG.timeMs(0,10),
					CFG.timeMs(0,30),
					CFG.timeMs(1),
					CFG.timeMs(2),
				],
				labels: [
					'1|second',
					2,
					5,
					10,
					30,
					'1|munte',
					2,
					5,
					10,
					30,
					'1|hour',
					'2|hours',
				],
				displayWidth: 4,
				display: function(x){return CFG.msToString(x);},
			},
			'How much virtual time passes for 1 second of real time. For example, 00:00:01 is for realtime simulation, 00:00:05 is for simulation 5 times faster.',
			'time,debug' );

		CFG.addBoolean(
			'dpts', 'People time speed', true, {internal:true},
			'If checked, the motion of people adheres to the global time lapse set in <em>Time speed</em>. If unchecks, the motion of people is unaffected and they move normally, independed on the time lapse speed.',
			'time,debug' );
	
		CFG.addTimeSlider(
			'st', 'Start time', CFG.timeMs(6,20), {fav:true, min:CFG.timeMs(0,0,0), max:CFG.timeMs(24), step:CFG.timeMs(0,10,0), seconds: false, labelStep:CFG.timeMs(2), dotStep:CFG.timeMs(1), labelSeconds:false, labelMinutes:false, days: false },
			'The virtual time at which the simulation starts.',
			'time,debug' );

	





CFG.addHeader(
	2, 'Sun & moon', '',
	'These parameters control the simulation of the sun and the moon. If they are present, they are always in opposite directions.',
	'time,sun,moon,light,morning,evening' );

		CFG.addNumericList(
			'su', 'Sun', 0, {values:[0,'no',1,'static',2,'dynamic']},
			'The motion of sun. <em>No</em> indicates there is no sun and light comes from everywhere. <em>Static</em> means the sun does not move, but stays at a position in the sky, defined by <em>STATIC SUN POSITION</em>. When the sun is <em>Dynamic</em>, it moves around the city, simulating day-night cycles.',
			'time,sun,light,debug' );

		CFG.addTimeSlider(
			'srm', 'Sunrise', CFG.timeMs(6), {min:CFG.timeMs(4), max:CFG.timeMs(9), step:CFG.timeMs(0,1), seconds: false, labelStep:CFG.timeMs(1), dotStep:CFG.timeMs(1), labelSeconds:false, labelMinutes:true, days: false, internal:true},
			'Time of the sunrise. At sunrise the sun steps above the horizon. Together with <em>sunset</em> it defines the day-night cycle.',
			'time,sun,light,morning' );

		CFG.addTimeSlider(
			'ssm', 'Sunset', CFG.timeMs(18), {min:CFG.timeMs(16), max:CFG.timeMs(21), step:CFG.timeMs(0,1), seconds: false, labelStep:CFG.timeMs(1), dotStep:CFG.timeMs(1), labelSeconds:false, labelMinutes:true, days: false, internal:true},
			'Time of the sunset. At sunset the sun steps below the horizon. Together with <em>sunrise</em> it defines the day-night cycle.',
			'time,sun,light,evening' );

		CFG.addTimeSlider(
			'sspm', 'Static sun position', CFG.timeMs(10,0,0), {min:CFG.timeMs(0), max:CFG.timeMs(24), step:CFG.timeMs(0,30), seconds: false, labelStep:CFG.timeMs(2), dotStep:CFG.timeMs(1), labelSeconds:false, labelMinutes:false, days: false, internal:true},
			'Position of the sun when <em>sun = static</em> measured as time of the day. The sun stays at this position, affecting shadows and color of sunlight.',
			'time,sun,debug' );

		CFG.addNumericSlider(
			'sha', 'Sun angle', 30, {min:0, max:360, step:15, labelStep:90, dotStep: 30, unit:'&deg;', internal:true},
			'Angle (in degrees) of how the sun path in the sky is horizontally rotated in respect to the ground. This can be used to adjust North, East, South and West directions. Angles 0&deg;, 90&deg;, 180&deg;, 270&deg; and 360&deg; will make the sun trajectory aligned with the city streets.',
			'time,sun' );

		CFG.addBoolean(
			'dspg', 'Manual sun', false, {internal:true},
			'If checked, adds a control for manually changing the sun position. This affects lightings and shadows (if they are turned on). The position is set as hours &ndash; i.e. 18.5 corresponds to 18:30.',
			'time,sun,debug' );
	
CFG.addHeader(
	2, 'Shadows', '', '',
	'time,shadow' );
	
		CFG.addNumericList(
			'sh', 'Shadows', 0, {values:[0,'no',1,'top',2,'full']},
			'The type of shadows. This parameter is affective only when <em>sun = static</em> or <em>dynamic</em>. Value <em>No</em> indicates there are no shadows, this has highest performance. <em>Top</em> shadows are static as if the sun light comes from above. <em>Full</em> shadows are generated depending on the sun position. If the <em>sun = dynamic</em> then shadows are continuously recalculated, which negatively impacts performance.',
			'time,shadow,debug' );

		CFG.addNumericListSlider(
			'shms', 'Shadow size', 4096, {values:[128,256,512,1024,2048,4096,8192,16384], unit:'px', internal:true},
			'The size of the shadow map measured in pixels. Larger maps makes more accurate shadows, but require more memory and time. Not all values are supported for all platforms, as the maximal size depends on the GPU.',
			'time,shadow' );
			
		CFG.addNumericSlider(
			'shmc', 'Shadow count', 3, {min:1, max:10, step:1, internal:true},
			'Number of overlapping shadows. These shadows are at different resolutions, providing better softness of shadows. However, more number of shadows slows the performance.',
			'time,shadow' );

		CFG.addBoolean(
			'acs', 'People shadows', false, {},
			'If checked, people have shadows. The current implementation of shadows in walking people is static and does not depend on body posture.',
			'time,shadow' );


	
CFG.addHeader(
	2, 'Morning lights', '',
	'Time intervals in the morning when lights are turned on/off. The exact time for each window is picked from this interval. It is suggested to synchronize these parameters with the time of <em>Sunrise</em>.',
	'time,morning,light,house,apartment,office', {internal:true} );


var lightAM = {
		min: CFG.timeMs(4),
		max: CFG.timeMs(10),
		step: CFG.timeMs(0,5),
		seconds: false,
		labelStep: CFG.timeMs(2),
		dotStep: CFG.timeMs(1),
		labelSeconds: false,
		labelMinutes:true,
		internal:true
	};

CFG.addHeader(
	3, 'Houses', '', '',
	'time,morning,light,house', {internal:true} );

		CFG.addTimeRangeSlider(
			'lhan', 'House AM lights on', CFG.timeMs(4,30), CFG.timeMs(5,30), {...lightAM},
			'Time interval in the morning when house lights are turned on.',
			'time,morning,light,house' );

		CFG.addTimeRangeSlider(
			'lhaf', 'House AM lights off', CFG.timeMs(6,30), CFG.timeMs(7), {...lightAM},
			'Time interval in the morning when house lights are turned off.',
			'time,morning,light,house' );

CFG.addHeader(
	3, 'Apartments', '', '',
	'time,morning,light,apartment', {internal:true} );

		CFG.addTimeRangeSlider(
			'laan', 'Apartment AM lights on', CFG.timeMs(4,30), CFG.timeMs(5,30), {...lightAM},
			'Time interval in the morning when apartment lights are turned on.',
			'time,morning,light,apartment' );

		CFG.addTimeRangeSlider(
			'laaf', 'Apartment AM lights off', CFG.timeMs(6,30), CFG.timeMs(7), {...lightAM},
			'Time interval in the morning when apartment lights are turned off.',
			'time,morning,light,apartment' );

CFG.addHeader(
	3, 'Offices', '', '',
	'time,morning,light,office', {internal:true} );

		CFG.addTimeRangeSlider(
			'loan', 'Office AM lights on', CFG.timeMs(5,30), CFG.timeMs(6,10), {...lightAM},
			'Time interval in the morning when office lights are turned on.',
			'time,morning,light,office' );

		CFG.addTimeRangeSlider(
			'loaf', 'Office AM lights off', CFG.timeMs(6,10), CFG.timeMs(6,30), {...lightAM},
			'Time interval in the morning when office lights are turned off.',
			'time,morning,light,office' );





CFG.addHeader(
	2, 'Evening lights', '',
	'Time intervals in the evening when lights are turned on/off. The exact time for each window is picked from this interval. It is suggested to synchronize these parameters with the time of <em>Sunset</em>.',
	'time,evening,light,house,apartment,office', {internal:true} );

var lightPM = {
		min: CFG.timeMs(17),
		max: CFG.timeMs(23),
		step: CFG.timeMs(0,5),
		seconds: false,
		labelStep: CFG.timeMs(2),
		dotStep: CFG.timeMs(1),
		labelSeconds: false,
		labelMinutes:true,
		internal:true
	};

CFG.addHeader(
	3, 'Houses', '', '',
	'time,evening,light,house', {internal:true} );

		CFG.addTimeRangeSlider(
			'lhpn', 'House PM lights on', CFG.timeMs(17,45), CFG.timeMs(18,30), {...lightPM},
			'Time interval in the evening when house lights are turned on.',
			'time,evening,light,house' );

		CFG.addTimeRangeSlider(
			'lhpf', 'House PM lights off', CFG.timeMs(21), CFG.timeMs(23), {...lightPM},
			'Time interval in the evening when house lights are turned off.',
			'time,evening,light,house' );

CFG.addHeader(
	3, 'Apartments', '', '',
	'time,evening,light,apartment', {internal:true} );

		CFG.addTimeRangeSlider(
			'lapn', 'Apartment PM lights on', CFG.timeMs(17,45), CFG.timeMs(18,30), {...lightPM},
			'Time interval in the evening when apartment lights are turned on.',
			'time,evening,light,apartment' );

		CFG.addTimeRangeSlider(
			'lapf', 'Apartment PM lights off', CFG.timeMs(21), CFG.timeMs(23), {...lightPM},
			'Time interval in the evening when apartment lights are turned off.',
			'time,evening,light,apartment' );

CFG.addHeader(
	3, 'Offices', '', '',
	'time,evening,light,office', {internal:true} );

		CFG.addTimeRangeSlider(
			'lopn', 'Office PM lights on', CFG.timeMs(17), CFG.timeMs(17,30), {...lightPM},
			'Time interval in the evening when office lights are turned on.',
			'time,evening,light,office' );

		CFG.addTimeRangeSlider(
			'lopf', 'Office PM lights off', CFG.timeMs(18), CFG.timeMs(22), {...lightPM},
			'Time interval in the evening when office lights are turned off.',
			'time,evening,light,office' );

