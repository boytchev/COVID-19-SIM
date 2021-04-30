import * as THREE from './js/three.module.js';
import * as dat from './js/dat.gui.module.js';
import {OrbitControls} from './js/OrbitControls.js';


var container = document.getElementById( 'container' );

//var stats = new Stats();
//var statsCalls = stats.addPanel( new Stats.Panel( 'calls', '#ff8', '#221' ) );
//var statsTrigs = stats.addPanel( new Stats.Panel( '△', '#ff8', '#221' ) );
//	container.appendChild( stats.dom );


export var renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	
export var scene = new THREE.Scene();

var currentTime_elem = document.getElementById('time'),
	currentFps_elem = document.getElementById('fps'),
	agents_elem = document.getElementById('agents');


import './font.js';

import {DEBUG_RANDOM_SEED, DEBUG_SUN_POSITION_GUI, EARTH_SIZE, GROUND_SIZE, DEBUG_AUTOROTATE, DEBUG_AUTOROTATE_SPEED, DEBUG_FOLLOW_AGENT, DEBUG_NAVMESH_SHOW_MESHES, VR, DEBUG_TIME_SPEED, DEBUG_RENDERER_INFO} from './config.js';
import {msToString, round} from './core.js';
import {Nature, currentTimeMs, frame} from './objects/nature.js';

import {Ground} from './objects/ground.js';
import {Textures} from './textures/textures.js';
import {Blocks} from './objects/blocks.js';
import {Trees} from './objects/trees.js';
import {Crossing,Crossings} from './objects/crossings.js';
import {Agents} from './agents/agents.js';
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

export var camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 2*EARTH_SIZE );
	camera.position.set( 10*GROUND_SIZE, 3*GROUND_SIZE, 10*GROUND_SIZE );
	camera.position.set( GROUND_SIZE/1.5, GROUND_SIZE/4, GROUND_SIZE/1.5 );
	camera.position.set( 0.01+0*GROUND_SIZE/0.8, GROUND_SIZE*2, 0 );
	camera.position.set( GROUND_SIZE/2, GROUND_SIZE/10, GROUND_SIZE/3 );
	camera.position.set( -GROUND_SIZE/2, GROUND_SIZE/10, GROUND_SIZE/2 );
	//camera.position.set( 0, 0.26*GROUND_SIZE, 0 );
			
export var controls = new OrbitControls( camera, renderer.domElement );
	controls.maxPolarAngle = Math.PI * 0.495;
	controls.minDistance = 20;
	controls.maxDistance = 1.5*GROUND_SIZE;
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.rotateSpeed = 0.3;
	controls.panSpeed = 0.25;
	controls.screenSpacePanning = false;
	controls.target.set( 0, 0, 0 );
	controls.autoRotate = DEBUG_AUTOROTATE;
	controls.autoRotateSpeed = DEBUG_AUTOROTATE_SPEED;
	controls.update();

export var navmesh = new NavMesh();		//console.log('navmesh\t\t',clock.getDelta());
export var textures = new Textures();		//console.log('textures\t',clock.getDelta());
var ground = new Ground();			//console.log('ground\t\t',clock.getDelta());
export var blocks = new Blocks();			//console.log('blocks\t\t',clock.getDelta());

//randomTarget = pick(blocks.allTrueBlocks).randomPos();
//drawArrow( randomTarget, randomTarget.addY(30) );

export var buildings = new Buildings();	//console.log('buildings\t',clock.getDelta());
var trees = new Trees();			//console.log('trees\t\t',clock.getDelta());
var crossings = new Crossings();	//console.log('crossings\t',clock.getDelta());
export var agents = new Agents();			//console.log('agents\t\t',clock.getDelta());
var nature = new Nature();			//console.log('nature\t\t',clock.getDelta());

agents_elem.innerHTML = 'ppl='+agents.agents.length;

if( DEBUG_FOLLOW_AGENT>=0 && DEBUG_FOLLOW_AGENT<this.agents.agents.length )
{
	var agent = this.agents.agents[DEBUG_FOLLOW_AGENT];
	agent.mesh.material = agent.mesh.material.clone();
	agent.mesh.material.color = new THREE.Color('cornflowerblue');
}

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
	
	
function oncePerSecond()
{
	currentTime_elem.innerHTML = msToString( currentTimeMs );
	
	if( oncePerSecond_frames )
		currentFps_elem.innerHTML = 'fps='+round(1000*DEBUG_TIME_SPEED*(frame-oncePerSecond_frames)/(currentTimeMs-oncePerSecond_timeMs),1);
	
	oncePerSecond_timeMs = currentTimeMs;
	oncePerSecond_frames = frame;
	
} // oncePerSecond
setInterval( oncePerSecond, 1000 );


// main animation cycle
function animate()
{
	//requestAnimationFrame( animate );

	//statsCalls.update( renderer.info.render.calls, 460  );
	//statsTrigs.update( renderer.info.render.triangles, 460  );
	// mesh.quaternion.copy(camera.quaternion);
	//stats.update();

	nature.update();
	agents.update();
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
		/*if( DEBUG_FOLLOW_AGENT<0 ) */controls.update();
		if( frame%6 == 0 ) renderer.render(scene, camera);
	}
	
	
	if (DEBUG_RENDERER_INFO && frame==10)
	{
		console.log( 'renderer.info' );
		console.log( '\tgeometries',renderer.info.memory.geometries );
		console.log( '\ttextures',renderer.info.memory.textures );
		console.log( '\tcalls',renderer.info.render.calls );
		console.log( '\tlines',renderer.info.render.lines );
		console.log( '\tpoints',renderer.info.render.points );
		console.log( '\ttriangles',renderer.info.render.triangles );
	}
	/*
	if( frame%60 == 0 )
	{
		var c = d = 0;
		for( var i in blocks.allTrueBlocks )
		{
			d += blocks.allTrueBlocks[i].agents.length;
			c += blocks.allTrueBlocks[i].agents.length * blocks.allTrueBlocks[i].agents.length;
		}
		console.log(c,'of',d*d,'i.e.', (100*c/d/d).toFixed(1)+'%' );
	}*/
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