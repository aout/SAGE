if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Entity.js");

include("Mesh.js");
include("Texture.js");

/**
 * Entity Class
 * @param {String} name Name
 * @param {Mesh} mesh Meshes
 */
Entity = function(name) {
	this.name = name;
	this.parts = [];
	this.webGL = Root.getInstance().getWebGL();
	this.isPickable = true;
};

Entity.prototype.generate = function(geometry) {
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
};

/**
 * Draw the entity
 * @param {Program} shaderProgram Shader program 
 */
Entity.prototype.draw = function(shaderProgram) {
  
    var uniforms = [
    {name: "uhasSkeleton",
    type: "Int",
    numberOfElements: 1,
    value0: 0}];
  
  shaderProgram.setUniforms(uniforms);
  
  for (var i = 0; i < this.parts.length; ++i) {
    this.parts[i].mesh.draw(this.parts[i].material, shaderProgram);
  }
};
