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

function drawScene(elapsedTime)
{
  var amahaniTransform     = Transform.getTransform("Amahani");
  amahaniTransform.rotate((75 * elapsedTime) / 1000.0, [0.0, 0.0, 1.0]);
  var skeletonRoot     = Transform.getTransform("skeletonRoot");
  skeletonRoot.rotate((75 * elapsedTime) / 1000.0, [0.0, 0.0, 1.0]);
  
  document.getElementById("FPS").innerText = parseInt(Root.getInstance().actualFps).toString()+" fps";
}

function createCubeJoint(parent, joint, cubeEnt) {
  var transform = parent.addChild(joint.name);
  transform.addEntity(cubeEnt);
  transform.localMatrix = joint.localMatrix;
  
  for (var i = 0; i < joint.children.length; ++i) {
    createCubeJoint(transform, joint.children[i], cubeEnt);
  }
}

function initScene()
{
	var root = Root.getInstance();
	var rm   = ResourceManager.getInstance();
	
	var rootTransform    = Transform.getTransform("root");
	
  var amahaniTransform = Transform.getTransform("Amahani");
  amahaniTransform.translate([-1.0, 0.0, 0.0]);
  amahaniTransform.rotate(-90, [1.0, 0.0, 0.0]);
	
	var cameraTransform  = rootTransform.addChild("camera");
	var skeletonRoot     = rootTransform.addChild("skeletonRoot");
	skeletonRoot.translate([1.0, 0.0, 0.0]);
	skeletonRoot.rotate(-90, [1.0, 0.0, 0.0]);
	root.getCamera().attach(cameraTransform);
		
	var ent = new Entity("cube_entity", [rm.getMeshByName('cube_mesh')], [rm.getTextureByName('cube_texture')]);
	createCubeJoint(skeletonRoot, amahaniTransform.entities[0].skeleton.root, ent);

	cameraTransform.translate([0, 1, 7]);
	
	root.startRendering(drawScene);
}

function loadResources() {
	var rm = ResourceManager.getInstance();
	
	rm.prepareCollada("Amahani", "Resources/Meshs/Amahani.dae");
	rm.prepareMesh("cube_mesh", "cube");
	rm.prepareTexture("cube_texture", "Resources/Textures/nehe.gif");
	rm.doLoad(initScene);
}

function main() {
  document.getElementById("go").style.visibility= 'hidden';
	var root = Root.getInstance();
	
	root.init("viewport", loadResources, {R: 0.3, G: 0.3, B: 0.3, A: 1.0});
}
