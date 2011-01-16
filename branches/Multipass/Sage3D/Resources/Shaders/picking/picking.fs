#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler0;

void	main(void) {
  float z = gl_FragCoord.w;
	gl_FragData[0] = vec4(z,z,z, 1.0);
}