if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Rotate.js");

ColladaLoader_Rotate = function(ColladaFile) {
	this.colladaFile = ColladaFile;
	
	this.X = 0;
	
	this.Y = 0;
	
	this.Z = 0;
	
	this.ANGLE = 0;
	
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
	this.X = tab[0];
	this.Y = tab[1];
	this.Z = tab[2];
	this.ANGLE = tab[3];
	return true;
};

ColladaLoader_Rotate.prototype.vector = function() {
  return ([this.X, this.Y, this.Z, this.ANGLE]);
};