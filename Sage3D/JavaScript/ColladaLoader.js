if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("ColladaLoader.js");

function flipImage(img) {
	var tmpcanvas = document.createElement("canvas");
	tmpcanvas.width = img.width;
	tmpcanvas.height = img.height;
	var cx = tmpcanvas.getContext("2d");
	cx.globalCompositeMode = "copy";
	cx.translate(0, img.height);
	cx.scale(1, -1);
	cx.drawImage(img, 0, 0);
	return tmpcanvas;
}

function nodeText(n) {
  var s = "";
  for (c = n.firstChild;
       c;
       c = c.nextSibling)
  {
    if (c.nodeType != 3)
      break;
    s += c.textContent;
  }

  return s;
}

function parseFloatListString (s) {
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
}

function parseIntListString (s) {
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
}

function xpathGetElementById(xmldoc, id) {
  return xmldoc.evaluate("//*[@id=\"" + id + "\"]", xmldoc, null,
                         XPathResult.FIRST_ORDERED_NODE_TYPE,
                         null).singleNodeValue;
}


ColladaLoader = function() {
	this.webGL = null;
	
	this.mesh = {
		position: null,
		normal: null,
		texcoord: null,
		indices: null,
		numIndices: null,
		bbox : null
	};
	
	this.image = null;
	this.texture = null;
	this.error = "no error";
	
	this.isYup = true;
	
	this.status = ColladaLoader.StatusEnum.NONE;
	
	this.xmlFile = null;
	this.parseInterval = null;
	this.createTextureInterval = null;
}

ColladaLoader.StatusEnum = {
	NONE			: 0,
	XML_LOADING		: 1,
	XML_LOADED		: 2,
	IMAGE_LOADING	: 4,
	IMAGE_LOADED	: 8,
	COMPLETE		: 16,
	ERROR			: 32
}

ColladaLoader.prototype.load = function(webGL, src) {
	this.webGL = webGL;
	this.status = ColladaLoader.StatusEnum.XML_LOADING;
	
    var xhr = new XMLHttpRequest();
    var self = this;

    xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
          self.xmlFile = xhr.responseXML;
		  self.status = ColladaLoader.StatusEnum.XML_LOADED;
		}
    };

    xhr.open("GET", src, true);
    xhr.overrideMimeType("text/xml");
    xhr.setRequestHeader("Content-Type", "text/xml");
    xhr.send(null);
	
	this.parseWhenLoaded();
}

ColladaLoader.prototype.parseWhenLoaded = function() {
	var self = this;
	this.parseInterval = window.setInterval(function() {
		if (self.status == ColladaLoader.StatusEnum.XML_LOADED) {
			self.parse();
			window.clearInterval(self.parseInterval);
		} else if (self.status == ColladaLoader.StatusEnum.ERROR) {
			window.clearInterval(self.parseInterval);
		}
	}, 100);
}

ColladaLoader.prototype.nsResolver = function(prefix) {
      var ns = {
        'c' : 'http://www.collada.org/2005/11/COLLADASchema'
      };
      return ns[prefix] || null;
}

ColladaLoader.prototype.getNode = function(xml, xpathexpr, ctxNode) {
	if (ctxNode == null)
		ctxNode = xml;
	return xml.evaluate(xpathexpr, ctxNode, this.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

ColladaLoader.prototype.parse = function() {
    var upAxisNode = this.getNode(this.xmlFile, '//c:asset/c:up_axis');
    if (upAxisNode) {
      var val = nodeText(upAxisNode);
      if (val.indexOf("Z_UP") != 1)
        this.isYup = false;
    }

    var meshNode = this.getNode(this.xmlFile, '//c:library_geometries/c:geometry[@id="mesh"]/c:mesh');
	if (!meshNode) {
		this.status = ColladaLoader.StatusEnum.ERROR;
		this.error = "Couldn't find mesh node";
		return false;
	}

    var farrays = ['position', 'normal', 'texcoord'];
    for (var i = 0; i < farrays.length; ++i) {
		var fname = farrays[i];
		
		var fnode = this.getNode(this.xmlFile, '//c:source[@id="' + fname + '"]/c:float_array', meshNode);
		if (!fnode) {
			this.status = ColladaLoader.StatusEnum.ERROR;
			this.error = "Missing " + fname + " float_array in mesh node";
			return false;
		}
		
		var count = parseInt(fnode.getAttribute('count'));
		var data = parseFloatListString(nodeText(fnode));
		
		if (data.length < count) {
			this.status = ColladaLoader.StatusEnum.ERROR;
			this.error = "Attribute " + fname + " expected " + count + " elements but parse only gave " + data.length;
			return false;
		}
		
		if (fname == "position") {
			var minx = Infinity, miny = Infinity, minz = Infinity;
			var maxx = -Infinity, maxy = -Infinity, maxz = -Infinity;
			var npoints = Math.floor(data.length / 3);
			for (var i = 0; i < npoints; ++i) {
				var x = data[i*3  ];
				var y = data[i*3+1];
				var z = data[i*3+2];
				
				minx = Math.min(minx, x);
				miny = Math.min(miny, y);
				minz = Math.min(minz, z);
				
				maxx = Math.max(maxx, x);
				maxy = Math.max(maxy, y);
				maxz = Math.max(maxz, z);
			}
			
			this.mesh.bbox = {
				min: { x: minx, y: miny, z: minz },
				max: { x: maxx, y: maxy, z: maxz }
			};
		}
		
		this.mesh[fname] = this.webGL.createBuffer();
		this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, this.mesh[fname]);
		this.webGL.bufferData(this.webGL.ARRAY_BUFFER, new WebGLFloatArray(data), this.webGL.STATIC_DRAW);
    }

    var inode = this.getNode(this.xmlFile, '//c:triangles/c:p', meshNode);
    if (!inode) {
		this.status = ColladaLoader.StatusEnum.ERROR;
		this.error = "Missing triangles/p in mesh node";
		return false;
    }
	data = parseIntListString(nodeText(inode));
	this.mesh["indices"] = this.webGL.createBuffer();
	this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, this.mesh["indices"]);
	this.webGL.bufferData(this.webGL.ELEMENT_ARRAY_BUFFER, new WebGLUnsignedShortArray(data), this.webGL.STREAM_DRAW);
	this.mesh.numIndices = data.length;

	this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, null);

	var texNode = this.getNode(this.xmlFile, '//c:library_images/c:image[@name="diffuse"]/c:init_from');
	if (!texNode) {
		this.status = ColladaLoader.StatusEnum.ERROR;
		this.error = "Couldn't find texture node";
		return false;
	}

	var self = this;
	this.status = ColladaLoader.StatusEnum.IMAGE_LOADING;
	this.image = new Image();
	this.image.onload = function () {
		self.status = ColladaLoader.StatusEnum.IMAGE_LOADED;
	}

	var name = nodeText(texNode);
	if (name.substr(-4).toLowerCase() == ".tga")
		name = name.substr(0, name.length-3) + "png";
	var uri = this.xmlFile.baseURI.toString();
	uri = uri.substr(0, uri.lastIndexOf("/")) + "/" + name;
	this.image.src = uri;

	this.createTextureWhenImageLoaded();

    return true;
}

ColladaLoader.prototype.createTextureWhenImageLoaded = function() {
	var self = this;
	this.createTextureInterval = window.setInterval(function() {
		if (self.status == ColladaLoader.StatusEnum.IMAGE_LOADED) {
			self.createTexture();
			window.clearInterval(self.createTextureInterval);
		} else if (self.status == ColladaLoader.StatusEnum.ERROR) {
			window.clearInterval(self.createTextureInterval);
		}
	}, 100);
}

ColladaLoader.prototype.createTexture = function() {
	
	this.texture = this.webGL.createTexture();
	this.webGL.bindTexture(this.webGL.TEXTURE_2D, this.texture);
	this.webGL.texImage2D(this.webGL.TEXTURE_2D, 0, flipImage(this.image));
	this.webGL.generateMipmap(this.webGL.TEXTURE_2D);
	this.webGL.bindTexture(this.webGL.TEXTURE_2D, null);
	
	this.status = ColladaLoader.StatusEnum.COMPLETE;
	return true;
}
