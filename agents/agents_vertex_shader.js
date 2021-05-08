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
	//attribute vec3 aVertexColor;
	//varying vec3 vVertexColor;
	attribute float infectionLevel;
	attribute float agentId;
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