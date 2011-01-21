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

void	main(void) {
	gl_Position = uPMatrix * uEMatrix * uMVMatrix * vec4(POSITION, 1.0);
}
