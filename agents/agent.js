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
		
		if( !AgentGeometry ) AgentGeometry = this.geometry();
		if( !AgentMaterial ) AgentMaterial = this.material();
		if( !AgentMaterial2 ) AgentMaterial2 = this.material2();
		// if( AgentLabelGeometry==1 )
		// {
			// AgentLabelGeometry = [];
			// for( var i=0; i<110; i++ )
			// {
				// var ageGeometry = new THREE.TextGeometry( ''+i, {
						// font: font.font,
						// size: 0.5,
						// height: 0.03,
						// curveSegments: 4,
						// bevelEnabled: false,
					// } );
				// ageGeometry.translate(i<9.5?-0.2:-0.4,1.9,0);
				// AgentLabelGeometry.push( ageGeometry );
			// }
		// }
			
		this.isAdult = isAdult;
		
		// set age and height
		this.age = this.getRandomAge( );
	
		// other things
		this.home = home;
		this.position = home.randomPos();
		this.walkingSpeed = AGENT_WALKING_SPEED.randFloat( );	// in meters/second

		this.dailySchedule.reset( this.isAdult );
		
		// fake work address
		this.work = new WorkAddress();
		this.work.position = this.work.randomPos();
		//this.work = new BlockAddress();
		
		if( DEBUG_SHOW_HOME_TO_WORK_ARROW )
			drawArrow( this.home.center, this.work.center );

		//if( this.home.building && (this.home.building === this.work.building) )
		//	console.error('Home and work is in the same building. This case is not handled so far. Code 0937.');

//	console.log(this.home, this.work);
//	drawArrow( this.home.center, this.work.center );

		
	} // Agent.constructor
	
	
	
	update()
	{
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
		
	} // Agent.updateImage


	
	image()
	{
		var mesh = new THREE.Mesh( AgentGeometry, this.isAdult?AgentMaterial:AgentMaterial2 );
			
		mesh.position.set( this.x, this.y, this.z );
		mesh.scale.set( this.height/1.7, this.height/1.7, this.height/1.7 );
		
		//mesh.castShadow = true;
		
		scene.add( mesh );

		// var ageMesh = new THREE.Mesh( AgentLabelGeometry[round(this.age,1)], AgentMaterial2 );
		// mesh.add( ageMesh );

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
	
	
	
	geometry()
	{
		var geometry = new THREE.CylinderBufferGeometry( 0.2, 0.4, 1.7, 6, 2 );
		geometry.translate( 0, 1.7/2, 0 );
		
		var pos = geometry.getAttribute( 'position' );
		for( var i=0; i<pos.count; i++ )
		{
			var x = pos.getX( i );
			var y = pos.getY( i );
			var z = pos.getZ( i );
			
			if( y>0.1 && y<1.7 )
			{
				pos.setXYZ( i, x/4, 1.4, z/4 );
			}
		}
		
		return geometry;
		
	} // Agent.geometry
	
	
	
	material()
	{
		var material = new THREE.MeshPhongMaterial( {
				color: 'crimson',
//				shininess: 100,
		});
		
		return material;
		
	} // Agent.material
	
	
	
	material2()
	{
		var material = new THREE.MeshBasicMaterial( {
				color: 'navy'
		});
		
		return material;
		
	} // Agent.material2
	
	
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



AgentGeometry = undefined;
// AgentLabelGeometry = 1;
AgentMaterial = undefined;
AgentMaterial2 = undefined;

Agent.generateAgeDistributionArrays();