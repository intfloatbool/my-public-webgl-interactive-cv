uniform sampler2D glowMap;
  
uniform bool horizontal;
uniform float lightMultipler;
varying vec2 vUv;

void main()
{            
    float weight[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

    for(int i = 0; i < 5; i++) {
        weight[i] = weight[i] * lightMultipler;
    }

    vec2 TexCoords = vUv; 
    vec2 tex_offset = 1.0 / vec2(textureSize(glowMap, 0)); // gets size of single texel
    vec3 result = texture(glowMap, TexCoords).rgb * weight[0]; // current fragment's contribution
    if(horizontal)
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(glowMap, TexCoords + vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
            result += texture(glowMap, TexCoords - vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
        }
    }
    else
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(glowMap, TexCoords + vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
            result += texture(glowMap, TexCoords - vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
        }
    }
    gl_FragColor = vec4(result, 1.0);
}