if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Array.js");

ColladaLoader_Array = function(ColladaFile) {
  
  this.colladaFile = ColladaFile;
  this.type = undefined;
  this.data = [];
  
  this.attributes = {
    id: undefined,
    name: undefined,
		count: undefined
  };
  
};

ColladaLoader_Array.typeEnum = {
	IDREF_array: 1,
	Name_array: 2,
	bool_array: 3,
	float_array: 4,
	int_array: 5
};

ColladaLoader_Array.prototype.parse = function(node) {
  
  if (!(node.tagName in ColladaLoader_Array.typeEnum)) {
  	return false;
  }
	
	this.type = ColladaLoader_Array.typeEnum[node.tagName];
  
  ColladaLoader.parseAttributes(this, node);
  this.attributes.count = parseInt(this.attributes.count);
  
  switch (this.type) {
  	case ColladaLoader_Array.typeEnum.IDREF_array:
	case ColladaLoader_Array.typeEnum.Name_array:
		this.data = ColladaLoader.parseNameListString(ColladaLoader.nodeText(node));
		break;
	case ColladaLoader_Array.typeEnum.bool_array: this.data = ColladaLoader.parseBoolListString(ColladaLoader.nodeText(node)); break;
	case ColladaLoader_Array.typeEnum.float_array: this.data = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(node)); break;
	case ColladaLoader_Array.typeEnum.int_array: this.data = ColladaLoader.parseIntListString(ColladaLoader.nodeText(node)); break;
  }
  
  if (this.data.length != this.attributes.count) {
  	if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Array ' + this.attributes.id + ' contains ' + this.data.length + ' elements while \'count\' is ' + this.attributes.count + '</span><br />'; }
  	return false;
  }
  
  if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="info">Array ' + this.attributes.id + ' loaded</span><br />'; }
  return true;
};
