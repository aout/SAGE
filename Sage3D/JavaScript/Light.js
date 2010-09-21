if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Light.js");

/**
 * Light Class
 * @param {String} name
 * @param {String} type
 * @param {Array} color
 * @param {Int} intensity
 * @param {Array} direction
 * @param {Transform} parent
 */
Light = function(name, type, color, intensity, direction, parent) {
	this.enabled = false;
	
	this.name = name;
	this.type = type;
	this.color = color;
	this.intensity = intensity;
	this.direction = direction;
	this.parent = parent;
	
	this.Status = Light.StatusEnum.LIGHT_NONE;
	this.error = "no error.";
};

/**
 * Light Status
 */
Light.StatusEnum = {
	LIGHT_NONE 			: 0,
	LIGHT_INITIALIZING	: 1,
	LIGHT_UPDATING		: 2,
	LIGHT_READY			: 3,
	LIGHT_ERROR			: 4
};

/**
 * Light Type
 */
Light.TypeEnum = {
	AMBIENT			: 0, // ambient (global) light of the scene
	DIRECTIONAL		: 1, // vector directed light (laser, sunlight, moonlight...)
	SPOTLIGHT		: 2, // conic light (spots, lamps...)
	POINTLIGHT		: 3, // spherical light (bulbs, sun in a very wide scene, fire...)
};

Light.prototype.add = function () {
	
};
