if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Geometry.js");

ColladaLoader_Geometry = function(ColladaFile) {
  
  this.colladaFile = ColladaFile;
  this.sources = [];
  
  this.attributes = {
    id: undefined,
    name: undefined
  };
  
};

ColladaLoader_Geometry.prototype.parse = function(node) {
  
  ColladaLoader.parseAttributes(this, node);
    
  var meshNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:mesh', node);
  if (!meshNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;mesh&gt; in ' + this.attributes.id + '</span><br />'; }
    return false;
  }
  
  var sourceNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:source', meshNode);
  for (var i = 0; i < sourceNodes.snapshotLength; i++) {
    var source = new ColladaLoader_Source(this.colladaFile);
    if (source.parse(sourceNodes.snapshotItem(i))) {
      this.sources.push(source);
    }
  }
  
  if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="info">Geometry ' + this.attributes.id + ' loaded</span><br />'; }
  return true;
};
