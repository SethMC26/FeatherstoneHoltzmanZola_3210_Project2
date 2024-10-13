// Input from earlier in the pipeline, the vertex shader
in float rand;

void main() 
{
    
    gl_FragColor = vec4(1.0, rand, 1.0-rand, 1.0);
}