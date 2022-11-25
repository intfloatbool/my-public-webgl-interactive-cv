varying vec3 v_view_direction;
varying vec3 v_normal;
varying vec2 v_texture_coordinate;

void main(void)
{
   gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
   v_texture_coordinate = gl_MultiTexCoord0.xy;
   v_view_direction = -gl_ModelViewMatrix[3].xyz;
   v_normal = gl_NormalMatrix * gl_Normal;
}