//
//	class Ground()
//		constructGroundImage()
//



class Ground
{
	
	
	
	constructor()
	{
		this.sysType = 'Ground';
		
		this.constructGroundImage();
	} // constructor

	
	
	constructGroundImage()
	{
		let geometry = new THREE.PlaneBufferGeometry( GROUND_SIZE, GROUND_SIZE );

		var MeshClass = (SHADOWS)?THREE.MeshStandardMaterial:THREE.MeshBasicMaterial;
		
		let material = new MeshClass( {
				color: '#404040',
				depthTest: false,
				// map: textures.grid.map( Math.round(GROUND_SIZE/GROUND_TEXTURE_SCALE), Math.round(GROUND_SIZE/GROUND_TEXTURE_SCALE) )
				transparent: DEBUG_BLOCKS_OPACITY<1,
				opacity: DEBUG_BLOCKS_OPACITY,
				metalness: 0,
				roughness: 1,
			} );
		
		let image = new THREE.Mesh( geometry, material );
			image.renderOrder = -100;
			image.rotation.x = -Math.PI/2;
			image.updateMatrix();
			image.matrixAutoUpdate = false;
			image.receiveShadow = true;
			
		scene.add( image );
	
		if( DEBUG_SHOW_DIRECTIONS )
		{
			// marker "TOP"
			var textMaterial = new THREE.MeshBasicMaterial({color:'white'}),
				textStyle = {
							font: font.font,
							size: GROUND_SIZE/30,
							height: 0.03,
							curveSegments: 4,
							bevelEnabled: false,
						};
						
			var textGeometry = new THREE.TextGeometry( 'TOP / Z+', textStyle );
			var text = new THREE.Mesh( textGeometry, textMaterial );
			text.position.x = -GROUND_SIZE/10;
			text.position.z = GROUND_SIZE/2 + GROUND_SIZE/30;
			text.rotation.x = -Math.PI/2;
			scene.add( text );
			
			var textGeometry = new THREE.TextGeometry( 'BOTTOM / Z-', textStyle );
			var text = new THREE.Mesh( textGeometry, textMaterial );
			text.position.x = -GROUND_SIZE/8;
			text.position.z = -GROUND_SIZE/2;
			text.rotation.x = -Math.PI/2;
			scene.add( text );
			
			var textGeometry = new THREE.TextGeometry( 'LEFT / X-', textStyle );
			var text = new THREE.Mesh( textGeometry, textMaterial );
			text.position.x = -GROUND_SIZE/2;
			text.position.z = GROUND_SIZE/20;
			text.rotation.set(-Math.PI/2,Math.PI/2,0,'YXZ');
			scene.add( text );
			
			var textGeometry = new THREE.TextGeometry( 'RIGHT / X+', textStyle );
			var text = new THREE.Mesh( textGeometry, textMaterial );
			text.position.x = GROUND_SIZE/2+GROUND_SIZE/30;
			text.position.z = GROUND_SIZE/20;
			text.rotation.set(-Math.PI/2,Math.PI/2,0,'YXZ');
			scene.add( text );
		}
	} // constructGroundImage
	
	
	
} // Ground
