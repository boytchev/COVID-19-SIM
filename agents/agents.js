//
//	class Agents
//		constructor()
//		generate( count )
//		update()
//		debugShowAgeDistribution()
//

import * as THREE from '../js/three.module.js';
import {buildings} from '../main.js';
import {Adult, Child} from './agent.js';
import {Address} from './address.js';
import {INFECTION_PATTERNS_COUNT, AGENT_ADULTS_PER_HOUSE, AGENT_MAX_COUNT, IMMUNE_STRENGTH, AGENT_CHILDREN_PER_HOUSE, AGENT_ADULTS_PER_APARTMENT, AGENT_CHILDREN_PER_APARTMENT, DEBUG_CENTER_VIEW_ON_AGENTS, DEBUG_SHOW_AGENTS_AGE_DISTRIBUTION, DEBUG_AGENT_LOCATIONS, DEBUG_AGENT_HEALTH, DEBUG_FOLLOW_AGENT} from '../config.js';


export class Agents
{
	
	constructor( )
	{
		this.sysType = 'Agents';
		
		this.agents = [];

		this.generateInfections();
		
		this.generateAgents( );
				
		if( DEBUG_SHOW_AGENTS_AGE_DISTRIBUTION ) 
			this.debugShowAgeDistribution();
	} // Agents.constructor

	
	
	generateAgents( )
	{
		// generate agents and set their homes
		
		
		// add agents to all houses
		for( var i=0; i<buildings.houses.length; i++ )
		{
			var agentHome = new Address( buildings.houses[i] );
			
			// create adults
			var n = AGENT_ADULTS_PER_HOUSE.randInt();
			for( var j=0; j<n; j++ )
				if( this.agents.length<AGENT_MAX_COUNT )
					this.agents.push( new Adult(agentHome) );
				
			// create children
			var n = AGENT_CHILDREN_PER_HOUSE.randInt();
			for( var j=0; j<n; j++ )
				if( this.agents.length<AGENT_MAX_COUNT )
					this.agents.push( new Child(agentHome) );

			if( this.agents.length>=AGENT_MAX_COUNT ) break;
		}
	
		// add agents to all apartments
		for( var i=0; i<buildings.apartments.length; i++ )
		//for( var floor=0; floor<buildings.apartments[i].floors; floor++ )
		for( var floor=buildings.apartments[i].floors-1; floor>=0; floor-- )
		for( var room=0; room<buildings.apartments[i].rooms.length; room++ )
		{
			var agentHome = new Address( buildings.apartments[i], floor, room );
			
			// create adults
			var n = AGENT_ADULTS_PER_APARTMENT.randInt();
			for( var j=0; j<n; j++ )
				if( this.agents.length<AGENT_MAX_COUNT )
					this.agents.push( new Adult(agentHome) );
			
			// create children
			var n = AGENT_CHILDREN_PER_APARTMENT.randInt();
			for( var j=0; j<n; j++ )
				if( this.agents.length<AGENT_MAX_COUNT )
					this.agents.push( new Child(agentHome) );

			if( this.agents.length>=AGENT_MAX_COUNT ) break;
		}
					
					
		// if no agents are created, but there is request to create, create one in a random block
		if( this.agents.length==0 && AGENT_MAX_COUNT )
		{
			var agentHome = new BlockAddress( );
			this.agents.push( new Adult(agentHome) );
		}
		
		
		if( DEBUG_CENTER_VIEW_ON_AGENTS && this.agents.length )
		{	// move camera target to the center of all agents
			var position = new Pos( 0, 0 );
			
			for( var i=0; i<this.agents.length; i++ )
				position = position.add( this.agents[i].position );
			
			controls.target.set( position.x/this.agents.length, 0, position.z/this.agents.length );	
		}
		

		var statAdults = 0,
			statChildren = 0;
		for( var i=0; i<this.agents.length; i++)
			if( this.agents[i].isAdult )
				statAdults++;
			else
				statChildren++;
		console.log(statAdults+' adults,',statChildren+' children');
	} // Agents.generateInRandomBlock



	update()
	{
		if( this.agents.length )
		{	
			if( DEBUG_AGENT_LOCATIONS )
			{
				var agentsAtHome = 0,
					agentsAtWork = 0,
					agentsOutside = 0,
					agentsOther = 0;
			}

			if( DEBUG_AGENT_HEALTH )
			{
				var agentsInfected = 0;
			}
			
			// update positions and images of agents
			for( var i=0; i<this.agents.length; i++ )
			{
				var agent = this.agents[i];
				agent.update();
				agent.updateImage();
				
				if( i==DEBUG_FOLLOW_AGENT )
				{
					var pos = agent.position.vector(),
						dVect = pos.sub( controls.target );
					var t = currentTimeMs/DEBUG_TIME_SPEED/5000,
						q = 0.6+0.5*Math.sin(t/1.4),
						r = 25+17*Math.sin(t/2);
					var dx = r*Math.sin(t)*Math.cos(q),
						dy = r*Math.sin(q),
						dz = r*Math.cos(t)*Math.cos(q);

					controls.target.set( 
						THREE.Math.lerp(controls.target.x,agent.position.x,0.022),
						THREE.Math.lerp(controls.target.y,agent.position.y,0.022),
						THREE.Math.lerp(controls.target.z,agent.position.z,0.022)
					);
					camera.position.set( controls.target.x+dx, controls.target.y+dy, controls.target.z+dz ); 
//console.log(controls.target.x.toFixed(5));					
				} // if( i==DEBUG_FOLLOW_AGENT )
				
				if( DEBUG_AGENT_LOCATIONS )
				{
					switch( agent.doing )
					{
						case agent.AGENT_DOING_NOTHING: 		
								agentsOther++;
								break;
						case agent.AGENT_WORKING_IN_OFFICE: 	
						case agent.AGENT_WALKING_IN_OFFICE:
								agentsAtWork++;
								break;
						case agent.AGENT_STAYING_AT_HOME: 	
						case agent.AGENT_WALKING_AT_HOME: 	
						case agent.AGENT_SLEEPING_AT_HOME:
								agentsAtHome++;
								break;
						case agent.AGENT_WALKING_ROUTE:
								agentsOutside++;
								break;
						default:
								console.error(	'Uncounted action '+this.agents[i].doing.name+' [1813]' );
					}
				} // if( DEBUG_AGENT_LOCATIONS )
				
				if( DEBUG_AGENT_HEALTH )
				{
					if( agent.infectionPattern != undefined )
						agentsInfected++;
				} // if( DEBUG_AGENT_HEALTH )
					
			} // for agents

			if( DEBUG_AGENT_LOCATIONS )
			{
				console.log( 'home',agentsAtHome,'\tcommute',agentsOutside,'\twork',agentsAtWork);
			}
			
			if( DEBUG_AGENT_HEALTH )
			{
				console.log( 'infected',agentsInfected,'of',agents.agents.length);
			}
			
//			console.log(this.agents[0].position.block==null,this.agents[0].doing);
		}
	} // Agents.update

	
	
	debugShowAgeDistribution()
	{
		var years = [];
		for( var i=0; i<this.agents.length; i++ )
		{
			var age = Math.floor( this.agents[i].age );
			years[age] = (years[age] || 0)+1;
		}

		
		var W = window.innerWidth-100,
			H = window.innerHeight-100;
			
		var canvas = document.createElement( 'canvas' );
			canvas.width = W;
			canvas.height = H;
		
		var ctx = canvas.getContext( '2d' );
			ctx.fillStyle = 'white';
			ctx.fillRect( 0, 0, W, H );	
		

		var dX = (W-40)/AGENT_AGE_YEARS.max,
			dY = years.reduce(function(a, b) {return Math.max(a, b)});
			
		for( var i=AGENT_AGE_YEARS.min; i<=AGENT_AGE_YEARS.max; i++ )
		{
			var columnHeight = (years[i]||0)/dY*(H-40);
			ctx.fillStyle = 'cornflowerblue';
			ctx.fillRect( 20+dX*i, H-20-columnHeight, dX, columnHeight );	
			
			var pplCount = dY*(0.5+0.5*Math.cos(i/30-0.3));
			columnHeight = pplCount/dY*(H-40);
			ctx.fillStyle = 'crimson';
			ctx.fillRect( 20+dX*i+dX/4, H-20-columnHeight, dX/2, columnHeight );	
			
		}
		
		document.body.appendChild( canvas );
		canvas.style = "position:fixed; top:50px; left:50px; z-index:120000; border:solid 1px black;";
		console.log( 'agents=',this.agents.length );
		console.log(dY);
	} // Agents.debugShowAgeDistribution



	generateInfections()
	{
		this.viralShedding = [];
		
		// generate infection pattern for peak day at 10%, 20%, ... 90%
		var totalDays = INFECTION_PATTERNS_COUNT+1;
		for( var i = 0; i<INFECTION_PATTERNS_COUNT; i++ )
		{
			var peakDay = i+1;
			
			this.viralShedding.push( new THREE.SplineCurve( [
				new THREE.Vector2( 0, 0 ),
				new THREE.Vector2( peakDay/2, 0.15 ),
				new THREE.Vector2( peakDay, 1 ),
				new THREE.Vector2( (totalDays+peakDay)/2, 0.15 ),
				new THREE.Vector2( 10, 0 )
			] ) );
		}
	}
}
