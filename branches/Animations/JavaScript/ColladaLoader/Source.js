if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Source.js");

ColladaLoader_Source = function(ColladaFile) {
  
  this.colladaFile = ColladaFile;
  this.dataArray = undefined;
  
  this.attributes = {
    id: undefined,
    name: undefined
  };
  
  this.accessor = {
  	attributes: {
			count: undefined,
			offset: undefined,
			source: undefined,
			stride: undefined
		  }  	
  };
  
  
};

ColladaLoader_Source.prototype.parse = function(node) {
  
  ColladaLoader.parseAttributes(this, node);
    
  var ArrayNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:IDREF_array | c:Name_array | c:bool_array | c:float_array | c:int_array', node);
  if (!ArrayNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;array&gt; in ' + this.attributes.id + '</span><br />'; }
    return false;
  }
  
  this.dataArray = new ColladaLoader_Array(this.colladaFile);
  if (!this.dataArray.parse(ArrayNode)) {
  	return false;
  }

  var accessorNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:technique_common/c:accessor', node);
  ColladaLoader.parseAttributes(this.accessor, accessorNode);
  
  this.accessor.attributes.count = parseInt(this.accessor.attributes.count);
  this.accessor.attributes.offset = parseInt(this.accessor.attributes.offset);
  this.accessor.attributes.stride = parseInt(this.accessor.attributes.stride);
  
  var arrayId = this.accessor.attributes.source.substr(1, this.accessor.attributes.source.length - 1);
  if ((arrayId != this.dataArray.attributes.id) || ((this.accessor.attributes.count * this.accessor.attributes.stride) != this.dataArray.attributes.count)) {
  	if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Bad accessor attributes in ' + this.attributes.id + '</span><br />'; }
  	return false;
  }

  if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="info">Source ' + this.attributes.id + ' loaded</span><br />'; }
  return true;
};
