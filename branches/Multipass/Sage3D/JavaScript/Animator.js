if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Animator.js");

include("AnimatableEntity.js");

/**
 * Animator Class
 */
Animator = function() {
	this.animatable = [];
};

/**
 * Static member
 * ColladaLoader instance
 */
Animator.instance = [];

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
ColladaLoader.addAnimatableEntity = function(animatableEntity, anime){
	animatableEntity.onAnime = anime; //put specific animation in onAnime
	this.animatable.push(animatableEntity);
};

ColladaLoader.removeAnimatableEntity = function(animatableEntity){
	for (var i; i < this.animatable.lenght; ++i){
		if (animatable[i] == animatableEntity){
			this.animatable.splice(i, 1);
			return;
		}
	}
};

ColladaLoader.prototype.update = function(elapsedTime){
	for (var i; i < this.animatable.lenght; ++i){
		if (this.animatable[i].onAnime != null)
		if ( this.animatable[i].onAnime.update(elapsedTime) == false )
			this.animatable.splice(i, 1);	
	}
};