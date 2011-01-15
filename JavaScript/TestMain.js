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
	
	var rootTransform    = Transform.getTransform("root");
	var cameraTransform  = rootTransform.addChild("camera");
	cameraTransform.translate([0.0, 1.0, 5.0]);
	root.getCamera().attach(cameraTransform);
	
	root.addCallbackToCallbackArray("DRAW_SCENE", drawScene, Root.HookEnum.ROOT_HOOK_ONRENDERSTART);
	root.startRendering();
}

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