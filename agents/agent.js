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



var agent_id = 0;

class Agent extends AgentBehaviour
{
	
	constructor( isAdult, home )
	{
		super();

		this.sysType = 'Agent';
		this.id = agent_id++;
		
/*		if( !AgentDebugMaterial ) AgentDebugMaterial = [
			AgentMaterial,
			new THREE.MeshPhongMaterial({color: 'pink'}),
			new THREE.MeshPhongMaterial({color: 'green'}),
			new THREE.MeshPhongMaterial({color: 'black'}),
			new THREE.MeshPhongMaterial({color: 'white'}),
		];
*/			
		this.isAdult = isAdult;
		
		// set age and height
		this.age = this.getRandomAge( );
	
		// other things
		this.home = home;
		this.position = home.randomPos();
		this.walkingSpeed = AGENT_WALKING_SPEED.randFloat( );	// in meters/second

		this.dailySchedule.reset( this.isAdult );
		
		// work address
		this.work = new WorkAddress();
		this.work.position = this.work.randomPos();
		
		this.infectionLevel = 0;
		this.infectionPattern = undefined;
		this.infectionPeriodMs = undefined;
		
		if( DEBUG_SHOW_HOME_TO_WORK_ARROW )
			drawArrow( this.home.center, this.work.center );

//	console.log(this.home, this.work);
//	drawArrow( this.home.center, this.work.center );

		this.infect();
	} // Agent.constructor
	
	
	
	update()
	{
		// update infection status
		if( this.infectionPattern!=undefined )
		{
			// end of infection
			if( currentTimeMs > this.infectionPeriodMs.max )
			{
				this.infectionLevel = 0;
				this.infectionPattern = undefined;
			}
			else
			{
				var viralShedding = agents.viralShedding[this.infectionPattern];
				
				var elapsedTime = currentTimeMs-this.infectionPeriodMs.min,
					totalTime = this.infectionPeriodMs.diff(),
					relativeTime = elapsedTime/totalTime;
					
				var infLev = viralShedding.getPointAt( relativeTime ).y;
				this.infectionLevel = 100*infLev;

				// update overhead indicator
				if( INFECTION_OVERHEAD_INDICATOR )
				{
					this.mesh.children[0].geometry = Agents.labelGeometry[ Math.round(this.infectionLevel) ];
				}
				// update color indicator
				if( INFECTION_COLOR_INDICATOR )
				{
					this.mesh.material.color.r = infLev;
					this.mesh.material.color.g = 0.2;
					this.mesh.material.color.b = 1-infLev;
					if( INFECTION_OVERHEAD_INDICATOR )
					{
						this.mesh.children[0].material.color = this.mesh.material.color;
					}
				}
			}
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
	


	updateImage()
	{
		this.mesh.position.copy( this.position.vector() );
		//this.mesh.rotation.y = THREE.Math.lerp(this.mesh.rotation.y,controls.getAzimuthalAngle(),0.1);
		
		if( this.doing == this.AGENT_SLEEPING_AT_HOME )
			this.mesh.rotation.x = THREE.Math.lerp( this.mesh.rotation.x, Math.PI/2, 0.1 );
		else
			this.mesh.rotation.x = THREE.Math.lerp( this.mesh.rotation.x, 0, 0.1 );
		
		if( INFECTION_OVERHEAD_INDICATOR )
		{
			this.mesh.children[0].rotation.y = controls.getAzimuthalAngle();
		}
		
	} // Agent.updateImage


	
	debugColor(n)
	{
		this.mesh.material = AgentDebugMaterial[n];
	}
	
	
	image()
	{
		var mesh = new THREE.Mesh( Agents.geometry, this.material() );
			
		mesh.position.set( this.x, this.y, this.z );
		mesh.scale.set( this.height/1.7, this.height/1.7, this.height/1.7 );
		
		//mesh.castShadow = true;
		
		scene.add( mesh );

		if( INFECTION_OVERHEAD_INDICATOR )
		{
			var ageMesh = new THREE.Mesh( Agents.labelGeometry[Math.round(this.infectionLevel)], mesh.material );
			mesh.add( ageMesh );
		}
		
		return mesh;
		
	} // Agent.image

	

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
	
	
	
	material()
	{
		var material = new THREE.MeshPhongMaterial( {
				color: 'crimson',
		});
		
		return material;
		
	} // Agent.material
	
	
	
	infect()
	{
		this.infectionLevel = 0;
		this.infectionPattern = THREE.Math.randInt( 1, Math.round(INFECTION_PATTERNS_COUNT/2) );
		this.infectionPeriodMs = new Range( currentTimeMs, currentTimeMs + INFECTION_TOTAL_MS.randFloat() );
		
//		console.log('level',this.infectionLevel,'pattern',this.infectionPattern,'from',msToString(this.infectionPeriodMs.min),'to',msToString(this.infectionPeriodMs.max));
		
	}
	
} // Agent



class Child extends Agent
{
	
	constructor( home )
	{
		super( false, home );

		this.sysType = 'Child';
		
		this.height = THREE.Math.mapLinear( this.age, 0, 17, AGENT_HEIGHT_CHILD.min, AGENT_HEIGHT_CHILD.max );
		this.height = this.height * THREE.Math.randFloat( 0.9, 1.1 );

		this.mesh = this.image();
		
	} // Child.constructor
} // Child



class Adult extends Agent
{
	
	constructor( home )
	{
		super( true, home );

		this.sysType = 'Adult';

		this.height = THREE.Math.mapLinear( this.age, 18, 100, AGENT_HEIGHT_ADULT.min, AGENT_HEIGHT_ADULT.max );
		this.height = this.height * THREE.Math.randFloat( 0.9, 1.1 );

		this.mesh = this.image();
		
	} // Adult.constructor
} // Adult



Agent.generateAgeDistributionArrays();