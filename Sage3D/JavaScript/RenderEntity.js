if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("RenderEntity.js");

include("Mesh.js");
include("Texture.js");

RenderEntity = function() {
	
	this.webGL = Root.getInstance().getWebGL();
	
	this.mesh = undefined;
	this.textures = new Array();
};

RenderEntity.prototype.addTexture = function(texture) {
	this.textures.push(texture);
};

RenderEntity.prototype.setMesh = function(mesh) {
	this.mesh = mesh;
};

RenderEntity.prototype.draw = function(shaderProgram) {
	for each (var texture in this.textures) {
		texture.active(shaderProgram);
	}
	if (this.mesh != undefined) {
		this.mesh.draw(shaderProgram);
	}
};
