varying vec2 vTexCoord0;

uniform sampler2D uTexture0;

void main(void)
{
	gl_FragColor = texture2D(uTexture0, vTexCoord0.st);
}