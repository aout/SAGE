if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Texture.js");

Texture = function () {

	this.webGL = Root.getInstance().getWebGL();

	this.unitTexture = undefined;
	this.glTexture = undefined;
	this.image = undefined;
	this.status = Texture.StatusEnum.TEXTURE_NONE;
	this.error = "no error";
}

Texture.StatusEnum = {
		TEXTURE_NONE: 0,
		TEXTURE_LOADING: 1,
		TEXTURE_BINDING: 2,
		TEXTURE_READY: 3,
		TEXTURE_ERROR: 4	
};

//public methods
Texture.prototype.load = function(unitTexture, url) {
	if (unitTexture < 0 || unitTexture > 31) {
		this.status = Texture.StatusEnum.TEXTURE_ERROR;
		this.error = "Bad unit texture";
		return this.status;
	}
	this.status = Texture.StatusEnum.TEXTURE_LOADING;
	this.unitTexture = unitTexture;
	var self = this;
	
	this.image = new Image();
	this.image.onload = function() {
		self.status = Texture.StatusEnum.TEXTURE_BINDING;
		self.glTexture = self.webGL.createTexture();
		self.webGL.activeTexture(self.unitTexture + self.webGL.TEXTURE0);
		self.webGL.bindTexture(self.webGL.TEXTURE_2D, self.glTexture);
		self.webGL.texImage2D(self.webGL.TEXTURE_2D, 0, self.image, true);
	    self.webGL.texParameteri(self.webGL.TEXTURE_2D, self.webGL.TEXTURE_MAG_FILTER, self.webGL.LINEAR);
	    self.webGL.texParameteri(self.webGL.TEXTURE_2D, self.webGL.TEXTURE_MIN_FILTER, self.webGL.LINEAR_MIPMAP_NEAREST);
	    self.webGL.generateMipmap(self.webGL.TEXTURE_2D);
		self.status = Texture.StatusEnum.TEXTURE_READY;
	};
	this.image.src = url;
	return this.status;
}

Texture.prototype.active = function(shaderProgram) {
	if (this.status != Texture.StatusEnum.TEXTURE_READY)
		return this.status;
	if (shaderProgram == undefined)
		shaderProgram = Root.getInstance().getDefaultProgram();
	shaderProgram.use();
	this.webGL.activeTexture(this.unitTexture + this.webGL.TEXTURE0);
	this.webGL.bindTexture(this.webGL.TEXTURE_2D, this.glTexture);
	shaderProgram.setUniforms({	name: "uSampler",
		 						type: "1i",
		 						value: this.unitTexture - this.webGL.TEXTURE0	});
}
