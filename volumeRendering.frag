#version 300 es
// WebGL2 requires specifying the floating point precision once per program object
precision highp float;
precision highp sampler2D;
precision highp sampler3D;

// #line 197 // This sets the line numbers to match with the line numbers in this file
uniform sampler2D entryPoints;  // The texture that holds the entry points
uniform sampler2D exitPoints;   // The texture that holds the exit points

uniform sampler3D volume;       // The texture that holds the volume data
uniform sampler2D transferFunction; // The texture that holds the transfer function data
                                    // WebGL doesn't like 1D textures, so this is a 2D
                                    // texture that is only 1 pixel high
uniform float stepSize;             // The ray step size as determined by the user
uniform int renderType;             // The value of the 'Rendering output' parameter
uniform int compositingMethod;      // The value of the 'Compositing method' parameter


// Poor man's enum for the compositing methods.  If additional compositing methods are
// added, they have to be accounted for in the rendering function as well
const int CompositingMethodFrontToBack = 0;
const int CompositingMethodFirstHitPoint = 1;
const int CompositingMethodMaximumIntensityProjection = 2;

in vec2 st; // This is the texture coordinate of the fragment that we are currently
            // computing.  This is used to look up the entry/exit points to compute the
            // direction of the ray
out vec4 out_color; // The output variable where we will store the final color that we
                    // painstakingly raycasted

/// This function computes the final color for the ray traversal by actually performing
/// the volume rendering.
/// @param entryCoord The coordinate where the ray enters the bounding box
/// @param exitCoord The coordinates where the ray exits the bounding box
/// @return The final color that this ray represents
vec4 traverseRay(vec3 entryCoord, vec3 exitCoord)
{
    // Make some space to collect the resulting color for this ray
    vec4 result = vec4(0.0);

    // Compute the ray direction based of the entry and exit coordinates
    vec3 rayDirection = exitCoord - entryCoord;

    // This is our ray-advance parameter which will go from t=0 for the entry point to
    // t=tEnd for the exit point of the ray
    float t = 0.0;

    // Actually compute tEnd
    float tEnd = length(rayDirection);

    // The user gave us a step size along the ray, so we are using it here.  Every step
    // along the ray, we are incrementing t by tIncr and have a look at the sample
    float tIncr = stepSize;

    // Start with the volume rendering.  We continue with this loop until we are either
    // reaching the end of the ray (t >= tEnd) or if our resulting color is so saturated
    // (result.a >= 0.99) that any other samples that would follow would have so little
    // impact as to make the computation unnecessary (called early ray termination)
    while (t < tEnd && result.a < 0.99)
    {
        // Compute the current sampling position along the ray
        vec3 sampleCoord = entryCoord + t * rayDirection;

        // Sample the volume at the sampling position.  The volume we are looking at is a
        // scalar volume, so it only has a single value, which we extract here from the r
        // component
        float value = texture(volume, sampleCoord).r;

        // Feed the value through the transfer function.  The 0.5 here is a crux as WebGL2
        // does not support 1D textures, so we need to choose a coordinate for the second
        // dimension.  The transfer function texture only has a single pixel in the second
        // dimension and we want to avoid any potential issues with interpolation, so we
        // access the pixel right in the center
        vec4 color = texture(transferFunction, vec2(value, 0.5));

        // This line is a bit magic.  Basically, we want to prevent that the brightness of
        // the resulting image that we generate depends on the stepSize the user chooses.
        // Higher step size means more samples per pixel, so we need to reduce the impact
        // of each sample to keep the overall pixel value roughly the same.  150 is a
        // randomly chosen value to serve as a reference contribution
        const float ReferenceSamplingInterval = 150.0;
        color.a = 1.0 - pow(1.0 - color.a, tIncr * ReferenceSamplingInterval);

        // We only want to continue if the sample we are currently using actually has any
        // contribution.  If the alpha value is 0, it will not contribute anything, so skip
        if (color.a > 0.0)
        {
            if (compositingMethod == CompositingMethodFrontToBack)
            {
                //
                //   @TODO: Implement the front-to-back compositing here
                //




            }
            else if (compositingMethod == CompositingMethodFirstHitPoint)
            {
                //
                //   @TODO: Implement the first hitpoint compositing here
                //





            }
            else if (compositingMethod == CompositingMethodMaximumIntensityProjection)
            {
                //
                //   @TODO: Implement the maximum-intensity projection here
                //




            }
        }

        // Step further along the ray
        t += tIncr;
    }

    // If we get here, the while loop above terminated, so we are done with the ray, so
    // we can return the result
    return result;
}

void main()
{
    // Access the entry point texture at our current pixel location to get the entry pos
    vec3 entryCoord = texture(entryPoints, st).rgb;
    // Access the exit point texture at our current pixel location to get the exit pos
    vec3 exitCoord = texture(exitPoints, st).rgb;

    // Poor man's enum for the render types.  These values should be synchronized with the
    // render function in case any of the numbers change
    const int RenderTypeVolumeRendering = 0;
    const int RenderTypeEntryPoints = 1;
    const int RenderTypeExitPoints = 2;
    const int RenderTypeRayDirection = 3;
    const int RenderTypeTransferFunction = 4;
    const int RenderTypeVolumeSlice = 5;
    const int RenderTypeVolumeSliceWithTransferFunction = 6;

    // The values that are checked against here have to be synced with the renderVolume
    if (renderType == RenderTypeVolumeRendering)
    {
        // Check for an early out. If the entry coordinate is the same as the exit
        // coordinate then our current pixel is missing the volume, so there is no need for
        // any ray traversal
        if (entryCoord == exitCoord)
        {
            discard;
        }

        // Perform the raycasting using the entry and the exit pos
        vec4 pixelColor = traverseRay(entryCoord, exitCoord);

        // As the raycasting might not return a fully opaque color (for example if the ray
        // exits the volume without being fully saturated), we can't just assing the color,
        // but need to mix (=lerp) it with a fully black background color
        out_color = mix(vec4(0.0, 0.0, 0.0, 1.0), pixelColor, pixelColor.a);
    }
    else if (renderType == RenderTypeEntryPoints)
    {
        // Just rendering the entry point coordinate back as a color
        out_color = vec4(entryCoord, 1.0);
    }
    else if (renderType == RenderTypeExitPoints)
    {
        // Just rendering the exit point coordinate back as a color
        out_color = vec4(exitCoord, 1.0);
    }
    else if (renderType == RenderTypeRayDirection)
    {
        // Render the ray direction as a color. We need to take the absolute value here as
        // it is difficult to render negative colors
        out_color = vec4(abs(exitCoord - entryCoord), 1.0);
    }
    else if (renderType == RenderTypeTransferFunction)
    {
        // Just render the transfer function into the viewport
        vec4 c = texture(transferFunction, vec2(st));
        out_color = vec4(c.rgb, 1.0);
    }
    else if (renderType == RenderTypeVolumeSlice)
    {
        // Take a central slice of the volume and render it to the screen. This is mainly
        // meant as a control for the next option.
        float value = texture(volume, vec3(st, 0.5)).r;
        out_color = vec4(value, value, value, 1.0);
    }
    else if (renderType == RenderTypeVolumeSliceWithTransferFunction)
    {
        // Take a central slice out of the volume and render it to the screen.  Then, apply
        // the transfer function to all pixels.  This rendering option can be used to verify
        // that the transfer function editor works as expected before trying it on the
        // volume rendering
        float value = texture(volume, vec3(st, 0.5)).r;
        vec4 c = texture(transferFunction, vec2(value, 0.5));
        out_color = vec4(c.rgb, 1.0);
    }
}
