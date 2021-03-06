if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Camera.js");

include("Transform.js");

/**
 * Camera Class
 * @param {String} name Name of the Camera
 * @param {Transform} transform Transform which hold the camera
 */
Camera = function(name, transform) {
	/**
	 * Camera name
	 * @type {String}
	 */
	this.name = name;

	/**
	 * Transform parent
	 * @type {Transform} 
	 */
	this.parent = transform;

	/**
	 * Computed matrix
	 * @type {Matrix}
	 */
	this.computedMatrix = mat4.create();
	mat4.inverse(this.parent.computedMatrix, this.computedMatrix);
};

/**
 * Attach a camera to a transform
 * @param {Transform} transform Transform wich hold the camera
 */
Camera.prototype.attach = function(transform) {
	this.parent = transform;
	mat4.inverse(this.parent.computedMatrix, this.computedMatrix);
}

/**
 * Look at
 * @param {Float} ex Eye x position
 * @param {Float} ey Eye y position
 * @param {Float} ez Eye z position
 * @param {Float} tx Target x position
 * @param {Float} ty Target y position
 * @param {Float} tz Target z position
 * @param {Float} ux Is up axis
 * @param {Float} uy Is up axis
 * @param {Float} uz Is up axis
 */
 
Camera.prototype.lookAt = function(ex, ey, ez, tx, ty, tz, ux, uy, uz) {
//	this.computedMatrix = makeLookAt(ex, ey, ez, tx, ty, tz, ux, uy, uz);
}

/**
 * Update the computed matrix
 */
Camera.prototype.update = function() {
	//First, we get the parent transforms
	var parentTransforms = [];
	for (var transform = this.parent; transform != undefined; transform = transform.parent) {
		parentTransforms.push(transform);
	}
	
	//Then, we update the parent transform matrix
	for (var i = parentTransforms.length - 1; i >= 0; --i) {
		if (parentTransforms[i].isLocalMatrixChanged === true || parentTransforms[i].isParentMatrixChanged === true) {
			if (parentTransforms[i].parent != undefined) {
				mat4.multiply(parentTransforms[i].parent.computedMatrix, parentTransforms[i].localMatrix, parentTransforms[i].computedMatrix);
			}
			else {
				parentTransforms[i].computedMatrix = parentTransforms[i].localMatrix;
			}
			parentTransforms[i].isLocalMatrixChanged = false;
			parentTransforms[i].isParentMatrixChanged = false;
			for (var j = 0; j < parentTransforms[i].children.length; ++j) {
				parentTransforms[i].children[j].isParentMatrixChanged = true;
			}
		}		
	}
	mat4.inverse(this.parent.computedMatrix, this.computedMatrix);
}
