if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Root.js");

include("Program.js")

Root = function() {
	this.viewPort = null;
	this.webGL = null;
	
	this.modelViewMatrix = Matrix.I(4);
	this.projectionMatrix = Matrix.I(4);
	
	this.defaultProgram = null;
	
	this.matrixStack = new Array();
	
	this.isInit = false;
}

Root.prototype.init = function(canvasId, clearColor, clearDepth, projection, lookAt) {
	if (this.isInit)
		return true;
	
	this.viewPort = document.getElementById(canvasId);
	if (!this.viewPort) { alert("Could not get the viewport"); return false; }
	
	if (!this.webGL) {
		try { this.webGL = this.viewPort.getContext("experimental-webgl"); } 
		catch (e) {}
	}
	if (!this.webGL) {
		try { this.webGL = this.viewPort.getContext("moz-webgl"); }
		catch (e) {}
	}
	if (!this.webGL) {
		try { this.webGL = this.viewPort.getContext("webkit-3d"); }
		catch (e) {}
	}

	if (!this.webGL) { alert("WebGL is not enabled"); return false; }
	
	this.defaultProgram = new Program();
	this.defaultProgram.createAndUse(this.webGL, "shaders/default/default.vs", "shaders/default/default.fs");
	
	this.webGL.viewport(0, 0, this.viewPort.width, this.viewPort.height);
	this.webGL.depthRange(1, 10);
	
	if (clearColor != undefined)
		this.webGL.clearColor(clearColor.R, clearColor.G, clearColor.B, clearColor.A);
	else
		this.webGL.clearColor(255, 0, 255, 1);
	this.webGL.clearDepth((clearDepth != undefined) ? (clearDepth) : (1));
	
	this.webGL.clear(this.webGL.COLOR_BUFFER_BIT | this.webGL.DEPTH_BUFFER_BIT);
	
	if (projection != undefined)
		this.projectionMatrix = makePerspective(projection.fovy, projection.aspect, projection.znear, projection.zfar);
	else
		this.projectionMatrix = makePerspective(70, this.viewPort.width / this.viewPort.height, 0.1, 100);
	
	if (lookAt != undefined)
		this.modelViewMatrix = makeLookAt(lookAt.ex, lookAt.ey, lookAt.ez, lookAt.cx, lookAt.cy, lookAt.cz, lookAt.ux, lookAt.uy, lookAt.uz);
	else	
		this.modelViewMatrix = makeLookAt(0, 100, -100, 0, 100, 0, 0, 1, 0);;
	
	this.isInit = true;
	return true;
}

Root.prototype.push = function() {
	this.matrixStack.push(this.modelViewMatrix);
}

Root.prototype.pop = function() {
	if (this.matrixStack.length > 0)
		this.modelViewMatrix = this.matrixStack.pop();
}

Root.prototype.translate = function (v) {
    var m = Matrix.Translation($V([v[0],v[1],v[2]])).ensure4x4();
	this.modelViewMatrix = this.modelViewMatrix.x(m);
}

Root.prototype.rotate = function (ang, v) {
    var arad = ang * Math.PI / 180.0;
    var m = Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4();
    this.modelViewMatrix = this.modelViewMatrix.x(m);
}

Root.prototype.scale = function (v) {
    var m = Matrix.Diagonal([v[0], v[1], v[2], 1]);
   	this.modelViewMatrix = this.modelViewMatrix.x(m);
}

Root.prototype.invert = function () {
    this.modelViewMatrix = this.modelViewMatrix.inv();
}

Root.prototype.LookAt = function (lookAt) {
	var m = makeLookAt(lookAt.ex, lookAt.ey, lookAt.ez, lookAt.cx, lookAt.cy, lookAt.cz, lookAt.ux, lookAt.uy, lookAt.uz);
	this.modelViewMatrix = this.modelViewMatrix.x(m);
}
