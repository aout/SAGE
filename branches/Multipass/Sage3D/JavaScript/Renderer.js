if (gIncludedFiles == undefined)
 alert("You must include this file");
gIncludedFiles.push("Renderer.js");

include("DrawPass.js");
include("CallbackHooks.js");

/**
 * Renderer Class
 */
Renderer = function(){
    // Quick access to GL Context
    this.root = Root.getInstance();
    this.webGL = this.root.getWebGL();

    // Render Mode
    this.renderMode = Renderer.RenderModeEnum.RENDERER_FORWARD;

    // Advanced Rendering Techniques
    this.multipassRendering = true;
    this.dynamicLightRange = false;

    // Picking Variables
    this.picking = false;
    this.pickingPass = undefined;
    this.pickedElement = undefined;
    this.pickingFinished = false;
    
    this.defaultProgram = new Program("Default", "Resources/Shaders/default/default.vs", "Resources/Shaders/default/default.fs", null);
    this.currentProgram = this.defaultProgram;

    this.currentDrawpass = undefined;

    // Array of draw passes, most likely to be performance passes (depth, lights, picking...)
    this.drawPasses = [];

    // Last draw pass, commonly called beauty pass due to its complexity
    this.beautyPass = undefined;

    //Callbacks
    this.callbacks = new CallbackHooks(Renderer.HookEnum)

    // Lights's relative constants
    this.MAX_LIGHTS = 50;
    this.MAX_ACTIVE_LIGHTS = 4;
    this.MAX_ACTIVE_PER_PIXEL_LIGHTS = 4;
    this.MAX_ACTIVE_PER_VERTEX_LIGHTS = 4;

    // Lights's relative arrays
    this.lights = [];
    this.activeLights = [];
    this.activePerPixelLights = [];
    this.activePerVertexLights = [];

};

// Renderer Modes Enum
Renderer.RenderModeEnum = {
    RENDERER_FORWARD: 0,
    RENDERER_DEFFERED: 1
};

// Renderer Hooks Enum
Renderer.HookEnum = {
    RENDERER_HOOK_ONRENDERSTART: 1,
    RENDERER_HOOK_ONRENDEREND: 1,
    RENDERER_HOOK_ONDRAWPASSSTART: 1,
    RENDERER_HOOK_ONDRAWPASSEND: 1,
    RENDERER_HOOK_ONBEAUTYPASSSTART: 1,
    RENDERER_HOOK_ONBEAUTYPASSEND: 1
};

// Iterates through draw passes then uses the beauty pass
Renderer.prototype.render = function(elapsedTime){
    // Callback
    this.callbacks.executeCallbacks('RENDERER_HOOK_ONRENDERSTART', elapsedTime);

    // Use Multipass only in Forward Rendering Mode
    if (this.renderMode == Renderer.RenderModeEnum.RENDERER_FORWARD){
        /**
         * IF DYNAMIC LIGHT RANGE IS ENABLED:
         * Here goes the distance calculations to determine which lights will be activated
         * 4 closest lights are per-pixel lights
         * 4 other lights are vertex-lit
         * the rest might be used in a Spherical Harmonic (that will most likely never be implemented)
         */

        //Performance passes
        if (this.isMultipassRenderingEnabled){
            for (var i = 0; i < this.drawPasses.length; ++i){
                if (this.drawPasses[i].isEnabled){
                    // Set Current Draw Pass for out-of-scope calls
                    this.currentDrawpass = this.drawPasses[i];

                    // Set Program to use
                    this.setCurrentProgram(this.drawPasses[i].program);

                    // Callback
                    this.callbacks.executeCallbacks('RENDERER_HOOK_ONDRAWPASSSTART', elapsedTime);

                    // Draw Pass Render
                    this.drawPasses[i].draw(elapsedTime);

                    // Callback
                    this.callbacks.executeCallbacks('RENDERER_HOOK_ONDRAWPASSEND', elapsedTime);
                }
            }
        }
        // Set Program to use
        this.setCurrentProgram(this.beautyPass.program);
        // Set Current Draw Pass for out-of-scope calls
        this.currentDrawpass = this.beautyPass;

        // Callback
        this.callbacks.executeCallbacks('RENDERER_HOOK_ONBEAUTYPASSSTART', elapsedTime);

        // Beauty Pass
        this.beautyPass.draw(elapsedTime);

        // Callback
        this.callbacks.executeCallbacks('RENDERER_HOOK_ONBEAUTYPASSEND', elapsedTime);
    }

    // Callback
    this.callbacks.executeCallbacks('RENDERER_HOOK_ONRENDEREND', elapsedTime);
};

// Generates and sets a default beauty pass
Renderer.prototype.setDefaultBeautyPass = function(){
    var pass = new DrawPass("BEAUTY_PASS", 0, DrawPass.TargetTypeEnum.DRAWPASS_TARGET_SCREEN);
    pass.generateBeautyPass();
    this.beautyPass = pass;
};

// Sets Current Program and Uses it
Renderer.prototype.setCurrentProgram = function(program){
    this.currentProgram = program;
    this.currentProgram.use();
};

// Returns Default Program
Renderer.prototype.getDefaultProgram = function(){
    return this.defaultProgram;
};

// Returns currently in use program
Renderer.prototype.getCurrentProgram = function(){
    return this.currentProgram;
};

// Returns currently in use draw pass
Renderer.prototype.getCurrentDrawPass = function(){
    return this.currentDrawpass;
};

// Returns pickingPass
Renderer.prototype.getPickingPass = function() {
    return this.pickingPass;
};

// Checks availability of multipass rendering
Renderer.prototype.isMultipassRenderingEnabled = function(){
    if (this.multipassRendering == true){
        return true;
    }
    else{
        return false;
    }
};

// Checks if DLR is enabled
Renderer.prototype.isDynamicLightRangeEnabled = function(){
    if (this.dynamicLightRange == true){
        return true;
    }
    else{
        return false;
    }
};

// Checks if Picking is enabled
Renderer.prototype.isPickingEnabled = function(){
    if (this.picking == true){
        return true;
    }
    else{
        return false;
    }
};

// Enables the usage of multiple draw passes to render a scene
Renderer.prototype.enableMultipassRendering = function(){
    this.multipassRendering = true;
};

// Disables the usage of multiple draw passes (only uses beauty pass)
Renderer.prototype.disableMultipassRendering = function(){
    this.multipassRendering = false;
};

// Adds a previously set generated draw pass to the render process
Renderer.prototype.addDrawPass = function(drawPass){
    if (drawPass.isValid){
        if (drawPass.order < this.drawPasses.length){
            this.drawPasses.splice(drawPass.order, 0, drawPass);
            return true;
        }
        else if (drawPass.order == this.drawPasses.length){
            this.drawPasses.push(drawPass);
            return true;
        }
    }
    else{
        return false;
    }
};

// Removes a draw pass from the render process
// You can also use the DrawPass's name
Renderer.prototype.removeDrawPass = function(order){
    if (order instanceof String){
        for (var i = 0; i < this.drawPasses.length; ++i){
            if (this.drawPasses[i].name == order){
                return this.drawPasses.splice(i, 1);
            }
        }
    }
    else if (this.drawPasses.lenght >= order){
        return this.drawPasses.splice(order, 1);
    }
    return null;
};

// Disables a draw pass from the render process
// You can also use the DrawPass's name
Renderer.prototype.disableDrawPass = function(order){
    if (order instanceof String){
        for (var i = 0; i < this.drawPasses.length; ++i){
            if (this.drawPasses[i].name == order){
                this.drawPasses[order].isEnabled = false;
                return true;
            }
        }
    }
    if (this.drawPasses.lenght >= order){
        this.drawPasses[order].isEnabled = false;
        return true;
    }
    return false;
};

// Enables a previously disabled draw pass
// You can also use the DrawPass's name
Renderer.prototype.enableDrawPass = function(order){
    if (order instanceof String){
        for (var i = 0; i < this.drawPasses.length; ++i){
            if (this.drawPasses[i].name == order){
                this.drawPasses[order].isEnabled = true;
                return true;
            }
        }
    }
    if (this.drawPasses.lenght >= order){
        this.drawPasses[order].isEnabled = true;
        return true;
    }
    return false;
};

// Adds a light to the Light List (needs to be activated to be seen)
// Returns true if the light can be added into the scene.
Renderer.prototype.addLight = function(light){
    if (this.lights.length <= this.MAX_LIGHTS){
        this.lights.push(light);
        return true;
    }
    return false;
};

// Removes a light from the light list
Renderer.prototype.removeLight = function(name){
    for (var i = 0; i < this.lights.length; ++i){
        if (this.lights[i].name == name){
            return this.lights.splice(i, 1);
        }
    }
    return null;
};

// Activates a light (meaning one draw pass may be added for this particular light if Shadow Mapping is ON)
// Return true if succesfully activated
Renderer.prototype.activateLight = function(name){
    if (this.dynamicLightRange == false){
        if (this.activeLights.length <= this.MAX_ACTIVE_LIGHTS){
            for (var i = 0; i < this.lights.length; ++i){
                if (this.lights[i].name == name){
                    this.activeLights.push(this.lights.splice(i, 1));
                    // ENABLE OR ADD LIGHTING PASS
                    return true;
                }
            }
        }
    }
    return false;
};

// Disables a previously activated light
Renderer.prototype.disableLight = function(name){
    if (this.dynamicLightRange == false){
        for (var i = 0; i < this.activeLights.length; ++i){
            if (this.activeLights[i].name == name){
                this.lights.push(this.activeLights.splice(i, 1));
                // REMOVE OR DISABLE LIGHTING PASS
                return true;
            }
        }
    }
    return false;
};

// Execute the picking procedure
// Returns picked element or null
Renderer.prototype.pick = function(x, y) {
  if (this.isPickingEnabled()) {
    var pickedElement = null;
    
    // Pause the rendering loop
    this.root.pauseRendering();
    
    // Set mouse click coordinates
    this.pickingPass.mouseClickPos.x = x;
    this.pickingPass.mouseClickPos.y = this.root.height - y;
    
    // Launch the picking drawPass
    this.pickingPass.draw();
    
    // Wait for it to finish ?
    
    // Save pickedElement
    pickedElement = this.pickedElement;
    
    // Continue rendering
    this.root.continueRendering();
    
    // Return pickedELement
    return pickedElement;
  }
};

/** HIGH LEVEL API FUNCTIONS
 *  One may not uses these if messing with custom shaders or draw passes !
 *  May Consume more resources as the complexity of the scene increases.
 */

// Enables built-in Light Rendering
// This basically changes the default shader to support multiple light sources
Renderer.prototype.enableLightRendering = function(){

    };

// Disables built-in Light Rendering
Renderer.prototype.disableLightRendering = function(){

    };


// Enables automatic calculation of the activated lights
// Based on a distance calculation between a reference node and lights
Renderer.prototype.enableDynamicLightRange = function(referenceNode){

    };


// Disables DLR
Renderer.prototype.disableDynamicLightRange = function(){

    };

// Enables built-in Shadow Mapping
// One draw pass will be used for each active light on the scene.
Renderer.prototype.enableShadowMapping = function(){

    };

// Disables built-in Shadow Mapping
Renderer.prototype.disableShadowMapping = function(){

    };

// Enables built-in Picking
Renderer.prototype.enablePicking = function(){
    var pass = new DrawPass("DEPTH_PASS", 0, DrawPass.TargetTypeEnum.DRAWPASS_TARGET_TEXTURE);
    pass.generateDepthPass();
   this.pickingPass = pass;

    if (success = true){
        this.picking = true;
    }
    else{
        this.picking = false;
    }
};

// Disables built-in Picking
Renderer.prototype.disablePicking = function(){
    this.pickingPass = undefined;
    this.picking = false;
};
