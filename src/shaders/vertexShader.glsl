out float rand;
out vec4 finalPos; 

uniform float scaleFactor;
uniform float time;
uniform vec3 tVec;
uniform vec3 rVec;

// Used to get random numbers
// Found here https://stackoverflow.com/questions/5149544/can-i-generate-a-random-number-inside-a-pixel-shader
//From class examples (thank you Prof. Stuetzle)
float random( vec2 p )
{
    vec2 K1 = vec2(
        23.14069263277926, // e^pi (Gelfond's constant)
        2.665144142690225 // 2^sqrt(2) (Gelfondâ€“Schneider constant)
    );
    return fract( cos( dot(p,K1) ) * 12345.6789 );
}

void main()
{  
    // Grab a random number based on the position of the vertex
    rand = random( vec2( position.x, position.y ) );

    //scaling matrix 
    mat4 scalingMat = mat4(
        scaleFactor , 0.0, 0.0, 0.0,
        0.0, scaleFactor, 0.0, 0.0,
        0.0, 0.0, scaleFactor, 0.0,
        0.0, 0.0,      0.0 , 1
    );
    
    //rotation matrixes
    float theta;
    //theta for x
    theta = rVec.x * time * 0.15;
    mat4 rotateXMat = mat4(
        1.0, 0.0,               0.0,               0.0,
        0.0, cos(theta), -sin(theta), 0.0,
        0.0, sin(theta), cos(theta),0.0,
        0.0, 0.0,            0.0,              1.0

    );

    //theta for y
    theta = rVec.y * time * 0.15;
    mat4 rotateYMat = mat4(
        cos(theta), 0.0, -sin(theta),  0.0,
        0.0, 1.0, 0.0, 0.0,
        sin(theta), 0.0,  cos(theta), 0.0,
        0.0,0.0, 0.0, 1.0
    );

    //theta for z 
    theta = rVec.z * time * 0.15;
    mat4 rotateZMat = mat4(
        cos(theta), -sin(theta), 0.0, 0,
        sin(theta), cos(theta), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
    
    //float t = 2.0;
    //translation mat not working - it displeases the shader gods 
    mat4 translateMat = mat4(
         1.0, 0.0, 0.0, 0.0,
         0.0, 1.0, 0.0, 0.0,
         0.0, 0.0, 1.0, 0.0,
         0.0, 0.0, 0.0, 1.0
    );

    vec4 transformVec =  rotateYMat * rotateXMat * scalingMat *  vec4(position, 1.0);
    //scale our position by our scaling factor
    finalPos = projectionMatrix * viewMatrix * modelMatrix * transformVec;

    //gl_Position = projectionMatrix * viewMatrix * modelMatrix * transformPos;
    gl_Position =  finalPos;
}