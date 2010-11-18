if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Translate.js");

ColladaLoader_Translate = function(ColladaFile) {
	this.colladaFile = ColladaFile;
	
	this.X = {
		value: 0,
		animations: []
	};
	
	this.Y = {
		value: 0,
		animations: []
	};
	
	this.Z = {
		value: 0,
		animations: []
	};	
	
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
	this.X.value = tab[0];
	this.Y.value = tab[1];
	this.Z.value = tab[2];
	return true;
};