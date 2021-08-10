// Modified from THREE.ShaderLib.phong.vertexShader
//
// Modified code is in COVID19SYM

export default `

#define COVID19SYM


#define PHONG
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif

#ifdef COVID19SYM
	uniform float uTime;
	attribute int aVertexTopology;
	varying vec3 vVertexColor;
	attribute float infectionLevel;
	attribute float agentId;
	attribute float randomId;
	varying float vAgentId;
	varying float vRandomId;
	attribute float agentHeight;
	attribute int motionType;
	
	//varying float vInfectionLevel;
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

#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
#endif
	#include <begin_vertex>

#ifdef COVID19SYM
	vVertexColor = vec3( 1.0, 1.0-infectionLevel, 1.0-infectionLevel );
	//vInfectionLevel = infectionLevel;
	vAgentId = agentId;
	vRandomId = randomId;
	
	man = vRandomId<0.5;
	
	float speed = 1.8+0.8*sin(agentId); // speed of walking
	float baseAngle = 0.2*1.6;

	float rawTime = speed*uTime + agentId*15.0;

	float mod2 = mod(rawTime,2.0)-1.0;
	float mod4 = floor(mod(rawTime,4.0)/2.0);
	float time = asin(clamp(mod2/0.95,-0.99,0.99)) + PI*mod4;
	
	float sine = sin(time);
	float cosine = cos(time);
	float mirror = sign(transformed.x); // left or right
	

	mat3 rot; // general purpose rotation matrix
	

	

	#define HEAD  1
	#define HANDS 2
	#define BELLY 3
	#define LEGS  4
	#define KNEES 5
	#define FEET  6
	
	// belly - slim and fat people
	if( aVertexTopology == BELLY )
	{
		float k = 1.2*pow(0.5+0.5*sin(1.234*agentId),2.0);
		transformed.x *= mapLinear( transformed.y, 0.43, 0.7, 1.0+k*0.2, 1.0+k*0.5);
		transformed.z *= mapLinear( transformed.y, 0.43, 0.7, 1.0+k*2.0, 1.0+k*0.5);
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
				  
			rot = rotX(a)*rotY(b);

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
				  
			rot = rotX(a);

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
	
	float headScale = 1.7/agentHeight,
		  bodyScale = headScale + (1.0-headScale)/0.863;

	if( aVertexTopology == HEAD )
	{
		// scale the head up and move it down
		transformed *= headScale;
		transformed.y += 1.0-headScale;

		// turning head left-right up-down
		float a = 0.6*sin(mod(0.12*rawTime,2.0*PI)),
			  b = 0.2*sin(mod(0.17*rawTime,2.0*PI));
			  
		rot = rotY(a)*rotX(b);
		
		apply(rot,0.863);
	}
	else
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
		rot = rotX(PI/2.0);
		apply(rot,0.0);
	}
	
	//float r = 0.5+0.5*sin(float(1.2*agentId)+1.76434*float(aVertexTopology));
	//float g = 0.5+0.5*cos(float(1.7*agentId)+2.16434*float(aVertexTopology));
	//float b = 0.5-0.5*sin(float(1.9*agentId)+1.134*float(aVertexTopology));
	//vVertexColor = vec3( r, g, b );
	vVertexColor = vec3( 1 );
	
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