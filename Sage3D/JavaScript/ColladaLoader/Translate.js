if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Translate.js");

ColladaLoader_Translate = function(ColladaFile) {
	this.colladaFile = ColladaFile;
	
	this.X = 0;
	
	this.Y = 0;
		
	this.Z = 0;
	
	this.attributes = {
		sid: undefined
	}	
};

ColladaLoader_Translate.prototype.parse = function(node) {
	ColladaLoader.parseAttributes(this, node);
	
	var tab = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(node));
	if (tab.length != 3) {
		return false;
	}
	this.X = tab[0];
	this.Y = tab[1];
	this.Z = tab[2];
	return true;
};

ColladaLoader_Translate.prototype.vector = function() {
  return ([this.X, this.Y, this.Z]);
};