#ifdef GL_ES
precision highp float;
#endif

//varying vec2 vTextureCoord;
//varying vec3 vLightWeighting;

//uniform sampler2D uSampler0;

void	main(void) {

	gl_FragData[0] = vec4(gl_FragCoord.w, gl_FragCoord.w, gl_FragCoord.w, 1.0);
}