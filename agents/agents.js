//
//	class Agents
//		constructor()
//		generate( count )
//		update()
//		debugShowAgeDistribution()
//

var aa;

class Agents
{
	
	constructor( )
	{
		this.sysType = 'Agents';
		
		this.agents = [];

		this.generate( );
		
		if( DEBUG_SHOW_AGENTS_AGE_DISTRIBUTION ) 
			this.debugShowAgeDistribution();
	} // Agents.constructor


	generate( )
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
		

	} // Agents.generateInRandomBlock



	update()
	{
		if( this.agents.length )
		{	
			for( var i=0; i<this.agents.length; i++ )
			{
				this.agents[i].update();
				this.agents[i].updateImage();
				if( i==DEBUG_FOLLOW_AGENT )
				{
					var pos = this.agents[i].position.vector(),
						dVect = pos.sub( controls.target );
						
					var t = currentTimeMs/30000,
						q = 0.6+0.5*Math.sin(t/1.4),
						r = 45+37*Math.sin(t/2);
					var dx = r*Math.sin(t)*Math.cos(q),
						dy = r*Math.sin(q),
						dz = r*Math.cos(t)*Math.cos(q);
					
					controls.target.set( 
						THREE.Math.lerp(controls.target.x,this.agents[i].position.x,0.022),
						0, 
						THREE.Math.lerp(controls.target.z,this.agents[i].position.z,0.022)
					);
					camera.position.set( controls.target.x+dx, 5+dy, controls.target.z+dz ); 
					
				}
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


}
