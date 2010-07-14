if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Mesh.js");

/**
 * Mesh Class
 * @param {String} name Name
 */
Mesh = function (name) {
	this.webGL = Root.getInstance().getWebGL();
	this.name = name;
	this.buffers = new Array();
	this.drawingBuffer = null;
	this.BBox = {
		x: { min: -Infinity, max: Infinity },
		y: { min: -Infinity, max: Infinity },
		z: { min: -Infinity, max: Infinity },
	}
};

/**
 * Mesh Destructor
 */
Mesh.prototype.destroy = function() {
	for (var i = 0; i < this.buffers.length; ++i) {
		delete this.buffers[i];
	}
	delete this.buffers;
};

/**
 * Clone
 * @param {Mesh} mesh Mesh Object
 */
Mesh.prototype.clone = function(mesh) {
	delete this.buffers;
	this.buffers = new Array();
	for (var i = 0; i < mesh.buffers.length; ++i) {
		this.buffers.push(buffers[i]);
	}
	this.BBox = mesh.BBox;
};

/**
 * Add a buffer to the mesh
 * @param {String} bufferName Name of the new buffer
 * @param {Int} bufferType Buffer type: gl.ELEMENT_ARRAY_BUFFER | gl.ARRAY_BUFFER
 * @param {Array} bufferData Data array
 * @param {Int} numItems Number of Vertex
 * @param {Int} itemType Item type: gl.FIXED | gl.BYTE | gl.UNSIGNED_BYTE | gl.SHORT | gl.FLOAT | gl.UNSIGNED_SHORT
 * @param {Int} itemSize Number of elements per Vertex
 */
Mesh.prototype.addBuffer = function(bufferName, bufferType, bufferData, numItems, itemType, itemSize) {
	var tmpBuffer;
	var glArray;
	
	//Check data format and instanciates Buffer
	switch (itemType) {
		case this.webGL.FIXED:
		case this.webGL.BYTE:
		case this.webGL.UNSIGNED_BYTE:
		case this.webGL.SHORT:
			//throw SageNotImplementedException
			return false;
			break;
		case this.webGL.FLOAT:
			if (bufferType == this.webGL.ELEMENT_ARRAY_BUFFER) {
				//throw SageBadArgsException;
				return false;
			}
			glArray = new WebGLFloatArray(bufferData);
			break;
		case this.webGL.UNSIGNED_SHORT:
			glArray = new WebGLUnsignedShortArray(bufferData);
			break;
		default:
			//throw SageBadArgsException();
			return false;
			break;
	}
	
	//Create VBO
	tmpBuffer = this.webGL.createBuffer();
	this.webGL.bindBuffer(bufferType, tmpBuffer);
    this.webGL.bufferData(bufferType, glArray, this.webGL.STATIC_DRAW);
	tmpBuffer.bufferName = bufferName;
	tmpBuffer.bufferType = bufferType;
	tmpBuffer.itemType = itemType;
	tmpBuffer.itemSize = itemSize;
    tmpBuffer.numItems = numItems;
	
	//Add to mesh buffer array
	this.buffers.push(tmpBuffer);
	return true;
};

/**
 * Set the drawing buffer
 * @param {String} bufferName Buffer name
 */
Mesh.prototype.setDrawingBuffer = function(bufferName) {
	for each (var buffer in this.buffers) {
		if (buffer.bufferName === bufferName) {
			this.drawingBuffer = buffer;
			return true;
		}
	}
	return false;
};

/**
 * Calculate the Bounding Box
 * @param {Array} vertices
 */
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

/**
 * Draw the mesh
 * @param {Program} shaderProgram
 */
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


