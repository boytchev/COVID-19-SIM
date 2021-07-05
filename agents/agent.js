//
//	class Agent
//		constructor( isAdult, home )
//		getRandomAge( )
//		update()			// do what is doing
//		updateImage()		// do what is doing
//		image()
//		geometry()
//		material()
//		material2()
//		static generateAgeDistributionArrays()
//		debugColor( n )
//
//	class Adult
//		constructor( home )
//
//	class Child
//		constructor( home )
//
//  IMPORTANT
//		Agent colour is used for additional data:
//		- red component = infection level
//		- green component = unused
//		- blue component = unused


var agent_id = 0;

import * as THREE from '../js/three.module.js';

import {AgentBehaviour} from './agentBehaviour.js';
import {Agents} from './agents.js';
import {WorkAddress} from './address.js';
import {/*INFECTION_OVERHEAD_INDICATOR, */AGENT_AGE_YEARS, AGENT_WALKING_SPEED, IMMUNE_STRENGTH, DEBUG_SHOW_HOME_TO_WORK_ARROW, PERCENTAGE_INITIAL_INFECTED, AGENT_HEIGHT_ADULT, DEBUG_FOLLOW_AGENT_HEALTH, AGENT_HEIGHT_CHILD, INFECTION_PATTERNS_COUNT, INFECTION_TOTAL_MS, IMMUNE_RECOVERY_FACTOR, INFECTION_COLOR_INDICATOR, INFECTION_DISTANCE, DEBUG_AGENT_ACTIONS, /*DEBUG_BLOCK_COLOR, */INFECTION_STRENGTH, IMMUNE_CURE_FACTOR} from '../config.js';
import {font} from '../font.js';
import {scene, controls, agents} from '../main.js';
import {Range, drawArrow} from '../core.js';
import {currentTimeMs, previousDayTimeMs, deltaTime, dayTimeMs} from '../objects/nature.js';



/*if( INFECTION_OVERHEAD_INDICATOR )
{	
	var labelGeometry = [];
	for( var i=0; i<=100; i++ )
	{
		var fontGeometry = new THREE.TextBufferGeometry( ''+i+'%', {
				font: font.font,
				size: 0.5,
				height: 0.03,
				curveSegments: 4,
				bevelEnabled: false,
			} );
		fontGeometry.computeBoundingBox();
		fontGeometry.translate( (fontGeometry.boundingBox.min.x-fontGeometry.boundingBox.max.x)/2, 1.9, 0 );
		labelGeometry.push( fontGeometry );
	}
} // if( INFECTION_OVERHEAD_INDICATOR )
*/


class Agent extends AgentBehaviour
{
	
	constructor( isAdult, home )
	{
		super();

		this.sysType = 'Agent';
		this.id = agent_id++;
		
		this.isAdult = isAdult;
		
		// set age and height
		this.age = this.getRandomAge( );
	
		// other things
		this.home = home;
		this.position = home.randomPos();
		this.walkingSpeed = AGENT_WALKING_SPEED.randFloat( );	// in meters/second
		this.walkingTime = 0;
		
		// add agent to block
		this.position.block.agents.push( this );

		this.dailySchedule.reset( this.isAdult );
		
		// work address
		this.work = new WorkAddress();
		this.work.position = this.work.randomPos();
		
		this.infectionLevel = 0;
		this.infectionPattern = undefined;
		this.infectionPeriodMs = undefined;
		this.generalImmuneStrength = IMMUNE_STRENGTH.randFloat();
		this.currentImmuneStrength = this.generalImmuneStrength;
		
		if( DEBUG_SHOW_HOME_TO_WORK_ARROW )
			drawArrow( this.home.center, this.work.center );

		if( Math.random() < PERCENTAGE_INITIAL_INFECTED )
			this.infect();
		
	} // Agent.constructor
	
	
	
	update()
	{
		// update infection status
		if( this.infectionPattern!=undefined )
		{
			// agent is infected
			
			// end of infection
			if( currentTimeMs > this.infectionPeriodMs.max )
			{
				this.cure();
			}
			else
			{
				var viralShedding = agents.viralShedding[this.infectionPattern];
				
				var elapsedTime = currentTimeMs-this.infectionPeriodMs.min,
					totalTime = this.infectionPeriodMs.diff(),
					relativeTime = elapsedTime/totalTime;
					
				var infLev = viralShedding.getPointAt( relativeTime ).y;
				this.infectionLevel = 100*infLev;
			}
		}
		else
		{
			// agent is not infected

			// recovery of immune system
			this.currentImmuneStrength = Math.min( this.currentImmuneStrength * (1+IMMUNE_RECOVERY_FACTOR*deltaTime), this.generalImmuneStrength );
			
			// get a list of agents in the same block
			var otherAgents = this.position.block.agents;

			// if there is infected agent, which is too close, then consider infection
			for( var otherAgent of otherAgents )
			{				
				// skip if the other agent is healthy
				if( otherAgent.infectionPattern == undefined ) continue;
				
				// skip if the other agent is on a different floor
				if( otherAgent.position.y != this.position.y ) continue;

				// skip if the other agent is too close in X direction
				var distanceX = Math.abs( otherAgent.position.x - this.position.x );
				if( distanceX > INFECTION_DISTANCE ) continue;

				// skip if the other agent is too close in Z direction
				var distanceZ = Math.abs( otherAgent.position.z - this.position.z );
				if( distanceZ > INFECTION_DISTANCE ) continue;
				
				// calculation how strong [0,1] is the infection process depending on distance
				var infectionStrength = INFECTION_STRENGTH * Math.cos( distanceX/INFECTION_DISTANCE * Math.PI/2 ) * Math.cos( distanceZ/INFECTION_DISTANCE * Math.PI/2 );
				
				// calculate how much infection [0,100] is transferred in the actual time slot
				var infectionTransfer = infectionStrength * otherAgent.infectionLevel * deltaTime;
				
				this.currentImmuneStrength -= infectionTransfer;
				if( this.currentImmuneStrength < 0 )
				{
					this.infect();
					break;
				}
				
			} // for j
			
		}
		

		// if a new day has started, reset schedule 
		if( previousDayTimeMs > dayTimeMs )
		{
			this.dailySchedule.reset( this.isAdult );
		}
		
		if( DEBUG_AGENT_ACTIONS==this.id )
		{
			if( this.doing!=this.lastDoing )
			{
				this.lastDoing = this.doing;
				console.log(msToString(dayTimeMs),this.doing.name);
			}
		}
		
		if( DEBUG_FOLLOW_AGENT_HEALTH==this.id )
		{
			if( this.infectionPattern==undefined )
				console.log('agent №'+this.id,'is healthy',(100*this.currentImmuneStrength/this.generalImmuneStrength).toFixed(1)+'%');
			else
				console.log('agent №'+this.id,'is infected',this.infectionLevel.toFixed(1)+'%');
		}
		
		// do what the agen has to do
		this.doing();
		
	} // Agent.update
	
/*

	updateImage()
	{
		this.mesh.position.copy( this.position.vector() );
		
		if( this.doing == this.AGENT_SLEEPING_AT_HOME )
			this.mesh.rotation.x = THREE.Math.lerp( this.mesh.rotation.x, Math.PI/2, 0.1 );
		else
			this.mesh.rotation.x = THREE.Math.lerp( this.mesh.rotation.x, 0, 0.1 );
		
		if( INFECTION_OVERHEAD_INDICATOR )
		{
			this.mesh.children[0].rotation.y = controls.getAzimuthalAngle();
		}
		
	} // Agent.updateImage
*/

	
	debugColor(n)
	{
//TODO		this.mesh.material = AgentDebugMaterial[n];
	}
	
	
	getRandomAge( )
	{
		var index = this.isAdult ? AGENT_AGE_YEARS.max : 17,
			step = this.isAdult ? 64 : 16,			
			probe = this.isAdult ? Agent.adultsCensus[AGENT_AGE_YEARS.max]*Math.random() : Agent.childrenCensus[17]*Math.random(),
			census = this.isAdult ? Agent.adultsCensus : Agent.childrenCensus;

		while( step )
		{
			if( census[index-step] > probe )
				index -= step;
			step >>= 1;
		}

		return index;
		
	} // Agent.getRandomAge
	
	
	
	static generateAgeDistributionArrays( )
	{
		// generate an array uof age distribution, used to
		// pick randomly an age of an agent
		
		Agent.childrenCensus = [];
		Agent.adultsCensus = [];
			
		Agent.childrenCensus[-1] = 0;
		Agent.adultsCensus[17] = 0;

		for( var age = AGENT_AGE_YEARS.min; age <= AGENT_AGE_YEARS.max; age++ )
		{
			var count = 0.5 + 0.5*Math.cos(age/30-0.3);
			
			if( age<18 )
				Agent.childrenCensus[age] = Agent.childrenCensus[age-1] + count;
			else
				Agent.adultsCensus[age] = Agent.adultsCensus[age-1] + count;
		}
	} // Agent.generateAgeDistributionArrays
	
	
	infect()
	{
		this.infectionLevel = 0;
		this.infectionPattern = THREE.Math.randInt( 1, Math.round(INFECTION_PATTERNS_COUNT/2) );
		this.infectionPeriodMs = new Range( currentTimeMs, currentTimeMs + INFECTION_TOTAL_MS.randFloat() );
		
		//console.log('agent №'+this.id,'is infected');
	}
	
	cure()
	{
		this.infectionLevel = 0;
		this.infectionPattern = undefined;

		// general immune strength increases after cure
		this.generalImmuneStrength = Math.min( this.generalImmuneStrength * IMMUNE_CURE_FACTOR.randFloat(), IMMUNE_STRENGTH.max );
		this.currentImmuneStrength = this.generalImmuneStrength;
		
		//console.log('agent №'+this.id,'is cured');
	}
	
} // Agent



export class Child extends Agent
{
	
	constructor( home )
	{
		super( false, home );

		this.sysType = 'Child';
		
		this.height = THREE.Math.mapLinear( this.age, 0, 17, AGENT_HEIGHT_CHILD.min, AGENT_HEIGHT_CHILD.max );
		//TODO-TEMP this.height = this.height * THREE.Math.randFloat( 0.8, 1.3 );

	} // Child.constructor
} // Child



export class Adult extends Agent
{
	
	constructor( home )
	{
		super( true, home );

		this.sysType = 'Adult';

		this.height = THREE.Math.mapLinear( this.age, 18, 100, AGENT_HEIGHT_ADULT.min, AGENT_HEIGHT_ADULT.max );
		//TODO-TEMP this.height = this.height * THREE.Math.randFloat( 0.9, 1.1 );
		
	} // Adult.constructor
} // Adult



Agent.generateAgeDistributionArrays();