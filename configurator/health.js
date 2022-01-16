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
	'health,infection,immunity,time,tracking' );

// HEALTH.INFECTION ===================================



CFG.addHeader(
	2, 'Masks', '', '',
	'health,mask,adult,child' );

CFG.addHeader(
	3, 'Effectiveness', '', '',
	'health,mask' );
	
		CFG.addNumericSlider(
			'mie', 'Mask inhale effectiveness', 30, {min:0, max:100, step:10, unit: "%", percentage: true},
			'Mask effectiveness for inhaled air &ndash i.e. how effective is the mask protecting a person from other people. The amount of incoming infectious particles is reduced by this factor.',
			'health,mask' );
	
		CFG.addNumericSlider(
			'mee', 'Mask exhale effectiveness', 90, {min:0, max:100, step:10, unit: "%", percentage: true},
			'Mask effectiveness for exhaled air &ndash i.e. how effective is the mask protecting other people from this person. The amount of outgoing infectious particles is reduced by this factor.',
			'health,mask' );
			
CFG.addHeader(
	3, 'Behaviour', '',
	'The mask behaviour parameters are intervals of infection levels from 0 (healthy) to 10 (most infected).',
	'health,mask,adult,child' );
	
		var maskLabels = [0,'healthy',1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,'most|infected'];
		CFG.addNumericRangeSlider(
			'amon', 'Adult mask on', 2, 4, {min:0, max:10, step:1, labels:maskLabels},
			'When an adult puts a mask on. For each adult the actual condition of putting mask on is randomly picked within the interval. The condition occurs when the infection level raises and goes above the picked value.',
			'health,mask,adult' );
			
		CFG.addNumericRangeSlider(
			'amof', 'Adult mask off', 1, 5, {min:0, max:10, step:1, labels:maskLabels},
			'When an adult takes a mask off. For each adult the actual condition of taking mask off is randomly picked within the interval. The condition occurs when the infection level decreases and goes below the picked value.',
			'health,mask,adult' );
			
		CFG.addNumericRangeSlider(
			'cmon', 'Child mask on', 2, 4, {min:0, max:10, step:1, labels:maskLabels},
			'When a child puts a mask on. For each child the actual condition of putting mask on is randomly picked within the interval. The condition occurs when the infection level raises and goes above the picked value.',
			'health,mask,child' );
			
		CFG.addNumericRangeSlider(
			'cmof', 'Child mask off', 1, 5, {min:0, max:10, step:1, labels:maskLabels},
			'When a child takes a mask off. For each child the actual condition of taking mask off is randomly picked within the interval. The condition occurs when the infection level decreases and goes below the picked value.',
			'health,mask,child' );
			
			
CFG.addHeader(
	2, 'Infection', '', '',
	'health,infection,time,debug' );

		CFG.addNumericSlider(
			'pii', 'Initially infected', 5, {fav:true, min:0, max:100, step:1, percentage: true, labelStep:10, dotStep:5, unit: '%'},
			'Percentage of initially infected people. Although infected, the people will start with the asymptotic phase, so the infection will manifestated later on.',
			'health,infection,debug' );

		CFG.addNumericListSlider(
			'id', 'Infection distance', 1, {fav:true, min:0.2, max:50, values:[0.2,0.5,1,2,5,10,20,30,40,50], unit: 'm'},
			'The maximal infection distance in meters. The distance is measured as Manhattan distance. If a person is further away from another person, then there is no infection trasnfer between both.',
			'health,infection' );

		CFG.addNumericSlider(
			'ist', 'Infection speed', 50, {min:10, max:100, step:10, percentage: true, labelStep:10, unit: '%'},
			'A scaling factor for the infection speed. Larger factors make the infection spread faster.',
			'health,infection' );
	
		CFG.addNumericListSlider(
			'itm', 'Infection duration', CFG.dayMs(14), {
				values: [
							CFG.dayMs(0,0,15),	
							CFG.dayMs(0,1),
							CFG.dayMs(0,2),
							CFG.dayMs(0,6),
							CFG.dayMs(0,12),
							CFG.dayMs(1),
							CFG.dayMs(2),
							CFG.dayMs(3),
							CFG.dayMs(7),
							CFG.dayMs(14),
							CFG.dayMs(21),
							CFG.dayMs(30)
						],
				labels: [
							'15|min',
							'1|hour',
							'2',
							'6',
							'12',
							'1|day',
							'2',
							'3',
							'1|week',
							'2',
							'3',
							'1|month'
						],
				displayWidth: 4,
				display: function(x){return CFG.msToString(x,false);},
			},
			'Duration of infection. The actual duration is this value &pm;20%.',
			'health,infection,time' );

		CFG.addNumericSlider(
			'ipc', 'Infection patterns count', 10, {min:2, max:21, step:1, labelStep:4, dotStep:1, internal:true},
			'The number of infection patterns. Each pattern has a viral shedding curve with specific position of the peak value. Currently the infection pattern is picked individually for each person from the first half of available patterns (i.e. the infection peak is near the beginning of the illness.',
			'health,infection' );
	
		CFG.addNumericListSlider(
			'is', 'Infection step', 50, {values:[1,2,3,5,10,20,50,100,200,500,1000], unit: 'frame(s)', internal:true},
			'The number of animation frames used to check the whole population. If the value is 1, then all people are checked every frame. This may affect the performance badly in case of large but concentrated population. Distributing the check over higher number of frames, keeps the performance at the cost of some inaccuracy in infection &ndash; if two people meet and go away between their checks, they will not infect each other.',
			'health,infection' );



CFG.addHeader(
	2, 'Immunity', '', '',
	'health,immunity' );

		CFG.addNumericRangeSlider(
			'ims', 'Immune strength', 100, 200, {min:10, max:1000, step:50, labelStep:100, dotStep:100},
			'Initial immune strength of a person. When in contact with infection the strength decreases and when it reaches 0 the person becomes infected.',
			'health,immunity' );

		CFG.addNumericSlider(
			'imrf', 'Immune recovery factor', 2, {min:0, max:100, step:1, labelStep:10, unit:'/h'},
			'Every hour the immune system of a person self-recovers by this value. Larger recovery factors will protect a person against infection, as the decrease caused by the infection will be overcome by the immune system recovery.',
			'health,immunity' );
			
		CFG.addNumericRangeSlider(
			'icf', 'Immune cure factor', 1.0, 1.2, {min:0.5, max:2, step:0.1, labelStep:0.5, dotStep:0.1},
			'Scaling factor of immune strength after cure. Value 1.0 keeps the same immune strength as before the infection. Value 1.2 increates the strength by 20%. Value 0.5 decreases the strength twice.',
			'health,immunity' );

	
CFG.addHeader(
	2, 'Monitoring', '', '',
	'health,tracking' );

		CFG.addBoolean(
			'ioi', 'Health overhead indicator', false, {},
			'If checked, there is overhead indicator showing the health status as colour and as numeric level from OK (no infection), then 1, 2, ... to 10 (higly infected person).',
			'health,debug' );
			
		CFG.addBoolean(
			'ici', 'Health color indicator', false, {},
			'If checked, the skin color of infected people turn reddish depending on the level of the health status.',
			'health,debug' );
			
		CFG.addBoolean(
			'dsvs', 'Viral diagram', false, {internal:true},
			'If checked, shows a diagram of the viral shedding (infection level per time period). Higher values indicate higher probability of infecting nearby people. Vertical lines split the diagram into periods. Curves indicate different infection patterns. Click on the diagram to hide it.',
			'health' );

		CFG.addBoolean(
			'dah', 'Population health', false, {internal:true},
			'If checked, once per second prints in the JS console the number of infected people split into three health categories &ndash; asymptotic (infection level under 20%), medium (between 20% and 60%) and severe (above 60%).',
			'health' );

		CFG.addNumericSlider(
			'dfah', 'Follow person health', -1, {min:-1, max:20, step:1, internal:true, labels:[-1,"no|one",0,0,5,5,10,10,15,15,20,20]},
			'If this parameter cointains an existing person id, then the health status of this person is printed in the JS console. If the value is -1, such printing is turned off. Note, that onlye one of the first 20 persons can be followed.',
			'health,tracking' );

