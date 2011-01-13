var gIncludedFiles = [];
gIncludedFiles.push("TestMain.js");

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
include("InputManager.js");

var isRotating = false;

function drawScene(elapsedTime) {
  document.getElementById("FPS").innerHTML = Root.getInstance().getFps()+" fps";
}

function initScene()
{
  var root = Root.getInstance();
	var rm   = ResourceManager.getInstance();
	var im = new InputManager();
	
	var rootTransform    = Transform.getTransform("root");
	
	var cameraTransform  = rootTransform.addChild("camera");
	
	var amahaniTransform = Transform.getTransform("Amahani");
	
	var amahaniTransform2 = rootTransform.addChild("Amahani2");
	amahaniTransform2.entities = amahaniTransform.entities;
	
	amahaniTransform.translate([-1.0, -1.0, -5.0]);
	amahaniTransform2.translate([1.0, -1.0, -5.0]);
	
	root.getCamera().attach(cameraTransform);
	
	im.bindKey('Z', function(elapsed){
	  var transform = Transform.getTransform("camera");
    var move = 1.5 * (elapsed / 1000.0);
    transform.translate([0.0, 0.0, -move]);
	});
	
	im.bindKey('S', function(elapsed){
    var transform = Transform.getTransform("camera");
    var move = 1.5 * (elapsed / 1000.0);
    transform.translate([0.0, 0.0, move]);
  });
  
	im.bindKey('Q', function(elapsed){
    var transform = Transform.getTransform("camera");
    var rot = 90 * (elapsed / 1000.0);
    transform.rotate(rot, [0.0, 1.0, 0.0]);
  });
  
	im.bindKey('D', function(elapsed){
    var transform = Transform.getTransform("camera");
    var rot = 90 * (elapsed / 1000.0);
    transform.rotate(-rot, [0.0, 1.0, 0.0]);
  });
	
	root.callbacks.addCallback('DRAW_SCENE', drawScene, 'ROOT_HOOK_ONRENDERSTART');
	
	createNewDrawPass();
	
	root.startRendering();
}

function createNewDrawPass() {
  var renderer = Root.getInstance().getRenderer();
  var amahaniTransform = Transform.getTransform("Amahani");
  var amahaniTransform2 = Transform.getTransform("Amahani2");

  renderer.beautyPass.RenderTreeRoot = amahaniTransform;
  
  var pass = new DrawPass("DEPTH_PASS", 0);
  pass.setDefaultBuffers();
  pass.RenderTreeRoot = amahaniTransform2;
  pass.program = new Program("depth", "Resources/Shaders/default/default.vs", "Resources/Shaders/depth/depth.fs", null);
  pass.validate();
  
  renderer.addDrawPass(pass);
};

function loadResources() {
	var rm = ResourceManager.getInstance();		
	rm.prepareCollada("Amahani", "Resources/Meshs/Amahani.dae");
	rm.doLoad(initScene);
}

function main() {  
  document.getElementById("go").style.visibility = 'hidden';
	var root = Root.getInstance();
	root.init("viewport", loadResources, {R: 0.1, G: 0.1, B: 0.1, A: 1.0});
}

function clearLight() {
  Root.getInstance().directionalColor = [1.0, 1.0, 1.0];
}

function red() {
  Root.getInstance().directionalColor = [1.0, 0.0, 0.0];
}
function green() {
  Root.getInstance().directionalColor = [0.0, 1.0, 0.0];
}
function blue() {
  Root.getInstance().directionalColor = [0.0, 0.0, 1.0];
}
function front() {
  var lightingDirection = vec3.create([0.0, -1.0, -1.0]);
  vec3.normalize(lightingDirection);
  vec3.negate(lightingDirection);
  Root.getInstance().lightingDirection = lightingDirection;
}
function right() {
  var lightingDirection = vec3.create([-1.0, -1.0, 0.0]);
  vec3.normalize(lightingDirection);
  vec3.negate(lightingDirection);
  Root.getInstance().lightingDirection = lightingDirection;
}
function left() {
  var lightingDirection = vec3.create([1.0, -1.0, 0.0]);
  vec3.normalize(lightingDirection);
  vec3.negate(lightingDirection);
  Root.getInstance().lightingDirection = lightingDirection;
}
function back() {
  var lightingDirection = vec3.create([0.0, -1.0, 1.0]);
  vec3.normalize(lightingDirection);
  vec3.negate(lightingDirection);
  Root.getInstance().lightingDirection = lightingDirection;
}
function toggleLight() {
  Root.getInstance().isLightingEnabled = !Root.getInstance().isLightingEnabled;
}
function toggleRotation() {
  isRotating = !isRotating;
}
function toggleSkeleton() {

}