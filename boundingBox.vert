#version 300 es

// WebGL2 requires specifying the floating point precision once per program object
precision highp float;

// #line 77 // This sets the line numbers to match with the line numbers in this file
// Hard-code all of the vertices for a 6-face cube centered on 0 with a side-length of 1
const vec3 p0 = vec3(-1.0, -1.0, -1.0);
const vec3 p1 = vec3( 1.0, -1.0, -1.0);
const vec3 p2 = vec3( 1.0,  1.0, -1.0);
const vec3 p3 = vec3(-1.0,  1.0, -1.0);
const vec3 p4 = vec3(-1.0, -1.0,  1.0);
const vec3 p5 = vec3( 1.0, -1.0,  1.0);
const vec3 p6 = vec3( 1.0,  1.0,  1.0);
const vec3 p7 = vec3(-1.0,  1.0,  1.0);

// 6 faces * 2 triangles/face * 3 vertices/triangles = 36 vertices

const vec3 positions[36] = vec3[]
(
    p0, p2, p1,      p0, p3, p2,   // front side
    p1, p6, p5,      p1, p2, p6,   // right side
    p4, p3, p0,      p4, p7, p3,   // left side
    p4, p6, p7,      p4, p5, p6,   // back side
    p3, p6, p2,      p3, p7, p6,   // top side
    p1, p4, p0,      p1, p5, p4    // bottom side
);

// Specifies the varying variable that stores the position of the vertex.  The value of
// this variable will be interpolated in the fragment shader
out vec3 position;

// The model matrix specifies the transformation for the current bounding box
uniform mat4 modelMatrix;
// The view matrix specifies information about the location of the virtual camera
uniform mat4 viewMatrix;
// The projection matrix determines the projection and its parameters, like FOV
uniform mat4 projectionMatrix;

void main()
{
    // gl_VertexID is a library-defined variable that corresponds to the number of the
    // vertex for which the vertex shader is currently being evaluated
    vec4 p = vec4(positions[gl_VertexID], 1.0);

    // gl_Position is a library-defined variable that needs to be set by the vertex shader
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * p;

    // Just passing the value along for the fragment shader to interpolate the value
    // between the vertices
    position = p.xyz;
}