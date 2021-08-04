// Modified from THREE.ShaderLib.phong.fragmentShader
//
// Modified code is in COVID19SYM

export default `


#define COVID19SYM


#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

#ifdef COVID19SYM
	uniform float uTime;
	varying vec3 vVertexColor;
	varying float vAgentId;
	varying float vRandomId;
	//varying float vInfectionLevel;
#endif

#ifdef COVID19SYM
	vec4 colorShoeSole( )
	{
		return vec4(0,0,0,1);
	}
	vec4 colorShoeSkin( )
	{
		return vec4(
			1.0*fract(2.7/vRandomId),
			1.0*fract(3.3/vRandomId),
			1.0*fract(1.1/vRandomId),
			1.0
		);
	}
	vec4 colorSock( )
	{
		float c = 1.0-pow(vRandomId,5.0);
		return vec4(c,c,c,1);
	}
	vec4 colorHumanSkin( )
	{
		return vec4(1.0,0.8,0.8,1);
	}
	vec4 colorPants( )
	{
		float c = pow(fract(8.3/vRandomId),1.5);
		//return vec4(c,c,c,1);

		return vec4(
			c*fract(1.7/vRandomId),
			c*fract(2.3/vRandomId),
			c*fract(3.1/vRandomId),
			1.0
		);
	}
	
	vec4 recodeUndressedColor( vec4 color )
	{
		int index = int(round(100.0*color.r));
		
		int sockLevel = int(2.0 + 5.0*pow(fract(1.0/vRandomId),0.5)); // [2..7]
		
		if( index<=sockLevel ) color = colorSock();
		else
		if( index==9 ) color = colorSock();
		else
		if( index==10 ) color = colorSock();
		else
		if( index<=90 ) color = colorHumanSkin();
		
		return color;
	}

	vec4 recodeColor( vec4 color )
	{
		int index = int(round(100.0*color.r));
		
		int shoeLevel = int(2.0 + 5.0*pow(fract(2.8/vAgentId),1.0)); // [2..7]
		int sockLevel = int(2.0 + 5.0*pow(fract(1.0/vRandomId),0.5)); // [2..7]
		int pantLevel = int(4.0 + 6.0*pow(fract(5.3/vRandomId),1.0)); // [4..10]
		
		if( index==1 ) color = colorShoeSole();
		else
		if( index<=shoeLevel ) color = colorShoeSkin();
		else 
		if( index<=sockLevel ) color = colorSock();
		else
		if( index<pantLevel ) color = colorHumanSkin();
		else
		if( index<=12 ) color = colorPants();
		else
		if( index<=90 ) color = colorHumanSkin();
		
		return color;
	}
#endif


void main() {
	#include <clipping_planes_fragment>


vec4 diffuseColor = vec4( diffuse, opacity );

#ifdef COVID19SYM
	//diffuseColor = vec4( 1.0, 1.0-vInfectionLevel, 1.0-vInfectionLevel, opacity );

	diffuseColor = vec4(vVertexColor,1.0);
#endif


	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	
	#include <logdepthbuf_fragment>

//#include <map_fragment>
#ifdef USE_MAP

	vec4 texelColor = texture2D( map, vUv );

	texelColor = mapTexelToLinear( texelColor );
	#ifdef COVID19SYM_RECOLOR
		#ifdef COVID19SYM
			if( fract(3.0/vRandomId)<0.3 )
				texelColor = recodeUndressedColor( texelColor );
			else
				texelColor = recodeColor( texelColor );
		#endif
	#endif
	diffuseColor *= texelColor;

#endif


#ifndef COVID19SYM
	#include <color_fragment>
#endif	
	
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	
	#include <envmap_fragment>
	
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}
`