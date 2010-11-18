if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Material.js");

/**
 * Material Class
 * @param {String} name Name
 */
Material = function(name) {

	this.webGL = Root.getInstance().getWebGL();

	this.name = name;

	this.status = Material.StatusEnum.MATERIAL_NONE;
	this.error = "no error";

  this.emission		= undefined,
  this.ambient		= undefined,
  this.diffuse		= undefined,
  this.specular		= undefined,
  this.shininess	= undefined    
};

/**
 * Material Status
 */
Material.StatusEnum = {
		MATERIAL_NONE			: 0,
		MATERIAL_LOADING	: 1,
		MATERIAL_READY		: 2,
		MATERIAL_ERROR		: 3
};

Material.textureStatusChanged = function(texture) {
	
};

Material.prototype.load = function(emission, ambient, diffuse, specular, shininess) {
	var textureUnit = 0;
};


Material.prototype.active = function(shaderProgram) {
};
