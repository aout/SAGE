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
  document.getElementById("FPS").innerHTML = Root.getInstance().actualFps.toString()+" fps";
}

function initScene()
{
	var root = Root.getInstance();
	var rm   = ResourceManager.getInstance();
	var im = new InputManager();
	
	var rootTransform    = Transform.getTransform("root");
	var cameraTransform  = rootTransform.addChild("camera");
	cameraTransform.translate([0.0, -30.0, 250.0]);
	root.getCamera().attach(cameraTransform);
	
	im.bindKey('Z', function(elapsed){
	  var transform = Transform.getTransform("camera");
    transform.translate([0.0, 0.0, -(15.0 * (elapsed / 1000.0))]);
	});
	
	im.bindKey('S', function(elapsed){
    var transform = Transform.getTransform("camera");
    transform.translate([0.0, 0.0, (15.0 * (elapsed / 1000.0))]);
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
	
	root.addCallbackToCallbackArray("DRAW_SCENE", drawScene, Root.HookEnum.ROOT_HOOK_ONRENDERSTART);
	root.startRendering();
}

function loadResources() {
	var rm = ResourceManager.getInstance();		
	rm.prepareCollada("Amahani", "Resources/Meshs/avatar.dae");
	rm.doLoad(initScene);
}

function main() {  
  document.getElementById("go").style.visibility = 'hidden';
	var root = Root.getInstance();
	root.init("viewport", loadResources, {R: 0.1, G: 0.1, B: 0.1, A: 1.0});
}