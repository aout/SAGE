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
    /*var text = {
    type: "Texture",
    owner: this.task,
    name: this.task.name + '_texture',
    progress: 0.0
    };
    ResourceManager.getInstance().taskList.push(text);
    this.task.children.push(text); // A retravailler avec le resourceManager.js*/

    this.status = ColladaLoader.StatusEnum.XML_PARSING;

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

    //return false;

    //    var meshId = meshNode.getAttribute("id"); A mettre ailleurs

    //delete explodeTmpBuffers
    /*for (var name in floatArrays) {
    delete floatArrays[name];
    }*/
    delete floatArrays;

    this.status = ColladaLoader.StatusEnum.COMPLETE;


    if (this.callback != undefined) {
        this.callback(mesh);
    }
};
