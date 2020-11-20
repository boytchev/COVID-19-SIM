//
//	Classes to control the visual effects of nature
//
//	class SunLight( intensity, shadowMapShift )
//
//	class Nature
//		update();
//



class SunLight extends THREE.DirectionalLight
{
	constructor( intensity, shadowMapShift = 0 )
	{
		super( 'white', intensity );
		
		this.position.set( GROUND_EDGE, 2*GROUND_EDGE, GROUND_EDGE );
		
		if( SHADOWS )
		{
			this.castShadow = SUN?true:false;
			this.shadow.mapSize.width = SHADOW_MAP_SIZE>>shadowMapShift;
			this.shadow.mapSize.height = SHADOW_MAP_SIZE>>shadowMapShift;
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
		
		
		this.ambientLight = new THREE.AmbientLight( 'white', 0.5 );
		this.ambientLight.name = 'ambient';
		scene.add( this.ambientLight );
		
		// add shadow capabilities of renderer
		if( SHADOWS )
		{
			renderer.shadowMap.enabled = true;
			
			//renderer.shadowMap.type = THREE.PCFShadowMap;
			renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			//renderer.shadowMap.type = THREE.BasicShadowMap;
			//renderer.shadowMap.type = THREE.VSMShadowMap;
			
			renderer.shadowMap.autoUpdate = false;
			renderer.shadowMap.needsUpdate = true;
			
		}

		if( SHADOWS )
		{
			this.topLight = new SunLight( 1, 2 );
			this.topLight.position.set( 0, GROUND_EDGE/10, 0 );
			this.topLight.name = 'top';
			this.topLight.castShadow = true;
			scene.add( this.topLight );
		}
		
		// add normal sun light
		for( var i=0; i<SHADOWS_COUNT; i++)
		{
			this.sunLights[i] = new SunLight( Math.pow(0.7,i), i );
			this.sunLights[i].name = 'sun'+i;
		}
		
		// add background color
		scene.background = new THREE.Color( 'skyblue' );
		
		
		// set all light intensities, so their sum is 1
		var totalIntensity = -0.2;
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
		}
		else
		{
			for( var i=0; i<this.sunLights.length; i++)
				this.sunLights[i].position.copy( camera.position );
		}
	}
	
} // Nature

