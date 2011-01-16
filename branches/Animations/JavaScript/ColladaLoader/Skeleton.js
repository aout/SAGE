if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Skeleton.js");

ColladaLoader_Skeleton = function(controller) {
	this.colladaFile = controller.colladaFile;
	this.controller = controller;
	
  this.roots = [];
	this.joints = [];
	this.vertexWeights = [];
	
	this.hasAnimations = true;
	this.minTime = 0;
	this.maxTime = 0;
};

ColladaLoader_Skeleton.prototype.organizeJoints  = function(currentNode, parent) {
  
  var sid = currentNode.getAttribute('sid');
  
  if (sid && sid != '') {
    for (var i = 0; i < this.joints.length; ++i) {
      if (this.joints[i].name == sid) {
        if (!parent) {
        	this.roots.push(this.joints[i]);
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
	
	var skeletonNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:skeleton', instanceNode);
	if (!skeletonNodes || skeletonNodes.snapshotLength == 0) {
		if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;skeleton&gt; in &lt;instance_controller url="#' + this.controller.attributes.id + '"&gt;</span><br />'; }
		return false;
	}

	var rootNodeIds = [] 
	for (var i = 0; i < skeletonNodes.snapshotLength; ++i) {
		var rootNodeId = ColladaLoader.nodeText(skeletonNodes.snapshotItem(i));
		rootNodeIds.push(rootNodeId.substr(1, rootNodeId.length - 1));
	}
	
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
	
	for (var i = 0; i < rootNodeIds.length; ++i) {
		var rootNodeNode = ColladaLoader.getNode(this.colladaFile.xml, '//c:node[@id="' + rootNodeIds[i] + '"]', libraryVisualScenesNode);
		if (!rootNodeNode) {
			if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;node id="' + rootNodeIds[i] + '"&gt;</span><br />'; }
			return false;
		}
		
		this.organizeJoints(rootNodeNode, null);		
	}
	
	return true;
};

ColladaLoader_Skeleton.prototype.findJoint = function(array, name) {
	for (var i = 0; i < array.length; ++i) {
		if (array[i].name === name) {
			return array[i];
		}
	}
	return undefined;
};

ColladaLoader_Skeleton.prototype.generateBindShape = function() {
	var sageJoints = new Array(this.joints.length);
	
	//First create all sage joint
	for (var i = 0; i < this.joints.length; ++i) {
		sageJoints[i] = new Joint(this.joints[i].name, undefined, this.joints[i].generateBindShapeLocalMatrix(), this.joints[i].inverseBindMatrix);
	}
	
	//Then organize them
	for (var i = 0; i < this.joints.length; ++i) {
		//set the parent if exists
		if (this.joints[i].parent) {
			sageJoints[i].parent = this.findJoint(sageJoints, this.joints[i].parent.name);
		}
		//set the children is exist
		for (var j = 0; j < this.joints[i].children.length; ++j) {
			sageJoints[i].addChild(this.findJoint(sageJoints, this.joints[i].children[j].name));
		}
	}
	
	if (this.roots.length == 1) {
		var root = this.findJoint(sageJoints, this.roots[0].name);
	}	else {
		var local = mat4.create();
		var ibm = mat4.create();
		mat4.identity(local);
		mat4.identity(ibm);
		var root = new Joint('NoMultiRoot', undefined, local, ibm);
		for (var i = 0; i < this.roots.length; ++i) {
			var joint = this.findJoint(sageJoints, this.roots[i].name)
			root.addChild(joint);
			joint.parent = root;
		}
	} 
	
	//Compute All matrix in joint tree
	root.update();
	
	return new Skeleton(sageJoints, root, this.controller.bindShapeMatrix);
};
