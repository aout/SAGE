if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("AnimatableEntity.js");

include("Mesh.js");
include("Texture.js");

/**
 * AnimatableEntity Class
 * @param {String} name Name
 * @param {Mesh} mesh Meshes
 * @param {TextureArray} textures Textures
 */
AnimatableEntity = function(name) {

	this.webGL = Root.getInstance().getWebGL();
	
	this.name = name;
	this.parts = [];
	this.skeleton = undefined;
	
	this.shaderMatrices = undefined;
};

AnimatableEntity.prototype.generate = function(geometry) {
	for (var i = 0; i < geometry.primitives.length; ++i) {
		var primitive = geometry.primitives[i];
		if (!primitive.buffers) {
			primitive.generateBuffers();
		}
		var mesh = new Mesh(geometry.attributes.id + '_primitive_' + primitive.attributes.name);
		for (var bufferName in primitive.buffers) {
			mesh.addBuffer(	bufferName,
											this.webGL.ARRAY_BUFFER,
											primitive.buffers[bufferName].data,
											Math.floor(primitive.buffers[bufferName].data.length / primitive.buffers[bufferName].stride),
											this.webGL.FLOAT,
											primitive.buffers[bufferName].stride,
											this.webGL.STATIC_DRAW);
		}
		mesh.setDrawingBuffer('POSITION');
		this.parts.push({
			mesh: mesh,
			material: primitive.material.sageMaterial
		});
	}
	
	this.skeleton = geometry.controller.skeleton.generateBindShape();
	this.shaderMatrices = this.skeleton.getShaderMatrices();
	/*this.shaderMatrices = [];
	var mat = mat4.create();
	mat4.identity(mat);
	for (var i = 0; i < 58; ++i)
	{
	  for (var j = 0; j < 16; ++j)
	  {
	    this.shaderMatrices.push(mat[j]);
	  }
	}*/
};

/**
 * Draw the AnimatableEntity
 * @param {Program} shaderProgram Shader program 
 */
AnimatableEntity.prototype.draw = function(shaderProgram) {
	
	if (!shaderProgram) {
		shaderProgram = Root.getInstance().getCurrentProgram();
	}
	
	var uniforms = [
		{name: "uJoints",
		type: "Float",
		isMatrix: true,
		numberOfElements: 4,
		value0: this.shaderMatrices},
		{name: "uhasSkeleton",
		type: "Int",
		numberOfElements: 1,
		value0: 1}];
	
	shaderProgram.setUniforms(uniforms);
	
  for (var i = 0; i < this.parts.length; ++i) {
    this.parts[i].mesh.draw(this.parts[i].material, shaderProgram);
  }
};
