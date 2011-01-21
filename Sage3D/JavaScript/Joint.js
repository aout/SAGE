if (gIncludedFiles == undefined)
  alert("You must include this file");

gIncludedFiles.push("Joint.js");

/**
 * Joint Class
 * @param {Object} object required object to construct the class  
 */
 
Joint = function(name, parent, localMatrix, inverseBindMatrix) {
  /**
   * Joint name
   * @type {String}
   */
  this.name = name;

  /**
   * Joint parent
   * @type {Joint} 
   */
  this.parent = parent;

  /**
   * Children Joint
   * @type {JointArray}
   */
  this.children = [];

  /**
   * Matrix of the current Joint
   * @type {Matrix}
   */
  this.localMatrix = localMatrix;

   /**
   * Inverse bind matrix of the current Joint
   * @type {Matrix}
   */
  this.inverseBindMatrix = inverseBindMatrix;
  
  /**
   * Skeleton matrix
   * @type {Matrix}
   */
  this.skeletonMatrix = mat4.create();
  mat4.identity(this.skeletonMatrix);

	/**
	 * Shader matrix
	 * @type {Matrix}
	 */
  this.shaderMatrix = mat4.create();
  mat4.identity(this.shaderMatrix);
};

/**
 * update
 */
Joint.prototype.update = function() {
  
  if (this.parent) {
  	mat4.multiply(this.parent.skeletonMatrix, this.localMatrix, this.skeletonMatrix);
  } else {
  	this.skeletonMatrix = this.localMatrix;
  }
  mat4.multiply(this.skeletonMatrix, this.inverseBindMatrix, this.shaderMatrix);
  
  //Call update() on the children Transform
  for (var i = 0; i < this.children.length; ++i) {
    this.children[i].update();
  }
};

Joint.prototype.addChild = function(joint) {
	this.children.push(joint);
}

Joint.prototype.getShaderMatrix = function() {
	return this.shaderMatrix;
};