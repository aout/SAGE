if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Input.js");

ColladaLoader_Input = function(ColladaFile) {
  
  this.colladaFile = ColladaFile;
  this.source = undefined;
  
  this.attributes = {
	  	offset: undefined,
	  	semantic: undefined,
	  	source: undefined,
	  	set: undefined
	 };
  
};

ColladaLoader_Input.prototype.parse = function(node, sources) {
	ColladaLoader.parseAttributes(this, node);
	this.attributes.offset = parseInt(this.attributes.offset);
	
	var sourceId = this.attributes.source.substr(1, this.attributes.source.length - 1);
	for (var i = 0; i < sources.length; ++i) {
		if (sources[i].attributes.id == sourceId) {
			this.source = sources[i];
			return true;
		}
	}
	if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Source ' + sourceId + ' not found</span><br />'; }
	return false;
};