if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Mesh.js");

Mesh = function () {
	//private attributes
	
	//public attributes
	this.vPosition = null;
	this.vColor = null;
	this.indices = null;
	
	this.BBox = {
		x: { min: -Infinity, max: Infinity },
		y: { min: -Infinity, max: Infinity },
		z: { min: -Infinity, max: Infinity },
	}
	
	//private methods
}

//public methods
Mesh.prototype.clone = function(mesh) {
	
}

Mesh.prototype.render = function() {
	
}

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

	var colors = [
	  // Front face
      1.0, 0.0, 0.0, 1.0,
	  1.0, 0.0, 0.0, 1.0,
	  1.0, 0.0, 0.0, 1.0,
	  1.0, 0.0, 0.0, 1.0,
	  
	  // Back face     
      1.0, 1.0, 0.0, 1.0,
	  1.0, 1.0, 0.0, 1.0,
	  1.0, 1.0, 0.0, 1.0,
	  1.0, 1.0, 0.0, 1.0,
	  
	  // Top face
      0.0, 1.0, 0.0, 1.0,
	  0.0, 1.0, 0.0, 1.0,
	  0.0, 1.0, 0.0, 1.0,
	  0.0, 1.0, 0.0, 1.0,
	  
	  // Bottom face
      1.0, 0.5, 0.5, 1.0,
	  1.0, 0.5, 0.5, 1.0,
	  1.0, 0.5, 0.5, 1.0,
	  1.0, 0.5, 0.5, 1.0,
	  
	  // Right face
      1.0, 0.0, 1.0, 1.0,
	  1.0, 0.0, 1.0, 1.0,
	  1.0, 0.0, 1.0, 1.0,
	  1.0, 0.0, 1.0, 1.0,
	  
	  // Left face
      0.0, 0.0, 1.0, 1.0,
	  0.0, 0.0, 1.0, 1.0,
	  0.0, 0.0, 1.0, 1.0,
	  0.0, 0.0, 1.0, 1.0,     
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

	mesh.vPosition = gl.createBuffer();	
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vPosition);
    gl.bufferData(gl.ARRAY_BUFFER, new WebGLFloatArray(vertices), gl.STATIC_DRAW);
    mesh.vPosition.itemSize = 3;
    mesh.vPosition.numItems = 24;
	
	mesh.vColor = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vColor);
	gl.bufferData(gl.ARRAY_BUFFER, new WebGLFloatArray(colors), gl.STATIC_DRAW);
    mesh.vColor.itemSize = 4;
    mesh.vColor.numItems = 24;
	
	mesh.indices = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indices);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new WebGLUnsignedShortArray(indices), gl.STATIC_DRAW);
    mesh.indices.itemSize = 1;
    mesh.indices.numItems = 36;
	
	return mesh;
}

Primitives.sphere = function() {
	
}
