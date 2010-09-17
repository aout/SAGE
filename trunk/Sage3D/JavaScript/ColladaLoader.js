if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("ColladaLoader.js");

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
  return s;
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
          alert('Up Axis: ' + upAxis);
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

        materials[materialId] = new Texture(imageId);
        materials[materialId].load(0, imageUrl, function() {alert('Texture loaded successfuly !!!')}, minfilter, magfilter);

      }
    }
    
    /***
    
    Boucles pour retrouver les input des meshs 
    
    ***/

    /*** 

    Contenu du floatArray

    var floatArrays = {
    'INDICESP': {
    'floatArray': Array(),
    'maxOffset': 0,
    'count': 29000
    },
    'POSITION': {
    'floatArray': Array(),
    'newArray': Array(),
    'offset': 0,
    'stride': 3,
    'count': 29000
    }
    };
    
    ***/

    var floatArrays = {};

    var geometryNode = ColladaLoader.getNode(this.xmlFile, '//c:library_geometries/c:geometry');
    var listMeshNodes = geometryNode.getElementsByTagName('mesh');

    for (var i = 0; i < listMeshNodes.length; i++) {
        var listMeshNodesChildren = listMeshNodes[i].children;
        var listTrianglesNodes = listMeshNodes[i].getElementsByTagName('triangles');

        for (var j = 0; j < listTrianglesNodes.length; j++) {
            var listInputNodes = listTrianglesNodes[j].getElementsByTagName('input');
            var indicesP = listTrianglesNodes[j].getElementsByTagName('p')[0];

            floatArrays['INDICESP'] = {};

            floatArrays['INDICESP']['floatArray'] = ColladaLoader.parseIntListString(ColladaLoader.nodeText(indicesP));
            floatArrays['INDICESP']['maxOffset'] = 0;
            //floatArrays['INDICESP']['count'] = parseInt(listTrianglesNodes[j].getAttribute('count'));
            floatArrays['INDICESP']['count'] = Math.floor(floatArrays['INDICESP']['floatArray'].length / 3);

            for (var k = 0; k < listInputNodes.length; k++) {
                for (var l = 0; l < listMeshNodesChildren.length; l++) {
                    var sourceId = listInputNodes[k].getAttribute('source');

                    if (listMeshNodesChildren[l].getAttribute('id') == sourceId.substr(1, sourceId.length - 1)) {
                        if (listInputNodes[k].getAttribute('semantic') == "VERTEX") {
                            var listInputVertices = listMeshNodesChildren[l].getElementsByTagName('input');

                            for (var m = 0; m < listInputVertices.length; m++) {
                                var sourceIdVertex = listInputVertices[m].getAttribute('source');

                                for (var n = 0; n < listMeshNodesChildren.length; n++) {
                                    if (listMeshNodesChildren[n].getAttribute('id') == sourceIdVertex.substr(1, sourceIdVertex.length - 1)) {
                                        floatArrays['POSITION'] = {}
                                        floatArrays['POSITION']['floatArray'] = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(listMeshNodesChildren[n].children[0]));
                                        var offset = parseInt(listInputNodes[k].getAttribute('offset'));
                                        floatArrays['POSITION']['offset'] = offset;
                                        floatArrays['INDICESP']['maxOffset'] = offset > floatArrays['INDICESP']['maxOffset'] ? offset : floatArrays['INDICESP']['maxOffset'];
                                        var accessorNode = listMeshNodesChildren[n].getElementsByTagName('technique_common')[0].getElementsByTagName('accessor')[0];
                                        floatArrays['POSITION']['stride'] = parseInt(accessorNode.getAttribute('stride'));
                                        floatArrays['POSITION']['count'] = parseInt(accessorNode.getAttribute('count'));
                                    }
                                }
                            }
                        }
                        else {
                            floatArrays[listInputNodes[k].getAttribute('semantic')] = {}
                            floatArrays[listInputNodes[k].getAttribute('semantic')]['floatArray'] = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(listMeshNodesChildren[l].children[0]));
                            var offset = parseInt(listInputNodes[k].getAttribute('offset'));
                            floatArrays[listInputNodes[k].getAttribute('semantic')]['offset'] = offset;
                            floatArrays['INDICESP']['maxOffset'] = offset > floatArrays['INDICESP']['maxOffset'] ? offset : floatArrays['INDICESP']['maxOffset'];
                            var accessorNode = listMeshNodesChildren[l].getElementsByTagName('technique_common')[0].getElementsByTagName('accessor')[0];
                            floatArrays[listInputNodes[k].getAttribute('semantic')]['stride'] = parseInt(accessorNode.getAttribute('stride'));
                            floatArrays[listInputNodes[k].getAttribute('semantic')]['count'] = parseInt(accessorNode.getAttribute('count'));

                        }
                    }
                }
            }

            // On remet les tableaux dans l'ordre
            var end = floatArrays['INDICESP']['count'] * (floatArrays['INDICESP']['maxOffset'] + 1);
            for (var p = 0; p < end; p += floatArrays['INDICESP']['maxOffset'] + 1) {
                for (var name in floatArrays) {
                    if (name == 'INDICESP')
                        continue;
                    if (p == 0)
                        floatArrays[name]['newArray'] = new Array();
                    for (var stride = 0; stride < floatArrays[name]['stride']; stride++)
                        floatArrays[name]['newArray'].push(floatArrays[name]['floatArray'][floatArrays['INDICESP']['floatArray'][p + floatArrays[name]['offset']] * floatArrays[name]['stride'] + stride])
                }
            }

            // Creation des vbo
            var mesh = new Mesh('Amahani_mesh');
            mesh.addBuffer("aVertexPosition", this.webGL.ARRAY_BUFFER, floatArrays['POSITION']['newArray'], Math.floor(floatArrays['POSITION']['newArray'].length / floatArrays['POSITION']['stride']), this.webGL.FLOAT, floatArrays['POSITION']['stride']);
            mesh.addBuffer("aTextureCoord", this.webGL.ARRAY_BUFFER, floatArrays['TEXCOORD']['newArray'], Math.floor(floatArrays['TEXCOORD']['newArray'].length / floatArrays['TEXCOORD']['stride']), this.webGL.FLOAT, floatArrays['TEXCOORD']['stride']);
            mesh.setDrawingBuffer("aVertexPosition");
            mesh.calcBBox(floatArrays['POSITION']['newArray']);
        }
    }
    
    
    /*** 

    Contenu du Skeleton

    var Skeleton = {
    'JOINT1': {
    'matrix': Matrix(),
    'weights': Array(),
    },
    };
    
    ***/

    var Skeleton = {};

    var skinNode = ColladaLoader.getNode(this.xmlFile, '//c:library_controllers/c:controller/c:skin');
    var skinSourcesNodes = skinNode.getElementsByTagName('source');
    var jointsNode = skinNode.getElementsByTagName('joints')[0];
    var vertexWeights = skinNode.getElementsByTagName('vertex_weights')[0];

    var inputs = jointsNode.getElementsByTagName('input');
    var jointNameId = '';
    var matrixId = '';
    var weightId = '';

    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].getAttribute('semantic') == 'JOINT') {
            jointNameId = inputs[i].getAttribute('source');
            jointNameId = jointNameId.substr(1, jointNameId.length - 1);
        }
        else if (inputs[i].getAttribute('semantic') == 'INV_BIND_MATRIX') {
            matrixId = inputs[i].getAttribute('source');
            matrixId = matrixId.substr(1, matrixId.length - 1);
        }
    }

    inputs = vertexWeights.getElementsByTagName('input');

    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].getAttribute('semantic') == 'WEIGHT') {
            weightId = inputs[i].getAttribute('source');
            weightId = weightId.substr(1, weightId.length - 1);
        }
    }


    var vcount = ColladaLoader.parseIntListString(ColladaLoader.nodeText(vertexWeights.getElementsByTagName('vcount')[0]));
    var v = ColladaLoader.parseIntListString(ColladaLoader.nodeText(vertexWeights.getElementsByTagName('v')[0]));
    var jointNames = new Array();
    var matrix = new Array();
    var weight;

    for (var i = 0; i < skinSourcesNodes.length; i++) {
        switch (skinSourcesNodes[i].getAttribute('id')) {
            case jointNameId:
                var jointNamesString = ColladaLoader.nodeText(skinSourcesNodes[i].children[0]);
                jointNamesString = jointNamesString.replace(/^\n*\s+/g, "").replace(/\s+\n*$/g, "");
                jointNames = jointNamesString.split(/\s+/);
                break;
            case matrixId:
                var matrixTmp = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(skinSourcesNodes[i].children[0]));
                for (var j = 0; j < matrixTmp.length; j += 16) {
                    var matrixTmp2 = new Array();
                    matrixTmp2.push(matrixTmp[j]);
                    matrix.push(new Matrix(matrixTmp2));
                }
                break;
            case weightId:
                weight = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(skinSourcesNodes[i].children[0]));
                break;
        }
    }

    Skeleton['JOINTS'] = jointNames;
    Skeleton['MATRICES'] = matrix;
    Skeleton['WEIGHTS'] = weight;

    //return false;

    //    var meshId = meshNode.getAttribute("id"); A mettre ailleurs

    //delete explodeTmpBuffers
    /*for (var name in mesh) {
    delete mesh[name];
    }*/
    delete mesh;

    this.status = ColladaLoader.StatusEnum.COMPLETE;


    if (this.callback != undefined) {
        this.callback(mesh);
    }
};
