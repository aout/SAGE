var gIncludedFiles = new Array();
gIncludedFiles.push("sage3d.js");

Array.prototype.inArray = function (value) {
	for (var i = 0; i < this.length; ++i)
		if (this[i] === value)
			return true;
	return false;
};

function include(fileName) {
	if (!gIncludedFiles.inArray(fileName))
	document.write("<script src=\"JavaScript/" + fileName + "\" type=\"text/javascript\"></script>");
}

include("Root.js");

var g_cube;

function main() {
	var root = Root.getInstance();
	
	if (!root.init("viewport"))
		alert("init failure");
	else
		alert("init success");

	g_cube = Primitives.cube();
	draw();
	
	
}

function draw() {
	var root = Root.getInstance();
	var gl = root.getWebGL();
	var program = root.getDefaultProgram();
	var cube = g_cube;
	
	gl.viewport(0, 0, 800, 600);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
	var uniforms = [
		{name: "uMVMatrix",
		 type: "Matrix4fv",
		 value: root.getModelViewMatrix()},
		{name: "uPMatrix",
		 type: "Matrix4fv",
		 value: root.getProjectionMatrix()}
	];
	
	var attibutes = [
		{name: "aVertexPosition",
		 type: "3f",
		 buffer: g_cube.vPosition},
		{name: "aVertexColor",
		 type: "4f",
		 buffer: g_cube.vColors},
	];
		
	program.setUniforms(uniforms);
	program.setAttributes(attibutes);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g_cube.vPosition);
	gl.drawArrays(gl.TRIANGLES, 0, g_cube.vPosition.numItems);

//    gl.drawElements(gl.TRIANGLES, g_cube.indices.numItems, gl.UNSIGNED_SHORT, 0);
}

/*
function main() {
	var root = new Root();
	
	if (root.init("viewport", {R: 0, G: 0, B: 0, A: 1}, 1)) {
		var collada = new ColladaLoader();
		collada.load(root.webGL, "resources/Amahani.dae");
		root.renderLoop = function () {
			if (root.defaultProgram.status == StatusEnum.SHADER_USING && collada.status == ColladaLoader.StatusEnum.COMPLETE) {
		
				var bbox = collada.mesh.bbox;
				
				var midx = (bbox.min.x + bbox.max.x) / 2;
				var midy = (bbox.min.y + bbox.max.y) / 2;
				var midz = (bbox.min.z + bbox.max.z) / 2;
				
				var maxdim = bbox.max.x - bbox.min.x;
				maxdim = Math.max(maxdim, bbox.max.y - bbox.min.y);
				maxdim = Math.max(maxdim, bbox.max.z - bbox.min.z);
				
				root.lookAt({ex: midx,	ey: midz,	ez: midy-(maxdim*1.5),
						  cx: midx,	cy: midz,	cz: midy,
						  ux: 0, 	uy: 1, 		uz: 0});
				
				root.rotate(90,[1,0,0]);
				root.scale([1,1,-1]);
			
				root.defaultProgram.setAttributes(new Array({name: "aVertex", type: "3f", buffer: collada.mesh.position},
														 {name: "aTexCoord0", type: "2f", buffer: collada.mesh.texcoord}));
		
				root.defaultProgram.setUniforms(new Array({name: "uMVMatrix", type: "Matrix4fv", value: root.modelViewMatrix},
													   {name: "uPMatrix", type: "Matrix4fv", value: root.projectionMatrix}));
				
				root.webGL.bindTexture(root.webGL.TEXTURE_2D, collada.texture);
				root.webGL.bindBuffer(root.webGL.ELEMENT_ARRAY_BUFFER, collada.mesh.indices);
				root.webGL.drawElements(root.webGL.TRIANGLES, collada.mesh.numIndices, root.webGL.UNSIGNED_SHORT, 0);
			}
		};
		root.go(10);
	}
}*/