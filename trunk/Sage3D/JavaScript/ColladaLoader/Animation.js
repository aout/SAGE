if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Animation.js");

ColladaLoader_Animation = function(ColladaFile) {
  
  this.colladaFile = ColladaFile;
  this.children = [];
  this.sources = [];
  
  this.sampler = {
  	defined: false,
  	inputs: [],
  	attributes: {
  		id: undefined
  	}
  };
  
  this.channel = {
  	defined: false,
  	attributes: {
  		source: undefined,
  		target: undefined
  	}
  };
  
  this.attributes = {
    id: undefined,
    name: undefined
  };
};

ColladaLoader_Animation.prototype.parse = function(node) {

	ColladaLoader.parseAttributes(this, node);
	
	var animationNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:animation', node);
	for (var i = 0; i < animationNodes.snapshotLength; ++i) {
		var animation = new ColladaLoader_Animation(this.colladaFile);
		if (animation.parse(animationNodes.snapshotItem(i))) {
			this.children.push(animation);
		}
	}

	var sourceNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:source', node);
	for (var i = 0; i < sourceNodes.snapshotLength; ++i) {
		var source = new ColladaLoader_Source(this.colladaFile);
		if (source.parse(sourceNodes.snapshotItem(i))) {
			this.sources.push(source);
		}
	}

	var samplerNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:sampler', node);
	if (!samplerNode && !animationNodes.snapshotLength) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="warning">Animation ' + this.attributes.id + ' is empty</span><br />'; }
		return false;
	} else if (!samplerNode) {
		if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="info">Animation ' + this.attributes.id + ' loaded</span><br />'; }
		return true;		
	}
	
	ColladaLoader.parseAttributes(this.sampler, samplerNode);
	this.sampler.defined = true;

	var inputNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:input', samplerNode);
	for (var i = 0; i < inputNodes.snapshotLength; ++i) {
		var input = new ColladaLoader_Input(this.colladaFile);
		if (input.parse(inputNodes.snapshotItem(i), this.sources)) {
			this.sampler.inputs.push(input);
		}
	}
	
	for (var i = 1; i < this.sampler.inputs.length; ++i) {
		if (this.sampler.inputs[0].source.accessor.attributes.count !=
				this.sampler.inputs[i].source.accessor.attributes.count) {
			if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Inputs in sampler didn\'t have the same size in ' + this.attributes.id + '</span><br />'; }
			return false;
		}
	}
	
	var channelNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:channel', node);
	if (!channelNode) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;channel&gt; in ' + this.attributes.id + '</span><br />'; }
		return false;
	}

	ColladaLoader.parseAttributes(this.channel, channelNode);
	this.channel.defined = true;
	
	var sourceId = this.channel.attributes.source;
	sourceId = sourceId.substr(1, sourceId.length - 1);
	
	if (sourceId != this.sampler.attributes.id) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML += '<span class="error">Couldn\'t find &lt;sampler id="' + sourceId + '"&gt; in ' + this.attributes.id + '</span><br />'; }
		return false;		
	}

	var target = this.channel.attributes.target.split(new RegExp("/|\\.", "g"));
	if (target.length < 2 || target.length > 3) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML += '<span class="error">Target attribute of &lt;channel&gt; is not crrectly formated in ' + this.attributes.id + '</span><br />'; }
		return false;
	}
	
	var idFound = false;
	var sidFound = false;
	var animationAdded = false;
	for (var i = 0; i < this.colladaFile.libraryControllers.length && !idFound; ++i) {
		var skeleton = this.colladaFile.libraryControllers[i].skeleton;
		for (var j = 0; j < skeleton.joints.length && !idFound; ++j) {
			var joint = skeleton.joints[j];
			if (joint.name == target[0]) {
				idFound = true;
				for (var k = 0; k < joint.transformations.length && !sidFound; ++k) {
					var transformation = joint.transformations[k];
					if (transformation.attributes.sid == target[1]) {
						sidFound = true;
						if (target.length == 2 && transformation instanceof ColladaLoader_Matrix) {
							transformation.matrix.animations.push(this);
							skeleton.hasAnimation = true;
							animationAdded = true;
						}
						else if (target.length == 3 && target[2] in transformation) {
							transformation[target[2]].animations.push(this);
							animationAdded = true;
							skeleton.hasAnimation = true;
						}
					}
				}
			}
		}
	}
	
	if (!idFound) {
		if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="error">Bad channel target attribute: joint with id "' + target[0] + '" not found in ' + this.attributes.id + '<br />You can only animate joints</span><br />'; }		
		return false;		
	} else if (!sidFound) {
		if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="error">Bad channel target attribute: sid "' + target[1] + '" not found in ' + this.attributes.id + '</span><br />'; }
		return false;
	} else if (!animationAdded) {
		if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="error">Bad channel target attribute: attribute "' + target[2] + '" not found in ' + this.attributes.id + '</span><br />'; }		
		return false;
	}
	
	
	
	if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="info">Animation ' + this.attributes.id + ' loaded</span><br />'; }
	return true;
};