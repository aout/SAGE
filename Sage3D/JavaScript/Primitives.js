if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Primitives.js");

/**
 * Primitives namespace
 */
Primitives = {};

/**
 * make a cube
 */
Primitives.cube = function(name, callback) {

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

	var mesh = new Mesh(name);
	
	mesh.calcBBox(vertices);
	mesh.addBuffer("aVertexPosition", gl.ARRAY_BUFFER, vertices, 24, gl.FLOAT, 3);
	mesh.addBuffer("aTextureCoord", gl.ARRAY_BUFFER, texCoord, 24, gl.FLOAT, 2);
	mesh.addBuffer("indices", gl.ELEMENT_ARRAY_BUFFER, indices, 36, gl.UNSIGNED_SHORT, 1);
	mesh.setDrawingBuffer("indices");
	
	callback(mesh);
};

/**
 * Sphere
 */
Primitives.sphere = function(name, radius, lats, longs, callback) {
    var vertices = [ ];
    var texCoord = [ ];
    var indices = [ ];
    
    for (var latNumber = 0; latNumber <= lats; ++latNumber) {
        for (var longNumber = 0; longNumber <= longs; ++longNumber) {
            var theta = latNumber * Math.PI / lats;
            var phi = longNumber * 2 * Math.PI / longs;

            var sinTheta = Math.sin(theta);
            var sinPhi = Math.sin(phi);
            var cosTheta = Math.cos(theta);
            var cosPhi = Math.cos(phi);
            
            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longs);
            var v = latNumber / lats;
            
            texCoord.push(u);
            texCoord.push(v);
            vertices.push(radius * x);
            vertices.push(radius * y);
            vertices.push(radius * z);
        }
    }
    
    for (var latNumber = 0; latNumber < lats; ++latNumber) {
        for (var longNumber = 0; longNumber < longs; ++longNumber) {
            var first = (latNumber * (longs + 1)) + longNumber;
            var second = first + longs + 1;
            indices.push(first);
            indices.push(second);
            indices.push(first + 1);

            indices.push(second);
            indices.push(second + 1);
            indices.push(first + 1);
        }
    }

    var mesh = new Mesh(name);
    
    mesh.calcBBox(vertices);
    mesh.addBuffer("aVertexPosition", gl.ARRAY_BUFFER, vertices, Math.floor(vertices.length / 3), gl.FLOAT, 3);
    mesh.addBuffer("aTextureCoord", gl.ARRAY_BUFFER, texCoord, Math.floor(texCoord.length / 2), gl.FLOAT, 2);
    mesh.addBuffer("indices", gl.ELEMENT_ARRAY_BUFFER, indices, indices.length, gl.UNSIGNED_SHORT, 1);
    mesh.setDrawingBuffer("indices");
  
    callback(mesh);
};