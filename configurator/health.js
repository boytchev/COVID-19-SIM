//
// Health
//	- Infection
//	- Immunity
//	- Monitoring


import * as CFG from './configurator.js';



// HEALTH ===================================

CFG.addHeader(
	1, 'Health', 'health',
	'Prameters for infection and people health.',
	'health,infection,immunity,people,time,tracking' );

// HEALTH.INFECTION ===================================



CFG.addHeader(
	2, 'Infection', '', '',
	'health,infection,people,time,debug' );

		CFG.addPercentage(
			'pii', 'Initially infected', 0.05, {fav:true, min:0, max:1, step:0.05},
			'Percentage of initially infected people. Although infected, the people will start with the asymptotic phase, so the infection will manifestated later on.',
			'health,infection,people,debug' );

		CFG.addNumeric(
			'id', 'Infection distance', 1, {fav:true, min:0.2, max:50, step:0.2, unit: 'm'},
			'The maximal infection distance in meters. The distance is measured as Manhattan distance. If a person is further away from another person, then there is no infection trasnfer between both.',
			'health,infection' );

		CFG.addPercentage(
			'ist', 'Infection speed', 0.5, {min:0.1, max:1, step:0.1},
			'A scaling factor for the infection speed. Larger factors make the infection spread faster.',
			'health,infection' );
	
		CFG.addTimeRange(
			'itmh', 'Infection duration (hours)', CFG.timeMs(0,0,10), CFG.timeMs(10), {min:CFG.timeMs(0), max:CFG.timeMs(23,59,59), step:CFG.timeMs(0,0,10)},
			'Duration of infection in hours. The full duration combines this value and the value of <em>Infection duration (days)</em>.',
			'health,infection,time' );

		CFG.addNumericRange(
			'itmd', 'Infection duration (days)', 14, 28, {min:0, max:60, step:1, unit:'d'},
			'Duration of infection in days. The full duration combines this value and the value of <em>Infection duration (hours)</em>. For example, if hours infection is 4:00 to 10:00 and days infection is 1..6 days, then the actual duration is picked from 1 day and 4 hours to 6 days and 10 hours.',
			'health,infection,time' );

		CFG.addNumeric(
			'ipc', 'Infection patterns count', 10, {min:2, max:21, step:1},
			'The number of infection patterns. Each pattern has a viral shedding curve with specific position of the peak value. Currently the infection pattern is picked individually for each person from the first half of available patterns (i.e. the infection peak is near the beginning of the illness.',
			'health,infection' );
	
		CFG.addNumeric(
			'is', 'Infection step', 200, {min:1, max:1000, step:10},
			'The number of animation frames needed to check the whole population. If the value is 1, then all people are checked every frame. This may affect the performance badly in case of large but concentrated population. Distributing the check over higher number of frames, keeps the performance at the cost of some inaccuracy in infection &ndash; if two people meet and go away between their checks, they will not infect each other.',
			'health,infection' );



CFG.addHeader(
	2, 'Immunity', '', '',
	'health,immunity' );

		CFG.addNumericRange(
			'ims', 'Immune strength', 100, 200, {min:10, max:1000, step:10},
			'Initial immune strength for a person. When in contact with infection the strength decreases and when it reaches 0 the person becomes infected.',
			'health,immunity' );

		CFG.addNumeric(
			'imrf', 'Immune recovery factor', 0.0005, {min:0, max:0.1, step:0.0005, unit:'/s'},
			'Every second the immune system of a person self-recovers by this value. Larger recovery factors will protect a person against infection, as the decrease caused by the infection will be overcome by the immune system recovery. <em>Immune strength = 100</em> is completely recovered in 2 days and 8 hours by recovery factor 0.0005.',
			'health,immunity' );
			
		CFG.addNumericRange(
			'icf', 'Immune cure factor', 1.0, 1.2, {min:0.5, max:2, step:0.1},
			'Scaling factor of immune strength after cure. Value 1.0 keeps the same immune strength as before the infection. Value 1.2 increates the strength by 20%. Value 0.5 decreases the strength twice.',
			'health,immunity' );

	
CFG.addHeader(
	2, 'Monitoring', '', '',
	'health,people,tracking' );

		CFG.addBoolean(
			'ioi', 'Health overhead indicator', false, {},
			'If checked, there is overhead indicator showing the health status as colour and as numeric level from OK (no infection), then 1, 2, ... to 10 (higly infected person).',
			'health,people,debug' );
			
		CFG.addBoolean(
			'ici', 'Health color indicator', false, {},
			'If checked, the skin color of infected people turn reddish depending on the level of the health status.',
			'health,people,debug' );
			
		CFG.addBoolean(
			'dsvs', 'Viral diagram', false, {},
			'If checked, shows a diagram of the viral shedding (infection level per time period). Higher values indicate higher probability of infecting nearby people. Vertical lines split the diagram into 14 periods. Click on the diagram to hide it.',
			'health' );

		CFG.addBoolean(
			'dah', 'Population health', false, {},
			'If checked, once per second prints in the JS console the number of infected people split into three health categories &ndash; asymptotic (infection level under 20%), medium (between 20% and 60%) and severe (above 60%).',
			'health,people' );

		CFG.addNumeric(
			'dfah', 'Follow person health', -1, {min:-1, max:50000, step:1},
			'If this parameter cointains an existing person id, then the health status of this person is printed in the JS console. If the value is -1, such printing is turned off.',
			'health,people,tracking' );

