if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Geometry.js");

ColladaLoader_Geometry = function(ColladaFile) {
  
  this.colladaFile = ColladaFile;
  this.sources = [];
  this.vertices = {
  	attributes: {
  		id: undefined,
  		name: undefined
  	},
  	inputs: []
  };
  this.primitives = [];
  
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
  
  var verticesNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:vertices', meshNode);
  if (!verticesNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;vertices&gt; in ' + this.attributes.id + '</span><br />'; }
    return false;
  }
  
  ColladaLoader.parseAttributes(this.vertices, verticesNode);
  var verticesInputNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:input', verticesNode);
  for (var i = 0; i < verticesInputNodes.snapshotLength; ++i) {
	  var input = new ColladaLoader_Input(this.colladaFile);
	  if (input.parse(verticesInputNodes.snapshotItem(i), this.sources)) {
	  	this.vertices.inputs.push(input);
	  }
  }
  
  var primitiveNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:lines | c:linestrips | c:polygons | c:polylist | c:triangles | c:trifans | c:tristrips', meshNode);
  for (var i = 0; i < primitiveNodes.snapshotLength; ++i) {
  	var primitive = undefined;
  	switch (primitiveNodes.snapshotItem(i).tagName) {
  		case 'triangles':
  			primitive = new ColladaLoader_Triangles(this.colladaFile);
  			break;
  		default:
  			if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Primitives ' + primitiveNodes.snapshotItem(i).tagName + ' is not implemented yet</span><br />'; }
  	}
  	if (primitive == undefined) {
  		continue;
  	}
	  if (primitive.parse(primitiveNodes.snapshotItem(i), this)) {
	  	this.primitives.push(primitive);
	  }
  }
  
  if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="info">Geometry ' + this.attributes.id + ' loaded</span><br />'; }
  return true;
};
