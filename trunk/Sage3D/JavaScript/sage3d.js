var gIncludedFiles = new Array();
gIncludedFiles.push("sage3d.js");

gIncludedFiles.inArray = function (value) {
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
}

function loadEntity() {
	var Cloader = ColladaLoader.getInstance();
	Cloader.load("Resources/Meshs/Amahani.dae", entityLoaded);
}

function entityLoaded(entity) {
	var rootTransform = Transform.getTransform("root");
	rootTransform.content.push(entity);

	var bbox = entity.mesh.BBox;

	var midx = (bbox.x.min + bbox.x.max) / 2;
	var midy = (bbox.y.min + bbox.y.max) / 2;
	var midz = (bbox.z.min + bbox.z.max) / 2;
	
	var maxdim = bbox.x.max - bbox.x.min;
	maxdim = Math.max(maxdim, bbox.y.max - bbox.y.min);
	maxdim = Math.max(maxdim, bbox.z.max - bbox.z.min);
	
	var m = makeLookAt(midx, midy, midz + (maxdim * 1.5),
					   midx, midy, midz,
					   0, 1, 0);

	rootTransform.localMatrix = rootTransform.localMatrix.x(m);
	rootTransform.translate([0.0, -1.0, 0.0]);
	rootTransform.rotate(-90, [1, 0, 0]);

	setInterval(draw, 12);	
}

var lastTime = new Date().getTime();
function draw() {
	var root = Root.getInstance();
	var gl = root.getWebGL();
	var rootTransform = Transform.getTransform("root");
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var timeNow = new Date().getTime();
    if (lastTime != 0) {
      var elapsed = timeNow - lastTime;
    }
    lastTime = timeNow;

	rootTransform.rotate((75 * elapsed) / 1000.0, [0.0, 0.0, 1.0]);
	rootTransform.render();
}
