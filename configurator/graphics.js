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


CFG.addBoolean(
	'dar', 'Auto rotate', false, {},
	'If checked, the scene rotates continuously with speed defined by <em>Auto rotate speed</em>. The user can still use the mouse to rotate manually. If not checked, the scene does not move by itself.' );

CFG.addNumeric(
	'dars', 'Auto rotate speed', 0.3, {min:0, max:1, step:0.1, unit:'rad/s', offset: 7},
	'The speed of automatic rotation measure in radians per second. The value is effective only if <em>Auto rotate</em> is checked, otherwise it has no effect.' );




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
