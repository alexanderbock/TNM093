#version 300 es
// WebGL2 requires specifying the floating point precision once per program object
precision highp float;

// #line 167 // This sets the line numbers to match with the line numbers in this file
const vec2 p0 = vec2(-1.0, -1.0);
const vec2 p1 = vec2( 1.0, -1.0);
const vec2 p2 = vec2( 1.0,  1.0);
const vec2 p3 = vec2(-1.0,  1.0);
// 1 quad * 2 triangles / quad * 3 vertices / triangle = 6 vertices
const vec2 positions[6] = vec2[](p0, p1, p2,    p0, p2, p3);

// This varying variable represents the texture coordinates that are used for the rays
out vec2 st;

void main()
{
    // gl_VertexID is a library-defined variable that corresponds to the number of the
    // vertex for which the vertex shader is currently being evaluated
    vec2 p = positions[gl_VertexID];

    // We can use the position here directly
    gl_Position = vec4(p, 0.0, 1.0);

    // The positions are in range [-1, 1], but the texture coordinates should be [0, 1]
    st = (p + vec2(1.0)) / vec2(2.0);
}