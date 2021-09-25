//
// Graphics
//	- Style
//	- Nature
//	- Simulation
//	- Monitoring


import * as CFG from './configurator.js';


// GRAPHICS ===================================

CFG.addHeader(
	1, 'Miscallaneous', 'misc',
	'Prameters controlling the graphics and other miscallaneous features.',
	'misc,route,tracking,home,house,apartment,office,people,navmesh,floor,route,elevator,rotation,graphics,debug' );


CFG.addHeader(
	2, 'Graphics', '', '',
	'misc,graphics'  );

		CFG.addBoolean(
			'daw', 'All white', false, {},
			'If checked, all buildings, trees and the ground are white. People colours are not affected.',
			'misc,graphics' );
			
		CFG.addBoolean(
			'cs', 'Cartoon style', false, {},
			'If checked, people, houses and trees are drawn in cartoon style &ndash white with heavy contrast shading.',
			'misc,graphics' );
			
		CFG.addBoolean(
			'pas', 'Pixel art style', false, {},
			'If checked, the image is pixelated into blocks of 8×8 pixels. This simulates a retro style animation.',
			'misc,graphics' );

		CFG.addBoolean(
			'dri', 'Renderer info', false, {},
			'If checked, shows renderer info (once per 10000 frames) in the JS console &ndash; number of geometries, textures, calls, lines, points and triangles.',
			'misc,graphics' );

CFG.addHeader(
	2, 'Rotation', '', '',
	'misc,rotation'  );

		CFG.addBoolean(
			'dar', 'Auto rotate', false, {fav:true},
			'If checked, the scene rotates continuously with speed defined by <em>Auto rotate speed</em>. The user can still use the mouse to rotate manually. If not checked, the scene does not move by itself.',
			'misc,rotation' );

		CFG.addNumeric(
			'dars', 'Auto rotate speed', 0.3, {min:0, max:1, step:0.1, unit:'rad/s', offset: 7},
			'The speed of automatic rotation measure in radians per second. The value is effective only if <em>Auto rotate</em> is checked, otherwise it has no effect.',
			'misc,rotation' );


CFG.addHeader(
	2, 'Navmeshes', '',
	'A navigational mesh (navmesh) is a structure defining locations and paths where people can walk. These parameters are used to visualize the navmesh.',
	'misc,navmesh,floor,route,elevator,debug' );

		CFG.addPercentage(
			'dnmo', 'Navmesh opacity', 0, {min:0, max:1, step:0.25},
			'Percentage of opacity of the navmesh &ndash; crimson and orange areas showing locations of rooms, elevators, checkpoints, etc. At 100% the navmesh is fully opaque, while at 0% it is fully transparent. Navmeshes are shown on top of buildings and other 3D objects.',
			'misc,navmesh,debug' );
			
		CFG.addBoolean(
			'dnmsf', 'Navmesh floors', false, {},
			'If checked, generates images of navmesh rooms at the floor level. However, they are shown only if <em>Navmesh opacity</em> is not 0%.',
			'misc,navmesh,floor,debug' );

		CFG.addBoolean(
			'dnmsl', 'Navmesh routes', false, {},
			'If checked, generates images of navmesh routes. However, they are shown only if <em>Navmesh opacity</em> is not 0%.',
			'misc,navmesh,route,debug' );

		CFG.addBoolean(
			'dnmse', 'Navmesh elevators', false, {},
			'If checked, generates images of navmesh elevators. However, they are shown only if <em>Navmesh opacity</em> is not 0%.',
			'misc,navmesh,elevator,debug' );



CFG.addHeader(
	2, 'Routes', '', '',
	'misc,route,tracking,home,house,apartment,office,people'  );

		CFG.addBoolean(
			'dsr', 'Show route', false, {},
			'If checked, show the route of each person as a sequence of arrows.',
			'misc,route,tracking' );

		CFG.addBoolean(
			'ddr', 'Print route', false, {},
			'If checked, prints the route of each person in the JS console. This parameter is checked when there are a few people, preferable exactly one, i.e. <em>Agent count</em>=1.',
			'misc,route,tracking' );

		CFG.addBoolean(
			'dsd', 'Show directions', false, {},
			'If checked, prints the directions and axes outside the city boundary. The orientation is as if the city is looked from below.',
			'misc,route' );

		CFG.addBoolean(
			'dshtwa', 'Home-to-work arrow', false, {},
			'If checked, an arrow is generated for each person pointing from home to office location.',
			'misc,home,house,apartment,office,route,tracking' );

		CFG.addNumeric(
			'drpa', 'Routes per person', 1, {min:1, max:200, step:1},
			'The number of routes generated for each person. Independent on the value, onle one of the routes is used. THe others only indicate what possibilities exists. This parameter is often used with <em>Show route</em> checked and <em>Agent count</em>=1.',
			'misc,route,people' );



CFG.addHeader(
	2, 'Configurator', '',
	'This section contains parameters that configure the configurator itself. They are not used by the simulator.',
	'misc,config'  );

		CFG.addBoolean(
			'cfg-si', 'Show info', true, {config: true},
			'If checked, each configuraiton parameter is accompanied by short description. This makes the page longer, but more suitable for novice users. If unchecked, these descriptions are hidden and the page is much shorter.',
			'misc,config' );
