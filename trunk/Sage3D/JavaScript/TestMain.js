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
include ("ResourceManager.js");
include ("Primitives.js")

function itWorks()
{
	var root = Root.getInstance();
	var mesh = ResourceManager.getInstance().getMeshByName("cube");
	var texture = ResourceManager.getInstance().getTextureByName("cubetexture");
	var rootTransform = Transform.getTransform("root");
	
	var cubeTransform = rootTransform.addChild("cube");
	cubeTransform.translate([0,0,-4]);
	var cube = new Entity("cube", mesh, [texture]);
	cubeTransform.addEntity(cube);
	setInterval(draw, 12);
}
var lastTime = new Date().getTime();
function draw()
{
	var timeNow = new Date().getTime();
    if (lastTime != 0) {
      var elapsed = timeNow - lastTime;
    }
    lastTime = timeNow;
	var gl = Root.getInstance().getWebGL();
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	Transform.getTransform("cube").rotate((75 * elapsed) / 1000.0, [0.0, 1.0, 0.0]);
	
	var root = Root.getInstance();
	root.getCamera().update();
	var rootTransform = Transform.getTransform("root");
	rootTransform.render();
		
}

function main() {
	var root = Root.getInstance();
	
	root.init("viewport", {R: 0.1, G: 0.1, B: 0.1, A: 1.0});
	
	var rm = ResourceManager.getInstance();
	rm.prepareMesh("cube", "cube");
	rm.prepareTexture("cubetexture", "Resources/Textures/nehe.gif");
	rm.doLoad(itWorks);
}
