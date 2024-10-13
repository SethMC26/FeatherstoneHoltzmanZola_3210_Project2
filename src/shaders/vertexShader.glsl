out float rand;
out vec4 transformPos; 
uniform float scaleFactor;

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
        scaleFactor, 0.0, 0.0, 0.0,
        0.0, scaleFactor, 0.0, 0.0,
        0.0, 0.0, scaleFactor, 0.0,
        0.0, 0.0,      0.0 , 1
    );

    //scale our position by our scaling factor
    transformPos = scalingMat * vec4(position, 1.0);

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * transformPos;
}