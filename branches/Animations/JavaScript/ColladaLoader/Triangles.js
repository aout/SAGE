if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Triangles.js");

ColladaLoader_Triangles = function(ColladaFile, geometry) {
  
  this.colladaFile = ColladaFile;
  this.geometry = geometry;
  
  this.maxOffset = 0;
  this.inputsByOffset = undefined;
  
  this.p = undefined;
  
  this.attributes = {
    name: undefined,
    count: undefined,
    material: undefined
  };
  
  this.material = undefined;
  
  this.buffers = undefined;
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

ColladaLoader_Triangles.prototype.generateBuffers = function() {
	if (!this.buffers) {
		
		//Create Buffers Object
		this.buffers = {};

		//Get Skeleton
		if (this.geometry.controller != undefined && this.geometry.controller.skeleton.hasAnimations) {
			var skeleton = this.geometry.controller.skeleton;
		} else {
			var skeleton = undefined;
		}
		
		for (var i = 0; i < this.p.length; i += (this.maxOffset + 1)) {

			for (var j = 0; j < (this.maxOffset + 1); ++j) {

				//Get the p index
				var index = this.p[i + j];

				for (var k = 0; k < this.inputsByOffset[j].length; ++k) {
					
					//Get buffer name
					var bufferName = this.inputsByOffset[j][k].attributes.semantic;
					
					// Create the buffer if doesn't exist
					if (!this.buffers[bufferName]) {
						this.buffers[bufferName] = {
							stride	: this.inputsByOffset[j][k].source.accessor.attributes.stride,
							data		: []
						};
					}
					
					//Vertex Weight
					if (bufferName === 'POSITION' && skeleton) {

						//Get vertex weight info
						var info = skeleton.vertexWeights[index];

						for (var weightI = 0; weightI < 4; ++weightI) {
							
							//Create buffers if they don't exist
							if (!this.buffers['aVertexWeight_' + weightI]) {
								this.buffers['aVertexWeight_' + weightI] = {
									stride	: 2,
									data		: []
								};								
							}
							
							if (weightI < info.length) {
								
								//Push the joint
								this.buffers['aVertexWeight_' + weightI].data.push(info[weightI].jointIndex);
								//this.buffers['aVertexWeight_' + weightI].data.push(0.0);
								
								//Push the weight corresponding
								this.buffers['aVertexWeight_' + weightI].data.push(info[weightI].weight);
								//this.buffers['aVertexWeight_' + weightI].data.push(1.0);
								
								
							} else {
								
								//Push the default value for joint
								this.buffers['aVertexWeight_' + weightI].data.push(0.0);
								
								//Push the default value for weight
								this.buffers['aVertexWeight_' + weightI].data.push(0.0);								
							}
						}
					}
					
					//Get the source array
					var source = this.inputsByOffset[j][k].source.dataArray.data;
					
					//Compute the p index with the data stride
					index *= this.buffers[bufferName].stride;
					
					if (bufferName != 'TEXCOORD') {
					  var x = source[index + 0];
  					var y = source[index + 1];
						var z = source[index + 2];
  
  					switch(this.colladaFile.upAxis) {
    					case ColladaLoader_ColladaFile.upAxisEnum.X_UP:
  							var tmp = x;
  							x = -y;
  							y = tmp;
							break;
							case ColladaLoader_ColladaFile.upAxisEnum.Z_UP:
              	var tmp = y;
              	y = z;
              	z = -tmp;
            	break;
          	}
          	this.buffers[bufferName].data.push(x);
          	this.buffers[bufferName].data.push(y);
          	this.buffers[bufferName].data.push(z);
        	}
      		else {
						for (var l = 0; l < this.buffers[bufferName].stride; ++l) {
							this.buffers[bufferName].data.push(source[index + l]);
        		}
					}
				}
			}
		}
	}
};
