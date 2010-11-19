if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Skeleton.js");

ColladaLoader_Skeleton = function(controller) {
	this.colladaFile = controller.colladaFile;
	this.controller = controller;
	
  this.root = undefined;
	this.joints = [];
	this.vertexWeights = [];
	
	this.hasAnimations = false;
	this.minTime = 0;
	this.maxTime = 0;
};

ColladaLoader_Skeleton.prototype.organizeJoints  = function(currentNode, parent) {
  
  var sid = currentNode.getAttribute('sid');
  
  if (sid && sid != '') {
    for (var i = 0; i < this.joints.length; ++i) {
      if (this.joints[i].name == sid) {
        if (!parent) {
        	this.root = this.joints[i];
          switch (this.colladaFile.upAxis) {
          	case ColladaLoader_ColladaFile.upAxisEnum.X_UP:
          		break;
          	case ColladaLoader_ColladaFile.upAxisEnum.Y_UP:
          		break;
          }
        }
        else {
          parent.children.push(this.joints[i]);
        }
        this.joints[i].parent = parent;
        parent = this.joints[i];
        
        var transformNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:matrix | c:translate | c:rotate', currentNode);
        for (var j = 0; j < transformNodes.snapshotLength; ++j) {
          switch (transformNodes.snapshotItem(j).tagName) {
            case 'matrix':
            	var matrix = new ColladaLoader_Matrix(this.colladaFile);
            	if (matrix.parse(transformNodes.snapshotItem(j))) {
            		this.joints[i].transformations.push(matrix);
            	}
              break;
            case 'translate':
            	var translate = new ColladaLoader_Translate(this.colladaFile);
            	if (translate.parse(transformNodes.snapshotItem(j))) {
            		this.joints[i].transformations.push(translate);
            	}
              break;
            case 'rotate':
            	var rotate = new ColladaLoader_Rotate(this.colladaFile);
            	if (rotate.parse(transformNodes.snapshotItem(j))) {
            		this.joints[i].transformations.push(rotate);
            	}
              break;
          }
        }
        break;
      }
    }
  }
  
  var childrenNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:node', currentNode);
  for (var i = 0; i < childrenNodes.snapshotLength; ++i) {
    this.organizeJoints(childrenNodes.snapshotItem(i), parent);
  }
};

ColladaLoader_Skeleton.prototype.parse = function() {
	for (var i = 0; i < this.controller.jointsInputs[0].source.accessor.attributes.count; ++i) {
		var joint = new ColladaLoader_Joint();
		for (var j = 0; j < this.controller.jointsInputs.length; ++j) {
			switch(this.controller.jointsInputs[j].attributes.semantic) {
				case 'JOINT':
					joint.name = this.controller.jointsInputs[j].source.dataArray.data[i];
					break;
				case 'INV_BIND_MATRIX':
					var tab = this.controller.jointsInputs[j].source.dataArray.data.slice(i * 16, i * 16 + 16);
					joint.inverseBindMatrix = mat4.create([	tab[ 0], tab[ 1], tab[ 2], tab[ 3],
																									tab[ 4], tab[ 5], tab[ 6], tab[ 7],
																									tab[ 8], tab[ 9], tab[10], tab[11],
																									tab[12], tab[13], tab[14], tab[15]	]);
					break;				
			}
		}
		this.joints.push(joint);
	}
	
	var vIndex = 0;
	for (var i = 0; i < this.controller.vertexWeights.vcount.length; ++i) {
		var tab = new Array(this.controller.vertexWeights.vcount[i]);
		for (var j = 0; j < this.controller.vertexWeights.vcount[i]; ++j) {
			tab[j] = {
				jointIndex: this.controller.vertexWeights.v[vIndex],
				weight:			this.controller.vertexWeights.inputs[1].source.dataArray.data[this.controller.vertexWeights.v[vIndex + 1]]
			};
			vIndex += 2;
		}
		this.vertexWeights.push(tab);
	}
	
	var libraryVisualScenesNode = ColladaLoader.getNode(this.colladaFile.xml, '/c:COLLADA/c:library_visual_scenes');
	if (!libraryVisualScenesNode) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;library_visual_scenes&gt;</span><br />'; }
		return false;
	}
	
	var instanceNode = ColladaLoader.getNode(this.colladaFile.xml, '//c:instance_controller[@url="#' + this.controller.attributes.id + '"]', libraryVisualScenesNode);
	if (!instanceNode) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;instance_controller url="#' + this.controller.attributes.id + '"&gt;</span><br />'; }
		return false;
	}
	
	var skeletonNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:skeleton', instanceNode);
	if (!skeletonNode) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;skeleton&gt; in &lt;instance_controller url="#' + this.controller.attributes.id + '"&gt;</span><br />'; }
		return false;
	}

	var rootNodeId = ColladaLoader.nodeText(skeletonNode);
	rootNodeId = rootNodeId.substr(1, rootNodeId.length - 1);
	
	//verification des materials
	var instanceMaterialNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:bind_material/c:technique_common/c:instance_material', instanceNode);
	var bindingMaterials = [];
	for (var i = 0; i < instanceMaterialNodes.snapshotLength; ++i) {
		var obj = {
			attributes: {
				symbol: undefined,
				target: undefined
			}
		};
		ColladaLoader.parseAttributes(obj, instanceMaterialNodes.snapshotItem(i));
		bindingMaterials.push(obj);
	}
	for (var i = 0; i < bindingMaterials.length; ++i) {
		var found = false;
		var targetId = bindingMaterials[i].attributes.target.substr(1, bindingMaterials[i].attributes.target.length - 1);
		for (var j = 0; j < this.colladaFile.libraryMaterials.length && !found; ++j) {
			if (this.colladaFile.libraryMaterials[j].attributes.id == targetId) {
				bindingMaterials[i].material = this.colladaFile.libraryMaterials[j];
				found = true;
			}
		}
		if (!found) {
			if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;material id="' + targetId + '"&gt; in &lt;instance_controller url="#' + this.controller.attributes.id + '"&gt;</span><br />'; }
			return false;
		}
	}
	var prim = this.controller.geometry.primitives;
	for (var i = 0; i < prim.length; ++i) {
		var found = false;
		for (var j = 0; j < bindingMaterials.length; ++j) {
			if (prim[i].attributes.material == bindingMaterials[j].attributes.symbol) {
				prim[i].material = bindingMaterials[j].material;
				found = true;
			}
		}
	}
	
	var rootNodeNode = ColladaLoader.getNode(this.colladaFile.xml, '//c:node[@id="' + rootNodeId + '"]', libraryVisualScenesNode);
	if (!rootNodeNode) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;node id="' + rootNodeId + '"&gt;</span><br />'; }
		return false;
	}
	
	this.organizeJoints(rootNodeNode, null);
	for (var i = 0; i < this.joints.lenth; ++i) {
		if (this.joints[i].parent == null && this.joints[i] != this.root) {
			if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Error in the joint\'s hierarchy</span><br />'; }
			return false;			
		}
	}
	
	return true;
};

ColladaLoader_Skeleton.prototype.generateSkeletons = function(precision) {
	for (var time = this.minTime; time <= this.maxTime; time += precision) {
		
	}
};
