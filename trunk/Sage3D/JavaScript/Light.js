if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Light.js");

/**
 * Light Class
 * @param {String} name
 * @param {String} type
 * @param {Array} color
 * @param {Int} intensity
 * @param {Transform} parent
 */
Light = function(name, type, color, intensity, parent) {
	this.enabled = false;
	
	this.name = name;
	this.type = type;
	this.color = color;
	this.intensity = intensity;
	this.coneRadius = undefined; //need to use Cos then
	this.parent = parent;
	
	this.Status = Light.StatusEnum.LIGHT_NONE;
	this.error = "no error.";
};

/**
 * Light Status
 */
Light.StatusEnum = {
	LIGHT_NONE 			     : 0,
	LIGHT_INITIALIZING   : 1,
	LIGHT_UPDATING		   : 2,
	LIGHT_READY			     : 3,
	LIGHT_ERROR			     : 4
};

/**
 * Light Type
 */
Light.TypeEnum = {
	LIGHT_AMBIENT			: 0, // ambient (global) light of the scene
	LIGHT_DIRECTIONAL	: 1, // vector directed light (sunlight, moonlight...)
	LIGHT_SPOTLIGHT		: 2, // conic light (spots, lamps...)
	LIGHT_POINTLIGHT	: 3, // spherical light (bulbs, sun in a very wide scene, fire...)
};
