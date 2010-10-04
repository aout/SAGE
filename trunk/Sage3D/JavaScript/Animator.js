if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Animator.js");

include("AnimatableEntity.js");

/**
 * Animator Class
 */
Animator = function() {
	this.animatable = undefined;
};

/**
 * Static member
 * ColladaLoader instance
 */
Animator.instance = undefined;

/**
 * Static member
 * ColladaLoader getInstance
 */
Animator.getInstance = function() {
	if (Animator.instance == undefined) {
		Animator.instance = new Animator();
	}
	return Animator.instance;
};
/**
 * Add a mesh to the Entity
 * @param {AnimatableEntity} animatableEntity AnimatableEntity
 * @param {Anime} anime Anime
 */
ColladaLoader.addEntityToAnim = function(animatableEntity, anime){

};