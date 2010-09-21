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
AnimatableEntity = function(name, geometry, skeleton, materials) {
  this.name = name;
  this.geometry = geometry;
  this.skeleton = skeleton;
  this.materials = materials;
  
  this.meshes = [];
};

/**
 * Destroy
 */
AnimatableEntity.prototype.destroy = function() {
  for (var i = 0; i < this.meshes.length; ++i) {
   this.meshes[i].destroy();
   delete this.meshes[i];
  }
  delete this.meshes;
}

/**
 * Draw the AnimatableEntity
 * @param {Program} shaderProgram Shader program 
 */
AnimatableEntity.prototype.draw = function(shaderProgram) {
  for (var i = 0; i < this.meshes.length; ++i) {
    this.meshes[i].draw(shaderProgram);
  }
};
