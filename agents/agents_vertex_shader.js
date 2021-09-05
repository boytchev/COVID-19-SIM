// Modified from THREE.ShaderLib.phong.vertexShader
//
// Modified code is in COVID19SYM


import {INFECTION_OVERHEAD_INDICATOR, MALE_RATIO, INFECTION_COLOR_INDICATOR, FORMAL_CLOTHING_RATIO, CASUAL_CLOTHING_RATIO} from '../config.js';

export default `

#define COVID19SYM


#define PHONG
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif

#ifdef COVID19SYM
	uniform float uTime;
	uniform float uViewAlpha;
	uniform float uViewBeta;
	
	attribute int aVertexTopology;
	varying vec3 vVertexColor;
	attribute float infectionLevel;
	attribute float agentId;
	attribute float randomId;
	varying float vAgentId;
	varying float vRandomId;
	attribute float agentHeight;
	attribute float agentSpeed;
	attribute float agentAge;
	attribute int motionType;
	attribute int mask;
	flat varying int vClothing;
	flat varying float vAge;
	flat varying float vInfectionLevel;
	flat varying int vVertexTopology;
	flat varying int vMask;
#endif

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

#ifdef COVID19SYM
	#define MOTION_TYPE_STAND 0
	#define MOTION_TYPE_WALK  1
	#define MOTION_TYPE_SLEEP 2

	bool man;
	
	float mapLinear(float value, float minIn, float maxIn, float minOut, float maxOut)
	{
		float v = clamp(value,minIn,maxIn);
		return (v-minIn)/(maxIn-minIn) * (maxOut-minOut) + minOut;
	}
	
	mat3 rotX(float angle)
	{
		float s = sin(angle);
		float c = cos(angle);
		return mat3( 1,  0,  0,
					 0,  c,  s,
					 0, -s,  c );
	}
	
	mat3 rotY(float angle)
	{
		float s = sin(angle);
		float c = cos(angle);
		return mat3(  c,  0,  s,
					  0,  1,  0,
					 -s,  0,  c );
	}
	
	mat3 rotZ(float angle)
	{
		float s = sin(angle);
		float c = cos(angle);
		return mat3(  c,  s,  0,
					 -s,  c,  0,
					  0,  0,  1 );
	}
	
	#define apply(matrix,offset) transformed.y -= offset; transformed *= matrix; vNormal *= matrix; transformed.y += offset;
	
#endif

void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	
#ifdef COVID19SYM
	//UNDEFINED   0
	#define HEAD  1
	#define HANDS 2
	#define NIPS  3
	#define BELLY 4
	#define HAIR  5
	// if INFECTION_OVERHEAD_INDICATOR is not set, then make OVERHEAD value invalid
	#define OVERHEAD ${INFECTION_OVERHEAD_INDICATOR?6:-1}
	#define LEGS  7
	#define KNEES 8
	#define FEET  9
	
	#define FORMAL_CLOTHING 1
	#define CASUAL_CLOTHING 2
	#define INTIMATE_CLOTHING 3
	
	#if (${INFECTION_COLOR_INDICATOR?1:0})
		vVertexColor = vec3( 1.0, 1.0-infectionLevel, 1.0-infectionLevel );
	#else
		vVertexColor = vec3( 1 );
	#endif

	vAgentId = agentId;
	vRandomId = randomId;
	vAge = agentAge;
	vInfectionLevel = infectionLevel;
	vMask = mask;
	vVertexTopology = aVertexTopology;

	man = vRandomId<float( ${MALE_RATIO} );

	float randomClothing = fract(7.32/randomId);
	if( randomClothing<=${ Number(FORMAL_CLOTHING_RATIO).toFixed(4) } )
		vClothing = FORMAL_CLOTHING;
	else
	if( randomClothing<=${ Number(CASUAL_CLOTHING_RATIO).toFixed(4) } )
		vClothing = CASUAL_CLOTHING;
	else
		vClothing = INTIMATE_CLOTHING;

	// flatten the 3D effect
	transformedNormal = mix(vec3(0,0,1),transformedNormal,0.7);

	if( !man )
	if( aVertexTopology == NIPS )
	{
		transformedNormal.z *= 1.0+1.0*sin(40.0*abs(position.x));
	}
#endif

#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
#endif
	#include <begin_vertex>


#ifdef COVID19SYM
	
	
	float speed = agentSpeed; //1.8+0.8*sin(agentId); // speed of walking
	float baseAngle = 0.2*1.6;

	float rawTime = speed*uTime + agentId*15.0;

	float mod2 = mod(rawTime,2.0)-1.0;
	float mod4 = floor(mod(rawTime,4.0)/2.0);
	float time = asin(clamp(mod2/0.95,-0.99,0.99)) + PI*mod4;
	
	float sine = sin(time);
	float cosine = cos(time);
	float mirror = sign(transformed.x); // left or right
	

	mat3 rot; // general purpose rotation matrix
	

	
	float fat = 1.1*pow(0.5+0.5*sin(1.234*agentId),2.0);

	float anthroScale = mapLinear( agentAge, 12.0, 50.0, 0.0, 1.0); // 1 = adult features; 0 = child features
	
	// belly - slim and fat people
	if( aVertexTopology == BELLY || aVertexTopology == NIPS )
	{
		transformed.x *= mapLinear( transformed.y, 0.43, 0.7, 1.0+fat*0.1, 1.0+fat*0.4);
		transformed.z *= mapLinear( transformed.y, 0.43, 0.7, 1.0+fat*2.0, 1.0+fat*0.5);
	}
		
	// masculite/feminine hip
	#define HIP_CENTER 0.55
	#define HIP_SPAN 0.3
	if( !man )
	{
		
		if( (HIP_CENTER-HIP_SPAN)<transformed.y && transformed.y<(HIP_CENTER+HIP_SPAN) )
		{	// HIP_CENTER-HIP_SPAN <- HIP_CENTER -> HIP_CENTER+HIP_SPAN
			float y = PI*(transformed.y-HIP_CENTER)/HIP_SPAN;
			transformed.x *= 1.0 + anthroScale*(0.1+0.05*fract(3.2/randomId))*clamp(0.5+0.5*cos(y)-0.3*fat,0.0,1.0);
		}
		
		if( aVertexTopology == NIPS )
		{
			transformed.z *= 1.0 + anthroScale*(transformed.y>0.7?0.25:0.1)*(1.0-cos(PI/0.05*transformed.x))*mapLinear( transformed.y, 0.71, 0.76, 1.2, 0.3); //forward
			transformed.x *= mapLinear( transformed.y, 0.69, 0.76, 1.3, 1.1); //sideway
		}

		if( aVertexTopology == HANDS && transformed.z<0.0 )
		{
			transformed.z *= mapLinear( transformed.y, 0.6, 0.8, 1.0, 0.5); //sideway
		}
	}
	
	// masculite/feminine shoulders
	#define SHOULDER_CENTER 0.85
	#define SHOULDER_SPAN 0.1
	if( aVertexTopology == HANDS )
	if( (SHOULDER_CENTER-SHOULDER_SPAN)<transformed.y && transformed.y<(SHOULDER_CENTER+SHOULDER_SPAN) )
	{	
		float y = PI*(transformed.y-SHOULDER_CENTER)/SHOULDER_SPAN;
		transformed.x *= 1.0 + anthroScale*(man?0.15:-0.1)*(0.5+0.5*cos(y));
		transformed.y += anthroScale*0.05*fract(5.8/randomId)*(0.5+0.5*cos(y));
	}
	
	// long hair
	#define MAX_HAIR 0.25
	float hairLength = (man?0.1:1.0)*MAX_HAIR*fract(15.1/randomId);
	if( aVertexTopology == HAIR )
	{
		transformed.z = mapLinear(hairLength,0.0,MAX_HAIR, transformed.z, -0.06);
		transformed.x *= mapLinear(hairLength,0.0,MAX_HAIR, 1.0, 2.5);
		transformed.y -= hairLength;
	}
	
	// overhead indicator
	if( aVertexTopology == OVERHEAD )
	{

		vec3 n = normalize(mat3(instanceMatrix) * objectNormal);

		float normalAngle = atan( n.x, n.z );
		
		rot = rotX( PI/2.0-uViewBeta ) * rotY( uViewAlpha-normalAngle );
		
		transformed.y -= 0.764;
		transformed *= rot;
		vNormal = vec3(0,0,1);

		if( motionType == MOTION_TYPE_SLEEP )
		{
			transformed.z -= 0.7;
			transformed.y += 0.17;
		}
		else
		{
			transformed.y += 1.064;
			transformed.z += 0.04;
		}
	}

	if( motionType == MOTION_TYPE_WALK )
	{

		// belly swing
		if( aVertexTopology == BELLY )
		{
			float a = 0.25*baseAngle*sine*sign(0.5-transformed.y);
			rot = rotY(a);
			apply(rot,0.0);

			transformed.y += - 0.005*mirror*cosine;
		}
	
		// swing hands and move shoulder
		if( aVertexTopology == HANDS )
		{
			float a = 1.25*baseAngle * (0.5*baseAngle + mirror*sine) * (0.8-transformed.y),
				  b = -0.25*baseAngle*sine;

			rot = rotX(a)*rotZ((0.27-0.05*fat)*mirror)*rotY(b);

			apply(rot,0.79);
			
			transformed.y += 0.007*baseAngle*mirror*cosine; // shoulder up-down
		}

		// knees
		if( aVertexTopology >= KNEES )
		{
			float k = mirror*cosine,
				  a = 1.2*baseAngle*k*(1.0-k);
			rot = rotX(a);

			apply(rot,0.30);
		}

		// legs
		if( aVertexTopology >= LEGS ) // includes knees and feet
		{
			float a = -baseAngle * (-0.25 + mirror*sine);
			
			rot = rotX(a) * rotZ(mirror*(man?0.08:0.18)); // woman 0.18, man = 0.08

			apply(rot,0.5);

			transformed.y -= 0.02*mirror*cosine;
		}
	}
	else if( motionType == MOTION_TYPE_SLEEP )
	{
		// knees
		if( aVertexTopology >= KNEES )
		{
			rot = rotX(-2.0);
			apply(rot,0.3);
		}

		// legs
		if( aVertexTopology >= LEGS )
		{
			rot = rotX(1.0);
			apply(rot,0.50);
		}

		// belly breathing
		if( aVertexTopology == BELLY )
		{
			transformed.z *= 1.0+0.2*sin(0.2*rawTime);
		}
	}
	else // catch section for all other motion types, including MOTION_TYPE_STAND
	{
		// swinging hand while standing
		if( aVertexTopology == HANDS )
		{
			float a = 0.25*baseAngle*mirror*sin(0.2*rawTime);
				  
			rot = rotX(a)*rotZ((0.27-0.05*fat)*mirror);

			apply(rot,0.79);
		}

		// feet must be horizontal
		if( aVertexTopology >= FEET )
		{
			rot = rotZ(-mirror*(man?0.08:0.18)); // woman 0.18, man = 0.08

			apply(rot,0.05);
		}
		
		// closing legs depending on gender
		if( aVertexTopology >= LEGS ) // includes knees and feet
		{
			rot = rotZ(mirror*(man?0.08:0.18)); // woman 0.18, man = 0.08

			apply(rot,0.5);
		}

	}
	
	// rescale the head and the body (keeping the head
	// constant size independent on the body height)
	//
	// constant head size make unproportionally big
	// heads for slamm heights, so limit the headScale
	
	float headScale = clamp( 1.7/agentHeight, 0.80, 1.80 ),
		  bodyScale = headScale + (1.0-headScale)/0.863;

	if( aVertexTopology == HEAD || aVertexTopology == HAIR )
	{
		// scale the head up and move it down
		transformed *= headScale;
		transformed.y += 1.0-headScale;

		// turning head left-right up-down
		float hair = 0.0;
		if( aVertexTopology == HAIR )
		{
			// this makes the bottom edge of long hair
			// to not move together with the hash
			hair = mapLinear(hairLength,0.0,MAX_HAIR, 0.5, 0.0);
		}
		float a = 0.6*hair*sin(mod(0.12*rawTime,2.0*PI)),
			  b = 0.2*hair*sin(mod(0.17*rawTime,2.0*PI));
			  
		rot = rotY(a)*rotX(b);
		
		apply(rot,0.863);
	}
	else
	if( aVertexTopology != OVERHEAD )
	{
		// scale the body down
		transformed *= bodyScale;
	}
	
	if( motionType == MOTION_TYPE_WALK )
	{
		if( aVertexTopology <= LEGS )
		{
			// move body up-down (simulation)
			transformed.y += 0.02*sin(time*2.0);
		}
	}
	else if( motionType == MOTION_TYPE_SLEEP )
	{
		// lying the whole body
		if( aVertexTopology != OVERHEAD )
		{
			rot = rotX(PI/2.0);
			apply(rot,0.0);
		}
	}

#endif

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}
`