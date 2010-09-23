if (gIncludedFiles == undefined)
	alert("You must include this file");

gIncludedFiles.push("Transform.js");

include("Entity.js");

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
	this.children = [];

	/**
	 * Render entities associated to the current Transform
	 * @type {RenderEntityArray}
	 */
	this.entities = [];

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
	this.shaderProgram = undefined;
	
	this.actualChild = 0;
	
	if (this.parent != undefined) {
		this.parent.children.push(this);
		this.computedMatrix = this.parent.computedMatrix.x(this.localMatrix);
	}
};

/**
 * Transform destructor
 */
Transform.prototype.destroy = function() {
	for (var i = 0; i < this.children.length; ++i) {
		this.children[i].destroy();
	}
	for (var i = 0; i < this.content.length; ++i) {
		this.entities[i].destroy();
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
	for (var i = 0; i < rootTransform.children.length; ++i) {
		var childTransform = rootTransform.children[i];
		var transform = Transform.getTransform(transformName, childTransform);
		if (transform != undefined) {
			return transform;
		}
	}
	return undefined;
};

/**
 * Add a child to this Transform
 * @param {Transform} transform Child Transform to add
 */
Transform.prototype.addChild = function(transform) {
	var child = transform;
	if (!(transform instanceof Transform)) {
		child = new Transform(this, transform);
	}
	else {
	 this.children.push(child);
	}
	return child;
};

/**
 * Remove Child
 * @param {String} param Name for the child transform
 * @return {Transform} Transform
 */
Transform.prototype.removeChild = function(name) {
	var transform = undefined;
	for (var i = 0; i < this.children.length; ++i) {
		if (this.children[i].name == name) {
			transform = this.children[i];
			this.children.splice(i, 1);
			break;
		}
	}
	return transform;
};

/**
 * Add an entity
 * @param {Entity} entity
 */
Transform.prototype.addEntity = function(entity) {
	this.entities.push(entity);
};

/**
 * Remove entity
 * @param {Int} handle
 * @return {Entity} Removed entity
 */
Transform.prototype.removeEntity = function(name) {
	var entity = undefined;
	for (var i = 0; i < this.entities.length; ++i) {
		if (this.entities[i].name == name) {
			ret = this.entities[i];
			this.entities.splice(i, 1);
			break;
		}
	}
	return entity;
}

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
 * Here we pass uniforms to the shader program
 */
Transform.prototype.render = function() {
	var hasChanged = false;
	var root = Root.getInstance();
	
	//First, recompute the matrix if necessary
	if (this.isLocalMatrixChanged === true || this.isParentMatrixChanged === true) {
		if (this.parent != undefined) {
			this.computedMatrix = this.parent.computedMatrix.x(this.localMatrix);
		}
		else {
			this.computedMatrix = this.localMatrix;
		}
		this.isLocalMatrixChanged = false;
		this.isParentMatrixChanged = false;
		hasChanged = true;
	}
 if (this.shaderProgram == undefined) {
    this.shaderProgram = root.getDefaultProgram();
  }

  this.shaderProgram.use();

/**
 * Example of uniform
 * {name: "UniformName",
 *  type: Float | Int,
 *  isArray: true | false | undefined,
 *  isMatrix: true | false | undefined,
 *  numberOfElements: 1 - 4,
 *  value0: xxx,
 *  value1: xxx, <- don't define these is only 1 value
 *  value2: xxx, <- don't define these is only 1 value
 *  value3: xxx} <- don't define these is only 1 value
 */

	var uniforms = [
		{name: "uMVMatrix",
		 type: "Float",
		 isMatrix: true,
		 numberOfElements: 4,
		 value0: this.computedMatrix},
		 
 		{name: "uEMatrix",
		 type: "Float",
		 isMatrix: true,
		 numberOfElements: 4,
		 value0: root.getCamera().computedMatrix},
		 
		{name: "uPMatrix",
		 type: "Float",
		 isMatrix: true,
		 numberOfElements: 4,
		 value0: root.getProjectionMatrix()}/*,
		 
		 {name: "uNMatrix",
		 type: "Float",
		 isMatrix: true,
		 numberOfElements: 4,
		 value0: this.computedMatrix.inverse()},
		 
		 {name: "uNumberOfLights",
		 type:  "Int",
		 numberOfElements: 1,
		 value0: root.getNumberOfLights()},
		 
		 {name: "uLightsPositions",
     type: "Float",
     isArray: true,
     numberOfElements: 3,
     value0: root.getLightsPositions()},
		 
		 {name: "uLightsDirections",
		 type: "Float",
		 isArray: true,
		 numberOfElements: 3,
		 value0: root.getLightsDirections()},
		 
		 {name: "uLightsColors",
     type: "Float",
     isArray: true,
     numberOfElements: 4,
     value0: root.getLightsColors()},
     
     {name: "uLightsIntensities",
     type: "Float",
     isArray: true,
     numberOfElements: 1,
     value0: root.getLightsIntensities()}*/
	];
	this.shaderProgram.setUniforms(uniforms);
	
	for (var i = 0; i < this.entities.length; ++i) {
		this.entities[i].draw(this.shaderProgram);
	}
	
	//Call render() on the children Transform
	for (var i = 0; i < this.children.length; ++i) {
		this.children[i].isParentMatrixChanged = hasChanged;
	}
};

Transform.prototype.nextChild = function() {
  if (this.actualChild >= this.children.length) {
    this.actualChild = 0;
    return null;
  }
  return this.children[this.actualChild++];
};
