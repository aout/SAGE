if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Node.js");

include("RenderElement.js");

Node = function() {

	//private attributes
	
	//Node parent
	//@type: Node
	var	_parent;
	
	//Children Node
	//@type: NodeArray
	var	_children;
	
	//Element associated to the current Node
	//@type: RenderElementArray
	var	_content;
	
	//Matrix of the current Node
	//@type: Matrix
	var _localMatrix;
	
	//Computed matrix
	//@type: Matrix
	var _computedMatrix;

	//Determines if the contents must be display or not
	//@type: Bool	
	var	_isVisible;
	
	//Determines if the local matrix has changed
	//@type: Bool
	var _isLocalMatrixChanged;
	
	//Determines if the parent's matrix has changed
	//@type: Bool
	var _isParentMatrixChanged;
	
	//private methods
}

//public methods

//Rotate. Modify the local Matrix
Node.prototype.rotate = function() {
	this._isLocalMatrixChanged = true;
	return this;
}

//Scale. Modify the local Matrix
Node.prototype.scale = function() {
	this._isLocalMatrixChanged = true;
	return this;
}

//Translate. Modify the local Matrix
Node.prototype.translate = function() {
	this._isLocalMatrixChanged = true;
	return this;
}

//Render.
Node.prototype.render = function() {
	var hasChanged = false;
	
	//First, recompute the matrix if necessary
	if (this._isLocalMatrixChanged === true || this._isParentMatrixChanged === true) {
		if (this._parent != null) {
			this._computedMatrix = this._parent._computedMatrix.mul(this._localMatrix);
		}
		else {
			this._computedMatrix = this._localMatrix;
		}
		this._isLocalMatrixChanged = false;
		this._isParentMatrixChanged = false;
		hasChanged = true;
	}
	
	//Display the content associated to this Node
	
	//Call render() on the children Node
	for each (var child in this._children) {
		child._isParentMatrixChanged = hasChanged;
		child.render();
	}		
}