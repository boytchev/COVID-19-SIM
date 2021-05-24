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

	// left hand
	if( transformed.x>=0.10 && transformed.y>=0.6 || transformed.x>=0.15)
	{
		float a = 0.1*sin(mod(time*0.0642,6.28));
		transformed.y -= 0.8;
		mat3 matB = mat3(1,0,0,0,cos(a),sin(a),0,-sin(a),cos(a));
		transformed *= matB;
		vNormal *= matB;
		transformed.y += 0.8;

//		vInfectionLevel = 1.0;
	}
	
	// right hand
	if( transformed.x<=-0.10 && transformed.y>=0.6 || transformed.x<=-0.15)
	{
		float a = 0.1*sin(3.1415926+mod(time*0.0642,6.28));
		transformed.y -= 0.8;
		mat3 matB = mat3(1,0,0,0,cos(a),sin(a),0,-sin(a),cos(a));
		transformed *= matB;
		vNormal *= matB;
		transformed.y += 0.8;

//		vInfectionLevel = 1.0;
	}
	
	
	// belly
	if( 0.43<=transformed.y && transformed.y<=0.7 &&
	    -0.11<=transformed.x && transformed.x<=0.11 &&
		transformed.z>0.0 
		)
		{
			float k = 1.2*pow(0.5+0.5*sin(1.234*agentId),4.0);
			transformed.x *= mapLinear( transformed.y, 0.43, 0.7, 1.0+k*0.2, 1.0+k*0.5);
			transformed.z *= mapLinear( transformed.y, 0.43, 0.7, 1.0+k*2.0, 1.0+k*0.5);
//		vInfectionLevel = 1.0;
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