// Indices of refraction
const float Air = 1.0;
const float Glass = 1.51714;

// Air to glass ratio of the indices of refraction (Eta)
const float Eta = Air / Glass;
 
// see http://en.wikipedia.org/wiki/Refractive_index Reflectivity
const float R0 = ((Air - Glass) * (Air - Glass)) / ((Air + Glass) * (Air + Glass));

uniform vec4 u_camera;

out vec3 v_reflection;
out vec3 v_refraction;
out float v_fresnel;

varying vec2 vUv;

void main(void)
{
	// We calculate in world space.
	vUv = uv;

	vec4 vertex = modelMatrix * vec4(position, 1.0);
	
	vec3 incident = normalize(vec3(vertex-u_camera));

	// Assume incoming normal is normalized.
	vec3 normal = normalMatrix * normal;
	
	v_refraction = refract(incident, normal, Eta);
	v_reflection = reflect(incident, normal);
			
	v_fresnel = R0 + (1.0 - R0) * pow((1.0 - dot(-incident, normal)), 5.0);
		
	//gl_Position = viewProjectionMatrix * vertex;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}