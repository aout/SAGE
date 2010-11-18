if (gIncludedFiles == undefined)
 alert("You must include this file");
gIncludedFiles.push("Root.js");

include("AnimatableEntity.js");
include("Camera.js");
include("ColladaLoader.js");
include("Entity.js");
include("Joint.js");
include("Light.js");
include("Mesh.js");
include("Material.js");
include("Primitives.js");
include("Program.js");
include("ResourceManager.js");
include("Texture.js");
include("Transform.js");
include("Renderer.js");

Root = function(){
    this.viewPort = undefined;
    this.webGL = undefined;
    this.status = Root.StatusEnum.ROOT_NONE;
    this.renderer = undefined;

    this.projectionMatrix = mat4.create();
    mat4.identity(this.projectionMatrix);
    this.defaultProgram = undefined;
    this.rootTransform = undefined;
    this.camera = undefined;

    this.width = null;
    this.height = null;

    this.isLightingEnabled = true;
    this.ambientLight = new Light("ambient", Light.TypeEnum.AMBIENT, [1.0, 1.0, 1.0, 1.0], 0.2, undefined);
    this.lights = [];
    this.maxLights = 5;
    //must have the exact same value in the shader!
    this.numberOfLights = 0;
    this.lightsPositions = [];
    this.lightsDirections = [];
    this.lightsColors = [];
    this.lightsIntensities = [];

    this.ambientColor = [0.1, 0.1, 0.1];
    this.directionalColor = [1.0, 1.0, 1.0];
    this.lightingDirection = vec3.create([ - 1.0, -1.0, 0.0]);
    vec3.normalize(this.lightingDirection);
    vec3.negate(this.lightingDirection);

    this.maxFps = 200;
    this.actualFps = 0.0;
    this.drawInterval = undefined;
    this.fpsInterval = undefined;

    this.renderedFrames = 0;
    this.lastRender = undefined;

this.mousePosition = {
	x: 0,
	y: 0,
	}
	this.hasClick = false;
    this.vectorMouse = undefined;
    this.onRender = undefined;
};

Root.StatusEnum = {
    ROOT_NONE: 0,
    ROOT_INITIALIZED: 1,
    ROOT_LOADING: 2,
    ROOT_LOADED: 3,
    ROOT_RUNNING: 4,
    ROOT_PAUSED: 5,
    ROOT_STOPPED: 6,
    ROOT_ERROR: 7
};

Root.instance = undefined;

Root.getInstance = function(){
    if (Root.instance == undefined)
    Root.instance = new Root();
    return Root.instance;
};

//Initializes the Root
// TODO: Try to catch the parameter within the function and not by arguments
Root.prototype.init = function(canvasId, callback, clearColor, clearDepth, projection){
    this.status = Root.StatusEnum.ROOT_NONE;

    //Set a viewport into the canvas
    this.viewPort = document.getElementById(canvasId);
    this.width = this.viewPort.offsetWidth;
    this.height = this.viewPort.offsetHeight;

    //Check WebGL context
    if (!this.isWebGLEnabled())
    return false;

    //set status to LOADING
    this.status = Root.StatusEnum.ROOT_LOADING;

    //viewport
    this.webGL.viewport(0, 0, this.width, this.height);

    //clear color
    if (clearColor != undefined)
    this.webGL.clearColor(clearColor.R, clearColor.G, clearColor.B, clearColor.A);
    else
    this.webGL.clearColor(1, 0, 1, 1);

    //clear depth
    this.webGL.clearDepth((clearDepth != undefined) ? (clearDepth) : (1.0));

    //do clear
    this.webGL.clear(this.webGL.COLOR_BUFFER_BIT | this.webGL.DEPTH_BUFFER_BIT);

    //make perspective
    if (projection != undefined)
    this.projectionMatrix = mat4.perspective(projection.fovy, projection.aspect, projection.znear, projection.zfar);
    else
    this.projectionMatrix = mat4.perspective(45, this.width / this.height, 0.1, 100.0);

    this.webGL.enable(this.webGL.DEPTH_TEST);
    this.webGL.depthFunc(this.webGL.LEQUAL);

    this.rootTransform = new Transform(undefined, "root");
    this.camera = new Camera("Camera", this.rootTransform);

    //set status to LOADED
    this.status = Root.StatusEnum.ROOT_LOADED;

    //WebGL	initialization!
    //default shader
    this.renderer = new Renderer();
    this.renderer.setDefaultBeautyPass();
    this.canDraw = true;
    callback();
    return true;
};

Root.prototype.getWebGL = function(){
    return this.webGL;
};
Root.prototype.getViewport = function(){
    return this.viewPort;
};

Root.prototype.getDefaultProgram = function(){
    return this.renderer.getDefaultProgram();
};

Root.prototype.getCurrentProgram = function(){
    return this.renderer.getCurrentProgram();
};

Root.prototype.getRenderer = function() {
    return this.renderer;
};

Root.prototype.getProjectionMatrix = function(){
    return this.projectionMatrix;
};

Root.prototype.getRootTransform = function(){
    return this.rootTransform;
};

Root.prototype.getCamera = function(){
    return this.camera;
};

//Check if webGL is currently enabled in the client's browser
Root.prototype.isWebGLEnabled = function(){
    //standard webGL status
    if (!this.webGL){
        try{
            this.webGL = this.viewPort.getContext("webgl");
        }
        catch(e){}
    }
    //underdev webGL
    if (!this.webGL){
        try{
            this.webGL = this.viewPort.getContext("experimental-webgl");
        }
        catch(e){}
    }
    //mozilla webGL
    if (!this.webGL){
        try{
            this.webGL = this.viewPort.getContext("moz-webgl");
        }
        catch(e){}
    }
    //safari webGL
    if (!this.webGL){
        try{
            this.webGL = this.viewPort.getContext("webkit-3d");
        }
        catch(e){}
    }
    // Here we need to call the Sage exception class
    if (!this.webGL)
    {
        alert("WebGL is not enabled");
        this.status = Root.StatusEnum.ROOT_ERROR;
        return false;
    }
    return true;
};

/**
 * Start the Render Loop
 * @param {Array} callbacks Array of callback functions to be executed
 */
Root.prototype.startRendering = function(callback){
    this.onRender = callback;
    var TimePerFrame = 1000 / this.maxFps;
    this.drawInterval = setInterval(this.draw, TimePerFrame);
    this.fpsInterval = setInterval(this.getFps, 500);
};

/**
 * Render Loop (draw)
 * @param {Function} callbacks Callback function to be executed
 * @param {Time} elapsedTime Time (ms) passed between two frames
 */
Root.prototype.draw = function(){

    var root = Root.getInstance();

    if (!root.canDraw){
        return;
    }

    root.canDraw = false;

    if (root.lastRender == undefined){
        root.lastRender = new Date().getTime();
    }
    var elapsedTime = new Date().getTime() - root.lastRender;
    ++root.renderedFrames;

    root.webGL.clear(root.webGL.COLOR_BUFFER_BIT | root.webGL.DEPTH_BUFFER_BIT);

    if (root.onRender != undefined){
        root.onRender(elapsedTime);
    }
    root.camera.update();

    root.renderer.render();

    root.lastRender = new Date().getTime();

    root.canDraw = true;
};

Root.prototype.getFps = function(){
    var root = Root.getInstance();
    root.actualFps = root.renderedFrames * 2;
    root.renderedFrames = 0;
};

/**
 * Adds a new light into the current scene.
 * @param {String} name
 * @param {String} type
 * @param {Array} color
 * @param {Int} intensity
 * @param {Transform} parent
 */
Root.prototype.addLight = function(name, type, color, intensity, parent){
    if (this.getNumberOfLights < 5){
        var light = new Light(name, type, color, intensity, parent);
        this.lights.push(light);
        ++this.numberOfLights;
    }
    else{
        alert("You currently reach the maximum number of lights.");
    }
};

Root.prototype.removeLight = function(name){
    var found = false;
    for (var i = 0; this.lights[i]; ++i){
        if (this.lights[i].name == name){
            this.lights.splice(i, 1);
            --this.numberOfLights;
        }
    }
    if (found == false){
        alert("Impossible to remove " + name + ". Not found.");
    }
};

Root.prototype.getNumberOfLights = function(){
    return this.numberOfLights;
};

Root.prototype.getLightsPositions = function(){
    var Positions = [];

    for (var i = 0; this.lights[i]; ++i){
        var transform = lights[i].parent;
        Positions.push([tranform.computedMatrix.col(4).splice(3, 1)]);
    }
    return Positions;
};

Root.prototype.getLightsDirections = function(){
    var Directions = [];

    for (var i = 0; this.lights[i]; ++i){
        var transform = lights[i].parent;

        var direction = transform.computedMatrix.x($V(1, 1, 1));
        Directions.push(direction.elements);
    }
    return Directions;
};

Root.prototype.getLightsColors = function(){
    var Colors = [];

    for (var i = 0; this.lights[i]; ++i){
        Colors.push(lights[i].color);
    }
    return Colors;
};

Root.prototype.getLightsIntensities = function(){
    var Intensities = [];

    for (var i = 0; this.lights[i]; ++i){
        Intensities.push(lights[i].intensity);
    }
    return Intensities;
};

Root.prototype.getAmbientColor = function(){
    return this.ambientColor;
};

Root.prototype.getDirectionalColor = function(){
    return this.directionalColor;
};

Root.prototype.getLightingDirection = function(){
    return this.lightingDirection;
};

Root.prototype.getDepthTexture = function(){
    return this.depthTexture;
};
Root.prototype.getMousePosition = function(){
    return this.mousePosition;
};
Root.prototype.getHasClick = function(){
    return this.hasClick;
};
Root.prototype.setHasClick = function(click){
    this.hasClick = click;
};

Root.prototype.setMousePosition = function(event){
    this.mousePosition.x = event.pageX;
    this.mousePosition.y = event.pageY;
	this.hasClick = true;
}