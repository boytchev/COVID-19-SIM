//
//	class HouseSidewalk
//		constructor( houseWing )
//
//	class HouseSidewalkPath
//		constructor( house )
//		isInside( margin )
//
//	class HouseSidewalks
//		static geometry( )
//		static material( )
//		static image( sidewalks )
//



// sidewalk around a house
class HouseSidewalk
{
	
	constructor( houseWing )
	{
		this.sysType = 'HouseSidewalk';
		
		this.center = houseWing.center;
		this.size = houseWing.size.shrink( -2 ); // i.e. expand by 2
		
	} // HouseSidewalk.constructor
	
} // HouseSidewalk
	
	
	
// sidewalk from house to street
class HouseSidewalkPath
{
	
	constructor(  house )
	{
		this.sysType = 'HouseSidewalkPath';
		
		this.rotation = house.facing;
		
		var zone, pos,
			zoneA = house.wingA.zone,
			zoneB = house.wingB.zone,
			blockZone = house.block.zone;
			
		// find the wing more extended into the direction of facing
		// and build a path from it to the street sidewalk
		switch( house.facing )
		{
			case RIGHT:
				zone = (zoneA.maxX() > zoneB.maxX()) ? zoneA : zoneB;
				this.center = new Pos( zone.maxX()+0.5, zone.zRange.mid(), house.block );
				this.length = this.distanceX( blockZone.b, blockZone.c );
				this.size = new Size( this.length, 1 );
				this.center.x += this.size.x/2;
				break;
			case TOP:
				zone = (zoneA.maxZ() > zoneB.maxZ()) ? zoneA : zoneB;
				this.center = new Pos( zone.xRange.mid(), zone.maxZ()+0.5, house.block );
				this.length = this.distanceZ( blockZone.a, blockZone.b );
				this.size = new Size( 1, this.length );
				this.center.z += this.size.z/2;
				break;
			case LEFT:
				zone = (zoneA.minX() < zoneB.minX()) ? zoneA : zoneB;
				this.center = new Pos( zone.minX()-0.5, zone.zRange.mid(), house.block );
				this.length = this.distanceX( blockZone.a, blockZone.d );
				this.size = new Size( this.length, 1 );
				this.center.x -= this.size.x/2;
				break;
			case BOTTOM:
				zone = (zoneA.minZ() < zoneB.minZ()) ? zoneA : zoneB;
				this.center = new Pos( zone.xRange.mid(), zone.minZ()-0.5, house.block );
				this.length = this.distanceZ( blockZone.d, blockZone.c );
				this.size = new Size( 1, this.length );
				this.center.z -= this.size.z/2;
				break;
			default:
				console.error( 'A house without array of possible facings. Should not happen. Code 1608.');
				return;
		}

		house.path = this;

	} // HouseSidewalkPath.constructor
	
	
	
	distanceX( to1, to2 )
	{
		//               (to1)
		//	             /
		//  (center)----+
		//             /
		//          (to2)
		var from = this.center;
		return Math.abs( THREE.Math.mapLinear( from.z, to1.z, to2.z, to1.x-from.x, to2.x-from.x ) ) - SIDEWALK_WIDTH/2;
		
	} // HouseSidewalkPath.distanceX
	
	
	
	distanceZ( to1, to2 )
	{
		//  (to1)--,
		//          --+--
		//	          |  '--(to2)
		//            |
		//         (center)
		var from = this.center;
		return Math.abs( THREE.Math.mapLinear( from.x, to1.x, to2.x, to1.z-from.z, to2.z-from.z ) ) - SIDEWALK_WIDTH/2;
		
	} // HouseSidewalkPath.distanceX
	
	
	
	isInside( pos, margin = 0 )
	{
		return (
			this.center.x-this.size.x/2+margin <= pos.x && pos.x <= this.center.x+this.size.x/2-margin &&
			this.center.z-this.size.z/2+margin <= pos.z && pos.z <= this.center.z+this.size.z/2-margin );
	} // HouseSidewalkPath.isInside
	
} // HouseSidewalkPath
	
	
	
class HouseSidewalks
{
	
	constructor( )
	{
		this.sysType = 'HouseSidewalks';
	} // HouseSidewalks.constructor
	
	

	static geometry()
	{
		var geometry = new THREE.InstancedBufferGeometry();

		// x,y,z, u,v
		
		var vertexBuffer = new THREE.InterleavedBuffer( new Float32Array( [
			// Top (from Y+)
			+0.5, 0, -0.5,		1, 0,	0, 1, 0,
			-0.5, 0, -0.5,		0, 0,	0, 1, 0,
			+0.5, 0, +0.5,		1, 1,	0, 1, 0,
			
			-0.5, 0, -0.5,		0, 0,	0, 1, 0,
			-0.5, 0, +0.5,		0, 1,	0, 1, 0,
			+0.5, 0, +0.5,		1, 1,	0, 1, 0,
		]), 8);
	
		var positions = new THREE.InterleavedBufferAttribute( vertexBuffer, 3/*values*/, 0/*offset*/ );
		var normals   = new THREE.InterleavedBufferAttribute( vertexBuffer, 3/*values*/, 5/*offset*/ );
		var uvs       = new THREE.InterleavedBufferAttribute( vertexBuffer, 2/*values*/, 3/*offset*/ );
		
		geometry.setAttribute( 'position', positions );
		geometry.setAttribute( 'normal', normals );
		geometry.setAttribute( 'uv', uvs);
		
		return geometry;
		
	} // HouseSidewalks.geometry



	static material()
	{
		
		var material = new THREE.MeshPhongMaterial({
				color: 'white',
				map: textures.sidewalk.map( 4, 4 ),
				depthTest: false,
				transparent: DEBUG_BLOCKS_OPACITY<1,
				opacity: DEBUG_BLOCKS_OPACITY
			});

		// inject GLSL code to fix scaling
		material.onBeforeCompile = shader => {
			//console.log(shader.vertexShader);
			//console.log(shader.fragmentShader);

			shader.vertexShader =
				shader.vertexShader.replace(
					'void main() {\n',
					
					'vec2 textureScale = vec2(1.0);\n'+
					'void main() {\n'+
					'	textureScale.x = instanceMatrix[0][0];\n'+
					'	textureScale.y = instanceMatrix[2][2];\n'+
					''
				);

			shader.vertexShader =
				shader.vertexShader.replace(
					'#include <uv_vertex>',
					
					'vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n'+
					'vUv = vUv*textureScale;\n'+
					''
				);
		
			//console.log(shader.vertexShader);
		} // material.onBeforeCompile
		
		return material;
		
	} // HouseSidewalks.material
	
	
	
	
	static image( sidewalks )
	{
		
		var instances = sidewalks.length;
		
		var geometry  = HouseSidewalks.geometry(),
			material  = HouseSidewalks.material(),
			mesh = new THREE.InstancedMesh( geometry, material, instances );
			
		// create a house sidewalk building matrix
		var matrix = new THREE.Matrix4();
		for( var i=0; i<instances; i++ )
		{
			matrix.makeScale( sidewalks[i].size.x, 1, sidewalks[i].size.z );
			matrix.setPosition( sidewalks[i].center.x, 0, sidewalks[i].center.z );

			mesh.setMatrixAt( i, matrix );
		}

		mesh.receiveShadow = true;
		mesh.renderOrder = -80;
		
		scene.add( mesh );
		
	} // HouseSidewalks.image

	
	
} // HouseSidewalks
