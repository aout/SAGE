if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Controller.js");

ColladaLoader_Controller = function(ColladaFile) {
  
  this.colladaFile = ColladaFile;
  this.geometry = undefined;
  this.bindShapeMatrix = undefined;
  
  this.jointsInputs = [];
  this.vertexWeights = {
  	inputs			: [],
  	vcount			: [],
  	v						: [],

	  attributes	: {
	  	count	: undefined
	  }
  };
  
  
  this.attributes = {
	  	id: undefined,
	  	name: undefined
	 };
  
  this.skeleton = undefined;
  
};

ColladaLoader_Controller.prototype.parse = function(node) {
	ColladaLoader.parseAttributes(this, node);

	var skinNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:skin', node);
	if (!skinNode) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;skin&gt; in ' + this.attributes.id + '</span><br />'; }
		return false;
	}

	var sourceId = skinNode.getAttribute('source');
	sourceId = sourceId.substr(1, sourceId.length - 1);
	
	for (var i = 0; i < this.colladaFile.libraryGeometries.length; ++i) {
		if (sourceId == this.colladaFile.libraryGeometries[i].attributes.id) {
			this.geometry = this.colladaFile.libraryGeometries[i];
			break;
		}
	}
	
	if (!this.geometry) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find geometry ' + sourceId + '</span><br />'; }
		return false;
	}
	
	var bindShapeMatrixNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:bind_shape_matrix', skinNode);
	if (!bindShapeMatrixNode) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="warning">Couldn\'t find &lt;bind_shape_matrix&gt; in ' + this.attributes.id + '. Default value is identity</span><br />'; }
	}	else {
		this.bindShapeMatrix = ColladaLoader.parseMatrixString(ColladaLoader.nodeText(bindShapeMatrixNode));
	}
	if (!this.bindShapeMatrix) {
		this.bindShapeMatrix = mat4.create();
		mat4.identity(this.bindShapeMatrix);
	}
	
	var sources = [];
	var sourceNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:source', skinNode);
	for (var i = 0; i < sourceNodes.snapshotLength; ++i) {
		var source = new ColladaLoader_Source(this.colladaFile);
		if (source.parse(sourceNodes.snapshotItem(i))) {
			sources.push(source);
		}
	}
	
	var jointsNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:joints', skinNode);
	if (!jointsNode) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;joints&gt; in ' + this.attributes.id + '</span><br />'; }
		return false;
	}

	var jointsInputNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:input', jointsNode);
	for (var i = 0; i < jointsInputNodes.snapshotLength; ++i) {
		var input = new ColladaLoader_Input(this.colladaFile);
		if (input.parse(jointsInputNodes.snapshotItem(i), sources)) {
			this.jointsInputs.push(input);
		}
	}
	
	//tester longueur source JOINT (name) et INV_BIND_MATRIX
	var length = this.jointsInputs[0].source.accessor.attributes.count;
	for (var i = 1; i < this.jointsInputs.length; ++i) {
		if (length != this.jointsInputs[i].source.accessor.attributes.count) {
			if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Bad joints input length in ' + this.attributes.id + '</span><br />'; }
			return false;			
		}
	}
	
	//TODO: utiliser vertexWeightsMaxOffset et vertexWeightsInputsByOffset
	var vertexWeightsNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:vertex_weights', skinNode);
	if (!vertexWeightsNode) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;vertex_weights&gt; in ' + this.attributes.id + '</span><br />'; }
		return false;
	}

	ColladaLoader.parseAttributes(this.vertexWeights, vertexWeightsNode);
	this.vertexWeights.attributes.count = parseInt(this.vertexWeights.attributes.count);

	if (this.vertexWeights.attributes.count != this.geometry.vertices.inputs[0].source.accessor.attributes.count) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Controller length and geometry length didn\'t match in ' + this.attributes.id + '</span><br />'; }
		return false;
	}

	var vertexWeightsInputNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:input', vertexWeightsNode);
	for (var i = 0; i < vertexWeightsInputNodes.snapshotLength; ++i) {
		var input = new ColladaLoader_Input(this.colladaFile);
		if (input.parse(vertexWeightsInputNodes.snapshotItem(i), sources)) {
			this.vertexWeights.inputs.push(input);
		}
	}

	var vcountNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:vcount', vertexWeightsNode);
	if (!vcountNode) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;vcountNode&gt; in ' + this.attributes.id + '</span><br />'; }
		return false;
	}
	
	this.vertexWeights.vcount = ColladaLoader.parseIntListString(ColladaLoader.nodeText(vcountNode));
	
	var vNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:v', vertexWeightsNode);
	if (!vNode) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;v&gt; in ' + this.attributes.id + '</span><br />'; }
		return false;
	}	
	
	this.vertexWeights.v = ColladaLoader.parseIntListString(ColladaLoader.nodeText(vNode));
	
	this.skeleton = new ColladaLoader_Skeleton(this);
	if (!this.skeleton.parse()) {
		return false;
	}
	
	if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="info">Controller ' + this.attributes.id + ' loaded</span><br />'; }
	return true;
};