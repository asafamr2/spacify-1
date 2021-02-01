uniform float time; 
uniform vec2 resolution;
uniform vec4 viewvec;

uniform vec3 colorsgrad[4];
uniform float colorsgradt[2];
// void main()	{
//     float x = view[0]+view[2]*gl_FragCoord.x/resolution.x;
//     float y = view[1]+view[3]*gl_FragCoord.y/resolution.y;
//     float r = 0.5+sin(x/100.)/2.;
//     float g = 0.5+sin(y/100.)/2.;

//     gl_FragColor = vec4(vec3(smoothstep(0.,100.,x)), 1.);
// }

#define iterations 20
#define formuparam 0.52

#define volsteps 10
#define stepsize 0.1

#define zoom   0.00000800
#define tile   0.850 
#define speed  0.010 

#define brightness 0.0015
#define darkmatter 0.300
#define distfading 0.730
#define saturation 0.850


void main()
{
	//get coords and direction
	// vec2 uv=fragCoord.xy/iResolution.xy-.5;
	// uv.y*=iResolution.y/iResolution.x;
    vec2 uv;
    uv.x = viewvec[0]+viewvec[2]*gl_FragCoord.x/resolution.x;
    uv.y = viewvec[1] +viewvec[3]*gl_FragCoord.y/resolution.y;
	vec3 dir=vec3(uv*zoom -vec2(0.75),1.);
	// float time=iTime*speed+.25;

	//mouse rotation
	// float a1=.5;
	// float a2=.8;
	// mat2 rot1=mat2(cos(a1),sin(a1),-sin(a1),cos(a1));
	// mat2 rot2=mat2(cos(a2),sin(a2),-sin(a2),cos(a2));
	// dir.xz*=rot1;
	// dir.xy*=rot2;
	vec3 from=vec3(1.,.5,0.5);
	// from+=vec3(time*2.,time,-2.);
	// from.xz*=rot1;
	// from.xy*=rot2;
	
	//volumetric rendering
	float s=0.1,fade=1.;
	// vec3 v=vec3(0.);
	float accumBright = 0.;
	for (int r=0; r<volsteps; r++) {
		vec3 p=from+s*dir*.5;
		p = abs(vec3(tile)-mod(p,vec3(tile*2.))); // tiling fold
		float pa,a=pa=0.;
		for (int i=0; i<iterations; i++) { 
			p=abs(p)/dot(p,p)-formuparam; // the magic formula
			a+=abs(length(p)-pa); // absolute sum of average change
			pa=length(p);
		}
		float dm=max(0.,darkmatter-a*a*.001); //dark matter
		a*=a*a; // add contrast
		if (r>6) fade*=1.-dm; // dark matter, don't render near
		//v+=vec3(dm,dm*.5,0.);
		// v+=fade;
		// v+=vec3(s)*a*brightness*fade; // coloring based on distance
		accumBright+=dm;
		accumBright+=fade;
		accumBright+=s*a*brightness*fade;
		fade*=distfading; // distance fading
		s+=stepsize;
	}

	vec3 fromcolor;
	vec3 tocolor;
	float finalt;
	accumBright=clamp(sqrt(accumBright)/30.,0.0,1.0);
	if(accumBright > colorsgradt[1]){
		fromcolor = colorsgrad[2];
		tocolor = colorsgrad[3];
		finalt = (accumBright-colorsgradt[1]) / (1.0 -colorsgradt[1]);
	}else if(accumBright > colorsgradt[0]){
		fromcolor = colorsgrad[1];
		tocolor = colorsgrad[2];
		finalt = (accumBright-colorsgradt[0]) / (colorsgradt[1] - colorsgradt[0]);
	}else{
		fromcolor = colorsgrad[0];
		tocolor = colorsgrad[1];
		finalt = (accumBright) / (colorsgradt[0]);
	}
	gl_FragColor = vec4(mix(fromcolor, tocolor, finalt), 1.0);
	// gl_FragColor.x += 0.5 +0.5* sin(uv.x);
	// v=mix(vec3(length(v)),v,saturation); //color adjust
	// gl_FragColor = vec4(v,1.);	
	
}