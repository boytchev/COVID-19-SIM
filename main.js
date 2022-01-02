export var clock = new THREE.Clock();



const measure_usedJSHeapSize = window.performance.memory?.usedJSHeapSize;
const measure_totalJSHeapSize = window.performance.memory?.totalJSHeapSize;
export function measure( name )
{
	if( window.performance.memory === undefined ) return;
	
	if( name.length<12 ) name += '\t';
	if( name.length<9 ) name += '\t';
	
	console.log(
		name+'\t',
		clock.getDelta().toFixed(3), 's',
		(100*window.performance.memory.usedJSHeapSize/window.performance.memory.jsHeapSizeLimit).toFixed(1)+'% of memory',

//		Math.round( (window.performance.memory.usedJSHeapSize-measure_usedJSHeapSize)/1024/1024), 'of',
//		'total', Math.round( (window.performance.memory.totalJSHeapSize-measure_totalJSHeapSize)/1024/1024), 'MB',
		//'limit', Math.round(window.performance.memory.jsHeapSizeLimit/1024/1024), 'MB',
	);
}

measure( 'start' );


import * as THREE from './js/three.module.js';
import * as dat from './js/dat.gui.module.js';
import {OrbitControls} from './js/OrbitControls.js';
//import {FirstPersonControls} from './js/FirstPersonControls.js';
import {PIXEL_ART_STYLE, SAFE_MODE} from './config.js';
import {deltaTimeReal} from './nature/nature.js';

var container = document.getElementById( 'container' );

//var stats = new Stats();
//var statsCalls = stats.addPanel( new Stats.Panel( 'calls', '#ff8', '#221' ) );
//var statsTrigs = stats.addPanel( new Stats.Panel( '△', '#ff8', '#221' ) );
//	container.appendChild( stats.dom );


export var renderer = new THREE.WebGLRenderer( { antialias: PIXEL_ART_STYLE?false:true } );
	renderer.setPixelRatio( window.devicePixelRatio/(PIXEL_ART_STYLE?8:1) );
	if( PIXEL_ART_STYLE ) renderer.domElement.style.imageRendering = 'pixelated';
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	
export var scene = new THREE.Scene();

var currentTime_elem = document.getElementById('time'),
	currentFps_elem = document.getElementById('fps'),
	agents_elem = document.getElementById('agents');


import './font.js';

import {DEBUG_FORM_A_LINE, DEBUG_RANDOM_SEED, DEBUG_SUN_POSITION_GUI, EARTH_SIZE, GROUND_SIZE, DEBUG_AUTOROTATE, DEBUG_AUTOROTATE_SPEED, DEBUG_FOLLOW_AGENT, DEBUG_NAVMESH_SHOW_MESHES, VR, DEBUG_TIME_SPEED, DEBUG_RENDERER_INFO, DEBUG_FOLLOW_AGENT_HEALTH, DEBUG_AGENT_LOCATIONS, DEBUG_AGENT_HEALTH, DEBUG_ALLOW_UNDERGROUND} from './config.js';
import {msToString, round} from './core.js';
import {Nature, currentTimeMs, simulationPlaying, toggleSimulationPlayPause} from './nature/nature.js';

import {Textures} from './textures/textures.js';
import {Blocks} from './objects/blocks.js';
import {Trees} from './nature/trees.js';
import {Crossing,Crossings} from './objects/crossings.js';
import {Agents, agentsAtHome, agentsAtWork, agentsOutside, agentsInfected} from './agents/agents.js';
import {NavMesh} from './agents/navmesh.js';
import {Buildings} from './objects/buildings.js';

		
if( DEBUG_RANDOM_SEED )
	Math.seedrandom( DEBUG_RANDOM_SEED );

export var guiObject = {sunPos:10};
if( DEBUG_SUN_POSITION_GUI )
{
	var gui = new dat.GUI();
		gui.remember( guiObject );
		gui.add( guiObject, 'sunPos' ).min(0).max(24).step(0.01).name('Sun pos (h)');
}

export var camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, EARTH_SIZE );
	camera.position.set( 10*GROUND_SIZE, 3*GROUND_SIZE, 10*GROUND_SIZE );
	camera.position.set( -GROUND_SIZE/6, GROUND_SIZE/15, -GROUND_SIZE/5 );
	//camera.position.set( 0.01+0*GROUND_SIZE/0.8, GROUND_SIZE*2, 0 );
	if( DEBUG_FORM_A_LINE )
		camera.position.set( 0, 4, GROUND_SIZE/3 );
	else
		camera.position.set( GROUND_SIZE*2, GROUND_SIZE/2, GROUND_SIZE/1 );
	
	camera.position.set( 0, 60, 60 );
			
export var controls = new OrbitControls( camera, renderer.domElement );
	if( !DEBUG_ALLOW_UNDERGROUND ) controls.maxPolarAngle = Math.PI * 0.495;
	controls.minDistance = 2;
	controls.maxDistance = 1.5*GROUND_SIZE;
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.rotateSpeed = 0.3;
	controls.panSpeed = 0.7;
	controls.screenSpacePanning = false;
	controls.autoRotate = DEBUG_AUTOROTATE;
	controls.autoRotateSpeed = DEBUG_AUTOROTATE_SPEED;
	controls.listenToKeyEvents( window );

//	controls.lookAt( 0, 12, 0 );
	controls.update( deltaTimeReal );
/* 	controls.addEventListener( 'change', function(){
		if( !simulationPlaying )
		{
			renderer.render(scene, camera);
		}
	} );
 */
export var navmesh = new NavMesh();		measure( 'navmesh' );
export var textures = new Textures();	measure( 'textures' );
export var blocks = new Blocks();		measure( 'blocks' );
export var buildings = new Buildings();	measure( 'buildings' );
var trees = new Trees();				measure( 'trees' );
var crossings = new Crossings();		measure( 'crossings' );
export var agents = new Agents();		measure( 'agents' );
var nature = new Nature();				measure( 'nature' );


agents_elem.innerHTML = agents.agents.length;

if( DEBUG_NAVMESH_SHOW_MESHES )
{
	navmesh.imageMesh();
}

window.onresize = function ()
{
	let width = window.innerWidth;
	let height = window.innerHeight;
		
	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize( width, height );
}; // onresize

var user, rightController,
	move = false,
	v = new THREE.Vector3();

// setup time
				
var oncePerSecond_timeMs = 0,
	oncePerSecond_frames = 0;
	
//var snd = new  Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
	
function oncePerSecond()
{

	currentTime_elem.innerHTML = msToString( currentTimeMs );
	
	if( oncePerSecond_frames )
		if( simulationPlaying )
			currentFps_elem.innerHTML = '='+round(1000*DEBUG_TIME_SPEED*(frame-oncePerSecond_frames)/(currentTimeMs-oncePerSecond_timeMs),1);
		else
			currentFps_elem.innerHTML = ' N/A';
	
	oncePerSecond_timeMs = currentTimeMs;
	oncePerSecond_frames = frame;
	
		
	if( 0<=DEBUG_FOLLOW_AGENT_HEALTH && DEBUG_FOLLOW_AGENT_HEALTH<agents.agents.length )
	{
		var agent = agents.agents[DEBUG_FOLLOW_AGENT_HEALTH];
		if( agent.infectionPattern==undefined )
			console.log('agent №'+agent.id,'is healthy',(100*agent.currentImmuneStrength/agent.generalImmuneStrength).toFixed(1)+'%');
		else
			console.log('agent №'+agent.id,'is infected',agent.infectionLevel.toFixed(1)+'%');
	}
		
	if( DEBUG_AGENT_LOCATIONS )
	{
		console.log( 'home',agentsAtHome,'\tcommute',agentsOutside,'\twork',agentsAtWork);
	}
	
	if( DEBUG_AGENT_HEALTH )
	{
		console.log( `infected asymp:${agentsInfected[0]}(${Math.round(100*agentsInfected[0]/agents.agents.length)}%), medium:${agentsInfected[1]}(${Math.round(100*agentsInfected[1]/agents.agents.length)}%), severe:${agentsInfected[2]}(${Math.round(100*agentsInfected[2]/agents.agents.length)}%) of ${agents.agents.length}`);
	}
	

} // oncePerSecond
setInterval( oncePerSecond, 1000 );


// main animation cycle
export var frame = 0;
export function animate()
{
	//requestAnimationFrame( animate );

	//statsCalls.update( renderer.info.render.calls, 460  );
	//statsTrigs.update( renderer.info.render.triangles, 460  );
	// mesh.quaternion.copy(camera.quaternion);
	//stats.update();
//if(renderer.xr.isPresenting && (frame%60 == 0) ) snd.play();

	frame++;

	// if( simulationPlaying )
	 // {
		if( !VR || frame%2 )
		{
			nature.update();
			buildings.update();
			agents.update();
		}
	// }

	if( VR )
	{
		// in VR
		if( move && rightController && user )
		{
			rightController.getWorldDirection( v );
								
			v.y = 0;
			v.normalize();
			
			user.position.addScaledVector( v, -10*deltaTimeReal );
		}

		renderer.render(scene, camera); // render all frames in VR mode
	}
	else
	{
		// not in VR
		//controls.update( deltaTimeReal );
		if( frame%6 == 0 ) renderer.render(scene, camera);
	}
	
	
	if (DEBUG_RENDERER_INFO && frame%10000==10)
	{
		console.log( 'renderer.info' );
		console.log( '\tgeometries',renderer.info.memory.geometries );
		console.log( '\ttextures',renderer.info.memory.textures );
		console.log( '\tcalls',renderer.info.render.calls );
		console.log( '\tlines',renderer.info.render.lines );
		console.log( '\tpoints',renderer.info.render.points );
		console.log( '\ttriangles',renderer.info.render.triangles );
	}
} //animate
renderer.setAnimationLoop( animate );


import { VRButton } from './js/VRButton.js';
if( VR )
{
	renderer.xr.enabled = true;
	document.body.appendChild( VRButton.createButton( renderer ) );
	
	camera.position.set( 0, 0, 0 );

	move = false;

	rightController = renderer.xr.getController( 0 );
	rightController.addEventListener( 'selectstart', function(){ move = true; } );
	rightController.addEventListener( 'selectend', function(){ move = false; } );
	rightController.add( new THREE.ArrowHelper( new THREE.Vector3(0,0,-1), new THREE.Vector3(0,0,0), 10, 'red', 1, 0.4 ) );
		
	// подвижен потребител
	user = new THREE.Group();
	user.add( camera );
	user.add( rightController );
	scene.add( user );
}


document.getElementById('playpause').addEventListener( 'click', toggleSimulationPlayPause );
