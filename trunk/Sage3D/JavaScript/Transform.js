if (gIncludedFiles == undefined)
	alert("You must include this file");

gIncludedFiles.push("Transform.js");

include("RenderEntity.js");

/**
 * Transform Class
 * @param {Transform} parent Parent transform
 * @param {String} name Transform name
 */
Transform = function(parent, name) {
	/**
	 * Transform name
	 * @type {String}
	 */
	this.name = name;

	/**
	 * Transform parent
	 * @type {Transform} 
	 */
	this.parent = parent;

	/**
	 * Children Transform
	 * @type {TransformArray}
	 */
	this.children = new Array();

	/**
	 * Render entities associated to the current Transform
	 * @type {RenderEntityArray}
	 */
	this.content = new Array();

	/**
	 * Matrix of the current Transform
	 * @type {Matrix}
	 */
	this.localMatrix = Matrix.I(4);

	/**
	 * Computed matrix
	 * @type {Matrix}
	 */
	this.computedMatrix = Matrix.I(4);

	/**
	 * Determines if the contents must be display or not
	 * @type {Bool}
	 */
	this.isVisible = true;

	/**
	 * Determines if the local matrix has changed
	 * @type {Bool}
	 */	
	this.isLocalMatrixChanged = false;

	/**
	 * Determines if the parent's matrix has changed
	 * @type {Bool}
	 */	
	this.isParentMatrixChanged = false;
	
	/**
	 * Shader used to draw the content
	 * @type {Program}
	 */
	this.shaderProgram = Root.getInstance().getDefaultProgram();
	
	if (this.parent != undefined) {
			this.computedMatrix = this.parent.computedMatrix.mul(this.localMatrix);
		}
};

/**
 * Static method
 * @param	{String} transformName Transform name
 * @param	{Transform} rootTransform Optional Root transform
 * @return	{Transform}
 */
Transform.getTransform = function(transformName, rootTransform) {
	if (rootTransform == undefined) {
		rootTransform = Root.getInstance().getRootTransform();
	}
	if (rootTransform.name === transformName) {
		return rootTransform;
	}
	for each (var childTransform in rootTransform.children) {
		var transform = Transform.getTransform(transformName, childTransform);
		if (transform != undefined) {
			return transform;
		}
	}
	return undefined;
};

/**
 * Add a child to this Transform
 * @param {String} name Name for the child transform
 */
Transform.prototype.addChild = function(name) {
	var child = new Transform(this, name);
	this.children.push(child);
};

/**
 * Remove Child
 * @param {String} param Name for the child transform or the transform itself
 * @return {Transform} Transform
 */
Transform.prototype.removeChild = function(name) {
	var newArray = new Array();
	var transform = undefined;
	for each (var child in this.children) {
		if (child.name === name) {
			transform = child;
		}
		else {
			newArray.push(child);
		}
	}
	this.children = newArray;
	return transform;
};

/**
 * Translate
 * @param {FloatArray} Vector
 */
Transform.prototype.translate = function(v) {
	this.isLocalMatrixChanged = true;
	this.localMatrix = this.localMatrix.x(Matrix.Translation($V([v[0],v[1],v[2]])).ensure4x4());
	return this;
};

/**
 * Rotate
 * @param {Float} 		Angle of rotation (in degrees)
 * @param {FloatArray}	Vector
 */
Transform.prototype.rotate = function(ang, v) {
	this.isLocalMatrixChanged = true;
	var arad = ang * Math.PI / 180.0;
	this.localMatrix = this.localMatrix.x(Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4());
	return this;
};

/**
 * Scale
 * @param {FloatArray} Vector
 */
Transform.prototype.scale = function(v) {
	this.isLocalMatrixChanged = true;
	this.localMatrix = this.localMatrix.x(Matrix.Diagonal([v[0], v[1], v[2], 1]));
	return this;
};

/**
 * Invert
 */
Transform.prototype.invert = function() {
	this.isLocalMatrixChanged = true;
	this.localMatrix = this.localMatrix.inv();
};

/**
 * Render
 */
Transform.prototype.render = function() {
	var hasChanged = false;
	
	//First, recompute the matrix if necessary
	if (this.isLocalMatrixChanged === true || this.isParentMatrixChanged === true) {
		if (this.parent != undefined) {
			this.computedMatrix = this.parent.computedMatrix.mul(this.localMatrix);
		}
		else {
			this.computedMatrix = this.localMatrix;
		}
		this.isLocalMatrixChanged = false;
		this.isParentMatrixChanged = false;
		hasChanged = true;
	}

	var uniforms = [
		{name: "uMVMatrix",
		 type: "Matrix4fv",
		 value: this.computedMatrix},
		{name: "uPMatrix",
		 type: "Matrix4fv",
		 value: Root.getInstance().getProjectionMatrix()},
	];
	this.shaderProgram.setUniforms(uniforms);
	
	for each (var entity in this.content) {
		entity.draw(this.shaderProgram);
	}
	
	//Call render() on the children Transform
	for each (var child in this.children) {
		child.isParentMatrixChanged = hasChanged;
		child.render();
	}
};