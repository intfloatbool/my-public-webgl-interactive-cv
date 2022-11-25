uniform samplerCube u_cubemap;
uniform sampler2D u_glass_texture;
in vec3 v_refraction;
in vec3 v_reflection;
in float v_fresnel;

varying vec2 vUv;

void main(void)
{
	vec4 refractionColor = texture(u_cubemap, normalize(v_refraction));
	vec4 reflectionColor = texture(u_cubemap, normalize(v_reflection));
		
	vec4 reflectColor = mix(refractionColor, reflectionColor, v_fresnel);
	vec4 glassTextureColor = texture2D(u_glass_texture, vUv.xy);
	vec4 mixReflectAndGlass = mix(reflectColor, glassTextureColor, 0.5);
	mixReflectAndGlass.r = mixReflectAndGlass.r * 0.5;
	mixReflectAndGlass.g = mixReflectAndGlass.g * 0.5;
	mixReflectAndGlass.b = mixReflectAndGlass.b * 0.5;

	mixReflectAndGlass.a = 1.0;
	gl_FragColor = mixReflectAndGlass;
}