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
	float seed = 1.234;
	int rand(float a, float b)
	{
		seed += 0.854;
		return int(a + (b-a+0.999)*fract(seed/vRandomId));
	}
	bool randBool(float probability)
	{
		seed += 0.754;
		return fract(seed/vRandomId) < probability;
	}
	
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
		vec4 color1 = vec4(0.1,0.05,0.05,1);
		vec4 color2 = vec4(1.2,0.8,0.6,1);
		vec4 color3 = vec4(1.0,0.95,0.90,1);
		
		float k1 = fract(3.7/vRandomId);
		float k2 = fract(4.7/vRandomId);
		float k3 = fract(5.7/vRandomId);
		
		return (2.0*k1*color1 + k2*color2 + 2.0*k3*color3)/(2.0*k1+k2+2.0*k3);
	}
	vec4 colorPants( )
	{
		float c = pow(fract(11.3/vRandomId),2.5);
		
		return vec4(
			c*fract(5.7/vRandomId),
			c*fract(2.3/vRandomId),
			c*fract(3.8/vRandomId),
			1.0
		);
	}
	vec4 colorBelt( )
	{
		return vec4(
			0.4*fract(0.7/vRandomId),
			0.0,
			0.0,
			1.0
		);
	}
	vec4 colorJacket( )
	{
		if( randBool(0.8) )
		{	// grayscale jacket
			float c = fract(2.23/vRandomId);
			return vec4(c,c,c,1);
		}
		else
		{	// color jacket
			return vec4(
				1.0*fract(6.2/vRandomId),
				1.0*fract(1.5/vRandomId),
				1.0*fract(4.3/vRandomId),
				1.0
			);
		}
	}
	vec4 colorShirt( )
	{
		return vec4(
			0.75+0.25*fract(5.2/vRandomId),
			0.75+0.25*fract(2.5/vRandomId),
			0.75+0.25*fract(3.3/vRandomId),
			1.0
		);
	}
	vec4 colorHair( )
	{	
		if( randBool(0.9) )
		{	// black->brown
			float c = fract(1.92/vRandomId)*fract(5.7/vRandomId);
			return vec4( 0.4*c, 0.2*c, 0.0, 1.0 );
		}
		else
		{	// gold->white
			float c = 0.2+0.4*fract(7.0/vRandomId);
			return vec4( 1.0, 1.0-0.5*c, 1.0-c, 1.0 );
		}
	}
	
	
	vec4 recodeUndressedColor( vec4 color )
	{
		int from;
		int to;
		int index = int(round(100.0*color.r));
		
		bool man = vRandomId<0.5;
		
		// socks
		bool socks = randBool( 0.5 );
		if( socks )
		{
			int sockLevel = rand( 2.0, man?6.0:8.0 ); // man:[2..6] woman:[2..8]
			if( index <= sockLevel ) return colorSock();
		}
		
		// bottom
		from = rand( 9.0, 10.0); // all:[9..10]
		to   = rand(10.0, 12.0); // all:[10..12]
		if( from<=index && index<=to ) return colorSock();
		
		// top
		if( !man )
		{
			from = rand( 13.0, 14.0); // woman:[13..14]
			to   = 14; // woman:[14]
			if( from<=index && index<=to ) return colorSock();
		}

		return colorHumanSkin();
	}

	vec4 recodeColor( vec4 color )
	{
		int index = int(round(100.0*color.r));
		int index2 = int(round(100.0*color.g));
		
		bool man = vRandomId<0.5;

		if( index<=11 ) // bottom clothes -- shoes-to-belt
		{
			int shoeEnd = rand( 2.0, man?6.0:7.0 ); // man:[2..6] woman:[2..7]
			int sockEnd = rand( 3.0, man?6.0:8.0 ); // man:[3..6] woman:[3..8]
			int pantBeg = rand( 4.0, 9.0 ); // all:[4..9]
			int pantEnd = rand( 10.0, 12.0 ); // all:[10..12]

			if( index==1 ) color = colorShoeSole();
				else
			if( index<=shoeEnd ) color = colorShoeSkin();
				else
			if( index<=sockEnd ) color = colorSock();
				else
			if( index<pantBeg ) color = colorHumanSkin();
				else
			if( index<=pantEnd ) color = colorPants();
				else
			if( index==11 ) color = colorBelt();
				else
			color = colorHumanSkin();
		}
		else
		if( index<=22 ) // upper clothes -- belt-to-neck-and-sleeves
		{
			bool jacket = randBool(0.5);
			
			if( index==19 && index2==0 ) color = colorHumanSkin(); // hands
				else
			if( jacket )
			{
				int jacketEnd = rand( 20.0, 22.0 );
				if( index<=jacketEnd || (1<=index2 && index2<=2)) color = colorJacket();
					else
				if( index==21 ) color = colorShirt(); // shirt
					else
				color = colorHumanSkin();
			}
			else
			{	// there is no jacket

				int shirtBeg = rand( 11.0, 13.0 );
				int shirtEnd = rand( 15.0, 18.0 );
				int shirtTop = rand( 19.0, 22.0 );
				if( (shirtBeg<=index && index<=shirtEnd) || (1<=index2 && index2<=2) ) color = colorShirt();
					else
				if( 20<=index && index<=shirtTop ) color = colorShirt();
					else
				color = colorHumanSkin();
			}
		}
		else
		{ // head
	
			if( man )
			{	// man
				if( index<=30 )
				{	// hair
					int hair = randBool(0.9) ? 1 : 0;
					int hairTopEnd = hair*rand( 23.0, 26.0 );
					int hairSideBeg = 27;
					int hairSideEnd = hair*rand( 27.0, 30.0 );
					if( index<=hairTopEnd ) color = colorHair();
						else
					if( hairSideBeg<=index && index<=hairSideEnd ) color = colorHair();
						else
					color = colorHumanSkin();
				}
				else
				{   // beard
					int beard = randBool(0.2) ? 1 : 0;
					int beardTopEnd = beard*rand( 31.0, 33.0 );
					int beardBottomBeg = 34;
					int beardBottomEnd = beard*rand( 34.0, 35.0 );
					if( index<=beardTopEnd ) color = colorHair();
						else
					if( beardBottomBeg<=index && index<=beardBottomEnd ) color = colorHair();
						else
					color = colorHumanSkin();
				}
			}
			else
			{	// woman
				int hairTopEnd = rand( 24.0, 26.0 );
				int hairSideBeg = 27;
				int hairSideEnd = rand( 27.0, 30.0 );
				if( index<=hairTopEnd ) color = colorHair();
					else
				if( hairSideBeg<=index && index<=hairSideEnd ) color = colorHair();
					else
				color = colorHumanSkin();
			}
			
		}
		
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
			if( fract(3.2/vRandomId)<-0.05 )
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