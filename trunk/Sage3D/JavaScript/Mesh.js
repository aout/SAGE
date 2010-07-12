if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Mesh.js");

Mesh = function () {
	//private attributes
	
	//public attributes
	this.buffers = new Array();
	this.drawingBuffer = null;
	this.BBox = {
		x: { min: -Infinity, max: Infinity },
		y: { min: -Infinity, max: Infinity },
		z: { min: -Infinity, max: Infinity },
	}
	
	//private methods
};

//public methods
Mesh.prototype.clone = function(mesh) {
	this.buffers = null;
	this.buffers = new Array();
	for each(var buffer in this.buffers) {
		this.buffers.push(buffer);
	}

	this.BBox.x.min = mesh.BBox.x.min;
	this.BBox.x.max = mesh.BBox.x.max;
	this.BBox.y.min = mesh.BBox.y.min;
	this.BBox.y.max = mesh.BBox.y.max;
	this.BBox.z.min = mesh.BBox.z.min;
	this.BBox.z.max = mesh.BBox.z.max;
};

Mesh.prototype.addBuffer = function(bufferName, bufferType, bufferData, numItems, itemType, itemSize) {
	var gl = Root.getInstance().getWebGL();
	var tmpBuffer;
	var glArray;
	
	switch (itemType) {
		case gl.FIXED:
		case gl.BYTE:
		case gl.UNSIGNED_BYTE:
		case gl.SHORT:
			//throw SageNotImplementedException
			return false;
			break;
		case gl.FLOAT:
			if (bufferType == gl.ELEMENT_ARRAY_BUFFER) {
				//throw SageBadArgsException;
				return false;
			}
			glArray = new WebGLFloatArray(bufferData);
			break;
		case gl.UNSIGNED_SHORT:
			glArray = new WebGLUnsignedShortArray(bufferData);
			break;
		default:
			//throw SageBadArgsException();
			return false;
			break;
	}
	
	tmpBuffer = gl.createBuffer();
	gl.bindBuffer(bufferType, tmpBuffer);
    gl.bufferData(bufferType, glArray, gl.STATIC_DRAW);
	tmpBuffer.bufferName = bufferName;
	tmpBuffer.bufferType = bufferType;
	tmpBuffer.itemType = itemType;
	tmpBuffer.itemSize = itemSize;
    tmpBuffer.numItems = numItems;
	
	this.buffers.push(tmpBuffer);
	 return true;
};

Mesh.prototype.setDrawingBuffer = function(bufferName) {
	for each (var buffer in this.buffers) {
		if (buffer.bufferName === bufferName) {
			this.drawingBuffer = buffer;
			return true;
		}
	}
	return false;
};

Mesh.prototype.calcBBox = function(vertices) {
	var nPoints = Math.floor(vertices.length / 3);
	for (var i = 0; i < nPoints; ++i) {
		var x = vertices[i * 3    ];
		var y = vertices[i * 3 + 1];
		var z = vertices[i * 3 + 2];
		
		if (i == 0) {
			this.BBox.x.min = x;
			this.BBox.x.max = x;
			this.BBox.y.min = y;
			this.BBox.y.max = y;
			this.BBox.z.min = z;
			this.BBox.z.max = z;
		}
		else {
			this.BBox.x.min = Math.min(this.BBox.x.min, x);
			this.BBox.x.max = Math.max(this.BBox.x.max, x);
			this.BBox.y.min = Math.min(this.BBox.y.min, y);
			this.BBox.y.max = Math.max(this.BBox.y.max, y);
			this.BBox.z.min = Math.min(this.BBox.z.min, z);
			this.BBox.z.max = Math.max(this.BBox.z.max, z);
		}
	}
};

Mesh.prototype.draw = function(shaderProgram) {
	if (this.drawingBuffer != null) {
		var gl = Root.getInstance().getWebGL();
		if (shaderProgram == undefined)
			shaderProgram = Root.getInstance().getDefaultProgram();
		shaderProgram.use();
		shaderProgram.setAttributes(this.buffers);
		gl.bindBuffer(this.drawingBuffer.bufferType, this.drawingBuffer);
		if (this.drawingBuffer.bufferType == gl.ELEMENT_ARRAY_BUFFER) {
			gl.drawElements(gl.TRIANGLES, this.drawingBuffer.numItems, this.drawingBuffer.itemType, 0);
		}
		else if (this.drawingBuffer.bufferType == gl.ARRAY_BUFFER) {
			gl.drawArrays(gl.TRIANGLES, 0, this.drawingBuffer.numItems);
		}
	}
};

//Primitives namespace
Primitives = {};

Primitives.cube = function() {

	var gl = Root.getInstance().getWebGL();
	if (gl == null)
		return null;

    var vertices = [
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,

      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0,
    ];

	var texCoord = [
	  // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      // Back face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Top face
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,

      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,

      // Right face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0
    ];

	var indices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
    ]

	var mesh = new Mesh();
	
	mesh.calcBBox(vertices);
	mesh.addBuffer("aVertexPosition", gl.ARRAY_BUFFER, vertices, 24, gl.FLOAT, 3);
	mesh.addBuffer("aTextureCoord", gl.ARRAY_BUFFER, texCoord, 24, gl.FLOAT, 2);
	mesh.addBuffer("indices", gl.ELEMENT_ARRAY_BUFFER, indices, 36, gl.UNSIGNED_SHORT, 1);
	mesh.setDrawingBuffer("indices");
	
	return mesh;
};

Primitives.sphere = function() {
	
};
