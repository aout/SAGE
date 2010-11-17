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

var isRotating = false;

function drawScene(elapsedTime) {
  handleKeys(elapsedTime);
  var amahaniTransform = Transform.getTransform("Amahani");
  if (isRotating) {
    amahaniTransform.rotate((90 * elapsedTime) / 1000.0, [0.0, 1.0, 0.0]);
    var skeletonRoot     = Transform.getTransform("skeletonRoot");
    skeletonRoot.rotate((90 * elapsedTime) / 1000.0, [0.0, 1.0, 0.0]);
  }
  document.getElementById("FPS").innerHTML = Root.getInstance().actualFps.toString()+" fps";
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
  amahaniTransform.translate([-1.0, -1.0, -5.0]);

  var cubeTransform  = rootTransform.addChild("cube");
  amahaniTransform.translate([-1.0, -1.0, -10.0]);

	
	var cameraTransform  = rootTransform.addChild("camera");
	var skeletonRoot     = rootTransform.addChild("skeletonRoot");
	skeletonRoot.translate([1.0, -1.0, -5.0]);
	//skeletonRoot.rotate(-90, [1.0, 0.0, 0.0]);
	skeletonRoot.isVisible = false;
	root.getCamera().attach(cameraTransform);
		
	var ent = new Entity("cube_entity", [rm.getMeshByName('cube_mesh')], [rm.getTextureByName('cube_texture')]);
	createCubeJoint(skeletonRoot, amahaniTransform.entities[0].skeleton.root, ent);

	cameraTransform.translate([0, 0, 0]);
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
  document.getElementById("go").style.visibility = 'hidden';
	var root = Root.getInstance();
	document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;
	root.init("viewport", loadResources, {R: 0.1, G: 0.1, B: 0.1, A: 1.0});
}

if (typeof KeyEvent == "undefined") {
    var KeyEvent = {
        DOM_VK_CANCEL: 3,
        DOM_VK_HELP: 6,
        DOM_VK_BACK_SPACE: 8,
        DOM_VK_TAB: 9,
        DOM_VK_CLEAR: 12,
        DOM_VK_RETURN: 13,
        DOM_VK_ENTER: 14,
        DOM_VK_SHIFT: 16,
        DOM_VK_CONTROL: 17,
        DOM_VK_ALT: 18,
        DOM_VK_PAUSE: 19,
        DOM_VK_CAPS_LOCK: 20,
        DOM_VK_ESCAPE: 27,
        DOM_VK_SPACE: 32,
        DOM_VK_PAGE_UP: 33,
        DOM_VK_PAGE_DOWN: 34,
        DOM_VK_END: 35,
        DOM_VK_HOME: 36,
        DOM_VK_LEFT: 37,
        DOM_VK_UP: 38,
        DOM_VK_RIGHT: 39,
        DOM_VK_DOWN: 40,
        DOM_VK_PRINTSCREEN: 44,
        DOM_VK_INSERT: 45,
        DOM_VK_DELETE: 46,
        DOM_VK_0: 48,
        DOM_VK_1: 49,
        DOM_VK_2: 50,
        DOM_VK_3: 51,
        DOM_VK_4: 52,
        DOM_VK_5: 53,
        DOM_VK_6: 54,
        DOM_VK_7: 55,
        DOM_VK_8: 56,
        DOM_VK_9: 57,
        DOM_VK_SEMICOLON: 59,
        DOM_VK_EQUALS: 61,
        DOM_VK_A: 65,
        DOM_VK_B: 66,
        DOM_VK_C: 67,
        DOM_VK_D: 68,
        DOM_VK_E: 69,
        DOM_VK_F: 70,
        DOM_VK_G: 71,
        DOM_VK_H: 72,
        DOM_VK_I: 73,
        DOM_VK_J: 74,
        DOM_VK_K: 75,
        DOM_VK_L: 76,
        DOM_VK_M: 77,
        DOM_VK_N: 78,
        DOM_VK_O: 79,
        DOM_VK_P: 80,
        DOM_VK_Q: 81,
        DOM_VK_R: 82,
        DOM_VK_S: 83,
        DOM_VK_T: 84,
        DOM_VK_U: 85,
        DOM_VK_V: 86,
        DOM_VK_W: 87,
        DOM_VK_X: 88,
        DOM_VK_Y: 89,
        DOM_VK_Z: 90,
        DOM_VK_CONTEXT_MENU: 93,
        DOM_VK_NUMPAD0: 96,
        DOM_VK_NUMPAD1: 97,
        DOM_VK_NUMPAD2: 98,
        DOM_VK_NUMPAD3: 99,
        DOM_VK_NUMPAD4: 100,
        DOM_VK_NUMPAD5: 101,
        DOM_VK_NUMPAD6: 102,
        DOM_VK_NUMPAD7: 103,
        DOM_VK_NUMPAD8: 104,
        DOM_VK_NUMPAD9: 105,
        DOM_VK_MULTIPLY: 106,
        DOM_VK_ADD: 107,
        DOM_VK_SEPARATOR: 108,
        DOM_VK_SUBTRACT: 109,
        DOM_VK_DECIMAL: 110,
        DOM_VK_DIVIDE: 111,
        DOM_VK_F1: 112,
        DOM_VK_F2: 113,
        DOM_VK_F3: 114,
        DOM_VK_F4: 115,
        DOM_VK_F5: 116,
        DOM_VK_F6: 117,
        DOM_VK_F7: 118,
        DOM_VK_F8: 119,
        DOM_VK_F9: 120,
        DOM_VK_F10: 121,
        DOM_VK_F11: 122,
        DOM_VK_F12: 123,
        DOM_VK_F13: 124,
        DOM_VK_F14: 125,
        DOM_VK_F15: 126,
        DOM_VK_F16: 127,
        DOM_VK_F17: 128,
        DOM_VK_F18: 129,
        DOM_VK_F19: 130,
        DOM_VK_F20: 131,
        DOM_VK_F21: 132,
        DOM_VK_F22: 133,
        DOM_VK_F23: 134,
        DOM_VK_F24: 135,
        DOM_VK_NUM_LOCK: 144,
        DOM_VK_SCROLL_LOCK: 145,
        DOM_VK_COMMA: 188,
        DOM_VK_PERIOD: 190,
        DOM_VK_SLASH: 191,
        DOM_VK_BACK_QUOTE: 192,
        DOM_VK_OPEN_BRACKET: 219,
        DOM_VK_BACK_SLASH: 220,
        DOM_VK_CLOSE_BRACKET: 221,
        DOM_VK_QUOTE: 222,
        DOM_VK_META: 224
    };
}

var keyStatus = {};

function handleKeyDown(event) {
  keyStatus[event.keyCode] = true;
  switch (event.keyCode) {
    case KeyEvent.DOM_VK_NUMPAD1:
      //Root.getInstance().getCamera().attach(Transform.getTransform("freeCam"));
      break;
    case KeyEvent.DOM_VK_NUMPAD2:
      //Root.getInstance().getCamera().attach(Transform.getTransform("amahani-camera"));
      break;
  }
}

function handleKeyUp(event) {
  keyStatus[event.keyCode] = false;
}

var constant_move = 3.0;
var constant_rot = 120;

function handleKeys(elapsed) {
  var transform = Transform.getTransform("camera");
  var move = constant_move * (elapsed / 1000.0);
  var rot = constant_rot * (elapsed / 1000.0);
  
  if (keyStatus[KeyEvent.DOM_VK_Z] == true) {
    transform.translate([0.0, 0.0, -move]);
  }
  if (keyStatus[KeyEvent.DOM_VK_S] == true) {
    transform.translate([0.0, 0.0, move]);
  }
  
  if (keyStatus[KeyEvent.DOM_VK_Q] == true) {
    transform.translate([-move, 0.0, 0.0]);
  }
  if (keyStatus[KeyEvent.DOM_VK_D] == true) {
    transform.translate([move, 0.0, 0.0]);
  }

  if (keyStatus[KeyEvent.DOM_VK_A] == true) {
    transform.rotate(rot, [0.0, 1.0, 0.0]);
  }
  if (keyStatus[KeyEvent.DOM_VK_E] == true) {
    transform.rotate(-rot, [0.0, 1.0, 0.0]);
  }
  
  if (keyStatus[KeyEvent.DOM_VK_UP] == true) {
    transform.rotate(rot, [1.0, 0.0, 0.0]);
  }
  if (keyStatus[KeyEvent.DOM_VK_DOWN] == true) {
    transform.rotate(-rot, [1.0, 0.0, 0.0]);
  }

  if (keyStatus[KeyEvent.DOM_VK_LEFT] == true) {
    transform.rotate(rot, [0.0, 0.0, 1.0]);
  }
  if (keyStatus[KeyEvent.DOM_VK_RIGHT] == true) {
    transform.rotate(-rot, [0.0, 0.0, 1.0]);
  }
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
/*function picking(e) { 
var vectorMouse = vec3.create([0.0, 0.0, 0.0]);
vectorMouse.x = e.pageX;
vectorMouse.Y = e.pageY;
vectorMouse.z = 5;

var vector = vectorMouse - getCamPos();

for (int i = 0; i < listObjectLenght; ++i)
{
Object obj = listObject[i];

 var cameraMatrice = GetCamera.getMatrice("camera");
 Matrix matriceObjet = obj.getMatrix() 
 Matrix cameraLocal = matrice_objet.invers() * camera;

 float min_distance = -1.0f;

 Vector final_collide;

for (int i = 0; i < listPolygoneLenght; ++i)
{
Polygone poly = listPolygone[i];
vector polyvector1 = poly.vertex1 - poly.vertex2;
vector polyvector2 = poly.vertex1 - poly.vertex3;
Vector normale = VectorCrossProduct(v1, v2).normalize; normal des vecteur 
float dot = VectorDot(normal, rayon); scalaire des vecteur verif vecteur pas parralele au plan
              if( dot >= 0) continue;
float t = VectorDot(normal, p1 - camera_local) / dot; verif poly devant la cam
      if( t < 0) continue;
	  Vector collide = camera_local + rayon * t; point de collision
	   Vector a = p1 - collide;
              Vector b = p2 - collide;
              Vector c = p3 - collide;
              Vector verif = a.normalize() + b.normalize() + c.normalize(); si verif est normalize alors c'est dans le poly
			   if( VectorLongeur(verif) > 1 ) continue;
			   Vector3d distance = camera_local - collide; coordonn� depuis l'origine soit Cam
			   if( VectorLongeur(distance) < min_distance || min_distance == -1) //calc la longueur
              {
                   final_collide = collide; // on met � jour le point de collision trouv�
                   min_distance = VectorLongeur(distance); // on met � jour la distance
              }

			  }
}
drawVector(vector, 50);
}

drawVector(vector3, distance);
{
	var newPoint = camPosition + distance*vector3
	line = getCamPos() + newPoint;
	
	var mesh = new Mesh(name);
	mesh.addBuffer("POSITION", gl.ARRAY_BUFFER, line, 2, gl.FLOAT, 3, gl.STATIC_DRAW);
	mesh.setDrawingBuffer("POSITION");
}
 */


