if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Material.js");

/**
 * Material Class
 * @param {String} name Name
 */
Material = function(name) {

	this.webGL = Root.getInstance().getWebGL();

	this.name = name;

	this.status = Material.StatusEnum.MATERIAL_NONE;
	this.error = "no error";

  this.components = {
    emission   : undefined,
    ambient    : undefined,
    diffuse    : undefined,
    specular   : undefined,
    shininess  : undefined        
  };
};

/**
 * Material Status
 */
Material.StatusEnum = {
		MATERIAL_NONE			: 0,
		MATERIAL_LOADING	: 1,
		MATERIAL_READY		: 2,
		MATERIAL_ERROR		: 3
};

Material.prototype.load = function(emission, ambient, diffuse, specular, shininess) {
  this.status = Material.StatusEnum.MATERIAL_LOADING;
  var textureUnit = 0;
  var nameArray = ['emission', 'ambient', 'diffuse', 'specular', 'shininess'];
  for (var i = 0; i < nameArray.length; ++i) {
    if (!arguments[i]) {
      continue;
    }
    if (Array.isArray(arguments[i])) {
      this.components[nameArray[i]] = new this.webGL.Float32Array(arguments[i]);
    } else if (name in arguments[i] && url in arguments[i] && minFilter in arguments[i] && magFilter in arguments[i]) {
      var self = this;
      this.components[nameArray[i]] = new Texture(arguments[i].name);
      this.components[nameArray[i]].load(textureUnit++, arguments[i].url,
        function(texture) {
          if (self.status == Material.StatusEnum.MATERIAL_ERROR) {
            return;
          }
          if (texture.status == Texture.StatusEnum.TEXTURE_ERROR) {
            self.status = Material.StatusEnum.MATERIAL_ERROR;
           
            var debug = document.evaluate('//div[@id="debugDiv"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            debug.innerHTML += '<span class="error">Material '+ self.name + ': creation failed</span><br />';
            return;
          }
          var ready = true;
          for (var comp in self.components) {
            if (self.components[comp] instanceof Texture && self.components[comp].status != Texture.StatusEnum.TEXTURE_READY) {
              ready = false;
              break;
            }
          }
          if (ready) {
            self.status = Material.StatusEnum.MATERIAL_READY;
            var debug = document.evaluate('//div[@id="debugDiv"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            debug.innerHTML += '<span class="success">Material '+ self.name + ' created successfuly</span><br />';
          }
        }, arguments[i].minFilter, arguments[i].magFilter);    
    }
  }
};

Material.prototype.load = function(colladaShadedSurface) {
  this.status = Material.StatusEnum.MATERIAL_LOADING;
	var textureUnit = 0;
	for (var item in colladaShadedSurface.components) {
	  if (item in this.components) {
	    if (colladaShadedSurface.components[item] instanceof ColladaLoader_Sampler2D) {
	      var sampler = colladaShadedSurface.components[item];
	      var image = sampler.surface.image;
	      var self = this;
	      this.components[item] = new Texture(image.attributes.id);
	      this.components[item].load(textureUnit++, image.imageSrc,
	        function(texture) {
	          if (self.status == Material.StatusEnum.MATERIAL_ERROR) {
	            return;
	          }
  	        if (texture.status == Texture.StatusEnum.TEXTURE_ERROR) {
  	          self.status = Material.StatusEnum.MATERIAL_ERROR;
             
              var debug = document.evaluate('//div[@id="debugDiv"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
              debug.innerHTML += '<span class="error">Material '+ self.name + ': creation failed</span><br />';
  	          return;
  	        }
  	        var ready = true;
  	        for (var comp in self.components) {
  	          if (self.components[comp] instanceof Texture && self.components[comp].status != Texture.StatusEnum.TEXTURE_READY) {
  	            ready = false;
  	            break;
  	          }
  	        }
  	        if (ready) {
  	          self.status = Material.StatusEnum.MATERIAL_READY;
  	          var debug = document.evaluate('//div[@id="debugDiv"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  	          debug.innerHTML += '<span class="success">Material '+ self.name + ' created successfuly</span><br />';
  	        }
  	      }, sampler.minFilter, sampler.magFilter);
	    } else {
	     this.components[item] = colladaShadedSurface.components[item];
	    }
	  }
	}
};


Material.prototype.active = function(shaderProgram) {
};
