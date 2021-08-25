//
// Graphics
//	- Style
//	- Nature
//	- Simulation
//	- Monitoring


import * as CFG from './configurator.js';


// GRAPHICS ===================================

CFG.addHeader(
	1, 'Graphics', 'graphics',
	'Prameters controlling the graphics and style.' );


// PEOPLE.STYLE ===================================

CFG.addHeader(
	2, 'Style' );

CFG.addBoolean(
	'daw', 'All white', false, {},
	'If checked, all buildings, trees and the ground are white. People colours are not affected.' );
	
CFG.addBoolean(
	'cs', 'Cartoon style', false, {},
	'If checked, people, houses and trees are drawn in cartoon style &ndash white with heavy contrast shading.' );

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

CFG.addBoolean(
	'dar', 'Auto rotate', false, {},
	'If checked, the scene rotates continuously with speed defined by <em>Auto rotate speed</em>. The user can still use the mouse to rotate manually. If not checked, the scene does not move by itself.' );

CFG.addNumeric(
	'dars', 'Auto rotate speed', 0.3, {min:0, max:1, step:0.1, unit:'rad/s', offset: 7},
	'The speed of automatic rotation measure in radians per second. The value is effective only if <em>Auto rotate</em> is checked, otherwise it has no effect.' );



// GRAPHICS.NATURE ===================================

CFG.addHeader(
	2, 'Nature' );

CFG.addNumericList(
	'su', 'Sun', 0, {values:[0,'no',1,'static',2,'dynamic']},
	'The motion of sun. <em>No</em> indicates there is no sun and light comes from everywhere. <em>Static</em> means the sun does not move, but stays as a position in the sky, defined by <em>STATIC SUN POSITION</em>. When the sun is <em>Dynamic</em>, it moves around the city, simulating day-night cycles.' );

CFG.addTime(
	'sspm', 'Static sun position', CFG.timeMs(10,0,0), {min:CFG.timeMs(0,0,0), max:CFG.timeMs(23,59,0), step:CFG.timeMs(0,30,0),},
	'Position of the sun when <em>sun = static</em> measured as time of the day. The sun stays at this position, affecting shadows and color of sunlight.' );

CFG.addTime(
	'srm', 'Sunrise', CFG.timeMs(6), {min:CFG.timeMs(1), max:CFG.timeMs(11), step:CFG.timeMs(0,0,1),},
	'Time of the sunrise. At sunrise the sun steps above the horizon. Together with <em>sunset</em> it defines the day-night cycle.' );

CFG.addTime(
	'ssm', 'Sunset', CFG.timeMs(18), {min:CFG.timeMs(13), max:CFG.timeMs(23), step:CFG.timeMs(0,0,1),},
	'Time of the sunset. At sunset the sun steps below the horizon. Together with <em>sunrise</em> it defines the day-night cycle.' );

CFG.addNumeric(
	'sha', 'Sun angle', 30, {min:0, max:360, step:15, unit:'&deg;'},
	'Angle (in degrees) of how the sun path in the sky is horizontally rotated in respect to the ground. This can be used to adjust North, East, South and West directions. Angles 0&deg;, 90&deg;, 180&deg;, 270&deg; and 360&deg; will make the sun trajectory aligned with the city streets.' );

CFG.addBoolean(
	'dspg', 'Manual sun', false, {},
	'If checked, adds a control for manually changing the sun position. This affects lightings and shadows (if they are turned on). The position is set as hours &ndash; i.e. 18.5 corresponds to 18:30.' );
			

// GRAPHICS.SIMULATION ===================================

CFG.addHeader(
	2, 'Simulation' );

CFG.addTime(
	'dts', 'Time speed', CFG.timeMs(0,0,1), {min:CFG.timeMs(0,0,1), max:CFG.timeMs(1,0,0), step:CFG.timeMs(0,0,1),},
	'How much virtual time passes for 1 second of real time. For example, 00:00:01 is for realtime simulation, 00:00:05 is for simulation 5 times faster.' );

CFG.addTime(
	'st', 'Start time', CFG.timeMs(6,20), {min:CFG.timeMs(0,0,0), max:CFG.timeMs(23,59,59), step:CFG.timeMs(0,10,0),},
	'The virtual time at which the simulation starts.' );



// GRAPHICS.MONITORING ===================================

CFG.addHeader(
	2, 'MONITORING' );

CFG.addPercentage(
	'dnmo', 'Navmesh opacity', 0, {min:0, max:1, step:0.25},
	'Percentage of opacity of the navigational mesh (navmesh) &ndash; crimson and orange areas showing locations of rooms, elevators, checkpoints, etc. At 100% the navmesh is fully opaque, while at 0% it is fully transparent. Navmeshes are shown on top of buildings and other 3D objects.' );
	
CFG.addBoolean(
	'dnmsf', 'Navmesh floors', false, {},
	'If checked, generates images of navmesh rooms at the floor level. However, they are shown only if <em>Navmesh opacity</em> is not 0%.' );

CFG.addBoolean(
	'dnmsl', 'Navmesh routes', false, {},
	'If checked, generates images of navmesh routes. However, they are shown only if <em>Navmesh opacity</em> is not 0%.' );

CFG.addBoolean(
	'dnmse', 'Navmesh elevators', false, {},
	'If checked, generates images of navmesh elevators. However, they are shown only if <em>Navmesh opacity</em> is not 0%.' );

CFG.addBoolean(
	'dsd', 'Show directions', false, {},
	'If checked, prints the directions and axes outside the city boundary. The orientation is as if the city is looked from below.' );
CFG.addBoolean(
	'dshtwa', 'Home-to-work arrow', false, {},
	'If checked, an arrow is generated for each person pointing from home to office location.' );

CFG.addBoolean(
	'dsr', 'Show route', false, {},
	'If checked, show the route of each person as a sequence of arrows.' );

CFG.addBoolean(
	'ddr', 'Print route', false, {},
	'If checked, prints the route of each person in the JS console. This parameter is checked when there are a few people, preferable exactly one, i.e. <em>Agent count</em>=1.' );

CFG.addNumeric(
	'drpa', 'Routes per person', 1, {min:1, max:200, step:1},
	'The number of routes generated for each person. Independent on the value, onle one of the routes is used. THe others only indicate what possibilities exists. This parameter is often used with <em>Show route</em> checked and <em>Agent count</em>=1.' );

CFG.addBoolean(
	'dri', 'Renderer info', false, {},
	'If checked, shows renderer info (once per 10000 frames) in the JS console &ndash; number of geometries, textures, calls, lines, points and triangles.' );
