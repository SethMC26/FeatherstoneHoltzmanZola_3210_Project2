out float rand;  // Pass to the fragment shader

// Used to get random numbers
// Found here https://stackoverflow.com/questions/5149544/can-i-generate-a-random-number-inside-a-pixel-shader
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

    // You need the "projectionMatrix * viewMatrix * modelMatrix" which is part of ShaderMaterial
    // Without this, WebGL assumes all coordinates are within -1.0 and 1.0, which our sphere is not (check its definition)
    gl_Position =  projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    // Uncomment this and watch it DISAPPEAR because of the above assumption
    //   gl_Position = vec4( position, 1.0 );
}