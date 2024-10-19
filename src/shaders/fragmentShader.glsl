#define scaleFactorMax 3.8
#define scaleFactormin 0.8
// Input from the vertex shader
// Input from the vertex shader
in float rand;
in vec4 finalPos; // For accessing the z-coordinate

// Uniform for scale factor
uniform float scaleFactor;
uniform float time;

vec3 color;
float ugScale;

void main() 
{   
    //normalize scale factor
    //NOTE this is from the main.js function Math.sin(time * asteroid.scaleSpeed) * 0.85 + 1.75 for min and max values
    //if this function changes the below code must also change highly reccomend using desmos to find min/max values
    float scaleFacNorm = (scaleFactor - 1.5 ) / (4.5 - 1.5);

    //Colors for brown orange and red 
    vec3 color1 = vec3(0.52, 0.26, 0.02); // brown
    vec3 color2 = vec3(0.59, 0.19, 0.04);  // orangev

    //Scale colors as shape increases and descreases in size
    color = mix(color1, color2, scaleFacNorm);
    color += vec3(rand*0.2718281828459045); // Add random value to each rgb(eulers number just for fun)
    
    //scale psychedelic effect with time on a wave 
    ugScale += sin(time * 0.00015);

    //really fun variable to change !!!
    float waveSize = 0.075 * rand;

    color.x += sin(finalPos.x * waveSize) * ugScale;
    color.y += cos(finalPos.y * waveSize) * ugScale;
    color.z += sin(finalPos.z * waveSize) * ugScale;

    gl_FragColor = vec4(color, 1.0); 
}
