// Modified from THREE.ShaderLib.phong.vertexShader
//
// Modified code is in COVID19SYM


import {INFECTION_OVERHEAD_INDICATOR, MALE_RATIO, INFECTION_COLOR_INDICATOR, FORMAL_CLOTHING_RATIO, CASUAL_CLOTHING_RATIO} from '../config.js';

export default `

#define COVID19SYM


#define PHONG
varying vec3 vViewPosition;
varying vec3 vNormal;

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
	attribute float agentSpeed;		// speed of walking 0.8~2.0 m/s
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
	
	float rawTime;

	float sinTime( float speed ) // [-1,1]
	{
		return sin( mod( rawTime*speed, 2.0*PI ) );
	}

	float cosTime( float speed ) // [-1,1]
	{
		return cos( mod( rawTime*speed, 2.0*PI ) );
	}

	float cosTime2( float speed, float offset ) // [-1,1]
	{
		return cos( mod( rawTime*speed+offset, 2.0*PI ) );
	}

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
	
	//#define apply(matrix,offset) transformed.y -= offset; transformed *= matrix; vNormal *= matrix; transformed.y += offset;
	#define apply(matrix,offset) transformed.y -= offset; transformed *= matrix; transformed.y += offset;
	#define applyMatrix(matrix,offset) transformed -= offset; transformed *= matrix; transformed += offset;
	#define applyVertex(matrix) transformed *= matrix;;
	
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
	#define BODY  0
	#define HEAD  1
	#define HANDS 2
	#define NIPS  3
	#define BELLY 4
	#define HAIR  5
	#define OVERHEAD 6
	#define LEGS  7
	#define KNEES 8
	#define FEET  9
	
	#define SKIRT_TOP		10
	#define SKIRT_BOTTOM	11
							
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
	transformedNormal = mix(vec3(0,1,0),transformedNormal,0.9);

	if( !man )
	if( aVertexTopology == NIPS )
	{
		//transformedNormal.z *= 1.0+1.0*sin(40.0*abs(position.x));
	}
#endif

	#include <begin_vertex>


#ifdef COVID19SYM
	

	rawTime = agentSpeed*uTime; // [0,inf]
 
	float sine = sinTime(1.0);
	float cosine = cosTime(1.0);
	float leftRight = sign(transformed.x);	// left(+1) or right(-1)

	#define JOINT_HANDS		vec3( 0.12*leftRight,  0.78,   0.0   )
	#define JOINT_NECK		vec3( 0.0,             0.88,   0.04  )
	#define JOINT_SUBNECK	vec3( 0.0,             0.78,   0.04  )
	#define JOINT_TIPTOE	vec3( 0.0,             0.0,    0.112 )
	#define JOINT_HEEL		vec3( 0.0,             0.048, -0.015 )
	#define JOINT_ANKLE		vec3( 0.0,             0.018,  0.015 )
	#define JOINT_WAIST		vec3( 0.0,             0.5,    0.11  )
	#define JOINT_HIP		vec3( 0.096*leftRight, 0.495,  0.026 )
	#define JOINT_OTHER_HIP	vec3(-0.096*leftRight, 0.495,  0.026 )
	#define JOINT_KNEE		vec3( 0.0,             0.27,   0.025 )
	#define JOINT_OVERHEAD	vec3( 0.0,             1.09,   0.046 )
	#define JOINT_OH_SLEEP	vec3( 0.0,             0.8,    0.006 )
	
	
	
	

	mat3 rot; // general purpose rotation matrix
	

	bool hasSkirt = !man && (fract(2.901/randomId)< (vClothing==INTIMATE_CLOTHING?0.3:0.8));
	
	float fat = (man?1.0:0.5)*pow(0.5+0.5*sin(1.234*agentId),2.0);

	float anthroScale = mapLinear( agentAge, 12.0, 50.0, 0.0, 1.0); // 1 = adult features; 0 = child features
	
	// rescale the head
	if( aVertexTopology == HEAD || aVertexTopology == HAIR )
	{
		float headScale = clamp( 1.7/agentHeight, 1.00, 1.60 );
		
		transformed -= JOINT_SUBNECK;
		transformed *= headScale;
		transformed += JOINT_SUBNECK;
	}
	
	// belly - slim and fat people
	if( aVertexTopology == BELLY || aVertexTopology == NIPS || ((transformed.z>0.0) && (aVertexTopology == SKIRT_TOP || aVertexTopology == SKIRT_BOTTOM)) )
	{
		transformed.x *= mapLinear( transformed.y, 0.43, 0.7, 1.0+fat*0.1, 1.0+fat*0.4);
		transformed.z *= mapLinear( transformed.y, 0.43, 0.7, 1.0+fat*2.0, 1.0+fat*0.5);
	}
		
	// masculite/feminine hip
	#define HIP_CENTER 0.55
	#define HIP_SPAN 0.1
	float hipScale = 1.0;
	if( !man )
	{
		if( !hasSkirt && (HIP_CENTER-HIP_SPAN)<transformed.y && transformed.y<(HIP_CENTER+HIP_SPAN) )
		{	// HIP_CENTER-HIP_SPAN <- HIP_CENTER -> HIP_CENTER+HIP_SPAN
			float y = PI*(transformed.y-HIP_CENTER)/HIP_SPAN;
			hipScale = 1.0 + anthroScale*(0.1+0.05*fract(3.2/randomId))*clamp(0.5+0.5*cos(y)-0.3*fat,0.0,1.0);
			transformed.x *= hipScale;
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

		if( aVertexTopology == HANDS )
		{
			transformed -= JOINT_HANDS;
			transformed *= vec3(0.8,1.0,0.8); //smaller
			transformed += JOINT_HANDS;
		}
	}
	
	// masculite/feminine shoulders
	#define SHOULDER_CENTER 0.85
	#define SHOULDER_SPAN 0.1
	if( aVertexTopology == HANDS )
	if( (SHOULDER_CENTER-SHOULDER_SPAN)<transformed.y && transformed.y<(SHOULDER_CENTER+SHOULDER_SPAN) )
	{	
		float y = PI*(transformed.y-SHOULDER_CENTER)/SHOULDER_SPAN;
		transformed.x *= 1.0 + anthroScale*(man?0.10:-0.2)*(0.7+0.3*cos(y));
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
		if( ${INFECTION_OVERHEAD_INDICATOR?'true':'false'} )
			{
				vec3 n = normalize(mat3(instanceMatrix) * objectNormal);

				float normalAngle = atan( n.x, n.z );
				
				rot = rotX( PI/2.0-uViewBeta ) * rotY( uViewAlpha-normalAngle );
				
				applyMatrix( rot, JOINT_OVERHEAD );

				if( motionType == MOTION_TYPE_SLEEP )
				{
					rot = rotX( -PI/2.0 );
					applyMatrix( rot, JOINT_OH_SLEEP );
				}
				
				vNormal = vec3(0,0,1);
			}
		else
			transformed = vec3(0); // hide overhead indicator
	}

	if( motionType == MOTION_TYPE_WALK ) //--------------------------------- WALK
	{
		float walkingPhase = mod( rawTime*2.0/PI, 4.0 );
		
		// head
		if( aVertexTopology == HEAD )
		{
			float a = 0.4*sinTime(0.3)*sinTime(0.5);
			float b = 0.1*cosine;
				  
			rot = rotY(a)*rotX(b);
			applyMatrix( rot, JOINT_NECK );
		}

		// swing hands and move shoulder
		if( aVertexTopology == HANDS )
		{
			float a = -0.25*leftRight*sine+0.1;
			
			rot = rotX(a);
			applyMatrix( rot, JOINT_HANDS );
		}

		// skirt - extrude it 
		if( hasSkirt && (aVertexTopology == SKIRT_TOP || aVertexTopology == SKIRT_BOTTOM) )
		{
			float skirtLength = 0.15+0.20*fract(3.81/randomId);
			float skirtWidth = 1.2+1.8*pow(fract(2.37/randomId),1.0)*(0.6-skirtLength);

			if( aVertexTopology == SKIRT_TOP )
			{
				transformed.x += 0.030*sign(transformed.x);
				transformed.y -= 0.04;
				transformed.z += 0.02*sign(transformed.z)-0.005;
			}

			if( aVertexTopology == SKIRT_BOTTOM )
			{
				transformed.x *= skirtWidth;
				transformed.y -= skirtLength;
				transformed.z += 0.03*sign(transformed.z)*skirtWidth;
				
				// walking forward - skirt motion
				transformed.z += 0.1*leftRight*sine/(0.2+skirtWidth)*mapLinear(skirtLength,0.15,0.40,0.3,2.2);
				transformed.x += 0.1*leftRight*sine/(0.2+skirtWidth)*mapLinear(skirtLength,0.15,0.40,0.1,0.3);
			}
		}


		// feet
		if( FEET == aVertexTopology )
		{
			float a = -0.2*pow(0.5+0.5*leftRight*sinTime(1.0),2.0);

			rot = rotX(a);
			applyMatrix ( rot, JOINT_ANKLE );
		}

		// knees
		if( FEET >= aVertexTopology && aVertexTopology >= KNEES )
		{
			float k = -leftRight*cosine,
			      a = 0.5*k*(1.0-k);

			rot = rotX(a);
			applyMatrix ( rot, JOINT_KNEE );
		}

		// legs
		if( FEET >= aVertexTopology && aVertexTopology >= LEGS )
		{
			
			float a = 0.1+0.27*leftRight*(sine);
			
			rot = rotX(a);
			applyMatrix( rot, JOINT_HIP );
		}

	transformed.z += 0.045*(0.5+0.7*cosTime2(2.0,-0.25));
		
/**********************
		float MAX_ALPHA_1_F0 = 0.2;
		float MAX_ALPHA_2_F0 = 0.2;
		float MAX_ALPHA_3_F0 = 0.2;
		float MAX_ALPHA_4_F0 = -0.50;
		float MAX_ALPHA_5_F0 = 0.0;
		float MAX_ALPHA_6_F0 = -0.7;
		float MAX_ALPHA_7_F0 = 0.0;
		
		float MAX_ALPHA_1_F1 = 0.0;
		float MAX_ALPHA_2_F1 = -0.2;
		float MAX_ALPHA_3_F1 = 0.1;
		float MAX_ALPHA_4_F1 = 0.0;
		float MAX_ALPHA_5_F1 = 0.4;
		float MAX_ALPHA_6_F1 = -1.2;
		float MAX_ALPHA_7_F1 = 0.2;
		
		float MAX_ALPHA_1_F2 = -0.8;
		float MAX_ALPHA_2_F2 = 0.0;
		float MAX_ALPHA_3_F2 = 0.7;
		float MAX_ALPHA_4_F2 = 0.0;
		float MAX_ALPHA_5_F2 = 0.57;
		float MAX_ALPHA_6_F2 = -0.2;
		float MAX_ALPHA_7_F2 = 0.0;
		
		bool LEFT  = (leftRight > 0.0);
		bool RIGHT = (leftRight < 0.0);
		
//if(walkingPhase>2.0) walkingPhase=4.0-walkingPhase;

		float phase = fract( walkingPhase ); // phase [0,1) inside the current walking phase
		//if( walkingPhase>0.9999 ) phase = 1.0;

// if( sinTime(120.0)<0.0 )
// {
// walkingPhase=0.0;
// phase=0.0;
// }
// else
// {
// walkingPhase=1.0;
// phase=1.0;
// }
	
if( walkingPhase>=2.0 )
{
	walkingPhase -= 2.0;
	LEFT = !LEFT;
	RIGHT = !RIGHT;
}

		// phase [0..1] weight on left foot, before midpoint
		if( walkingPhase<1.0 )
		{
			float alpha_1  = max( MAX_ALPHA_1_F1, mapLinear( phase, 0.0, 0.3, MAX_ALPHA_1_F0, MAX_ALPHA_1_F1 ) );
			float alpha_2  = mapLinear( phase, 0.0, 1.0, MAX_ALPHA_2_F0,  MAX_ALPHA_2_F1 );
			float alpha_3  = mapLinear( phase, 0.0, 1.0, MAX_ALPHA_3_F0,  MAX_ALPHA_3_F1 );
			float alpha_4  = mapLinear( phase, 0.0, 1.0, MAX_ALPHA_4_F0,  MAX_ALPHA_4_F1 );
			float alpha_5  = mapLinear( phase, 0.0, 1.0, MAX_ALPHA_5_F0,  MAX_ALPHA_5_F1 );
			float alpha_6  = mapLinear( phase, 0.0, 1.0, MAX_ALPHA_6_F0,  MAX_ALPHA_6_F1 );
			float alpha_7  = mapLinear( phase, 0.0, 1.0, MAX_ALPHA_7_F0,  MAX_ALPHA_7_F1 );

alpha_6 -= 0.3*(0.5+0.5*cos(2.0*PI*(phase-0.5)));

			if( RIGHT )
			{
				// right knee
				if( aVertexTopology == FEET && RIGHT )
				{
					applyMatrix( rotX(alpha_7), JOINT_ANKLE );
					applyMatrix( rotX(alpha_6), JOINT_KNEE );
					applyMatrix( rotX(alpha_5), JOINT_HIP );
					applyMatrix( rotX(alpha_4), JOINT_HIP );
					applyMatrix( rotX(alpha_3), JOINT_KNEE );
					applyMatrix( rotX(alpha_2), JOINT_ANKLE );
				}

				// right knee
				if( aVertexTopology == KNEES )
				{
					applyMatrix( rotX(alpha_6), JOINT_KNEE );
					applyMatrix( rotX(alpha_5), JOINT_HIP );
					applyMatrix( rotX(alpha_4), JOINT_HIP );
					applyMatrix( rotX(alpha_3), JOINT_KNEE );
					applyMatrix( rotX(alpha_2), JOINT_ANKLE );
				}

				// right leg
				if( aVertexTopology == LEGS )
				{
					applyMatrix( rotX(alpha_5), JOINT_HIP );
					applyMatrix( rotX(alpha_4), JOINT_HIP );
					applyMatrix( rotX(alpha_3), JOINT_KNEE );
					applyMatrix( rotX(alpha_2), JOINT_ANKLE );
				}
			} // RIGHT
			
			// upper body
			if( aVertexTopology >= BODY && aVertexTopology <= OVERHEAD || aVertexTopology >= SKIRT_TOP )
			{
				applyMatrix( rotX(alpha_4), JOINT_HIP );
				applyMatrix( rotX(alpha_3), JOINT_KNEE );
				applyMatrix( rotX(alpha_2), JOINT_ANKLE );
			}

			if( LEFT )
			{
				// left knee
				if( aVertexTopology == LEGS )
				{
					applyMatrix( rotX(alpha_3), JOINT_KNEE );
					applyMatrix( rotX(alpha_2), JOINT_ANKLE );
				}

				// left ankle
				if( aVertexTopology == KNEES )
				{
					applyMatrix( rotX(alpha_2), JOINT_ANKLE );
				}

				// left foot
				if( aVertexTopology == FEET )
				{
					applyMatrix( rotX(alpha_1), JOINT_HEEL );
				}
			} // LEFT
		}

		else
			
		if( walkingPhase<=2.0 )
		{
			// phase [1..2] weight on left foot, after midpoint

			float alpha_1  = mapLinear( phase, 0.0, 1.0, MAX_ALPHA_1_F1,  MAX_ALPHA_1_F2 );
			float alpha_2  = mapLinear( phase, 0.0, 1.0, MAX_ALPHA_2_F1,  MAX_ALPHA_2_F2 );
			float alpha_3  = mapLinear( phase, 0.0, 1.0, MAX_ALPHA_3_F1,  MAX_ALPHA_3_F2 );
			float alpha_4  = mapLinear( phase, 0.0, 1.0, MAX_ALPHA_4_F1,  MAX_ALPHA_4_F2 );
			float alpha_5  = mapLinear( phase, 0.0, 1.0, MAX_ALPHA_5_F1,  MAX_ALPHA_5_F2 );
			float alpha_6  = mapLinear( phase, 0.0, 1.0, MAX_ALPHA_6_F1,  MAX_ALPHA_6_F2 );
			float alpha_7  = mapLinear( phase, 0.0, 1.0, MAX_ALPHA_7_F1,  MAX_ALPHA_7_F2 );
			
			if( RIGHT )
			{
				// right knee
				if( aVertexTopology == FEET && RIGHT )
				{
					applyMatrix( rotX(alpha_7), JOINT_ANKLE );
					applyMatrix( rotX(alpha_6), JOINT_KNEE );
					applyMatrix( rotX(alpha_5), JOINT_HIP );
					applyMatrix( rotX(alpha_4), JOINT_HIP );
					applyMatrix( rotX(alpha_3), JOINT_KNEE );
					applyMatrix( rotX(alpha_2), JOINT_ANKLE );
					applyMatrix( rotX(alpha_1), JOINT_TIPTOE );
				}

				// right knee
				if( aVertexTopology == KNEES )
				{
					applyMatrix( rotX(alpha_6), JOINT_KNEE );
					applyMatrix( rotX(alpha_5), JOINT_HIP );
					applyMatrix( rotX(alpha_4), JOINT_HIP );
					applyMatrix( rotX(alpha_3), JOINT_KNEE );
					applyMatrix( rotX(alpha_2), JOINT_ANKLE );
					applyMatrix( rotX(alpha_1), JOINT_TIPTOE );
				}

				// right leg
				if( aVertexTopology == LEGS )
				{
					applyMatrix( rotX(alpha_5), JOINT_HIP );
					applyMatrix( rotX(alpha_4), JOINT_HIP );
					applyMatrix( rotX(alpha_3), JOINT_KNEE );
					applyMatrix( rotX(alpha_2), JOINT_ANKLE );
					applyMatrix( rotX(alpha_1), JOINT_TIPTOE );
				}
			} // RIGHT


			// upper body
			if( aVertexTopology >= BODY && aVertexTopology <= OVERHEAD || aVertexTopology >= SKIRT_TOP )
			{
				applyMatrix( rotX(alpha_4), JOINT_HIP );
				applyMatrix( rotX(alpha_3), JOINT_KNEE );
				applyMatrix( rotX(alpha_2), JOINT_ANKLE );
				applyMatrix( rotX(alpha_1), JOINT_TIPTOE );
			}

			if( LEFT )
			{
				// left knee
				if( aVertexTopology == LEGS )
				{
					applyMatrix( rotX(alpha_3), JOINT_KNEE );
					applyMatrix( rotX(alpha_2), JOINT_ANKLE );
					applyMatrix( rotX(alpha_1), JOINT_TIPTOE );
				}

				// left ankle
				if( aVertexTopology == KNEES )
				{
					applyMatrix( rotX(alpha_2), JOINT_ANKLE );
					applyMatrix( rotX(alpha_1), JOINT_TIPTOE );
				}

				// left foot
				if( aVertexTopology == FEET )
				{
					applyMatrix( rotX(alpha_1), JOINT_TIPTOE );
				}
			} // LEFT
		}


// if( sinTime(120.0)<0.0 )
// {
// transformed.z += 0.38;
// transformed.x += 0.13;
// }
***************************************/



		
	}
	else if( motionType == MOTION_TYPE_SLEEP ) //--------------------------------- SLEEP
	{
		// head
		if( aVertexTopology == HEAD )
		{
			float a = sinTime(0.05);
			a = sign(a)*pow(abs(a),0.5);
				  
			rot = rotY(a);
			applyMatrix( rot, JOINT_NECK );
		}

		// straddling hands
		if( aVertexTopology == HANDS )
		{
			float a = -0.4*leftRight;		// straddle towards body
				  
			rot = rotZ(a);
			applyMatrix( rot, JOINT_HANDS );
		} // hands

		// skirt - extrude it 
		float skirtLength = 0.0;
		float skirtWidth = 0.0;
		if( hasSkirt && (aVertexTopology == SKIRT_TOP || aVertexTopology == SKIRT_BOTTOM) )
		{
			skirtLength = 0.15+0.20*fract(3.81/randomId);
			skirtWidth = 1.2+1.8*pow(fract(2.37/randomId),1.0)*(0.6-skirtLength);

			if( aVertexTopology == SKIRT_TOP )
			{
				transformed.x += 0.030*sign(transformed.x);
				transformed.y -= 0.04;
				transformed.z += 0.02*sign(transformed.z)-0.005;
			}

			if( aVertexTopology == SKIRT_BOTTOM )
			{
				transformed.x *= skirtWidth*(transformed.z>0.0?1.5:1.1);
				transformed.y -= skirtLength*(transformed.z>0.0?0.7:1.0);
				
				if( transformed.z>0.05 )
				{
					// skirt is above legs
					transformed.z = 0.75*skirtLength;
				}
			}

		}

		// waist
		if( aVertexTopology < LEGS || aVertexTopology > FEET )
		{
			rot = rotX(-0.8);
			applyMatrix( rot, JOINT_HIP );
			transformed.y += 0.05;
			transformed.z += 0.05;
		}

		// knees
		if( aVertexTopology < KNEES || aVertexTopology > FEET )
		{
			rot = rotX(1.55);
			applyMatrix( rot, JOINT_KNEE );
		}

		// legs
		if( aVertexTopology != FEET )
		{
			rot = rotX(0.8);
			applyMatrix( rot, JOINT_ANKLE );
		}

		// belly breathing
		if( aVertexTopology == BELLY || (!hasSkirt && (aVertexTopology == SKIRT_TOP || aVertexTopology == SKIRT_BOTTOM)) )
		{
			transformed.y *= 1.0+0.1*sinTime(0.2);
		}
		
		// skirt - collision with floor and legs
		if( hasSkirt )
		{
			if( aVertexTopology == SKIRT_TOP || aVertexTopology == SKIRT_BOTTOM )
				transformed.y = max(transformed.y,0.001);
			if( aVertexTopology == BODY )
				transformed.y = max(transformed.y,0.01);
		}

	} // sleep
	else if( motionType == MOTION_TYPE_STAND ) //--------------------------------- STAND
	{
		
		// swinging hand while standing
		if( aVertexTopology == HANDS )
		{
			float a = 0.1*sinTime(0.2)*leftRight;	// swing forward/backward
			float b = 0.0*(0.27-0.05*fat)*leftRight;		// straddle towards body
				  
			rot = rotX(a) * rotZ(b);
			applyMatrix( rot, JOINT_HANDS );
		} // hands

		// moving head as if looking around
		if( aVertexTopology == HEAD )
		{
			float a = 0.2*pow(sinTime(0.1),3.0)*pow(sinTime(0.17),5.0);	// turn left/right
			float b = -0.15+0.15*cosTime(0.04);	// nodding
				  
			rot = rotY(a) * rotX(b);
			applyMatrix( rot, JOINT_NECK );
		} // head


		// closing legs for women
		if( !man && FEET >= aVertexTopology && aVertexTopology >= LEGS )
		{
			float a = 0.09*leftRight;
			
			// feet must be horizontal
			if( aVertexTopology == FEET )
			{
				rot = rotZ(-a);
				applyMatrix( rot, JOINT_ANKLE );
			}
			
			rot = rotZ(a);
			applyMatrix( rot, JOINT_HIP );
		} // legs
		
		
		// skirt - extrude it 
		if( hasSkirt && (aVertexTopology == SKIRT_TOP || aVertexTopology == SKIRT_BOTTOM) )
		{
			float skirtLength = 0.15+0.20*fract(3.81/randomId);
			float skirtWidth = 1.2+1.8*pow(fract(2.37/randomId),1.0)*(0.6-skirtLength);

			if( aVertexTopology == SKIRT_TOP )
			{
				transformed.x += 0.030*sign(transformed.x);
				transformed.y -= 0.04;
				transformed.z += 0.02*sign(transformed.z)-0.005;
			}

			if( aVertexTopology == SKIRT_BOTTOM )
			{
				transformed.x *= skirtWidth;
				transformed.y -= skirtLength;
				transformed.z += 0.03*sign(transformed.z)*skirtWidth;
			}
		} // skirt

	} // stand
	
	
	if( motionType == MOTION_TYPE_WALK )
	{
		if( aVertexTopology <= LEGS || aVertexTopology >= SKIRT_TOP )
		{
			// move body up-down (simulation)
			transformed.y += 0.01+0.01*sinTime(2.0);
		}
	}

//vNormal = normalize( vec3(0,1,-1)+transformedNormal );
vNormal = normalize( transformedNormal );
//vNormal = vec3(0,1,0);


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