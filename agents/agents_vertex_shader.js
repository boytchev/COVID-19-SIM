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
	
	float time = uTime + agentId*15.0;
	float timeWalk = mod(time*0.371,2.0*PI); // time hand motion
	float timeWalk2 = mod(time*0.371-0.8,2.0*PI); // time hand motion
	
	// hands
	if( abs(transformed.x)>=0.10 && transformed.y>=0.55 || abs(transformed.x)>=0.15)
	{
		// angle and matrix of swinging hands
		float swingAngle = 0.5 * (0.2 + sign(transformed.x)*sin(timeWalk));
		mat3 matSwing = rotX(swingAngle);

		// swing hands
		transformed.y -= 0.8;
		transformed *= matSwing;
		vNormal *= matSwing;
		transformed.y += 0.8;
	}
	
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
	
	// feet
	if( transformed.y<=0.08 )
	{
		// angle and matrix of swinging hands
		float swingAngle = -0.3 * (0.2 + sign(transformed.x) * sin(timeWalk));
		mat3 matSwing = rotX(swingAngle);

		// swing hands
		transformed.y -= 0.08;
		transformed *= matSwing;
		vNormal *= matSwing;
		transformed.y += 0.08;
	}
	
	
	// knees
	if( transformed.y<=0.30 )
	{
		// angle and matrix of swinging hands
		float swingAngle = -0.3 * (0.8 + sign(transformed.x)*sin(timeWalk));
		mat3 matSwing = rotX(swingAngle);

		// swing hands
		transformed.y -= 0.30;
		transformed *= matSwing;
		vNormal *= matSwing;
		transformed.y += 0.30;
	}
	
	
	// legs
	if( abs(transformed.x)>=0.01 && abs(transformed.x)<=0.17 && transformed.y<=0.47 )
	{
		// angle and matrix of swinging hands
		float swingAngle = -0.4 * (-0.3+sign(transformed.x)*sin(timeWalk));
		mat3 matSwing = rotX(swingAngle);
		mat3 matClose = rotZ(sign(transformed.x)*0.16); // woman 0.16, man = 0.08
		mat3 mat = matClose * matSwing;

		// swing legs
		transformed.y -= 0.5;
		transformed *= mat;
		vNormal *= mat;
		transformed.y += 0.5;
	}
	
	// waist
	if( abs(transformed.x)<=0.17 && transformed.y>0.47 && transformed.y<=0.7 )
	{
		// angle and matrix of swinging hands
		float swingAngle = -0.05 * (-0.3+sign(transformed.x)*sin(timeWalk));
		mat3 matSwing = rotX(swingAngle);

		// swing hands
		transformed.y -= 0.7;
		transformed *= matSwing;
		vNormal *= matSwing;
		transformed.y += 0.7;
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
		float a = 0.4*sin(mod(time*0.0542,6.28));
		float b = 0.1*sin(mod(time*0.0712,6.28));
		transformed.y -= HEAD_Y;
		mat3 matA = mat3(cos(a),0,sin(a),0,1,0,-sin(a),0,cos(a));
		mat3 matB = mat3(1,0,0,0,cos(b),sin(b),0,-sin(b),cos(b));
		transformed *= matA*matB;
		vNormal *= matA*matB;
		transformed.y += HEAD_Y;
	}

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