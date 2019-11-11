#version 300 es
// WebGL2 requires specifying the floating point precision once per program object
precision highp float;

// #line 126 // This sets the line numbers to match with the line numbers in this file
// Incoming varying variable from the vertex shader
in vec3 position;

// Define the output variable as a vec4 (= color)
out vec4 out_color;

void main()
{
    // Using the position as the red and green components of the color since the positions
    // are in [-1, 1] and the colors are in [0, 1], we need to renormalize here
    vec3 normPos = (position + vec3(1.0)) / vec3(2.0);

    out_color = vec4(normPos, 1.0);
}