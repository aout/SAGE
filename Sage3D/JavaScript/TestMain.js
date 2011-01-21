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

function drawScene(elapsedTime) {
  var amahaniTransform = Transform.getTransform("Amahani");
  amahaniTransform.rotate((90 * elapsedTime) / 1000.0, [0.0, 1.0, 0.0]);
}

function updateFps() {
  document.getElementById("FPS").innerHTML = Root.getInstance().getFps().toString()+" fps";
}

function initScene()
{
	var root = Root.getInstance();
	var rm   = ResourceManager.getInstance();
	var im = new InputManager();
	
	var rootTransform    = Transform.getTransform("root");
	var cameraTransform  = rootTransform.addChild("camera");
	cameraTransform.translate([0.0, 5.0, 20.0]);
	//cameraTransform.translate([0.0, 1.0, 5.0]);
	root.getCamera().attach(cameraTransform);
	
	setInterval(updateFps, 1000);
	
	im.bindKey('Z', function(elapsed){
	  var transform = Transform.getTransform("camera");
    var move = 2 * (elapsed / 1000.0);
    transform.translate([0.0, 0.0, -move]);
	});
	
	im.bindKey('S', function(elapsed){
    var transform = Transform.getTransform("camera");
    var move = 2 * (elapsed / 1000.0);
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
	
	im.bindMouse('MOUSE_LEFT', function(elapsed){
    var root = Root.getInstance();
    var input = root.getModule('INPUT_MANAGER');
    var renderer = root.getRenderer();
    document.getElementById("MOUSE").innerHTML = "MousePos x:"+input.mousePos.x+" y:"+input.mousePos.y;
    var pickedElement = renderer.pick(input.mousePos.x, input.mousePos.y);
    if (pickedElement != null) {
      document.getElementById("PICKED").innerHTML = pickedElement.name;
    }
    else {
      document.getElementById("PICKED").innerHTML = "null";
    }
  });
  
	
	root.callbacks.addCallback('DRAW_SCENE', drawScene, 'ROOT_HOOK_ONRENDERSTART');
	
	root.getRenderer().enablePicking();

	root.startRendering();
}

function loadResources() {
	var rm = ResourceManager.getInstance();		
	rm.prepareCollada("Amahani", "Resources/Meshs/Seymour_triangulate.dae");
	rm.doLoad(initScene);
}

function main() {  
  document.getElementById("go").style.visibility = 'hidden';
	var root = Root.getInstance();
	root.init("viewport", loadResources, {R: 1, G: 1, B: 1, A: 1.0});
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