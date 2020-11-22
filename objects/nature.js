//
//	Classes to control the visual effects of nature
//
//	class SunLight( intensity, shadowMapShift )
//
//	class Nature
//		update();
//


/* Comments:
												SHADOW	SHADOW
	LIGHT SOURCE				SUN		SHADOW	TYPE	COUNT	
	-------------------------	-------	------	-------	------
	camera, no shadows			no		no		static	0		
	camera, top shadows			no		top		static	1		
	camera, full shadows		no		full	dynamic	n+1		
	-------------------------	-------	------	-------	------	
	static sun, no shadows		static	no		static	0		
	static sun, top shadows		static	top		static	1
	static sun, full shadows	static	full	static	n+1
	-------------------------	-------	-------	-------	------	
	dynamic sun, no shadows		dynamic	no		static	0
	dynamic sun, top shadows	dynamic	top		static	1
	dynamic sun, full shadows	dynamic	full	dynamic	n+1
	-------------------------	-------	-------	-------	------	
*/


var NatureMaterial = ( SHADOWS != NO_SHADOWS ) ? THREE.MeshStandardMaterial : THREE.MeshBasicMaterial;

var ambientIntensities = [
		//NO  TOP  FULL_SHADOW
		[0.5, 0.5, 0.5],// NO_SUN
		[0.5, 0.5, 0.5],// STATIC_SUN
		[0.5, 0.5, 0.5]	// SYNAMIC_SUN
	];

var topIntensities = [
		//NO  TOP  FULL_SHADOW
		[0.1, 0.1, 0.2],// NO_SUN
		[0.1, 0.1, 0.2],// STATIC_SUN
		[0.1, 0.1, 0.2]	// SYNAMIC_SUN
	];
	
var sunIntensities = [
		//NO  TOP  FULL_SHADOW
		[1.0, 1.0, 1.0],// NO_SUN
		[1.0, 1.0, 1.0],// STATIC_SUN
		[1.0, 1.0, 1.0]	// SYNAMIC_SUN
	];


class AmbientLight extends THREE.AmbientLight
{
	constructor( intensity )
	{
		super( 'white', ambientIntensities[SUN][SHADOWS] );
		this.name = 'ambient';
		scene.add( this );
	}
}


class TopLight extends THREE.DirectionalLight
{
	constructor( intensity )
	{
		super( 'white', topIntensities[SUN][SHADOWS] );
		
		this.position.set( 0, 2*GROUND_EDGE, 0 );
		this.name = 'top';
		
		if( SHADOWS != NO_SHADOWS )
		{
			this.castShadow = true;
			this.shadow.mapSize.width = SHADOWS_MAP_SIZE>>2;
			this.shadow.mapSize.height = SHADOWS_MAP_SIZE>>2;
			this.shadow.camera.near = -10000;
			this.shadow.camera.far = 10000;
			this.shadow.camera.left = -GROUND_EDGE;
			this.shadow.camera.right = GROUND_EDGE;
			this.shadow.camera.bottom = -GROUND_EDGE;
			this.shadow.camera.top = GROUND_EDGE;
			this.shadow.bias = -0.00005;
		}
		
		scene.add( this );
	}
}


class SunLight extends THREE.DirectionalLight
{
	constructor( shadowMapShift = 0 )
	{
		super( 'white', sunIntensities[SUN][SHADOWS]*Math.pow(0.7,shadowMapShift) );
		
		this.position.set( GROUND_EDGE, 2*GROUND_EDGE, GROUND_EDGE );
		this.name = 'sun_'+shadowMapShift;
		
		if( SHADOWS == FULL_SHADOWS )
		{
			this.castShadow = true;
			this.shadow.mapSize.width = SHADOWS_MAP_SIZE>>shadowMapShift;
			this.shadow.mapSize.height = SHADOWS_MAP_SIZE>>shadowMapShift;
			this.shadow.camera.near = -10000;
			this.shadow.camera.far = 10000;
			this.shadow.camera.left = -GROUND_SIZE;
			this.shadow.camera.right = GROUND_SIZE;
			this.shadow.camera.bottom = -GROUND_SIZE;
			this.shadow.camera.top = GROUND_SIZE;
			this.shadow.bias = -0.00005;
		}
		
		scene.add( this );
	}
}


class Nature
{



	constructor()
	{
		this.sysType = 'Nature';
		this.sunLights = [];
		this.sunPosition = new THREE.Vector3();
		
		// set shadow capabilities of renderer
		if( SHADOWS != NO_SHADOWS )
		{
			renderer.shadowMap.enabled = true;
			
			//renderer.shadowMap.type = THREE.PCFShadowMap;
			renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			//renderer.shadowMap.type = THREE.BasicShadowMap;
			//renderer.shadowMap.type = THREE.VSMShadowMap;
			
			renderer.shadowMap.autoUpdate = false;
			renderer.shadowMap.needsUpdate = true;
		}
		
		
		// set ambient light - always present
		this.ambientLight = new AmbientLight();
		

		// set top light - present if there are any types of shadows
		if( SHADOWS != NO_SHADOWS )
		{
			this.topLight = new TopLight();
		}
		
		
		// set normal sun light, for full shadows there are many
		var shadowCount = (SHADOWS==FULL_SHADOWS) ? SHADOWS_MAX_COUNT : 1;
		for( var i=0; i<shadowCount; i++)
		{
			this.sunLights[i] = new SunLight( i );
		}
		
		
		// add background color
		scene.background = new THREE.Color( 'skyblue' );
		scene.fog = new THREE.Fog( 'skyblue', 0.2*EARTH_SIZE, 0.4*EARTH_SIZE );
		
		
		// adjust light intensities total to be 1
		var totalIntensity = 0;
		for( var i=0; i<scene.children.length; i++ )
			if( scene.children[i] instanceof THREE.Light )
				totalIntensity += scene.children[i].intensity;
		for( var i=0; i<scene.children.length; i++ )
			if( scene.children[i] instanceof THREE.Light )
			{
				scene.children[i].intensity /= totalIntensity;
				scene.children[i].originalIntensity = scene.children[i].intensity;
				console.log( scene.children[i].intensity.toFixed(2), scene.children[i].name );
			}
	} // Nature


	update()
	{
		if( SUN )
		{
			var sunAngle = this.getSunAngularPosition(),
				cos = Math.cos( sunAngle ),
				sin = Math.sin( sunAngle );
			this.sunPosition.set( GROUND_SIZE*cos*SUN_SIN, GROUND_SIZE*sin, GROUND_SIZE*cos*SUN_COS );
		}
		else
		{
			camera.getWorldDirection( this.sunPosition );
			this.sunPosition.multiplyScalar( -1 );
		}

		// set light (sun) positions
		for( var i=0; i<this.sunLights.length; i++)
			this.sunLights[i].position.copy( this.sunPosition );
			
			
		// request regeneration of shadows
		if( SUN!=STATIC_SUN && SHADOWS==FULL_SHADOWS )
		{	
			renderer.shadowMap.needsUpdate = true;
		}

		
	}
	
	
	
	// calculate sun position at given time of the day
	getSunAngularPosition()
	{
		var t = (SUN==STATIC_SUN) ? STATIC_SUN_POSITION_MS : dayTimeMs;
		
		if( DEBUG_SUN_POSITION_GUI )
		{
			t = timeMs(guiObject.sunPos);
			renderer.shadowMap.needsUpdate = true;
		}
		
		// check relative time position rT in respect to sunrise(rT=0) and sunset(rT=1)
		var rT = THREE.Math.mapLinear( t, SUNRISE_MS, SUNSET_MS, 0, 1 );

		if( rT<0 || rT>1)
		{
			// it is nighttime, calculate how much of the night has passed
			if( dayTimeMs<SUNRISE_MS ) t += HOURS_24_MS;
			rT = THREE.Math.mapLinear( t, SUNSET_MS, SUNRISE_MS+HOURS_24_MS, 1, 2 );
		}
		
		return rT*Math.PI;
	}
	
} // Nature

