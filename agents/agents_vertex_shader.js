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
	
	float time = 0.9*uTime + agentId*15.0;
	float timeWalk = mod(time*0.371,2.0*PI); // time hand motion
	float mirror = sign(transformed.x);
	float swing = sin(timeWalk);
	float mirroredSwing = mirror * swing;
	
	vec3 footTipPos = vec3(0.2,0,0);
	vec3 footTipNeg = vec3(0.2,0,0);
	
	// TODO: speed of walking affects the size of step
	// which in turn affects the angle of leg motion baseAngle
	
	float baseAngle = 0.4 + 0.15*sin(agentId*4.9238);
	
	float legAngle = 1.0*baseAngle;
	float legOffset = -0.25;
	
	float kneeAngle = 2.0*legAngle;
	
	float footAngle = 0.5*legAngle;
	float footOffset = 1.5*legAngle;
	float footTimeOffset = 1.4;
	
	float handAngle = 1.25*legAngle;
	float handOffset = 0.5*legAngle;
	
	if(true)
	{
		// legs
		float posAngle = -legAngle * (legOffset + sin(timeWalk));
		float negAngle = -legAngle * (legOffset - sin(timeWalk));
		
		footTipPos.y += (0.5-0.3) * (1.0 - cos(posAngle));
		footTipNeg.y += (0.5-0.3) * (1.0 - cos(negAngle));
		
		// knees
		posAngle += -kneeAngle * ( + sin(timeWalk));
		negAngle += -kneeAngle * ( - sin(timeWalk));
		
		footTipPos.y += (0.3-0.08) * (1.0 - cos(posAngle));
		footTipNeg.y += (0.3-0.08) * (1.0 - cos(negAngle));
		
		// feet
		posAngle += footAngle * (footOffset + sin(timeWalk));
		negAngle += footAngle * (footOffset - sin(timeWalk));
		
		footTipPos.y += 0.10 * (sin(posAngle));
		footTipNeg.y += 0.10 * (sin(negAngle));
		
	}

	#define HANDS 5
	#define LEGS 6
	#define KNEES 7
	#define FEET 8
	
	
	// belly - slim and fat people
	if(  0.43<=transformed.y && transformed.y<=0.70 &&
	    -0.11<=transformed.x && transformed.x<=0.11 &&
		transformed.z>0.0 
		)
	{
		float k = 1.2*pow(0.5+0.5*sin(1.234*agentId),4.0);
		transformed.x *= mapLinear( transformed.y, 0.43, 0.7, 1.0+k*0.2, 1.0+k*0.5);
		transformed.z *= mapLinear( transformed.y, 0.43, 0.7, 1.0+k*2.0, 1.0+k*0.5);
	}
	
	// hands
	if( aVertexTopology==HANDS )
	{
		float swingAngle = handAngle * (handOffset + mirroredSwing) * (1.0-transformed.y);
		mat3 matSwing = rotX(swingAngle);

		transformed.y -= 0.79;
		transformed *= matSwing;
		vNormal *= matSwing;
		transformed.y += 0.79;
	}

	// shoulders
	if( transformed.y>=0.75 && transformed.y<=0.85 && abs(transformed.x)<=10.15 && aVertexTopology!=HANDS)
	{
		float swingAngle = -0.2*handAngle * (handOffset + swing);
		mat3 matSwing = rotY(swingAngle);

		// swing hands
		transformed *= matSwing;
		vNormal *= matSwing;
	}

	if( aVertexTopology==FEET )
	{
		float sine = mirror*sin(timeWalk-0.1);
		float k = 0.5-0.5*sine;
		
		float swingAngle = 0.1+legAngle * (legOffset + mirroredSwing) - legAngle*k*k*sine;
		
		mat3 matSwing = rotX(swingAngle);

		transformed.y -= 0.08;
		transformed *= matSwing;
		vNormal *= matSwing;
		transformed.y += 0.08;
	}
	
	
	if( aVertexTopology>=KNEES )
	{
		float sine = sin(timeWalk-PI/2.0);
		float k = 0.5+mirror*0.5*sine;
		float swingAngle = -kneeAngle * mirror * (k*k*sine);
		mat3 matSwing = rotX(swingAngle);

		transformed.y -= 0.30;
		transformed *= matSwing;
		vNormal *= matSwing;
		transformed.y += 0.30;
	}
	
	
	// legs
	if( aVertexTopology>=LEGS )
	{
		// angle and matrix of swinging hands
		float swingAngle = -legAngle * (legOffset + mirroredSwing);
		mat3 matSwing = rotX(swingAngle);
		mat3 matClose = rotZ(mirror*0.16); // woman 0.16, man = 0.08
		mat3 mat = matClose * matSwing;

		// swing legs
		transformed.y -= 0.5;
		transformed *= mat;
		vNormal *= mat;
		transformed.y += 0.5 - 0.01*mirror*sin(timeWalk+PI/2.0);
	}
	
	// waist
	if( abs(transformed.x)<=0.17 && transformed.y>0.47 && transformed.y<=0.7 )
	{
		// angle and matrix of swinging hands
		float swingAngle = -0.05 * (-0.3 + mirroredSwing);
		mat3 matSwing = rotX(swingAngle);

		// swing hands
		transformed.y -= 0.7;
		transformed *= matSwing;
		vNormal *= matSwing;
		transformed.y += 0.7 - 0.01*mirror*sin(timeWalk+PI/2.0);
	}
		
	float HEAD_Y = 0.863;
	
	
	// process head - keep it the same size independend on the model height

	float HEAD_SCALE = 1.700/agentHeight;
	float BODY_SCALE = (1.0-HEAD_SCALE)/HEAD_Y + HEAD_SCALE;

	if(aVertexTopology==1)
	{
		transformed *= HEAD_SCALE;
		transformed.y += 1.0 - HEAD_SCALE;
	}
	else
	{
		transformed *= BODY_SCALE;
	}
	
	
	// turning head left-right up-down
	
	if(aVertexTopology==1)
	{
		float a = 0.6*sin(mod(time*0.0542,6.28));
		float b = 0.2*sin(mod(time*0.0712,6.28));
		transformed.y -= HEAD_Y;
		mat3 matA = mat3(cos(a),0,sin(a),0,1,0,-sin(a),0,cos(a));
		mat3 matB = mat3(1,0,0,0,cos(b),sin(b),0,-sin(b),cos(b));
		transformed *= matA*matB;
		vNormal *= matA*matB;
		transformed.y += HEAD_Y;
	}
	
	// shoulders up-down
	if( transformed.y>0.6 && transformed.y<=0.82 )
	{
		transformed.y += 0.005*mirror*sin(timeWalk+PI/2.0);
	}

	//transformed.y -= sin(timeWalk)>0.0 ? footTipPos.y : footTipNeg.y;
	

/*
	float time = uTime + agentId/100.0;
	if( transformed.y<0.5 )
	{
		float s = 2.0*abs( mod( time/1.0, 2.0 ) - 1.0 ) - 1.0;
		
		if( transformed.x>0.1 )
		{
			transformed.z += 0.2*s;
		} else
		if( transformed.x<-0.1 )
		{
			transformed.z -= 0.2*s;
		} else
		{
			transformed.y = 0.3;
		}
	} // y<0.5
*/	
	//transformed.z += mod( time/5.0, 120.0 );
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