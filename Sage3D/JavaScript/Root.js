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
//include("Material.js");
include("Primitives.js");
include("Program.js");
include("ResourceManager.js");
include("Texture.js");
include("Transform.js");
include("Renderer.js");
include("CallbackHooks.js");

Root = function(){
    this.viewPort = undefined;
    this.webGL = undefined;
    this.status = Root.StatusEnum.ROOT_NONE;
    this.version = "SAGE V0.6 Alpha 3";
    
    this.modules = {};
    
    this.renderer = undefined;
    this.clearColor = {
        R : 1,
        G : 1,
        B : 1,
        A : 1
      }
    
    this.callbacks = new CallbackHooks(Root.HookEnum);
    
    this.projectionMatrix = mat4.create();
    mat4.identity(this.projectionMatrix);
    this.defaultProgram = undefined;
    this.rootTransform = undefined;
    this.camera = undefined;

    this.width = null;
    this.height = null;

    this.maxFps = 60;
    this.actualFps = 0.0;
    this.lastRender = undefined;
    this.canDraw = undefined;
    this.drawLoop = undefined;

    // GOING AWAY IN THE NEXT RELEASE
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

Root.HookEnum = {
    ROOT_HOOK_ONRENDERSTART: 4,
    ROOT_HOOK_ONRENDEREND: 4
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
    if (clearColor != undefined) {
      this.clearColor = clearColor;
    }
    this.webGL.clearColor(this.clearColor.R, this.clearColor.G, this.clearColor.B, this.clearColor.A);

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

    // Set status to LOADED
    this.status = Root.StatusEnum.ROOT_LOADED;

    //WebGL	initialization!
    //default shader
    this.renderer = new Renderer();
    this.renderer.setDefaultBeautyPass();
    this.canDraw = true;
    
    this.lastRender = new Date().getTime();
    
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

// Starts the Render Loop
Root.prototype.startRendering = function(){
    var TimePerFrame = 1000 / this.maxFps;
    this.drawLoop = setInterval(this.draw, TimePerFrame);
    // Set status to RUNNING
    this.status = Root.StatusEnum.ROOT_RUNNING;
};

// Stops the Render Loop
Root.prototype.stopRendering = function() {
  clearInterval(this.drawLoop);
  // Set status to STOPPED
    this.status = Root.StatusEnum.ROOT_STOPPED;
};

// Pauses the Render Loop
// This means the Loop will still run but not draw
Root.prototype.pauseRendering = function() {
  this.status = Root.StatusEnum.ROOT_PAUSED;
};

// Let the rendering continue
Root.prototype.continueRendering = function() {
  this.status = Root.StatusEnum.ROOT_RUNNING;
};

// 

/**
 * Render Loop (draw)
 * @param {Function} callbacks Callback function to be executed
 * @param {Time} elapsedTime Time (ms) passed between two frames
 */
Root.prototype.draw = function(){
    // Get back the scope because setInterval causes us to lose it
    var root = Root.getInstance();
    
    // Avoid launching a last and single render if not RUNNING
    if (root.status == Root.StatusEnum.ROOT_RUNNING) {
    
    // Avoid multiple asynchronous calls
    if (!root.canDraw){
        return;
    }
    root.canDraw = false;
    
    // Calculate Elapsed Time since Last Render
    var elapsedTime = new Date().getTime() - root.lastRender;
    if (elapsedTime == 0) {
      elapsedTime = 1;
    }
    // Calculate actual FPS
    root.actualFps = 1000 / elapsedTime;
    
    // Clear screen for a fresh start
    root.webGL.clear(root.webGL.COLOR_BUFFER_BIT | root.webGL.DEPTH_BUFFER_BIT);
    
    // Start Callback
    root.callbacks.executeCallbacks('ROOT_HOOK_ONRENDERSTART', elapsedTime);
    
    // Update the Camera before Render
    root.camera.update();

    // Here we call the Renderer which handle advanced rendering techniques
    root.renderer.render(elapsedTime);

    // End Callback
    root.callbacks.executeCallbacks('ROOT_HOOK_ONRENDEREND', elapsedTime);

    // Save Timestamp for next render
    root.lastRender = new Date().getTime();
    root.canDraw = true;
    }
};

// Returns current FPS
Root.prototype.getFps = function(){
    return Math.round(Root.getInstance().actualFps);
};

// Registers a new module so it can be accessed easily inside the engine
// Returns the added module or null if fails
Root.prototype.registerModule = function(name, toAddModule) {
  var addedModule = null;
  if (this.modules.hasOwnProperty(name) == false) {
    this.modules[name] = {};
    this.modules[name].module = toAddModule;
  }
  addedModule = this.modules[name].module;
  return addedModule;
};

// Unregisters a particular module from the module list and returns it
Root.prototype.unregisterModule = function(name) {
  var module = null;
  if (this.modules.hasOwnProperty(name)) {
    module = this.modules[name].module;
    this.modules[name].module = null;
    this.modules[name]= null;
  }
  else {
    return module;
  }
};

// Return a particular module from the module list or null if fails
Root.prototype.getModule = function(name) {
  if (this.modules.hasOwnProperty(name)) {
    return this.modules[name].module;
  }
  else {
    return null;
  }
};

/**
 * 
 * THIS IS GOING AWAY IN THE NEXT BUILD
 * 
 */


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