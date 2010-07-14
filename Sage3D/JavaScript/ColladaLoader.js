if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("ColladaLoader.js");

/**
 * ColladaLoader Class
 */
ColladaLoader = function() {
	this.webGL	= Root.getInstance().getWebGL();
	this.xhr	= new XMLHttpRequest();
	
	this.entity	= undefined;
	
	this.status = ColladaLoader.StatusEnum.NONE;
	this.error = "no error";
	
	this.xmlFile = undefined;
	this.callback = undefined;
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

ColladaLoader.textureLoaded = function(texture) {
	if (texture != undefined && texture.status != Texture.StatusEnum.TEXTURE_ERROR) {
		ColladaLoader.getInstance().entity.addTexture(texture);
	}
};

ColladaLoader.prototype.load = function(url, callback) {
	this.status = ColladaLoader.StatusEnum.XML_LOADING;
	this.callback = callback;
    var self = this;
	this.entity = new Entity();

    this.xhr.onreadystatechange = function () {
		if (self.xhr.readyState == 4 && (self.xhr.status == 200 || self.xhr.status == 0)) {
          self.xmlFile = self.xhr.responseXML;
		  self.parse();
		}
    };

    this.xhr.open("GET", url, true);
    this.xhr.overrideMimeType("text/xml");
    this.xhr.setRequestHeader("Content-Type", "text/xml");
    try { this.xhr.send(null); }
	catch(e) { alert(e.Message); }
	return this.entity;
};

ColladaLoader.prototype.parse = function() {
    this.status = ColladaLoader.StatusEnum.XML_PARSING;
	
	var textureNode = ColladaLoader.getNode(this.xmlFile, '//c:library_images/c:image[@name="diffuse"]/c:init_from');
	if (!textureNode) {
		this.status = ColladaLoader.StatusEnum.ERROR;
		this.error = "Couldn't find texture node";
		return false;
	}
	var texture = new Texture();
	texture.load(0, ColladaLoader.nodeText(textureNode), ColladaLoader.textureLoaded);

	var zUp = false;
	var axisNode = ColladaLoader.getNode(this.xmlFile, '//c:asset/c:up_axis');
	if (axisNode) {
		zUp = ColladaLoader.nodeText(axisNode) == "Z_UP" ? true : false;
	}

    var meshNode = ColladaLoader.getNode(this.xmlFile, '//c:library_geometries/c:geometry[@id="mesh"]/c:mesh');
	if (!meshNode) {
		this.status = ColladaLoader.StatusEnum.ERROR;
		this.error = "Couldn't find mesh node";
		return false;
	}

    var arrayNames = ['position', 'normal', 'texcoord'];
	var tmpBuffers = 
	{
		position: undefined,
		normal: undefined,
		texcoord: undefined
	};
    for (var i = 0; i < arrayNames.length; ++i) {
		var arrayName = arrayNames[i];
		
		var arrayNode = ColladaLoader.getNode(this.xmlFile, '//c:source[@id="' + arrayName + '"]/c:float_array', meshNode);
		if (!arrayNode) {
			this.status = ColladaLoader.StatusEnum.ERROR;
			this.error = "Missing " + arrayName + " float_array in mesh node";
			return false;
		}
		
		var count = parseInt(arrayNode.getAttribute('count'));
		tmpBuffers[arrayName] = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(arrayNode));
		
		/*if (tmpBuffers[arrayName].length != count) {
			this.status = ColladaLoader.StatusEnum.ERROR;
			this.error = "Attribute " + arrayName + " expected " + count + " elements but parse gave " + tmpBuffers[arrayName].length;
			return false;
		}*/
    }

    var trianglesNode = ColladaLoader.getNode(this.xmlFile, '//c:triangles', meshNode);
    if (!trianglesNode) {
		this.status = ColladaLoader.StatusEnum.ERROR;
		this.error = "Missing triangles in mesh node";
		return false;
    }
	var count = parseInt(trianglesNode.getAttribute('count'));
	
	var pNode = ColladaLoader.getNode(this.xmlFile, '//c:p', trianglesNode);
	if (!pNode) {
		this.status = ColladaLoader.StatusEnum.ERROR;
		this.error = "Missing triangles/p in mesh node";
		return false;		
	}
	var pArray = ColladaLoader.parseIntListString(ColladaLoader.nodeText(pNode));

	/*if (pArray.length != count) {
		this.status = ColladaLoader.StatusEnum.ERROR;
		this.error = "Expected " + count + " elements but parse gave " + pArray.length;
		return false;
	}*/
	
	var explodeTmpBuffers = 
	{
		position: undefined,
		normal: undefined,
		texcoord: undefined
	};
	explodeTmpBuffers.position = new Array();
	explodeTmpBuffers.normal = new Array();
	explodeTmpBuffers.texcoord = new Array();

	var nPoints = Math.floor(pArray.length / 3);
	for (var i = 0; i < nPoints; ++i) {
		var positionIndex	= pArray[i * 3	  ] * 3;
		var normalIndex 	= pArray[i * 3 + 1] * 3;
		var texcoordIndex 	= pArray[i * 3 + 2] * 2;
		
		explodeTmpBuffers.position.push(tmpBuffers.position[positionIndex]);
		if (zUp == false) {
			explodeTmpBuffers.position.push(tmpBuffers.position[positionIndex + 1]);
			explodeTmpBuffers.position.push(tmpBuffers.position[positionIndex + 2]);
		}
		else {
			explodeTmpBuffers.position.push(tmpBuffers.position[positionIndex + 2]);
			explodeTmpBuffers.position.push(tmpBuffers.position[positionIndex + 1]);			
		}
		
		explodeTmpBuffers.normal.push(tmpBuffers.normal[normalIndex]);
		if (zUp == false) {
			explodeTmpBuffers.normal.push(tmpBuffers.normal[normalIndex + 1]);
			explodeTmpBuffers.normal.push(tmpBuffers.normal[normalIndex + 2]);
		}
		else {
			explodeTmpBuffers.normal.push(tmpBuffers.normal[normalIndex + 2]);
			explodeTmpBuffers.normal.push(tmpBuffers.normal[normalIndex + 1]);			
		}
		
		explodeTmpBuffers.texcoord.push(tmpBuffers.texcoord[texcoordIndex    ]);
		explodeTmpBuffers.texcoord.push(tmpBuffers.texcoord[texcoordIndex + 1]);
	}

	//delete tmpBuffers
	tmpBuffers.position = null;
	tmpBuffers.normal = null;
	tmpBuffers.texcoord = null;
	tmpBuffers = null;

	var mesh = new Mesh();
	mesh.addBuffer("aVertexPosition", this.webGL.ARRAY_BUFFER, explodeTmpBuffers.position, Math.floor(explodeTmpBuffers.position.length / 3), this.webGL.FLOAT, 3);
//	mesh.addBuffer("aNormal", gl.ARRAY_BUFFER, explodeTmpBuffers.normal, Math.floor(explodeTmpBuffers.normal.length / 3), gl.FLOAT, 3);
	mesh.addBuffer("aTextureCoord", this.webGL.ARRAY_BUFFER, explodeTmpBuffers.texcoord, Math.floor(explodeTmpBuffers.texcoord.length / 2), this.webGL.FLOAT, 2);
	mesh.setDrawingBuffer("aVertexPosition");
	mesh.calcBBox(explodeTmpBuffers.position);
	this.entity.setMesh(mesh);
	
	//delete explodeTmpBuffers
	explodeTmpBuffers.position = null;
	explodeTmpBuffers.normal = null;
	explodeTmpBuffers.texcoord = null;
	explodeTmpBuffers = null;

	this.status = ColladaLoader.StatusEnum.COMPLETE;

	if (this.callback != undefined) {
		this.callback(this.entity);
	}
};
