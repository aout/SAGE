if (gIncludedFiles == undefined)
  alert("You must include this file");

gIncludedFiles.push("Joint.js");

/**
 * Joint Class
 * @param {Object} object required object to construct the class  
 */
 
Joint = function(object) {
  /**
   * Joint name
   * @type {String}
   */
  this.name = object.name;

  /**
   * Joint parent
   * @type {Joint} 
   */
  this.parent = object.parent;

  /**
   * Children Joint
   * @type {JointArray}
   */
  this.children = object.children;

  /**
   * Matrix of the current Joint
   * @type {Matrix}
   */
  this.localMatrix = object.locaMatrix;

   /**
   * Inverse bind matrix of the current Joint
   * @type {Matrix}
   */
  this.inverseBindMatrix = object.ibm;
  
  /**
   * World matrix
   * @type {Matrix}
   */
  this.worldMatrix = object.worldMatrix;

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
  
};

/**
 * Joint destructor
 */
Joint.prototype.destroy = function() {
  for (var i = 0; i < this.children.length; ++i) {
    this.children[i].destroy();
  }
};

/**
 * Translate
 * @param {FloatArray} Vector
 */
Joint.prototype.translate = function(v) {
  this.isLocalMatrixChanged = true;
  this.localMatrix = this.localMatrix.x(Matrix.Translation($V([v[0],v[1],v[2]])).ensure4x4());
  return this;
};

/**
 * Rotate
 * @param {Float}     Angle of rotation (in degrees)
 * @param {FloatArray}  Vector
 */
Joint.prototype.rotate = function(ang, v) {
  this.isLocalMatrixChanged = true;
  var arad = ang * Math.PI / 180.0;
  this.localMatrix = this.localMatrix.x(Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4());
  return this;
};

/**
 * Scale
 * @param {FloatArray} Vector
 */
Joint.prototype.scale = function(v) {
  this.isLocalMatrixChanged = true;
  this.localMatrix = this.localMatrix.x(Matrix.Diagonal([v[0], v[1], v[2], 1]));
  return this;
};

/**
 * Invert
 */
Joint.prototype.invert = function() {
  this.isLocalMatrixChanged = true;
  this.localMatrix = this.localMatrix.inv();
};

/**
 * Render
 */
Joint.prototype.render = function() {
  var hasChanged = false;
  
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
};