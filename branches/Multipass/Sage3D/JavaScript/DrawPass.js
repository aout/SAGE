if (gIncludedFiles == undefined)
 alert("You must include this file");
gIncludedFiles.push("DrawPass.js");

/**
 * DrawPass Class
 * @param {String} name
 * @param {Int} order
 * @param {Enum} renderTarget
 */

DrawPass = function(name, order, renderTarget){
    // Quick access to Context
    this.root = Root.getInstance();
    this.webGL = this.root.getWebGL();
    this.renderer = this.root.getRenderer();

    // First element of the elements to be drawn
    // This is very useful if you use some sort of frustrum culling or scene clustering
    // By default, equals rootTransform (will try to draw all the elements)
    this.RenderTreeRoot = this.root.rootTransform;

    // The current element in the render loop
    this.currentElement = undefined;
    
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
    if (renderTarget == undefined){
        this.target = DrawPass.TargetTypeEnum.DRAWPASS_TARGET_SCREEN;
    }
    else{
        this.target = renderTarget;
    }

    // Draw Pass Buffers
    this.frameBuffer = undefined;
    this.renderBuffer = undefined;
    this.textureBuffer = undefined;

    // If True the next element won't be drawn
    this.skipElement = false;

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
    // Bind Buffers
    this.bindBuffers();
    // Callback
    this.callbacks.executeCallbacks('DRAWPASS_HOOK_ONSTART', elapsedTime);

    // Rendering Stuff
    var root = this.RenderTreeRoot;
    var prev = null;
    var actual = this.RenderTreeRoot;
    var next = null;

    // Render Loop
    while (actual){
        // Set currentElement
        this.currentElement = actual;
        if (!prev || actual != prev.parent){
            // Callback
            this.callbacks.executeCallbacks('DRAWPASS_HOOK_ONELEMENTRENDERSTART', elapsedTime);
            // Element Render
            if (!this.skipElement){
                actual.render();
            }
            this.skipNextElement = false;
            // Callback
            this.callbacks.executeCallbacks('DRAWPASS_HOOK_ONELEMENTRENDEREND', elapsedTime);
        }
        next = actual.nextChild();
        if (!next){
            if (prev != null && actual == prev.parent){
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
    // Unbind Buffers
    this.unbindBuffers();
}

DrawPass.prototype.skipElement = function(){
    this.skipElement = true;
};

DrawPass.prototype.drawElement = function(){
    this.skipElement = false;
};

// Checks Draw Pass Validity
DrawPass.prototype.validate = function(){
    this.isValid = true;
    return this.isValid;
};

// Sets Standard Buffers of the draw pass
DrawPass.prototype.setDefaultBuffers = function(){
    var GL = this.webGL;
    if (this.target == DrawPass.TargetTypeEnum.DRAWPASS_TARGET_TEXTURE){
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

    if (drawPass.target == DrawPass.TargetTypeEnum.DRAWPASS_TARGET_TEXTURE){
        GL.bindFramebuffer(GL.FRAMEBUFFER, drawPass.frameBuffer);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, drawPass.textureBuffer, 0);
        GL.bindRenderbuffer(GL.RENDERBUFFER, drawPass.renderBuffer);
        GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, drawPass.renderBuffer);
    }
    else if (drawPass.target == DrawPass.TargetTypeEnum.DRAWPASS_TARGET_SCREEN){
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    }
};

// Unbinds buffers once the pass has been rendered
// CAREFUL : YOU LOSE THE SCOPE IF RAISED BY A CALLBACK
DrawPass.prototype.unbindBuffers = function(){
    // Get back the scope
    var drawPass = Root.getInstance().getRenderer().getCurrentDrawPass();
    var GL = drawPass.webGL;

    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.bindRenderbuffer(GL.RENDERBUFFER, null);
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
}

// Generates a default light pass for a single light
DrawPass.prototype.generateLightPass = function(){

    };

// Generates a default depth pass for picking(Z-Buffer)
DrawPass.prototype.generateDepthPass = function(){
    this.setDefaultBuffers();
    this.program = new Program("Picking", "Resources/Shaders/picking/picking.vs", "Resources/Shaders/picking/picking.fs", null);
    
    // Disable the draw pass since we didn't want to pick yet
    this.isEnabled = false;
    
    // Set up a placeholders
    this.originalColor = new Uint8Array(4);
    this.mouseClickPos = {
        x: undefined,
        y: undefined
    }

    
    var saveColor = function() {
      var root = Root.getInstance();
      var drawPass = root.getRenderer().getPickingPass();
      var GL = root.webGL;
      
      drawPass.renderer.pickingFinished = false;
      drawPass.renderer.pickedElement = undefined;
      
      // Clear the viewport to get a fresh start
      GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
      GL.readPixels(drawPass.mouseClickPos.x, drawPass.mouseClickPos.y, 1, 1, GL.RGBA, GL.UNSIGNED_BYTE, drawPass.originalColor)
      }
    
    var checkPickability = function() {
      var root = Root.getInstance();
      var drawPass = root.getRenderer().getPickingPass();
      
      if (drawPass.currentElement.isPickable == false) {
        drawPass.skipElement();
      }
    }
    
    var checkColor = function() {
      var root = Root.getInstance();
      var drawPass = root.getRenderer().getPickingPass();
      var GL = drawPass.webGL;
      
      var color = new Uint8Array(4);
      GL.readPixels(drawPass.mouseClickPos.x, drawPass.mouseClickPos.y, 1, 1, GL.RGBA, GL.UNSIGNED_BYTE, color);
      if (!compareColors(color, drawPass.originalColor)) {
        drawPass.originalColor = color;
        drawPass.renderer.pickedElement = drawPass.currentElement;
      }
    }
    
    var raisePickingEnd = function() {
      var root = Root.getInstance();
      var drawPass = root.getRenderer().getPickingPass();
      drawPass.renderer.pickingFinished = true;
    }
    
    var compareColors = function(color, originalColor) {
      for (var i = 0; color[i] && originalColor[i]; ++i) {
        if (color[i] != originalColor[i]) {
          return false;
        }
      }
      return true
    }
    
    // Add a callback to save the original color
    this.callbacks.addCallback('SAVE_COLOR', saveColor, 'DRAWPASS_HOOK_ONSTART');
    
    // Add a callback to skip non-pickable elements
    this.callbacks.addCallback('CHECK_PICKABILITY', checkPickability, 'DRAWPASS_HOOK_ONELEMENTRENDERSTART');
    
    // Add the callback for each elements
    // check if the original color has changed
    this.callbacks.addCallback('CHECK_COLOR', checkColor, 'DRAWPASS_HOOK_ONELEMENTRENDEREND');
    
    // Add a callback to the end of the pass to raise the picked element
    // and disable the picking pass
    this.callbacks.addCallback('RAISE_PICKED_ELEMENT', raisePickingEnd, 'DRAWPASS_HOOK_ONEND');
    
    this.validate();
};


// Generates a final beauty pass
DrawPass.prototype.generateBeautyPass = function(){
    this.setDefaultBuffers();
    this.program = this.root.getDefaultProgram();
    this.validate();
};
