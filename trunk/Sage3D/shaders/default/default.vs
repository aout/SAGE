attribute vec3 aVertex;
attribute vec2 aTexCoord0;

uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;

varying vec2 vTexCoord0;

void main(void)
{
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertex, 1.0);
	vTexCoord0 = aTexCoord0;
}