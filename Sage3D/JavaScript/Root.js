if (gIncludedFiles == undefined)
	alert("You must include this file");
gIncludedFiles.push("Root.js");

include("Program.js");
include("Transform.js");
include("Camera.js");

//Root Namespace
Root = {};

//Root instance
Root._root = null;

Root.getInstance = function() {
	if (Root._root === null)
		Root._root = new Root._Root();
	return Root._root;
};

//Root Class
//TODO: Use the Sage Exception class
Root._Root = function() {

	this.StatusEnum = 
	{
		NONE 			: 0,
		INITIALIZED		: 1,
		LOADING			: 2,
		LOADED			: 3,
		RUNNING			: 4,
		PAUSED			: 5,
		STOPPED			: 6,
		ERROR			: 7
	};

	var _viewPort = undefined;
	var _webGL = undefined;
	var _status = StatusEnum.NONE;

	var _modelViewMatrix = undefined;
	var _projectionMatrix = undefined;

	var _defaultProgram = undefined;

	this.rootTransform = undefined;
	this.camera = undefined;

	//Initializes the Root
	// TODO: Try to catch the parameter within the function and not by arguments
	this.init = function(canvasId, clearColor, clearDepth, projection, lookAt)
	{
		this._status = StatusEnum.NONE;
		this._modelViewMatrix = Matrix.I(4);
		this._projectionMatrix = Matrix.I(4);

		//Set a viewport into the canvas
		this._viewPort = document.getElementById(canvasId);

		//Check WebGL context
		if(!this.isWebGLEnabled())
			return false;

		//set status to LOADING
		this._status = this.StatusEnum.LOADING;

		//WebGL	initialization!
		//default shader
		this._defaultProgram = new Program();
		this._defaultProgram.createAndUse(this._webGL, "Resources/Shaders/default/default.vs", "Resources/Shaders/default/default.fs");
		//viewport
		this._webGL.viewport(0, 0, this._viewPort.width, this._viewPort.height);
		//this._webGL.depthRange(1, 10);
		//clear color
		if (clearColor != undefined)
			this._webGL.clearColor(clearColor.R, clearColor.G, clearColor.B, clearColor.A);
		else
			this._webGL.clearColor(1, 0, 1, 1);
		//clear depth
		this._webGL.clearDepth((clearDepth != undefined) ? (clearDepth) : (1.0));
		//do clear
		this._webGL.clear(this._webGL.COLOR_BUFFER_BIT | this._webGL.DEPTH_BUFFER_BIT);
		//make perspective
		if (projection != undefined)
			this._projectionMatrix = makePerspective(projection.fovy, projection.aspect, projection.znear, projection.zfar);
		else
			this._projectionMatrix = makePerspective(45, this._viewPort.width / this._viewPort.height, 0.1, 100.0);
		//make look at
		//DEBUG
		/*if (lookAt != undefined)
			this._modelViewMatrix = makeLookAt(lookAt.ex, lookAt.ey, lookAt.ez, lookAt.cx, lookAt.cy, lookAt.cz, lookAt.ux, lookAt.uy, lookAt.uz);
		else	
			this._modelViewMatrix = makeLookAt(0, 1, -5, 0, 1, 0, 0, 1, 0);*/

		this._webGL.enable(this._webGL.DEPTH_TEST);
		this._webGL.depthFunc(this._webGL.LEQUAL);

		this.rootTransform = new Transform(undefined, "root");
		this.camera = new Camera("Camera", this.rootTransform);
		
		//set status to LOADED
		this._status = this.StatusEnum.LOADED;
		return true;
	};

	this.getWebGL = function() {
		return this._webGL;
	};

	this.getDefaultProgram = function() {
		return this._defaultProgram;
	};

	this.getModelViewMatrix = function() {
		return this._modelViewMatrix;
	};

	this.getProjectionMatrix = function() {
		return this._projectionMatrix;
	};

	this.getRootTransform = function() {
		return this.rootTransform;
	};

	this.getCamera = function() {
		return this.camera;
	};

	/*this.LookAt = function (lookAt) {
		var m = makeLookAt(lookAt.ex, lookAt.ey, lookAt.ez, lookAt.cx, lookAt.cy, lookAt.cz, lookAt.ux, lookAt.uy, lookAt.uz);
		this._modelViewMatrix = this._modelViewMatrix.x(m);
	};*/

	//private methods

	//Check if webGL is currently enabled in the client's browser
	this.isWebGLEnabled = function()
	{
		//standard webGL status
		if (!this._webGL) {
			try { this._webGL = this._viewPort.getContext("webgl"); } 
			catch (e) {}
		}
		//underdev webGL
		if (!this._webGL) {
			try { this._webGL = this._viewPort.getContext("experimental-webgl"); } 
			catch (e) {}
		}
		//mozilla webGL
		if (!this._webGL) {
			try { this._webGL = this._viewPort.getContext("moz-webgl"); }
			catch (e) {}
		}
		//safari webGL
		if (!this._webGL) {
			try { this._webGL = this._viewPort.getContext("webkit-3d"); }
			catch (e) {}
		}
		// Here we need to call the Sage exception class
		if (!this._webGL) 
		{
			alert("WebGL is not enabled");
			this._status = ERROR;
			return false;
		}
		return true;
	};
};