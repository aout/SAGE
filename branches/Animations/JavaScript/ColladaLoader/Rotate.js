if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Rotate.js");

ColladaLoader_Rotate = function(ColladaFile) {
	this.colladaFile = ColladaFile;
	
	this.X = {
		value: 0,
		animation: undefined
	};
	
	this.Y = {
		value: 0,
		animation: undefined
	};
	
	this.Z = {
		value: 0,
		animation: undefined
	};
	
	this.ANGLE = {
		value: 0,
		animation: undefined
	};
	
	this.attributes = {
		sid: undefined
	}
};

ColladaLoader_Rotate.prototype.parse = function(node) {
	ColladaLoader.parseAttributes(this, node);
	
	var tab = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(node));
	if (tab.length != 4) {
		return false;
	}
	this.X.value = tab[0];
	this.Y.value = tab[1];
	this.Z.value = tab[2];
	this.ANGLE.value = tab[3];
	return true;
};

ColladaLoader_Matrix.prototype.generateTransformation = function(time) {
	
};
