#define scaleFactorMax 3.8
#define scaleFactormin 0.8
// Input from the vertex shader
// Input from the vertex shader
in float rand;
in vec4 transformPos; // For accessing the z-coordinate

// Uniform for scale factor
uniform float scaleFactor;

vec3 color;

void main() 
{   
    //normalize scale factor
    //NOTE this is from the main.js function Math.sin(time * asteroid.scaleSpeed) * 0.85 + 1.75 for min and max values
    //if this function changes the below code must also change highly reccomend using desmos to find min/max values
    float scaleFacNorm = (scaleFactor - 0.8 ) / (3.8 - 0.8);

    //Colors for brown orange and red 
    vec3 brownColor = vec3(0.33, 0.18, 0.02); // Brown
    vec3 orangeColor = vec3(0.81, 0.49, 0.07);  // Orange
    vec3 redColor = vec3(0.9, 0.24, 0.15); // Red

    //Scale between brown and orange (0 to 0.5) then orange to red (0.5 to 1)
    if (scaleFacNorm < 0.5) {
        color = mix(brownColor, orangeColor, scaleFacNorm * 2.0); // Convert scaleFac norm from 0 to 0.5 to 0. 1
    } else {
        color = mix(orangeColor, redColor, (scaleFacNorm - 0.5) * 2.0); // Convert scaleFac norm from 0 to 0.5 to 0. 1
    }

    float randomness = rand * 0.35; // create random value with scale 
    //not sure which one i like better 
    color -= vec3(randomness); // Add random value to each rgb 
    //color += vec3(randomness); // Add random value to each rgb 

    gl_FragColor = vec4(color, 1.0); 
}
