if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Entity.js");

include("Mesh.js");

/**
 * Entity Class
 * @param {String} name Name
 * @param {Mesh} mesh Meshes
 */
Entity = function(name, meshes) {
	this.name = name;
	this.meshes = meshes;
};

/**
 * Destroy
 */
/*
Entity.prototype.destroy = function() {
	for (var i = 0; i < this.meshes.length; ++i) {
	 this.meshes[i].destroy();
	 delete this.meshes[i];
	}
	delete this.meshes;
	for (var i = 0; i < this.textures.length; ++i) {
		this.textures[i].destroy();
		delete this.textures[i];
	}
	delete this.textures;
}*/

/**
 * Add a mesh to the Entity
 * @param {Mesh} mesh Mesh Object
 */
Entity.prototype.addMesh = function(mesh) {
	this.meshes.push(mesh);
};

/**
 * Draw the entity
 * @param {Program} shaderProgram Shader program 
 */
Entity.prototype.draw = function(shaderProgram) {
  for (var i = 0; i < this.meshes.length; ++i) {
    this.meshes[i].draw(shaderProgram);
  }
};
