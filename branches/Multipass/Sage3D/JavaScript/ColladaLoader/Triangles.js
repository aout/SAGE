if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Triangles.js");

ColladaLoader_Triangles = function(ColladaFile) {
  
  this.colladaFile = ColladaFile;
  this.maxOffset = 0;
  this.inputsByOffset = undefined;
  
  this.p = undefined;
  
  this.attributes = {
    name: undefined,
    count: undefined,
    material: undefined
  };
  
  this.buffers = {};
  
};

ColladaLoader_Triangles.prototype.parse = function(node, mesh) {
	ColladaLoader.parseAttributes(this, node);
	this.attributes.count = parseInt(this.attributes.count);

	var inputs = [];
	var sources = mesh.sources.concat([mesh.vertices]);
	var inputNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:input', node);
	for (var i = 0; i < inputNodes.snapshotLength; ++i) {
		var input = new ColladaLoader_Input(this.colladaFile);
		if (!input.parse(inputNodes.snapshotItem(i), sources)) {
			if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Bad input in ' + mesh.attributes.name + '</span><br />'; }
			return false;
		}
		inputs.push(input);
		this.maxOffset = Math.max(this.maxOffset, input.attributes.offset);
	}
	
	this.inputsByOffset = new Array(this.maxOffset + 1);
	for (var i = 0; i < this.maxOffset + 1; ++i) {
		this.inputsByOffset[i] = [];
	}
	
	
	for (var i = 0; i < inputs.length; ++i) {
		if (inputs[i].attributes.semantic == 'VERTEX') {
			this.inputsByOffset[inputs[i].attributes.offset] = this.inputsByOffset[inputs[i].attributes.offset].concat(inputs[i].source.inputs);
		}
		else {
			this.inputsByOffset[inputs[i].attributes.offset].push(inputs[i]);
		}
	}
	
	var primitiveNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:p', node);
	  if (!primitiveNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;p&gt; in triangles in mesh' + mesh.attributes.id + '</span><br />'; }
    return false;
  }

	this.p = ColladaLoader.parseIntListString(ColladaLoader.nodeText(primitiveNode));
	if (this.p.length != this.attributes.count * (this.maxOffset + 1) * 3) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Bad Primitive length: ' + this.p.length + ' instead of ' + this.attributes.count * (this.maxOffset + 1) + '</span><br />'; }
		return false
	}
	
	if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="info">Triangles in ' + mesh.attributes.name + ' loaded</span><br />'; }
	return true;
};