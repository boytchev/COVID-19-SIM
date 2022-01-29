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
import {WorkAddress} from './address.js';
import {AGENT_AGE_YEARS, AGENT_WALKING_SPEED, IMMUNE_STRENGTH, DEBUG_SHOW_HOME_TO_WORK_ARROW, PERCENTAGE_INITIAL_INFECTED, AGENT_HEIGHT_ADULT, DEBUG_FOLLOW_AGENT_HEALTH, AGENT_HEIGHT_CHILD, INFECTION_PATTERNS_COUNT, INFECTION_TOTAL_MS, IMMUNE_RECOVERY_FACTOR, INFECTION_COLOR_INDICATOR, INFECTION_DISTANCE, DEBUG_AGENT_ACTIONS, INFECTION_STRENGTH, IMMUNE_CURE_FACTOR, INFECTION_STEP, ADULT_MASK_ON, ADULT_MASK_OFF, CHILD_MASK_ON, CHILD_MASK_OFF, MASK_INHALE_EFFECTIVENESS, MASK_EXHALE_EFFECTIVENESS} from '../config.js';
import {agents, frame} from '../main.js';
import {round, Range, drawArrow, msToString} from '../core.js';
import {currentTimeMs, previousDayTimeMs, deltaTime, dayTimeMs} from '../nature/nature.js';



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
		
		// mask (scaling 10 is because mask on/off param are from 0 to 10)
		this.mask = false;
		this.maskOn = 10 * (isAdult ? ADULT_MASK_ON.randFloat() : CHILD_MASK_ON.randFloat());
		this.maskOff = 10 * (isAdult ? ADULT_MASK_OFF.randFloat() : CHILD_MASK_OFF.randFloat());
		
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
		
		this.oldWalkQuants = -1;
		
		if( DEBUG_SHOW_HOME_TO_WORK_ARROW )
			drawArrow( this.home.center, this.work.center );

		if( Math.random() < PERCENTAGE_INITIAL_INFECTED )
			this.infect();
		
	} // Agent.constructor
	
	
	
	update()
	{
		var oldInfectionLevel = this.infectionLevel;
		
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
//if(this.id==0)
//{
//	console.log('relT=',relativeTime.toFixed(5),'inf=',infLev.toFixed(5),'total=',totalTime);
//}	
			}
		}
		else
		{
			// agent is not infected

			// recovery of immune system
			this.currentImmuneStrength = Math.min( this.currentImmuneStrength * (1+IMMUNE_RECOVERY_FACTOR/3600*deltaTime), this.generalImmuneStrength );
			
			// get a list of agents in the same block
			var otherAgents = this.position.block.agents;

			// if there is infected agent, which is too close, then consider infection
			for( var i = frame%INFECTION_STEP; i<otherAgents.length; i+=INFECTION_STEP )
			{				
				var otherAgent = otherAgents[i];
				
				// skip if the other agent is healthy
				if( otherAgent.infectionPattern == undefined ) continue;
				
				// skip if the other agent is on a different floor
				if( otherAgent.position.y != this.position.y ) continue;

				// skip if the other agent is not too close in X direction
				var distanceX = Math.abs( otherAgent.position.x - this.position.x );
				if( distanceX > INFECTION_DISTANCE ) continue;

				// skip if the other agent is not too close in Z direction
				var distanceZ = Math.abs( otherAgent.position.z - this.position.z );
				if( distanceZ > INFECTION_DISTANCE ) continue;
				
				// calculation how strong [0,1] is the infection process depending on distance
				var infectionStrength = INFECTION_STRENGTH * Math.cos( distanceX/INFECTION_DISTANCE * Math.PI/2 ) * Math.cos( distanceZ/INFECTION_DISTANCE * Math.PI/2 );
				
				// calculate how much infection [0,100] is transferred in the actual time slot
				var infectionTransfer = infectionStrength * otherAgent.infectionLevel * deltaTime * INFECTION_STEP;
				
				// if this agent has mask, consider its effectiveness
				if( this.mask )
					infectionTransfer *= 1-MASK_INHALE_EFFECTIVENESS;
					
				// if the other agent has a mask, consider its effectiveness
				if( otherAgent.mask )
					infectionTransfer *= 1-MASK_EXHALE_EFFECTIVENESS;
				
				this.currentImmuneStrength -= infectionTransfer;
				if( this.currentImmuneStrength < 0 )
				{
					this.infect();
					break;
				}
				
			} // for j
		}
		
		// decide whether to put on mask or take off mask
		if( oldInfectionLevel < this.infectionLevel )
		{
			// infection increases, it not masked, check whether to put mask on
			if( !this.mask && this.infectionLevel >= this.maskOn )
				this.mask = true;
		}
		else
		{
			// infection decreases, if masked, check whether to take mask off
			if( this.mask && this.infectionLevel <= this.maskOff )
				this.mask = false;
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

		
		// do what the agen has to do
		this.doing();
		
	} // Agent.update
	
	
	debugColor(n)
	{
//TODO		this.mesh.material = AgentDebugMaterial[n];
	}
	
	
	getRandomAge( )
	{
//		console.log('--> get random age for',this.isAdult?'adult':'child');
		
//		var minIndex = ,
//			maxIndex = AGENT_AGE_YEARS.max;
			
		var minIndex, maxIndex;
		
		if( this.isAdult )
		{
			minIndex = Math.max( 18, AGENT_AGE_YEARS.min );
			maxIndex = Math.max( 18, AGENT_AGE_YEARS.max );
		}
		else
		{
			minIndex = Math.min( 17, AGENT_AGE_YEARS.min );
			maxIndex = Math.min( 17, AGENT_AGE_YEARS.max );
		}
		
		var index = maxIndex,
			probe = THREE.Math.randFloat(Agent.census[minIndex-1],Agent.census[maxIndex]);
	
		var lowIndex = minIndex;
		while( lowIndex<index )
		{
			var mid = Math.floor((lowIndex+index)/2);
			if( Agent.census[mid] < probe )
				lowIndex = mid+1;
			else
				index = mid;
		}
		

//console.log('age ->',index);
		return index;
		
	} // Agent.getRandomAge

	_getRandomAge( )
	{
		console.log('get random age for',this.isAdult?'adult':'child');
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

//console.log('age ->',index);
		return index;
		
	} // Agent.getRandomAge
	
	
	
	static generateAgeDistributionArrays( )
	{
		// generate an array uof age distribution, used to
		// pick randomly an age of an agent
		
		Agent.census = [];
		Agent.census[-1] = 0;

		for( var age = 0; age <= AGENT_AGE_YEARS.max; age++ )
		{
			var count = 0.5 + 0.5*Math.cos(age/30-0.3);
			Agent.census[age] = Agent.census[age-1] + count;
		}
		
		//console.log('Agent.census');
		//console.log(Agent.census);
	} // Agent.generateAgeDistributionArrays
	
	
	infect()
	{
		var timeSpan = INFECTION_TOTAL_MS.randFloat(),
			elepasedTime = 0*timeSpan*Math.random()*0.5;
			
		this.infectionLevel = 0;
		this.infectionPattern = THREE.Math.randInt( 1, Math.round(INFECTION_PATTERNS_COUNT/2) );
		this.infectionPeriodMs = new Range( currentTimeMs - elepasedTime, currentTimeMs - elepasedTime + timeSpan  );

		if( this.id == DEBUG_FOLLOW_AGENT_HEALTH )
			console.log('agent №'+this.id,'is infected from',msToString(this.infectionPeriodMs.min),'to',msToString(this.infectionPeriodMs.max));
	}
	
	cure()
	{
		this.infectionLevel = 0;
		this.infectionPattern = undefined;

		// general immune strength increases after cure
		this.generalImmuneStrength = Math.min( this.generalImmuneStrength * IMMUNE_CURE_FACTOR.randFloat(), IMMUNE_STRENGTH.max );
		this.currentImmuneStrength = this.generalImmuneStrength;
		
		if( this.id == DEBUG_FOLLOW_AGENT_HEALTH )
			console.log('agent №'+this.id,'is cured');
	}
	
} // Agent



export class Child extends Agent
{
	
	constructor( home )
	{
		super( false, home );

		this.sysType = 'Child';
		
		this.height = THREE.Math.mapLinear( this.age, 0, 17, AGENT_HEIGHT_CHILD.min, AGENT_HEIGHT_CHILD.max );
		this.height = this.height * THREE.Math.randFloat( 0.85, 1.15 );

	} // Child.constructor
} // Child



export class Adult extends Agent
{
	
	constructor( home )
	{
		super( true, home );

		this.sysType = 'Adult';

		this.height = AGENT_HEIGHT_ADULT.randFloat();
		
	} // Adult.constructor
} // Adult



Agent.generateAgeDistributionArrays();