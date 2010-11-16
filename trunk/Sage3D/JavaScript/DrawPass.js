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
    this.fragmentShader = null;
    this.vertexShader = null;

    // Shader Attributes
    this.attributes = [];

    // Must be SCREEN or TEXTURE
    this.target = DrawPass.TargetTypeEnum.DRAWPASS_TARGET_SCREEN;

    // Draw Pass Buffers
    this.frameBuffer = null;
    this.renderBuffer = null
    this.textureBuffer = null;


    // Function Callbacks
    this.onStart = null;
    this.onElementRenderStart = null;
    this.onElementRenderEnd = null;
    this.onEnd = null;
}

DrawPass.TargetTypeEnum = {
    DRAWPASS_TARGET_SCREEN: 0,
    DRAWPASS_TARGET_TEXTURE: 1
};

// Draw !
DrawPass.prototype.draw = function(){
    this.onStart();

    // Rendering Stuff
    var prev = null;
    var actual = root.rootTransform;
    var next = null;

    while (actual){
        if (!prev || actual != prev.parent){
            // Callback
            this.onElementRenderStart();

            // Element Render
            actual.render();

            // Callback
            tthis.onElementRenderEnd();
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

    this.onEnd();
}

// Checks Draw Pass Validity
DrawPass.prototype.Validate = function(){
    this.isValid = true;
    return this.isValid;
};

// Sets Standard Buffers of the draw pass
DrawPass.prototype.setDefaultBuffers = function(){
    var GL = this.webGL;

    this.frameBuffer = GL.createFrameBuffer();
    GL.bindFrameBuffer(GL.FRAMEBUFFER, this.frameBuffer);
    this.frameBuffer.width = Root.getInstance().width;
    this.frameBuffer.height = Root.getInstance().height;

    this.textureBuffer = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.textParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
    GL.generateMipmap(GL.TEXTURE_2D);
    GL.textImage2D(GL.TEXTURE_2D, 0, GL.RGBA, this.frameBuffer.width, this.frameBuffer.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);

    this.renderBuffer = GL.createRenderBuffer();
    GL.bindRenderBuffer(GL.RENDERBUFFER, this.renderBuffer);
    GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, this.frameBuffer.width, this.frameBuffer.height);

    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.bindRenderBuffer(GL.RENDERBUFFER, null);
    GL.bindFrameBuffer(GL.FRAMEBUFFER, 0);
};

// Binds current buffers to draw
DrawPass.prototype.bindBuffers = function(){
    var GL = this.webGL;

    GL.bindFrameBuffer(GL.FRAMEBUFFER, this.frameBuffer);
    GL.bindRenderBuffer(GL.RENDERBUFFER, this.renderBuffer);
    if (this.target == DrawPass.TargetTypeEnum.DRAWPASS_TEXTURE){
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.textureBuffer, 0);
    }
    GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer);
};

// Generates a default light pass for a single light
DrawPass.prototype.generateLightPass = function(){

    };

// Generates a default depth pass (Z-Buffer)
DrawPass.prototype.generateDepthPass = function(){

    };

// Generates a final beauty pass
DrawPass.prototype.generateBeautyPass = function(){

    };
