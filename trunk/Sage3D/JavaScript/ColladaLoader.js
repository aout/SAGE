if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("ColladaLoader.js");

include("AnimatableEntity.js");
include("Entity.js");
include("Texture.js");
include("Joint.js");

/**
 * ColladaLoader Class
 */
ColladaLoader = function() {
	this.webGL	= Root.getInstance().getWebGL();
	this.xhr	= new XMLHttpRequest();
	
	this.status = ColladaLoader.StatusEnum.NONE;
	this.error = "no error";
	
	this.xmlFile = undefined;
	this.callback = undefined;
	
	this.task = undefined;
};

ColladaLoader.ZUpToYUpMatrix = $M([  [1.0, 0.0, 0.0, 0.0],
                                     [0.0, 0.0, 1.0, 0.0],
                                     [0.0, -1.0, 0.0, 0.0],
                                     [0.0, 0.0, 0.0, 1.0]  ]);

/**
 * Static member
 * ColladaLoader StatusEnum
 */
ColladaLoader.StatusEnum = {
	NONE			: 0,
	XML_LOADING		: 1,
	XML_PARSING		: 2,
	COMPLETE		: 3,
	ERROR			: 4
};

/**
 * Static member
 * ColladaLoader instance
 */
ColladaLoader.instance = undefined;

/**
 * Static member
 * ColladaLoader getInstance
 */
ColladaLoader.getInstance = function() {
	if (ColladaLoader.instance == undefined) {
		ColladaLoader.instance = new ColladaLoader();
	}
	return ColladaLoader.instance;
};

ColladaLoader.trim = function(s) {
  return s.replace(/\n/, ' ').replace(/^\s+/g, '').replace(/\s+$/g, '');
}

/**
 * Static member
 * Node Text get node content as a String
 * @return {String} Node Content
 * @param {Node} n DOM Node
 */
ColladaLoader.nodeText = function(n) {
  var s = "";
  for (c = n.firstChild; c; c = c.nextSibling) {
    if (c.nodeType != 3) {
		break;
	}
    s += c.textContent;
  }
  return ColladaLoader.trim(s);
};

/**
 * Static member
 * ParseFloatListString parse a string
 */
ColladaLoader.parseFloatListString = function(s) {
  if (s == "")
    return [];

  // this is horrible
  var ss = s.split(/\s+/);
  var res = Array(ss.length);
  for (var i = 0, j = 0; i < ss.length; i++) {
    if (ss[i].length == 0)
      continue;
    res[j++] = parseFloat(ss[i]);
  }
  return res;
};

ColladaLoader.parseIntListString = function(s) {
  if (s == "")
    return [];

  // this is horrible
  var ss = s.split(/\s+/);
  var res = Array(ss.length);
  for (var i = 0, j = 0; i < ss.length; i++) {
    if (ss[i].length == 0)
      continue;
    res[j++] = parseInt(ss[i]);
  }
  return res;
};

ColladaLoader.parseMatrixString = function(s) {
  var tab = ColladaLoader.parseFloatListString(s);
  if (tab.length != 16) {
    return null;
  }  
  return $M([[tab[ 0], tab[ 1], tab[ 2], tab[ 3]],
             [tab[ 4], tab[ 5], tab[ 6], tab[ 7]],
             [tab[ 8], tab[ 9], tab[10], tab[11]],
             [tab[12], tab[13], tab[14], tab[15]]]);
}

ColladaLoader.parseMatricesString = function(s) {
  var tab = ColladaLoader.parseFloatListString(s);
  if (tab.length % 16) {
    return null;
  }
  
  var res = new Array(tab.length / 16);
  for (var i = 0; i < tab.length / 16; ++i) {
    res[i] = $M([ [tab[i * 16 +  0], tab[i * 16 +  1], tab[i * 16 +  2], tab[i * 16 +  3]],
                  [tab[i * 16 +  4], tab[i * 16 +  5], tab[i * 16 +  6], tab[i * 16 +  7]],
                  [tab[i * 16 +  8], tab[i * 16 +  9], tab[i * 16 + 10], tab[i * 16 + 11]],
                  [tab[i * 16 + 12], tab[i * 16 + 13], tab[i * 16 + 14], tab[i * 16 + 15]]  ]);
  }
  return res;
}

ColladaLoader.nsResolver = function(prefix) {
      var ns = {
        'c' : 'http://www.collada.org/2005/11/COLLADASchema'
      };
      return ns[prefix] || null;
};

ColladaLoader.getNode = function(xml, xpathexpr, ctxNode) {
	if (ctxNode == null)
		ctxNode = xml;
	return xml.evaluate(xpathexpr, ctxNode, ColladaLoader.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
};

ColladaLoader.getNodes = function(xml, xpathexpr, ctxNode) {
  if (ctxNode == null)
    ctxNode = xml;
  return xml.evaluate(xpathexpr, ctxNode, ColladaLoader.nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
};

ColladaLoader.organizeJoints = function(xml, currentNode, joints, parent) {
  
  var sid = currentNode.getAttribute('sid');
  
  if (sid && sid != '') {
    for (var i = 0; i < joints.length; ++i) {
      if (joints[i].name == sid) {
        jointIndex = i;
        if (!parent) {
          //if (upAxis == 'Z_UP')
          joints[i].localMatrix = joints[i].localMatrix.x(ColladaLoader.ZUpToYUpMatrix);
        }
        else {
          parent.children.push(joints[i]);
        }
        joints[i].parent = parent;
        parent = joints[i];
        
        var transformNodes = ColladaLoader.getNodes(xml, 'c:matrix | c:translate | c:rotate', currentNode);
        for (var j = 0; j < transformNodes.snapshotLength; ++j) {
          switch (transformNodes.snapshotItem(j).nodeName) {
            case 'matrix':
              joints[i].localMatrix = joints[i].localMatrix.x(ColladaLoader.parseMatrixString(ColladaLoader.nodeText(transformNodes.snapshotItem(j))));
              break;
            case 'translate':
              break;
            case 'rotate':
              break;
          }
        }
        break;
      }
    }
  }
  
  var childrenNodes = ColladaLoader.getNodes(xml, 'c:node', currentNode);
  for (var i = 0; i < childrenNodes.snapshotLength; ++i) {
    ColladaLoader.organizeJoints(xml, childrenNodes.snapshotItem(i), joints, parent);
  }
};

ColladaLoader.prototype.load = function(task, callback) {
	this.status = ColladaLoader.StatusEnum.XML_LOADING;
	this.callback = callback;
	this.task = task;
  var self = this;

  this.xhr.onreadystatechange = function () {
  	if (self.xhr.readyState == 4 && (self.xhr.status == 200 || self.xhr.status == 0)) {
      self.xmlFile = self.xhr.responseXML;
  	  self.parse();
  	}
  };

  this.xhr.open("GET", task.location, true);
  this.xhr.overrideMimeType("text/xml");
  this.xhr.setRequestHeader("Content-Type", "text/xml");
  try { this.xhr.send(null); }
	catch(e) { alert(e.Message); }
};

ColladaLoader.prototype.parse = function () {
    this.status = ColladaLoader.StatusEnum.XML_PARSING;

    //Up Axis var with Y_UP as default value
    var upAxis = 'Y_UP';

    //Get up axis real value
    var upAxisNode = ColladaLoader.getNode(this.xmlFile, '/c:COLLADA/c:asset/c:up_axis');
    if (!upAxisNode) {
      alert('Warning: couldn\'t find up_axis node. Assuming up axis is Y_UP');
    }
    else {
      upAxis = ColladaLoader.nodeText(upAxisNode);
      switch (upAxis) {
        case 'X_UP':
        case 'Y_UP':
        case 'Z_UP':
         // alert('Up Axis: ' + upAxis);
        break;
        default:
          upAxis = 'Y_UP';
          alert('Warning: up axis as unknown value. Assuming up axis is Y_UP');
        break;
      }
      delete upAxisNode;
    }

    //Creation of the materials
    /*
    var materials = {
      materialId: {
        texture:    Sage3D.Texture
      }
    };
    */
    var materials = {};
    
    var materialNodes = ColladaLoader.getNodes(this.xmlFile, '/c:COLLADA/c:library_materials/c:material');
    if (!materialNodes || !materialNodes.snapshotLength) {
      alert('Warning: couldn\'t find any material nodes');
    }
    else {
      for (var i = 0; i < materialNodes.snapshotLength; i++) {
        var materialId = materialNodes.snapshotItem(i).getAttribute('id');
        if (!materialId) {
          alert('Error: this material doesn\'t have an id');
          continue;
        }
        
        var instanceEffectNode = ColladaLoader.getNode(this.xmlFile, 'c:instance_effect', materialNodes.snapshotItem(i));
        if (!instanceEffectNode) {
          alert('Error: couldn\'t find the instance_effect node');
          continue;
        }
        
        var effectId = instanceEffectNode.getAttribute('url');
        if (!effectId) {
          alert('Error: couldn\'t find effect url');
          continue;
        }
        effectId = effectId.substr(1, effectId.length - 1);
        
        var effectNode = ColladaLoader.getNode(this.xmlFile, '/c:COLLADA/c:library_effects/c:effect[@id="' + effectId + '"]');
        if (!effectNode) {
          alert('Error: couldn\'t find the effect node with id = ' + effectId);
          continue;
        }
        
        var textureNode = ColladaLoader.getNode(this.xmlFile, 'c:profile_COMMON/c:technique/c:phong/c:diffuse/c:texture', effectNode);
        if (!textureNode) {
          alert('Error: couldn\'t find the texture node');
          continue;
        }
        
        var samplerSid = textureNode.getAttribute('texture');
        if (!samplerSid) {
          alert('Error: couldn\'t find the sampler sid');
          continue;
        }
        
        var samplerNode = ColladaLoader.getNode(this.xmlFile, 'c:profile_COMMON/c:newparam[@sid="' + samplerSid + '"]/c:sampler2D', effectNode);
        if (!samplerNode) {
          alert('Error: couldn\'t find the sampler node');
          continue;
        }
        var minfilter = 'NEAREST';
        var magfilter = 'LINEAR';
        
        var minfilterNode = ColladaLoader.getNode(this.xmlFile, 'c:minfilter', samplerNode);
        if (!minfilterNode) {
          alert('Warning: couldn\'t find the minfilter node. Assuming is NEAREST');
        } else {
          minfilter = ColladaLoader.nodeText(minfilterNode);
          switch (minfilter) {
            case 'NEAREST':
            case 'LINEAR':
            case 'LINEAR_MIPMAP_NEAREST':
            case 'NEAREST_MIPMAP_NEAREST':
            case 'NEAREST_MIPMAP_LINEAR':
            case 'LINEAR_MIPMAP_LINEAR':
              break;
            default:
              alert('Warning: minfilter as an unknown value. Assuming is NEAREST');
              minfilter = 'NEAREST';
            break;
          }
        }
        
        var magfilterNode = ColladaLoader.getNode(this.xmlFile, 'c:magfilter', samplerNode);
        if (!magfilterNode) {
          alert('Warning: couldn\'t find the magfilter node. Assuming is LINEAR');
        } else {
          magfilter = ColladaLoader.nodeText(magfilterNode);
          switch (magfilter) {
            case 'NEAREST':
            case 'LINEAR':
              break;
            default:
              alert('Warning: magfilter as an unknown value. Assuming is LINEAR');
              magfilter = 'LINEAR';
            break;
          }
        }
        
        var sourceNode = ColladaLoader.getNode(this.xmlFile, 'c:source', samplerNode);
        if (!sourceNode) {
          alert('Error: couldn\'t find the source node');
          continue;
        }

        var surfaceSid = ColladaLoader.nodeText(sourceNode);
        if (!surfaceSid || surfaceSid == '') {
          alert('Error: couldn\'t find the surface sid');
          continue;
        }
        
        var initFromNode = ColladaLoader.getNode(this.xmlFile, 'c:profile_COMMON/c:newparam[@sid="' + surfaceSid + '"]/c:surface/c:init_from', effectNode);
        if (!initFromNode) {
          alert('Error: couldn\'t find the init_from node from surface');
          continue;
        }

        var imageId = ColladaLoader.nodeText(initFromNode);
        if (!imageId || imageId == '') {
          alert('Error: couldn\'t find the image id');
          continue;
        }

        var imageUrlNode = ColladaLoader.getNode(this.xmlFile, '/c:COLLADA/c:library_images/c:image[@id="' + imageId + '"]/c:init_from');
        if (!imageUrlNode) {
          alert('Error: couldn\'t find the init_from node from image');
          continue;
        }
        
        var imageUrl = ColladaLoader.nodeText(imageUrlNode);
        if (!imageUrl || imageUrl == '') {
          alert('Error: couldn\'t find the image url');
          continue;
        }

        var text = {
          type    : "Texture",
          owner   : this.task,
          name    : imageId,
          progress  : 0.0
        };
        ResourceManager.getInstance().taskList.push(text);
        this.task.children.push(text);

        materials[materialId] = new Texture(imageId);
        materials[materialId].load(0, imageUrl, this.callback, minfilter, magfilter);
      }
    }
    
    /*
    var meshes = {
      'geometryId': {
        triangles:  Array({
                           indices:    Array(int),
                           inputs:     Array({
                                              semantic: String,
                                              offset:   int,
                                              source:   pointer to meshes[geometryId]['sources'][sourceId]},
                                              ... ),
                           stride:     int,
                           count:      int,
                           material:   String,
                          },
                          ...),
        sources:  {
          'sourceId': {
            valuesArray:      Array(),
            stride:           int,
            count:            int
          },
          ...
        }
      }
    }; 
    */
    var meshes = {};
    var geometryNodes = ColladaLoader.getNodes(this.xmlFile, '/c:COLLADA/c:library_geometries/c:geometry');

    if (!geometryNodes || !geometryNodes.snapshotLength) {
      alert('Warning: couldn\'t find any geometry nodes');
    }
    else {
      for (var i = 0; i < geometryNodes.snapshotLength; i++) {
        var geometryId = geometryNodes.snapshotItem(i).getAttribute('id');
        if (!geometryId || geometryId == '') {
          alert('Error: this geometry doesn\'t have an id');
          continue;
        }
        meshes[geometryId] = {};
        meshes[geometryId]['sources'] = {};

        var sourceNodes = ColladaLoader.getNodes(this.xmlFile, 'c:mesh/c:source', geometryNodes.snapshotItem(i));
        if (!sourceNodes || !sourceNodes.snapshotLength) {
          alert('Warning: couldn\'t find any source nodes');
          continue;
        }
        else {
          for (var j = 0; j < sourceNodes.snapshotLength; j++) {
            var sourceId = sourceNodes.snapshotItem(j).getAttribute('id');
            if (!sourceId || sourceId == '') {
              alert('Error: this source node doesn\'t have an id');
              continue;
            }
            var accessorNode = ColladaLoader.getNode(this.xmlFile, 'c:technique_common/c:accessor', sourceNodes.snapshotItem(j));
            if (!accessorNode) {
              alert('Error: couldn\'t find the accessor node');
              continue;
            }
            
            var count = accessorNode.getAttribute('count');
            if (!count || count == '') {
              alert('Error: count attribute unknown');
              continue;
            }
            count = parseInt(count);
            
            var stride = accessorNode.getAttribute('stride');
            if (!stride || stride == '') {
              alert('Error: stride attribute unknown');
              continue;
            }
            stride = parseInt(stride);
            
            var sourceArrayId = accessorNode.getAttribute('source');
            if (!sourceArrayId || sourceArrayId == '') {
              alert('Error: source attribute unknown');
              continue;
            }
            sourceArrayId = sourceArrayId.substr(1, sourceArrayId.length - 1);
            
            var sourceArrayNode = ColladaLoader.getNode(this.xmlFile, 'c:*[@id="' + sourceArrayId + '"]', sourceNodes.snapshotItem(j));
            if (!sourceArrayNode) {
              alert('Error: this source doesn\'t have value');
              continue;
            }
            
            if (count * stride != parseInt(sourceArrayNode.getAttribute('count'))) {
              alert('Error: count doesn\'t match');
              continue;
            }
            
            meshes[geometryId]['sources'][sourceId] = {};
            meshes[geometryId]['sources'][sourceId]['count'] = count;
            meshes[geometryId]['sources'][sourceId]['stride'] = stride;
            meshes[geometryId]['sources'][sourceId]['size'] = stride * count;
            meshes[geometryId]['sources'][sourceId]['valuesArray'] = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(sourceArrayNode));
            
            if (meshes[geometryId]['sources'][sourceId]['valuesArray'].length < meshes[geometryId]['sources'][sourceId]['size']) {
              alert('Error: There is not enough value in the array');
              delete meshes[geometryId][sourceArrayId];
            } else if (meshes[geometryId]['sources'][sourceId]['valuesArray'].length > meshes[geometryId]['sources'][sourceId]['size']) {
              alert('Warning: there is too much value in the array');
            }
          }
        }
        
        var trianglesNodes = ColladaLoader.getNodes(this.xmlFile, 'c:mesh/c:triangles', geometryNodes.snapshotItem(i));
        if (!trianglesNodes || !trianglesNodes.snapshotLength) {
          alert('Error: couldn\'t find any triangles nodes');
          delete meshes[geometryId];
          continue;
        }
        else {
          meshes[geometryId]['triangles'] = new Array();
          for (var j = 0; j < trianglesNodes.snapshotLength; j++) {
            var triangles = {};
            
            var count = trianglesNodes.snapshotItem(j).getAttribute('count');
            if (!count || count == '') {
              alert('Error: no count attribute');
              continue;
            }
            count = parseInt(count);
            
            var material = trianglesNodes.snapshotItem(j).getAttribute('material');
            if (!material || material == '') {
              alert('Error: no material attribute');
              continue;
            }
            
            triangles['count'] = count;
            triangles['material'] = material;
            
            var maxOffset = 0;
            
            var inputNodes = ColladaLoader.getNodes(this.xmlFile, 'c:input', trianglesNodes.snapshotItem(j));
            if (!inputNodes || !inputNodes.snapshotLength) {
              alert('Error: couldn\'t find any input nodes');
              continue;
            }
            else {
              triangles['inputs'] = new Array();
              for (var k = 0; k < inputNodes.snapshotLength; k++) {
                var input = {};
                
                var offset = inputNodes.snapshotItem(k).getAttribute('offset');
                if (!offset || offset == '') {
                  alert('Error: no offset');
                  continue;
                }
                offset = parseInt(offset);
                
                var source = inputNodes.snapshotItem(k).getAttribute('source');
                if (!source || source == '') {
                  alert('Error: no source');
                  continue;
                }
                source = source.substr(1, source.length - 1);
                
                var semantic = inputNodes.snapshotItem(k).getAttribute('semantic');
                if (!semantic || semantic == '') {
                  alert('Error: no semantic');
                  continue;
                }
                
                var sourceNode = ColladaLoader.getNode(this.xmlFile, 'c:mesh/c:*[@id="' + source + '"]', geometryNodes.snapshotItem(i));
                if (!sourceNode) {
                  alert('Error: source not found');
                  continue;
                }

                if (sourceNode.nodeName == 'vertices') {
                  var newInputNode = ColladaLoader.getNode(this.xmlFile, 'c:input', sourceNode);
                  if (!newInputNode) {
                    alert('Error: no input node in vertices');
                    continue;
                  }
                  
                  semantic = newInputNode.getAttribute('semantic');
                  source = newInputNode.getAttribute('source');
                  source = source.substr(1, source.length - 1);
                }
                
                for (var sourceName in meshes[geometryId]['sources']) {
                  if (sourceName == source) {
                    input['semantic'] = semantic;
                    maxOffset = offset > maxOffset ? offset : maxOffset;
                    input['offset'] = offset;
                    input['source'] = meshes[geometryId]['sources'][sourceName];
                    triangles['inputs'].push(input);
                    break;
                  }
                }
              }
            }

            triangles['stride'] = maxOffset + 1;
            
            var indicesNode = ColladaLoader.getNode(this.xmlFile, 'c:p', trianglesNodes.snapshotItem(j));
            if (!indicesNode) {
              alert('Error: no indices node');
              continue;
            }
            
            triangles['indices'] = ColladaLoader.parseIntListString(ColladaLoader.nodeText(indicesNode));
            if (triangles['indices'].length != triangles['count'] * triangles['stride'] * 3) {
              alert('Warning: bad number of indices');
            }
            
            meshes[geometryId]['triangles'].push(triangles);
          }
        }
      }
    }


            /*
            // On remet les tableaux dans l'ordre
            var end = mesh['INDICESP']['count'] * (mesh['INDICESP']['maxOffset'] + 1);
            for (var p = 0; p < end; p += mesh['INDICESP']['maxOffset'] + 1) {
                for (var name in mesh) {
                    if (name == 'INDICESP')
                        continue;
                    if (p == 0)
                        mesh[name]['newArray'] = new Array();
                    for (var stride = 0; stride < mesh[name]['stride']; stride++)
                        mesh[name]['newArray'].push(mesh[name]['floatArray'][mesh['INDICESP']['floatArray'][p + mesh[name]['offset']] * mesh[name]['stride'] + stride])
                }
            }
            */


    /***

    var skeletons = {
      'controllerId': {
        boundMesh:            String,
        bindShapeMatrix:      Matrix,
        jointsNumber:         int,
        weightsNumber:        int,
        vertexWeightsNumber:  int,
        root:                 pointer to a joint,
        joints:               Array({ name:         String,
                                      ibm:          Matrix,
                                      localMatrix:  Matrix,
                                      worldMatrix:  Matrix,
                                      parent:       int,
                                      children:     Array(int) }),
        weights:              Array(int),
        vertexWeights:        Array(Array({joint: int, weight: int}))
      },
      ...      
    };

    ***/

    var skeletons = {};
    var skinNodes = ColladaLoader.getNodes(this.xmlFile, '/c:COLLADA/c:library_controllers/c:controller/c:skin');
    
    if (!skinNodes) {
      alert('Warning: There isn\'t skin node');
    } else {
      for (var i = 0; i < skinNodes.snapshotLength; i++) {
        var skin = {};
        
        var boundMeshId = skinNodes.snapshotItem(i).getAttribute('source');
        var boundMeshFound = false;
        
        if (boundMeshId || boundMeshId != '') {
          boundMeshId = boundMeshId.substr(1, boundMeshId.length - 1);
          for (var meshName in meshes) {
            if (meshName == boundMeshId) {
              boundMeshFound = true;
              break;
            }
          }
        }
        if (!boundMeshFound) {
          alert('Error: bad mesh id');
          continue;          
        }
        
        skin['boundMesh'] = boundMeshId;
        
        var controllerId = ColladaLoader.getNode(this.xmlFile, '..', skinNodes.snapshotItem(i)).getAttribute('id');
        if (!controllerId || controllerId == '') {
          alert('Error: bad controller id');
          continue;
        }
        
        var bindShapeMatrixNode = ColladaLoader.getNode(this.xmlFile, 'c:bind_shape_matrix', skinNodes.snapshotItem(i));
        if (!bindShapeMatrixNode) {
          //alert('Warning: no bind shape matrix. Assuming it\'s identity');
          skin['bindShapeMatrix'] = Matrix.I(4);
        }
        else {
          skin['bindShapeMatrix'] = ColladaLoader.parseMatrixString(ColladaLoader.nodeText(bindShapeMatrixNode));
          if (!skin['bindShapeMatrix']) {
            alert('Warning: invalid bind shape matrix. Assuming it\'s identity');
            skin['bindShapeMatrix'] = Matrix.I(4);
          }
        }
        
        var jointsNode = ColladaLoader.getNode(this.xmlFile, 'c:joints', skinNodes.snapshotItem(i));
        if (!jointsNode) {
          alert('Error: no joints node');
          continue;
        }
        
        var inputJointNameNode = ColladaLoader.getNode(this.xmlFile, 'c:input[@semantic="JOINT"]', jointsNode);
        if (!inputJointNameNode) {
          alert('Error: no input joint node');
          continue;
        }
        
        var jointNameArrayId = inputJointNameNode.getAttribute('source');
        if (!jointNameArrayId || jointNameArrayId == '') {
          alert('Error: no joint name array id');
          continue;
        }
        jointNameArrayId = jointNameArrayId.substr(1, jointNameArrayId.length - 1);
        
        var inputIBMNode = ColladaLoader.getNode(this.xmlFile, 'c:input[@semantic="INV_BIND_MATRIX"]', jointsNode);
        if (!inputIBMNode) {
          alert('Error: no IBM input node');
          continue;
        }
        
        var IBMArrayId = inputIBMNode.getAttribute('source');
        if (!IBMArrayId || IBMArrayId == '') {
          alert('Error: no IBM array id');
          continue;
        }
        IBMArrayId = IBMArrayId.substr(1, IBMArrayId.length - 1);
        
        var jointNameArraySourceNode = ColladaLoader.getNode(this.xmlFile, 'c:source[@id="' + jointNameArrayId + '"]', skinNodes.snapshotItem(i));
        var IBMArraySourceNode = ColladaLoader.getNode(this.xmlFile, 'c:source[@id="' + IBMArrayId + '"]', skinNodes.snapshotItem(i));
        
        if (!jointNameArraySourceNode || !IBMArraySourceNode) {
          alert('Error: bad id');
          continue;
        }
        
        //bon j'en ai marre de checker les valeures de retour.
        
        var jointAccessorNode = ColladaLoader.getNode(this.xmlFile, 'c:technique_common/c:accessor', jointNameArraySourceNode);
        skin['jointsNumber'] = jointAccessorNode.getAttribute('count');
        var jointNameArrayNode = ColladaLoader.getNode(this.xmlFile, 'c:*[@id="' + jointAccessorNode.getAttribute('source').substr(1, jointAccessorNode.getAttribute('source').length - 1) + '"]', jointNameArraySourceNode);
        
        var jointNameTab = ColladaLoader.nodeText(jointNameArrayNode).split(/\s+/);
        
        var IBMAccessorNode = ColladaLoader.getNode(this.xmlFile, 'c:technique_common/c:accessor', IBMArraySourceNode);
        var IBMArrayNode  = ColladaLoader.getNode(this.xmlFile, 'c:*[@id="' + IBMAccessorNode.getAttribute('source').substr(1, IBMAccessorNode.getAttribute('source').length - 1) + '"]', IBMArraySourceNode);
        
        var matricesTab = ColladaLoader.parseMatricesString(ColladaLoader.nodeText(IBMArrayNode));
        
        if (!jointNameTab || !matricesTab || jointNameTab.length != skin['jointsNumber'] || jointNameTab.length != matricesTab.length) {
          alert('CACA');
          continue;
        }
        
        skin['joints'] = new Array(skin['jointsNumber'])
        for (var j = 0; j < skin['jointsNumber']; ++j) {
          skin['joints'][j] = new Joint({
            name:               jointNameTab[j],
            inverseBindMatrix:  matricesTab[j],
            localMatrix:        Matrix.I(4),
            worldMatrix:        Matrix.I(4),
            parent:             null,
            children:           []
          });
        }
        
        // weights
        var weightsSourceNodeId = ColladaLoader.getNode(this.xmlFile, 'c:vertex_weights/c:input[@semantic="WEIGHT"]', skinNodes.snapshotItem(i)).getAttribute('source');
        var weightsAccessorNode = ColladaLoader.getNode(this.xmlFile, 'c:source[@id="' + weightsSourceNodeId.substr(1, weightsSourceNodeId.length - 1) + '"]/c:technique_common/c:accessor', skinNodes.snapshotItem(i));
        var weightsArrayId = weightsAccessorNode.getAttribute('source');
        skin['weightsNumber'] = parseInt(weightsAccessorNode.getAttribute('count'));
        skin['weights'] = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(ColladaLoader.getNode(this.xmlFile, 'c:source/c:*[@id="' + weightsArrayId.substr(1, weightsArrayId.length - 1) + '"]', skinNodes.snapshotItem(i))));
        
        // vertexWeights
        skin['vertexWeightsNumber'] = parseInt(ColladaLoader.getNode(this.xmlFile, 'c:vertex_weights', skinNodes.snapshotItem(i)).getAttribute('count'));
        skin['vertexWeights'] = new Array(skin['vertexWeightsNumber']);
        var vcountArray = ColladaLoader.parseIntListString(ColladaLoader.nodeText(ColladaLoader.getNode(this.xmlFile, 'c:vertex_weights/c:vcount', skinNodes.snapshotItem(i))));
        var vArray = ColladaLoader.parseIntListString(ColladaLoader.nodeText(ColladaLoader.getNode(this.xmlFile, 'c:vertex_weights/c:v', skinNodes.snapshotItem(i))));
        var vIndex = 0;
        for (var j = 0; j < skin['vertexWeightsNumber']; ++j) {
          skin['vertexWeights'][j] = new Array(vcountArray[j]);
          for (var k = 0; k < vcountArray[j]; ++k) {
            skin['vertexWeights'][j][k] = {
              joint:  vArray[vIndex + k * 2 + 0],
              weight: vArray[vIndex + k * 2 + 1]
              };
          }
          vIndex += vcountArray[j] * 2;
        }
        delete vcountArray;
        delete vArray;
        
        // Parsing visual scene to find the joint hierarchy 
        var instanceControllerNode = ColladaLoader.getNode(this.xmlFile, '//c:instance_controller[@url="#' + controllerId + '"]');
        var skeletonRootId = ColladaLoader.nodeText(ColladaLoader.getNode(this.xmlFile, 'c:skeleton', instanceControllerNode));
        skeletonRootId = skeletonRootId.substr(1, skeletonRootId.length - 1);
        var skeletonRootNode = ColladaLoader.getNode(this.xmlFile, '//c:node[@id="' + skeletonRootId + '"]');
        ColladaLoader.organizeJoints(this.xmlFile, skeletonRootNode, skin['joints'], null);
        
        for (var j = 0; j < skin['joints'].length; ++j) {
          if (!skin['joints'][j].parent) {
            skin['root'] = skin['joints'][j];
            break;
          }
        }
        
        var instanceMaterialNodes = ColladaLoader.getNodes(this.xmlFile, 'c:bind_material/c:technique_common/c:instance_material', instanceControllerNode);
        for (var j = 0; j < instanceMaterialNodes.snapshotLength; ++j) {
          var symbol = instanceMaterialNodes.snapshotItem(i).getAttribute('symbol');
          var target = instanceMaterialNodes.snapshotItem(i).getAttribute('target');
          target = target.substr(1, target.length - 1);
          
          for (var meshName in meshes) {
            if (meshName === skin['boundMesh']) {
              for (var k = 0; k < meshes[meshName].triangles; ++k){
                if (meshes[meshName].triangles[k].material === symbol) {
                  meshes[meshName].triangles[k].material = target;
                }
              }
            }
          }
        }
        skeletons[controllerId] = skin;
      }
    }

  var ent = new AnimatableEntity('Amahani', upAxis, meshes['mesh'], skeletons['skin'], materials);
  var amahaniTransform = Transform.getTransform("root").addChild('Amahani');
  amahaniTransform.addEntity(ent);
  this.task.parsingProgress = 1.0;
  if (this.callback) {
    this.callback();
  }
};
    /*
    return false;
    
	/*** 

    Contenu du tableau Animations

    var Animations = {
    'ANIMATION1': {
    'input': Array(),
    'output': Array(),
	'intangents': Array(),
    'outtagents': Array(),
	'interpolations': "",
    },
    };
    
    ***/
/*

    var Animations = {};

    var animationsNode = ColladaLoader.getNode(this.xmlFile, '//c:library_animations');
	var listAnimationNodes = animationsNode.getElementsByTagName('animation');
	var animationName = '';
	
	for (var i = 0; i < listAnimationNodes.length; i++) {
	
		var animationSourcesNodes = listAnimationNodes[i].getElementsByTagName('source');
		var animationSamplerNode = listAnimationNodes[i].getElementsByTagName('sampler');
		var listSamplerChildren = animationSamplerNode[0].children;
		
		Animations[i] = new Array();
	
		for (var j = 0; j < listSamplerChildren.length; j++) {
			 animationName = listSamplerChildren[j].getAttribute('source');
			 animationName = animationName.substr(1, animationName.length - 1);
			 
			 for (var k = 0; k < animationSourcesNodes.length; k++) {
				if (animationName == animationSourcesNodes[k].getAttribute('id'))
					switch (k) {
						case 0:
							Animations[i]['INPUT'] = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(animationSourcesNodes[k].children[0]));
							break;
						case 1:
							Animations[i]['OUTPUT'] = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(animationSourcesNodes[k].children[0]));
							break;
						case 2:
							Animations[i]['IN_TANGENT'] = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(animationSourcesNodes[k].children[0]));
							break;
						case 3:
							Animations[i]['OUT_TANGENT'] = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(animationSourcesNodes[k].children[0]));
							break;
						case 4:
							Animations[i]['INTERPOLATION'] = ColladaLoader.nodeText(animationSourcesNodes[k].children[0]);
							break;
						}
					
				}
		}
	}
    this.status = ColladaLoader.StatusEnum.COMPLETE;


    if (this.callback != undefined) {
        this.callback(null);
    }
};
*/