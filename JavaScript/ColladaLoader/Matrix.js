if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Matrix.js");

ColladaLoader_Matrix = function(ColladaFile) {
	this.colladaFile = ColladaFile;
	
	this.matrix = {
		value: undefined,
		animation: undefined
	};
	
	this.attributes = {
		sid: undefined
	}
};

ColladaLoader_Matrix.prototype.parse = function(node) {
	ColladaLoader.parseAttributes(this, node);
	
	this.matrix.value = ColladaLoader.parseMatrixString(ColladaLoader.nodeText(node));
	if (!this.matrix.value) {
		return false;
	}
	return true;
};

ColladaLoader_Matrix.prototype.generateTransformation = function(time) {
	
};
