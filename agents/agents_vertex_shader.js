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
	//varying vec3 vVertexColor;
	attribute float infectionLevel;
	attribute float agentId;
	attribute float agentHeight;
	varying float vInfectionLevel;
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
	#define applyFoot(matrix,offset) foot.y -= offset; foot *= matrix; foot.y += offset;
	
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
	//vVertexColor = aVertexColor;
	vInfectionLevel = infectionLevel;
	
//TODO-TEMP	float speed = 1.6+0.4*sin(agentId); // speed of walking
	float speed = 1.6; // speed of walking
	float baseAngle = 0.2*speed;

	float rawTime = speed*uTime + agentId*15.0;
//TODO-TEMP	float time = mod(rawTime, 2.0*PI); // time loop [0,2π]

	//float mod2 = mod(rawTime,2.0)-1.0;
	//float mod4 = floor(mod(rawTime,4.0)/2.0);
	float time = mod(rawTime, 2.0*PI);
	
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

/*
	// feet
	if( aVertexTopology == FEET )
	{
		float k = mirror*cosine,
			  a = 0.5*baseAngle*k*k*(1.0-k);
		
		rot = rotX(a);

		apply(rot,0.06);
	}
*/
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
		
		rot = rotX(a) * rotZ(mirror*0.08); // woman 0.16, man = 0.08

		apply(rot,0.5);

		transformed.y -= 0.02*mirror*cosine;
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

	//transformed.y += 0.02-agentHeight*(0.01-0.01*sin(2.0*time));
	//transformed.z += 0.2*baseAngle*speed*mod(uTime,100.0)*agentHeight;

	float cycleA = round(0.5+0.5*sign(sin(time)));
	float cycleB = round(0.5-0.5*sign(cos(time-0.2))); // left-right
//vInfectionLevel = round(2.0*(0.5+0.5*sign(cos(time-0.4))) + (0.5+0.5*sign(sin(time))))/3.0;
//vInfectionLevel = cycleB;
	
	vec3 posKnee,  negKnee;
	vec3 posAnkle, negAnkle;
	vec3 posToe,   negToe;
	float a,k;
	
	#define UPPER_LEN bodyScale*(0.23)
	#define LOWER_LEN bodyScale*(0.265)
//	#define FOOT_LEN bodyScale*(0.03)
	
	a = -baseAngle * (-0.25 + sine);
	posKnee.y = UPPER_LEN*cos(a);
	posKnee.z = UPPER_LEN*sin(a);
	k = cosine;
	a = a + 1.2*baseAngle*k*(1.0-k);
	posAnkle.y = posKnee.y + LOWER_LEN*cos(a);
	posAnkle.z = posKnee.z + LOWER_LEN*sin(a);
	//k = cosine;
	//a = a + /*0.5*baseAngle*k*k*(1.0-k) +*/ PI/2.0 - 0.1;
	//posToe.y = posAnkle.y + FOOT_LEN*cos(a);
	//posToe.z = posAnkle.z + FOOT_LEN*sin(a);
	

	a = -baseAngle * (-0.25 - sine);
	negKnee.y = UPPER_LEN*cos(a);
	negKnee.z = UPPER_LEN*sin(a);
	k = -cosine;
	a = a + 1.2*baseAngle*k*(1.0-k);
	negAnkle.y = negKnee.y + LOWER_LEN*cos(a);
	negAnkle.z = negKnee.z + LOWER_LEN*sin(a);
	//k = -cosine;
	//a = a + /*0.5*baseAngle*k*k*(1.0-k)*/ + PI/2.0 - 0.1;
	//negToe.y = negAnkle.y + FOOT_LEN*cos(a);
	//negToe.z = negAnkle.z + FOOT_LEN*sin(a);

	float dY = (1.0-cycleB)*posAnkle.y + cycleB*negAnkle.y;
	float dZ = (1.0-cycleB)*posAnkle.z + cycleB*negAnkle.z;
	
	//dY = (1.0-cycleB)*posToe.y + cycleB*negToe.y;
	//dZ = (1.0-cycleB)*posToe.z + cycleB*negToe.z;
	
	//dY = max(posToe.y,negToe.y);
	dY = max(posAnkle.y,negAnkle.y);
	
	transformed.y -= 0.47-dY;
	transformed.z -= dZ;
	
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