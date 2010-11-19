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
  /*
  var amahaniTransform = Transform.getTransform("Amahani");
  if (isRotating) {
    amahaniTransform.rotate((90 * elapsedTime) / 1000.0, [0.0, 1.0, 0.0]);
    var skeletonRoot     = Transform.getTransform("skeletonRoot");
    skeletonRoot.rotate((90 * elapsedTime) / 1000.0, [0.0, 1.0, 0.0]);
  }*/
  document.getElementById("FPS").innerHTML = Root.getInstance().actualFps.toString()+" fps";
}

/*
function createCubeJoint(parent, joint, cubeEnt) {
  
  var transform = parent.addChild(joint.name);
  transform.addEntity(cubeEnt);
  transform.localMatrix = joint.localMatrix;
  
  for (var i = 0; i < joint.children.length; ++i) {
    createCubeJoint(transform, joint.children[i], cubeEnt);
  }
}*/
var titi = 0;
var tutu = 0;
function toto(elapsedTime) {
  titi += elapsedTime;
}
function tata(elapsedTime) {
  tutu += elapsedTime;
}

function initScene()
{
  
	var root = Root.getInstance();
	var rm   = ResourceManager.getInstance();
	var input = new InputManager();
	
	input.bindKey("B", toto);
	input.bindMouse("MOUSE_LEFT", tata);
	
	var rootTransform    = Transform.getTransform("root");
	/*
  var amahaniTransform = Transform.getTransform("Amahani");
  amahaniTransform.translate([-1.0, -1.0, -5.0]);

  var cubeTransform  = rootTransform.addChild("cube");
  amahaniTransform.translate([-1.0, -1.0, -10.0]);

	*/
	var cameraTransform  = rootTransform.addChild("camera");
	
	/*
	var skeletonRoot     = rootTransform.addChild("skeletonRoot");
	skeletonRoot.translate([1.0, -1.0, -5.0]);
	//skeletonRoot.rotate(-90, [1.0, 0.0, 0.0]);
	skeletonRoot.isVisible = false;*/
	root.getCamera().attach(cameraTransform);
	/*	
	var ent = new Entity("cube_entity", [rm.getMeshByName('cube_mesh')], [rm.getTextureByName('cube_texture')]);
	createCubeJoint(skeletonRoot, amahaniTransform.entities[0].skeleton.root, ent);

	cameraTransform.translate([0, 0, 0]);*/
	
	root.addCallbackToCallbackArray("DRAW_SCENE", drawScene, Root.HookEnum.ROOT_HOOK_ONRENDERSTART);
	root.startRendering();
}

function loadResources() {
}

function main() {  
  document.getElementById("go").style.visibility = 'hidden';
	var root = Root.getInstance();
	root.init("viewport", initScene, {R: 0.1, G: 0.1, B: 0.1, A: 1.0});
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
  var skeletonRoot = Transform.getTransform("skeletonRoot");
  skeletonRoot.isVisible = !skeletonRoot.isVisible;
}
function setMousePosition(event) {
	Root.getInstance().setMousePosition(event);
}