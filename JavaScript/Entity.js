if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Entity.js");

include("Mesh.js");

/**
 * Entity Class
 * @param {String} name Name
 * @param {Mesh} mesh Meshes
 */
Entity = function(name) {
	this.name = name;
	this.parts = [];
	this.webGL = Root.getInstance().getWebGL();
};

Entity.prototype.generate = function(geometry) {
	for (var i = 0; i < geometry.primitives.length; ++i) {
		var primitive = geometry.primitives[i];
		if (!primitive.buffers) {
			primitive.generateBuffers();
		}
		var mesh = new Mesh('bouh');
		for (var j = 0; j < primitive.buffers.length; ++j) {
			mesh.addBuffer(	primitive.buffers[j].name,
											this.webGL.ARRAY_BUFFER,
											primitive.buffers[j].data,
											Math.floor(primitive.buffers[j].data.length / primitive.buffers[j].stride),
											this.webGL.FLOAT,
											primitive.buffers[j].stride,
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
  for (var i = 0; i < this.parts.length; ++i) {
    this.parts[i].mesh.draw(this.parts[i].material, shaderProgram);
  }
};
