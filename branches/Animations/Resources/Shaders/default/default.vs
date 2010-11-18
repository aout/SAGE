attribute vec3 POSITION;
attribute vec3 NORMAL;
attribute vec2 TEXCOORD;
attribute vec3 TEXTANGENT;
attribute vec3 TEXBINORMAL;

uniform mat4 uMVMatrix;
uniform mat4 uEMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform int uLightingEnabled;

uniform vec3 uLightingDirection;

uniform vec3 uAmbientColor;
uniform vec3 uDirectionalColor;
 
varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

void	main(void) {
	gl_Position = uPMatrix * uEMatrix * uMVMatrix * vec4(POSITION, 1.0);
	vTextureCoord = TEXCOORD;
  if (uLightingEnabled == 0) {
    vLightWeighting = vec3(1.0, 1.0, 1.0);
  }
  else {
    vec4 transformedNormal = uNMatrix * vec4(NORMAL, 1.0);
    vec4 tmp = vec4(uLightingDirection, 1.0);
    float directionalLightWeighting = max(dot(transformedNormal.xyz, tmp.xyz), 0.0);
    vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;
  }
}
