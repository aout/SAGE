if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Entity.js");

include("Mesh.js");
include("Texture.js");

/**
 * Entity Class
 * @param {String} name Name
 * @param {Mesh} mesh Mesh
 * @param {TextureArray} textures Textures
 */
Entity = function(name, mesh, textures) {
	this.name = name;
	this.mesh = mesh;
	this.textures = textures;
};

/**
 * Destroy
 */
Entity.prototype.destroy = function() {
	this.mesh.destroy();
	delete this.mesh;
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
 * Set mesh Entity
 * @param {Mesh} mesh Mesh Object
 */
Entity.prototype.setMesh = function(mesh) {
	this.mesh = mesh;
};

/**
 * Draw the entity
 * @param {Program} shaderProgram Shader program 
 */
Entity.prototype.draw = function(shaderProgram) {
	for (var i = 0; i < this.textures.length; ++i) {
		this.textures[i].active(shaderProgram);
	}

	if (this.mesh != undefined) {
		this.mesh.draw(shaderProgram);
	}
};
