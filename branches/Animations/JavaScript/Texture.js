if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Texture.js");

/**
 * Texture Class
 * @param {String} name Name
 * @param {Int} unitTexture
 * @param {String} url
 * @param {Function} callback
 */
Texture = function(name) {

	this.webGL = Root.getInstance().getWebGL();

	this.name = name;

	this.status = Texture.StatusEnum.TEXTURE_NONE;
	this.error = "no error";

	this.unitTexture = undefined;
	this.glTexture = undefined;
	this.image = undefined;

  	this.minFilter = undefined;
  	this.magFilter = undefined;
};

/**
 * Texture Status
 */
Texture.StatusEnum = {
		TEXTURE_NONE: 0,
		TEXTURE_LOADING: 1,
		TEXTURE_BINDING: 2,
		TEXTURE_READY: 3,
		TEXTURE_ERROR: 4
};

/**
 * Texture destructor
 */
Texture.prototype.destroy = function() {
	this.status = TEXTURE_NONE;
	this.webGL.deleteTexture(this.glTexture);
	delete this.image;
};


/**
 * Load a texture from url
 * @param {Int} unitTexture
 * @param {String} url
 * @param {Function} callback
 */
Texture.prototype.load = function(unitTexture, url, callback, minfilter, magfilter) {
	if (unitTexture < 0 || unitTexture > 8) {
		this.status = Texture.StatusEnum.TEXTURE_ERROR;
		this.error = "Bad unit texture";
		return this.status;
	}
	this.status = Texture.StatusEnum.TEXTURE_LOADING;
	switch (minfilter) {
	  case 'NEAREST':                this.minFilter = this.webGL.NEAREST;                break;
	  case 'LINEAR':                 this.minFilter = this.webGL.LINEAR;                 break;
	  case 'LINEAR_MIPMAP_NEAREST':  this.minFilter = this.webGL.LINEAR_MIPMAP_NEAREST;  break;
	  case 'NEAREST_MIPMAP_NEAREST': this.minFilter = this.webGL.NEAREST_MIPMAP_NEAREST; break;
	  case 'NEAREST_MIPMAP_LINEAR':  this.minFilter = this.webGL.NEAREST_MIPMAP_LINEAR;  break;
	  case 'LINEAR_MIPMAP_LINEAR':   this.minFilter = this.webGL.LINEAR_MIPMAP_LINEAR;   break;
	  default:                       this.minFilter = this.webGL.NEAREST;                break;
	}
  switch (magfilter) {
    case 'NEAREST':                this.magFilter = this.webGL.NEAREST;                break;
    case 'LINEAR':                 this.magFilter = this.webGL.LINEAR;                 break;
    default:                       this.magFilter = this.webGL.LINEAR;                 break;
  }
	this.unitTexture = unitTexture;
	var self = this;
	
	this.image = new Image();
	this.image.onerror = function() {
		self.status = Texture.StatusEnum.TEXTURE_ERROR;
		delete self.image;
    if (callback != undefined) {
      callback(self);
    }
	};
	this.image.onload = function() {
		self.status = Texture.StatusEnum.TEXTURE_BINDING;
		self.glTexture = self.webGL.createTexture();
		self.webGL.activeTexture(self.unitTexture + self.webGL.TEXTURE0);
		self.webGL.bindTexture(self.webGL.TEXTURE_2D, self.glTexture);
		self.webGL.pixelStorei(self.webGL.UNPACK_FLIP_Y_WEBGL, true);
		self.webGL.texImage2D(self.webGL.TEXTURE_2D, 0, self.webGL.RGBA, self.webGL.RGBA, self.webGL.UNSIGNED_BYTE, self.image);
	  self.webGL.texParameteri(self.webGL.TEXTURE_2D, self.webGL.TEXTURE_MAG_FILTER, self.magFilter);
	  self.webGL.texParameteri(self.webGL.TEXTURE_2D, self.webGL.TEXTURE_MIN_FILTER, self.minFilter);
	  if (self.minFilter == self.webGL.NEAREST_MIPMAP_NEAREST || self.minFilter == self.webGL.LINEAR_MIPMAP_NEAREST ||
	    self.minFilter == self.webGL.NEAREST_MIPMAP_LINEAR || self.minFilter == self.webGL.LINEAR_MIPMAP_LINEAR)
	   self.webGL.generateMipmap(self.webGL.TEXTURE_2D);
		self.status = Texture.StatusEnum.TEXTURE_READY;
		delete self.image;
		if (callback != undefined) {
			callback(self);
		}
	};
	this.image.src = url;
	return this.status;
};

/**
 * Active the texture
 * @param {Program} shaderProgram
 */
Texture.prototype.active = function(shaderProgram) {
	if (this.status != Texture.StatusEnum.TEXTURE_READY)
		return this.status;
	if (shaderProgram == undefined)
		shaderProgram = Root.getInstance().getCurrentProgram();
	shaderProgram.use();
	this.webGL.activeTexture(this.unitTexture + this.webGL.TEXTURE0);
	this.webGL.bindTexture(this.webGL.TEXTURE_2D, this.glTexture);
	shaderProgram.setUniforms([{	name: "uSampler" + this.unitTexture,
		 							              type: "1i",
		 							              value: this.unitTexture
		 							           }]);
};
