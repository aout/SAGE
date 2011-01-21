if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Entity.js");

include("Mesh.js");
include("Texture.js");

/**
 * Entity Class
 * @param {String} name Name
 * @param {Mesh} mesh Meshes
 * @param {TextureArray} textures Textures
 */
Entity = function(name, meshes, textures) {
	this.name = name;
	this.meshes = meshes;
	this.isPickable = true;
	this.textures = textures;
};

/**
 * Destroy
 */
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
}

/**
 * Add a texture to the entity
 * @param {Texture} texture Texture Object
 */
Entity.prototype.addTexture = function(texture) {
	this.textures.push(texture);
};

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
	for (var i = 0; i < this.textures.length; ++i) {
		this.textures[i].active(shaderProgram);
	}

  for (var i = 0; i < this.meshes.length; ++i) {
    this.meshes[i].draw(shaderProgram);
  }
};
