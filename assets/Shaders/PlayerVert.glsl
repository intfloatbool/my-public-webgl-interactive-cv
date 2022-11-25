varying vec3 v_view_direction;
varying vec3 v_normal;
varying vec2 v_texture_coordinate;

varying vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    v_texture_coordinate = vUv.xy;
    v_view_direction = -modelViewMatrix[3].xyz;
    v_normal = normalMatrix * normal;
}