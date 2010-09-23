attribute vec3 POSITION;
attribute vec3 NORMAL;
attribute vec2 TEXCOORD;
attribute vec3 TEXTANGENT;
attribute vec3 TEXBINORMAL;

uniform mat4 uMVMatrix;
uniform mat4 uEMatrix;
uniform mat4 uPMatrix;

uniform int uNumberOfLights;
uniform vec3 uLightsPositions[5];
uniform vec3 uLightsDirections[5];
uniform vec4 uLightsColors[5];
uniform int uLightsIntensities[5];

varying vec2 vTextureCoord;

void	main(void) {
	gl_Position = uPMatrix * uEMatrix * uMVMatrix * vec4(POSITION, 1.0);
	vTextureCoord = TEXCOORD;
}
