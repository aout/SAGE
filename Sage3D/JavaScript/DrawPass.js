if (gIncludedFiles == undefined)
 alert("You must include this file");
gIncludedFiles.push("DrawPass.js");

/**
 * DrawPass Class
 * @param {String} name
 * @param {Int} order
 */

DrawPass = function(name, order){
    // Quick access to GL Context
    this.webGL = Root.getInstance().getWebGL();

    // First element of the elements to be drawn
    // This is very useful if you use some sort of frustrum culling or scene clustering
    // By default, equals rootTransform (will try to draw all the elements)
    this.RenderTreeRoot = Root.getInstance().rootTransform;

    // Name of the draw pass
    this.name = name;

    // Draw Pass location in the DrawPasses Array
    this.order = order;

    this.isEnabled = true;
    this.isValid = false;

    // Shaders to use
    this.program = undefined;
    
    // Shader Attributes
    this.attributes = undefined;

    // Must be SCREEN or TEXTURE
    this.target = DrawPass.TargetTypeEnum.DRAWPASS_TARGET_SCREEN;

    // Draw Pass Buffers
    this.frameBuffer = undefined;
    this.renderBuffer = undefined;
    this.textureBuffer = undefined;


    // Function Callbacks
    this.callbacks = new CallbackHooks(DrawPass.Hooks);
};

// Draw Pass Type Enum
DrawPass.TargetTypeEnum = {
    DRAWPASS_TARGET_SCREEN: 0,
    DRAWPASS_TARGET_TEXTURE: 1
};

// Draw Pass Hooks
DrawPass.Hooks = {
  DRAWPASS_HOOK_ONSTART: 2,
  DRAWPASS_HOOK_ONEND: 2,
  DRAWPASS_HOOK_ONELEMENTRENDERSTART: 1,
  DRAWPASS_HOOK_ONELEMENTRENDEREND: 1
};

// Draw !
DrawPass.prototype.draw = function(elapsedTime){
    // Callback
    this.callbacks.executeCallbacks('DRAWPASS_HOOK_ONSTART', elapsedTime);

    // Rendering Stuff
    var prev = null;
    var actual = this.RenderTreeRoot;
    var next = null;

    while (actual){
        if (!prev || actual != prev.parent){
            // Callback
            this.callbacks.executeCallbacks('DRAWPASS_HOOK_ONELEMENTRENDERSTART', elapsedTime);

            // Element Render
            actual.render();

            // Callback
            this.callbacks.executeCallbacks('DRAWPASS_HOOK_ONELEMENTRENDEREND', elapsedTime);
        }
        next = actual.nextChild();
        if (!next){
            if (actual == prev.parent){
                next = actual.parent;
            }
            else{
                next = prev;
            }
        }
        prev = actual;
        actual = next;
    }

    this.callbacks.executeCallbacks('DRAWPASS_HOOK_ONEND', elapsedTime);
}

// Checks Draw Pass Validity
DrawPass.prototype.validate = function(){
    this.isValid = true;
    return this.isValid;
};

// Sets Standard Buffers of the draw pass
DrawPass.prototype.setDefaultBuffers = function(){
    var GL = this.webGL;
    if (this.target == DrawPass.TargetTypeEnum.DRAWPASS_TEXTURE){
        // FrameBuffer
        this.frameBuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffer);
        this.frameBuffer.width = Root.getInstance().width;
        this.frameBuffer.height = Root.getInstance().height;
        
        // Texture
        this.textureBuffer = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.textureBuffer);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
        GL.generateMipmap(GL.TEXTURE_2D);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, this.frameBuffer.width, this.frameBuffer.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
    
        // RenderBuffer
        this.renderBuffer = GL.createRenderbuffer();
        GL.bindRenderbuffer(GL.RENDERBUFFER, this.renderBuffer);
        GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, this.frameBuffer.width, this.frameBuffer.height);
    
        // Then Unbind to continue
        GL.bindTexture(GL.TEXTURE_2D, null);
        GL.bindRenderbuffer(GL.RENDERBUFFER, null);
    }
        // Always Unbind the FrameBuffer to continue displaying on screen
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
};

// Binds current buffers to draw
// CAREFUL : YOU LOSE THE SCOPE IF RAISED BY A CALLBACK
DrawPass.prototype.bindBuffers = function(){
   // Get back the scope
   var drawPass = Root.getInstance().getRenderer().getCurrentDrawPass();
   var GL = drawPass.webGL;
   
    if (drawPass.target == DrawPass.TargetTypeEnum.DRAWPASS_TEXTURE){
        GL.bindFramebuffer(GL.FRAMEBUFFER, drawPass.frameBuffer);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, drawPass.textureBuffer, 0);
        GL.bindRenderbuffer(GL.RENDERBUFFER, drawPass.renderBuffer);
        GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, drawPass.renderBuffer);
    }
    else if (drawPass.target == DrawPass.TargetTypeEnum.DRAWPASS_TARGET_SCREEN) {
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    }
};

// Generates a default light pass for a single light
DrawPass.prototype.generateLightPass = function(){

    };

// Generates a default depth pass (Z-Buffer)
DrawPass.prototype.generateDepthPass = function(){

    };

// Generates a final beauty pass
DrawPass.prototype.generateBeautyPass = function(){
    this.setDefaultBuffers();
    this.program = Root.getInstance().renderer.getDefaultProgram();
    
    this.callbacks.addCallback('BIND_BUFFERS', this.bindBuffers, 'DRAWPASS_HOOK_ONSTART');
    this.callbacks.addCallback('USE_PROGRAM', this.program.use, 'DRAWPASS_HOOK_ONSTART');

    this.validate();
};
