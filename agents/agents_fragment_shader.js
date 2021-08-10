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

	bool man;

	float seed = 1.234;

	float rand() // float random [0,1)
	{
		seed += 0.854;
		return fract(seed/vRandomId);
	}

	float randPersistant(float value) // float random [0,1)
	{
		return fract(value/vRandomId);
	}

	int randInt(int a, int b) // int random [a, b]
	{
		return int(float(a) + (float(b-a)+0.999)*rand());
	}

	bool randBool(float probability)
	{
		return rand() < probability;
	}
	
	vec4 colorShoeSole( )
	{
		return vec4(0,0,0,1);
	}
	
	vec4 colorShoeSkin( )
	{
		return vec4(rand(),rand(),rand(),1);
	}
	
	vec4 colorShoeSkinFormal( )
	{
		return vec4(0,0,0,1);
	}
	
	vec4 colorSock( )
	{
		float c = 1.0-pow(vRandomId,5.0);
		return vec4(c,c,c,1);
	}
	
	vec4 colorHumanSkin( )
	{
		vec4 color1 = vec4(0.1,0.05,0.05,1);
		vec4 color2 = vec4(1.0,0.75,0.6,1);
		vec4 color3 = vec4(1.0,0.95,0.90,1);
		
		float k1 = randPersistant(3.2);
		float k2 = randPersistant(1.9);
		float k3 = randPersistant(7.6);
		
		return (2.0*k1*color1 + 2.0*k2*color2 + 2.5*k3*color3)/(2.0*k1+2.0*k2+2.5*k3);
	}
	
	vec4 colorPants( )
	{
		float c = pow(rand(),2.5);
		
		return vec4(c*rand(),c*rand(),c*rand(),1);
	}
	
	vec4 colorPantsFormal( )
	{
		float r = 0.15*rand()*rand();
		float g = r+0.05*rand();
		float b = g+0.15*rand();
		
		return vec4(r,g,b,1);
	}
	
	vec4 colorBelt( )
	{
		return vec4(0.4*rand(),0,0,1);
	}

	vec4 colorBeltFormal( )
	{
		return vec4(0,0,0,1);
	}
	
	vec4 colorJacket( )
	{
		if( randBool(0.8) )
		{	// grayscale jacket
			float c = rand();
			return vec4(c,c,c,1);
		}
		else
		{	// color jacket
			return vec4(rand(),rand(),rand(),1);
		}
	}
	
	vec4 colorJacketFormal( )
	{
		float c = 1.0+0.3*(rand()+rand()-1.0);
		
		return c*colorPantsFormal();
	}
	
	vec4 colorShirt( )
	{
		return vec4(
			0.75+0.25*rand(),
			0.75+0.25*rand(),
			0.75+0.25*rand(),
			1.0
		);
	}
	
	vec4 colorShirtFormal( )
	{
		float r = 0.8+0.2*rand();
		
		return vec4(r,0.5*r+0.5,1,1);
	}
	
	vec4 colorHair( )
	{	
		if( randBool(0.9) )
		{	// black->brown
			float c = rand()*rand();
			return vec4(0.4*c,0.2*c,0,1);
		}
		else
		{	// gold->white
			float c = 0.2+0.4*rand();
			return vec4(1,1.0-0.5*c,1.0-c,1);
		}
	}
	
	vec4 recodeHead( int index, int index2 )
	{
		vec4 color;
		
		if( man )
		{	// man
			if( index<=30 )
			{	// hair
				int hair = randBool(0.9)?1:0;
				int hairTopEnd = hair*randInt(23,26);
				int hairSideBeg = 27;
				int hairSideEnd = hair*randInt(27,30);
				if( index<=hairTopEnd && index2==0 ) color = colorHair();
					else
				if( hairSideBeg<=index && index<=hairSideEnd && index2==0 ) color = colorHair();
					else
				color = colorHumanSkin();
			}
			else
			{   // beard
				int beard = randBool(0.2)?1:0;
				int beardTopEnd = beard*randInt(31,33);
				int beardBottomBeg = 34;
				int beardBottomEnd = beard*randInt(34,35);
				if( index<=beardTopEnd ) color = colorHair();
					else
				if( beardBottomBeg<=index && index<=beardBottomEnd ) color = colorHair();
					else
				color = colorHumanSkin();
			}
		}
		else
		{	// woman
			int hairTopEnd = randInt(24,26);
			int hairSideBeg = 27;
			int hairSideEnd = randInt(27,30);
			if( index<=hairTopEnd && index2==0 ) color = colorHair();
				else
			if( hairSideBeg<=index && index<=hairSideEnd && index2==0 ) color = colorHair();
				else
			color = colorHumanSkin();
		}
			
		return color;
	}
	
	vec4 recodeUndressedColor( vec4 color )
	{
		int from;
		int to;
		int index = int(round(100.0*color.r));
		int index2 = int(round(100.0*color.g));
		
		// socks
		bool socks = randBool( 0.5 );
		if( socks )
		{
			int sockLevel = randInt( 2, man?6:8 ); // man:[2..6] woman:[2..8]
			if( index <= sockLevel ) return colorSock();
		}
		
		// bottom
		from = randInt(9,10); // all:[9..10]
		to   = randInt(10,12); // all:[10..12]
		if( from<=index && index<=to ) return colorSock();
		
		// top
		if( !man )
		{
			from = randInt(13,14); // woman:[13..14]
			to   = 14; // woman:[14]
			if( from<=index && index<=to ) return colorSock();
		}

		if( index>=23 )
		{ // head
			return recodeHead(index,index2);
		}
		
		return colorHumanSkin();
	}

	vec4 recodeInformalColor( vec4 color )
	{
		int index = int(round(100.0*color.r));
		int index2 = int(round(100.0*color.g));
		
		if( index<=11 ) // bottom clothes -- shoes-to-belt
		{
			int shoeEnd = randInt(2,man?6:7); // man:[2..6] woman:[2..7]
			int sockEnd = randInt(3,man?6:8); // man:[3..6] woman:[3..8]
			int pantBeg = randInt(4,9); // all:[4..9]
			int pantEnd = randInt(10,12); // all:[10..12]

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
				int jacketEnd = randInt(20,22);
				if( index<=jacketEnd || (1<=index2 && index2<=2)) color = colorJacket();
					else
				if( index==21 ) color = colorShirt(); // shirt
					else
				color = colorHumanSkin();
			}
			else
			{	// there is no jacket

				int shirtBeg = randInt(11,13);
				int shirtEnd = randInt(15,18);
				int shirtTop = randInt(19,22);
				if( (shirtBeg<=index && index<=shirtEnd) || (1<=index2 && index2<=2) ) color = colorShirt();
					else
				if( 20<=index && index<=shirtTop ) color = colorShirt();
					else
				color = colorHumanSkin();
			}
		}
		else
		{ // head
			color = recodeHead(index,index2);
		}
		
		return color;
	}

	vec4 recodeFormalColor( vec4 color )
	{
		int index = int(round(100.0*color.r));
		int index2 = int(round(100.0*color.g));
		
		if( index<=11 ) // bottom clothes -- shoes-to-belt
		{
			int shoeEnd = randInt(2,3); // all:[2..3]
			int sockEnd = man?0:4;
			int pantBeg = man?4:randInt(7,9); // man:[4] woman:all:[7..9]
			int pantEnd = 10; // all:[10]

			if( index==1 ) color = colorShoeSole();
				else
			if( index<=shoeEnd ) color = colorShoeSkinFormal();
				else
			if( index<=sockEnd ) color = colorSock();
				else
			if( index<pantBeg ) color = colorHumanSkin();
				else
			if( index<=pantEnd ) color = colorPantsFormal();
				else
			if( index==11 ) color = colorBeltFormal();
				else
			color = colorHumanSkin();
		}
		else
		if( index<=22 ) // upper clothes -- belt-to-neck-and-sleeves
		{
			bool jacket = randBool(0.75);
			
			if( index==19 && index2==0 ) color = colorHumanSkin(); // hands
				else
			if( jacket )
			{
				int jacketEnd = randInt(20,22);
				if( index<=jacketEnd || (1<=index2 && index2<=2)) color = colorJacketFormal();
					else
				if( index==21 ) color = colorShirtFormal(); // shirt
					else
				color = colorHumanSkin();
			}
			else
			{	// there is no jacket

				int shirtBeg = 11;
				int shirtEnd = randInt(16,18 );
				int shirtTop = 21;
				if( (shirtBeg<=index && index<=shirtEnd) || (1<=index2 && index2<=2) ) color = colorShirtFormal();
					else
				if( 20<=index && index<=shirtTop ) color = colorShirtFormal();
					else
				color = colorHumanSkin();
			}
		}
		else
		{ // head
			color = recodeHead(index,index2);
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
			man = vRandomId<0.5;
			//texelColor = recodeUndressedColor( texelColor );
			//texelColor = recodeInformalColor( texelColor );
			texelColor = recodeFormalColor( texelColor );
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