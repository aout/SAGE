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
include("ColladaLoader.js");

function main() {
	var root = Root.getInstance();
	
	root.init("viewport", {R: 0.0, G: 0.0, B: 0.0, A: 1.0});
	loadEntity();
	
	ResourceManager.getInstance().loadMesh("cube-mesh", "cube");
	ResourceManager.getInstance().loadTexture("cube-texture", "Resources/Textures/NeHe.gif");
	ResourceManager.getInstance().doLoad(initScene);
}

function loadEntity() {
	var Cloader = ColladaLoader.getInstance();
	Cloader.load("Resources/Meshs/Amahani.dae", initScene);
}

function initScene(entity) {
	var rootTransform = Transform.getTransform("root");
	
	var amahaniEntityTransform = rootTransform.addChild("amahani");
	var freeCamTransform = rootTransform.addChild("freeCam");
	var amahaniCameraTransform = amahaniEntityTransform.addChild("amahani-camera");
	
	//add the entity
	amahaniEntityTransform.content.push(entity);

	//and set amahani position
	var bbox = entity.mesh.BBox;
	var x = 0.0;
	var y = -((bbox.y.max - bbox.y.min) / 2.0);
	var z = -8.0;
	amahaniEntityTransform.translate([x, y, z]);
	amahaniEntityTransform.rotate(180.0, [0.0, 1.0, 0.0]);

	//set camera position
	//becareful amahaniCameraTransform is a child of amahaniEntityTransform
	amahaniCameraTransform.translate([0.0, 3.0, 4.0]);
	amahaniCameraTransform.rotate(-20.0, [1.0, 0.0, 0.0]);
	var camera = Root.getInstance().getCamera(); 
	camera.attach(amahaniCameraTransform);
	
	setInterval(draw, 12);	
}

var lastTime = new Date().getTime();
function draw() {
  var input = new InputManager();
	var root = Root.getInstance();
	var gl = root.getWebGL();
	var amahaniTransform = Transform.getTransform("amahani");
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var timeNow = new Date().getTime();
    if (lastTime != 0) {
      var elapsed = timeNow - lastTime;
    }
    input.getElapsed(elapsed);
    lastTime = timeNow;
    
  input.listenKeyUp("A", input.Z());
  input.listenKeyDown("A");  
  input.listenMouseUp("RightButton", input.Q());
  input.listenMouseDown("RightButton");

	amahaniTransform.rotate((75 * elapsed) / 1000.0, [0.0, 1.0, 0.0]);
	Root.getInstance().getCamera().update();
	Transform.getTransform("root").render();
}
