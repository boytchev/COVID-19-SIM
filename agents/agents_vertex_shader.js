// Modified from THREE.ShaderLib.phong.vertexShader
//
// Modified code is in COVID19SYM


import {INFECTION_OVERHEAD_INDICATOR, MALE_RATIO, INFECTION_COLOR_INDICATOR, FORMAL_CLOTHING_RATIO, CASUAL_CLOTHING_RATIO, DEBUG_LEVEL_OF_DETAIL_DISTANCE} from '../config.js';

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
//#include <displacementmap_pars_vertex>
//#include <envmap_pars_vertex>
#include <color_pars_vertex>
//#include <fog_pars_vertex>
//#include <morphtarget_pars_vertex>
//#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
//#include <clipping_planes_pars_vertex>

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
	
	#define applyMatrix(matrix,offset) transformed = (transformed-offset)*matrix+offset

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
	#define TOES  10
	
	#define SKIRT_TOP		11
	#define SKIRT_BOTTOM	12
							
	#define FORMAL_CLOTHING 1
	#define CASUAL_CLOTHING 2
	#define INTIMATE_CLOTHING 3
	
	
	#if ( ${INFECTION_COLOR_INDICATOR?1:0} )
		vVertexColor = infectionLevel>0.0 ? vec3( infectionLevel, 1.0-pow(infectionLevel,10.0), 1.0-infectionLevel ) : vec3(1);
	#else
		vVertexColor = vec3( 1 );
	#endif


	// skip some vertex modificationa if the object is too far away
	bool CLOSEUP = float(${DEBUG_LEVEL_OF_DETAIL_DISTANCE}) > distance(instanceMatrix[3].xyz/instanceMatrix[3].w,cameraPosition);



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

	if( CLOSEUP && !man && aVertexTopology == NIPS )
	{
		transformedNormal.z *= 1.0+1.0*sin(40.0*abs(position.x));
	}
#endif

	#include <begin_vertex>


#ifdef COVID19SYM
	

	rawTime = 1.04*agentSpeed*uTime; // [0,inf]

	
	float sine = sinTime(1.0);
	float cosine = cosTime(1.0);
	float leftRight = sign(transformed.x);	// left(+1) or right(-1)

	#define JOINT_HANDS		vec3( 0.12*leftRight,  0.78,   0.0   )
	#define JOINT_NECK		vec3( 0.0,             0.88,   0.04  )
	#define JOINT_SUBNECK	vec3( 0.0,             0.78,   0.04  )
	#define JOINT_TIPTOE	vec3( 0.0,             0.0,    0.112 )
	#define JOINT_TOE		vec3( 0.07*leftRight,  0.000,  0.050 )
	#define JOINT_HEEL		vec3( 0.0,             0.048, -0.015 )
	#define JOINT_ANKLE		vec3( 0.0,             0.018,  0.015 )
	#define JOINT_WAIST		vec3( 0.0,             0.5,    0.11  )
	#define JOINT_HIP		vec3( 0.096*leftRight, 0.495,  0.026 )
	#define JOINT_OTHER_HIP	vec3(-0.096*leftRight, 0.495,  0.026 )
	#define JOINT_KNEE		vec3( 0.0,             0.27,   0.025 )
	#define JOINT_OVERHEAD	vec3( 0.0,             1.09-0.35,   0.046 )
	#define JOINT_OH_SLEEP	vec3( 0.0,             0.8,    0.006 )
	
	
	
	

	mat3 rot; // general purpose rotation matrix
	

	bool hasSkirt = !man && (fract(2.901/randomId)< (vClothing==INTIMATE_CLOTHING?0.3:0.8));
	
	float fat = (man?1.0:0.5)*pow(0.5+0.5*sin(1.234*agentId),2.0);

	float anthroScale = mapLinear( agentAge, 12.0, 50.0, 0.0, 1.0); // 1 = adult features; 0 = child features
	
	// rescale the head
	if( CLOSEUP )
	{
		if( aVertexTopology == HEAD || aVertexTopology == HAIR )
		{
			float headScale = clamp( 1.7/agentHeight, 1.00, 2.00 );
			
			transformed -= JOINT_SUBNECK;
			transformed *= headScale;
			transformed += JOINT_SUBNECK;
			transformed.y -= (headScale-1.0)/10.0;
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
					transformed.y += 0.35;

					if( motionType == MOTION_TYPE_SLEEP )
					{
						transformed.y -= 0.10;
						rot = rotX( -PI/2.0 );
						applyMatrix( rot, JOINT_OH_SLEEP );
					}
					
					vNormal = vec3(0,0,1);
				}
			else
				transformed = vec3(0); // hide overhead indicator
		}
	} //if( CLOSEUP )
	
	
	if( motionType == MOTION_TYPE_WALK ) //--------------------------------- WALK
	{
		
		// head
		if( CLOSEUP && aVertexTopology == HEAD )
		{
			float a = 0.4*sinTime(0.3)*sinTime(0.5);
			float b = 0.1*cosine;
				  
			rot = rotY(a)*rotX(b);
			applyMatrix( rot, JOINT_NECK );
		}

		// swing hands 
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


		if( CLOSEUP )
		{
			// toes
			if( TOES == aVertexTopology )
			{
				float a = 0.3*pow(0.5+0.5*leftRight*cosTime2(1.0,0.95),5.0);

				rot = rotX(a);
				applyMatrix ( rot, JOINT_TOE );
			}

			// feet
			if( FEET == aVertexTopology || TOES == aVertexTopology )
			{
				float a = -0.2*pow(0.5+0.5*leftRight*sine,3.0);

				rot = rotX(a);
				applyMatrix ( rot, JOINT_ANKLE );
			}
		
			// knees
			if( TOES >= aVertexTopology && aVertexTopology >= KNEES )
			{
				float k = -leftRight*cosine,
					  a = 0.5*k*(1.0-k);

				rot = rotX(a);
				applyMatrix ( rot, JOINT_KNEE );
			}
		} // CLOSEUP
///
///		// legs
///		if( TOES >= aVertexTopology && aVertexTopology >= LEGS )
///		{
///			
///			float a = (CLOSEUP?0.1:0.0)+0.267*leftRight*sine;
///			
///			rot = rotX(a);
///
///			// closing legs for women
///			if( CLOSEUP && !man )
///			{
///				float a = 0.09*leftRight;
///				rot = rot * rotZ(a);
///			} // legs			
///
///			applyMatrix( rot, JOINT_HIP );
///		}
///
///		if( CLOSEUP )
///		{
///			// adjust sliding feet
///			transformed.z += 0.046*(0.5+0.7*cosTime2(2.0,-0.25));
///			transformed.z += 0.020*pow(cosTime2(1.0,+1.23),6.0);
///			transformed.y -= 0.002*pow(0.5+0.5*cosTime2(2.0,0.025),2.0);
///			
///			float t = mod(rawTime, PI)/PI,
///			   from = 0.4,
///			   to = 0.9;
///			if( from<=t && t<=to)
///			{
///				float span = (to-from)/2.0,
///					  halfSpan = (to+from)/2.0,
///					cospan = 0.5+0.5*cos(PI*(t-halfSpan)/span);
///				transformed.z += 0.01*cospan;
///				transformed.y -= 0.005*cospan;
///			}
///			
///			// upper body
///			if( aVertexTopology >= BODY && aVertexTopology <= OVERHEAD || aVertexTopology >= SKIRT_TOP )
///			{
///				float a = 0.04*cosTime2(2.0,-0.25);
///				applyMatrix( rotX(a), JOINT_WAIST );
///			}
		} // CLOSEUP
		
	}
	else if( motionType == MOTION_TYPE_SLEEP ) //--------------------------------- SLEEP
	{
		if( CLOSEUP )
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
		} // CLOSEUP
		
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
		if( aVertexTopology < LEGS || aVertexTopology > TOES )
		{
			rot = rotX(-0.8);
			applyMatrix( rot, JOINT_HIP );
			transformed.y += 0.05;
			transformed.z += 0.05;
		}

		// knees
		if( aVertexTopology < KNEES || aVertexTopology > TOES )
		{
			rot = rotX(1.55);
			applyMatrix( rot, JOINT_KNEE );
		}

		// legs
		if( aVertexTopology != FEET && aVertexTopology != TOES )
		{
			rot = rotX(0.8);
			applyMatrix( rot, JOINT_ANKLE );
		}

		if( CLOSEUP )
		{
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
		} // CLOSEUP
	} // sleep

	else if( motionType == MOTION_TYPE_STAND ) //--------------------------------- STAND
	{
		
		if( CLOSEUP )
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
		} // CLOSEUP

		// closing legs for women
		if( !man && TOES >= aVertexTopology && aVertexTopology >= LEGS )
		{
			float a = 0.09*leftRight;
			
			// feet must be horizontal
			if( CLOSEUP && aVertexTopology == FEET && aVertexTopology == TOES )
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
	
	
	if( CLOSEUP && motionType == MOTION_TYPE_WALK )
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

//	#include <morphtarget_vertex>		-- not neede for agents
//	#include <skinning_vertex>			-- not neede for agents
//	#include <displacementmap_vertex>	-- not neede for agents
	#include <project_vertex>
	#include <logdepthbuf_vertex>
//	#include <clipping_planes_vertex>	-- not neede for agents
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
//	#include <envmap_vertex>			-- not neede for agents
	#include <shadowmap_vertex>
//	#include <fog_vertex>				-- not neede for agents
}
`