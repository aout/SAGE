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
var g_translate;
var g_texture;

function main() {
	var root = Root.getInstance();
	
	root.init("viewport", {R: 0.0, G: 0.0, B: 0.0, A: 1.0});
	
	g_translate = Matrix.Translation($V([0.0, 0.0, -8.0])).ensure4x4();
	g_cube = Primitives.cube();
	
	
	g_texture = root.getWebGL().createTexture();
    g_texture.image = new Image();
    g_texture.image.onload = onReady;
    g_texture.image.src = "Resources/Textures/nehe.gif";
}

function onReady() {
	
	var gl = Root.getInstance().getWebGL();
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, g_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, g_texture.image, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	
	setInterval(draw, 12);
}

var lastTime = 0;
var rCube = 0;
function draw() {
	var root = Root.getInstance();
	var gl = root.getWebGL();
	var program = root.getDefaultProgram();
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var timeNow = new Date().getTime();
    if (lastTime != 0) {
      var elapsed = timeNow - lastTime;
      rCube -= (75 * elapsed) / 1000.0;
    }
    lastTime = timeNow;

	var modelView = Matrix.I(4);
	modelView = modelView.x(g_translate);
	var arad = rCube * Math.PI / 180.0;
	modelView = modelView.x(Matrix.Rotation(arad, $V([1.0, 1.0, 1.0])).ensure4x4());
	
	var uniforms = [
		{name: "uMVMatrix",
		 type: "Matrix4fv",
		 value: modelView},
		{name: "uPMatrix",
		 type: "Matrix4fv",
		 value: root.getProjectionMatrix()},
 		{name: "uSampler",
		 type: "1i",
		 value: 0}

	];
	
	var attibutes = [
		{name: "aVertexPosition",
		 type: "3f",
		 buffer: g_cube.aVertexPosition},
		 {name: "aTextureCoord",
		 type: "2f",
		 buffer: g_cube.aTextureCoord}];
		
	program.setUniforms(uniforms);
	program.setAttributes(attibutes);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g_cube.indices);
	gl.drawElements(gl.TRIANGLES, g_cube.indices.numItems, gl.UNSIGNED_SHORT, 0);
}


/*function main() {
	var root = new Root.getInstance();
	
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