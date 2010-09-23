if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Program.js");

Program = function(name, vertexShader, fragmentShader, callback) {
	this.webGL = Root.getInstance().getWebGL();
	this.name = name;
	
	this.vertexShaderString = undefined;
	this.fragmentShaderString = undefined;
	
	this.vertexShader = undefined;
	this.fragmentShader = undefined;
	this.program = undefined;
	
	this.uniforms = undefined;
	this.attributes = undefined;
	
	this.status = Program.StatusEnum.PROGRAM_NONE;
	this.error = "No error";

	this.xhr = new XMLHttpRequest();
	
	this.status = this.load(vertexShader, fragmentShader, callback);
};

Program.StatusEnum = {
	PROGRAM_NONE 		: 0,
	PROGRAM_GETTING		: 1,
	PROGRAM_COMPILING	: 2,
	PROGRAM_READY		: 3,
	PROGRAM_USING		: 4,
	SHADER_ERROR		: 5	
};

Program.prototype.load = function(vertexShader, fragmentShader, callback) {
	if (this.status != Program.StatusEnum.PROGRAM_NONE) {
		this.status = Program.StatusEnum.PROGRAM_ERROR;
		this.error = "Load error";
		return this.status;
	}
	
	this.status = Program.StatusEnum.PROGRAM_GETTING;
	
	var self = this;
	
  this.xhr.onreadystatechange = function () {
		if (self.xhr.readyState == 4 && (self.xhr.status == 200 || self.xhr.status == 0)) {
			self.vertexShaderString = self.xhr.responseText;
		  
			self.xhr.onreadystatechange = function() {
				if (self.xhr.readyState == 4 && (self.xhr.status == 200 || self.xhr.status == 0)) {
					self.fragmentShaderString = self.xhr.responseText;
					self.compile(callback);
				}
			};
		  
      self.xhr.open("GET", fragmentShader, true);
      self.xhr.overrideMimeType("text/xml");
      self.xhr.setRequestHeader("Content-Type", "text/xml");
      try { self.xhr.send(null); }
      catch(e) { alert(e.Message); } 
		}
  };

  this.xhr.open("GET", vertexShader, true);
  this.xhr.overrideMimeType("text/xml");
  this.xhr.setRequestHeader("Content-Type", "text/xml");
  try { this.xhr.send(null); }
	catch(e) { alert(e.Message); }
	
	return this.status;
};

Program.prototype.compile = function(callback) {
	if (this.status != Program.StatusEnum.PROGRAM_GETTING){
		this.status = Program.StatusEnum.PROGRAM_ERROR;
		this.error = "Compile error";
		return this.status;
	}

	this.status = Program.StatusEnum.PROGRAM_COMPILING;
		
	this.vertexShader = this.webGL.createShader(this.webGL.VERTEX_SHADER);
	this.fragmentShader = this.webGL.createShader(this.webGL.FRAGMENT_SHADER);
	
	this.webGL.shaderSource(this.vertexShader, this.vertexShaderString);
	this.webGL.shaderSource(this.fragmentShader, this.fragmentShaderString);
	
    this.webGL.compileShader(this.vertexShader);
	this.webGL.compileShader(this.fragmentShader);
	
	if (!this.webGL.getShaderParameter(this.vertexShader, this.webGL.COMPILE_STATUS)) {
		this.status = Program.StatusEnum.PROGRAM_ERROR;
		this.error = this.webGL.getShaderInfoLog(this.vertexShader);
	}

	if (!this.webGL.getShaderParameter(this.fragmentShader, this.webGL.COMPILE_STATUS)) {
		this.status = Program.StatusEnum.PROGRAM_ERROR;
		this.error += this.webGL.getShaderInfoLog(this.fragmentShader);
	}

	if (this.status == Program.StatusEnum.PROGRAM_ERROR)
		return this.status;

	this.program = this.webGL.createProgram();
	
	this.webGL.attachShader(this.program, this.vertexShader);
	this.webGL.attachShader(this.program, this.fragmentShader);

	this.webGL.linkProgram(this.program);
    
    if (!this.webGL.getProgramParameter(this.program, this.webGL.LINK_STATUS)) {
  		this.status = Program.StatusEnum.PROGRAM_ERROR;
		this.error = this.webGL.getProgramInfoLog(this.program);
    }
	
	this.status = Program.StatusEnum.PROGRAM_READY;
	
	if (callback != undefined) {
		callback(this);
	}
};

Program.prototype.use = function() {
	if (this.status == Program.StatusEnum.PROGRAM_USING || this.status != Program.StatusEnum.PROGRAM_READY)
		return this.status;
	this.webGL.useProgram(this.program);
	this.status = Program.StatusEnum.PROGRAM_USING;
};

Program.prototype.setUniforms = function(tab) {
	if (this.status != Program.StatusEnum.PROGRAM_USING)
		return false;
	this.uniforms = tab;
	for (var i = 0; i < this.uniforms.length; ++i) {
		this.uniforms[i].id = this.webGL.getUniformLocation(this.program, this.uniforms[i].name);
		if (this.uniforms[i].id == -1)
			continue;
		switch (this.uniforms[i].numberOfElements) {
			case 1:
				switch (this.uniforms[i].type) {
				  case "Int":
				    if (this.uniforms[i].isArray === true) {
				      this.webGL.uniform1iv(this.uniforms[i].id, this.uniforms[i].value0.flatten().length, new Int32Array(this.uniforms[i].value0.flatten()));
				    }
				    else {
				      this.webGL.uniform1i(this.uniforms[i].id, this.uniforms[i].value0);
				    }
				  break;
				  case "Float":
            if (this.uniforms[i].isArray === true) {
              this.webGL.uniform1fv(this.uniforms[i].id, this.uniforms[i].value0.flatten().length, new Float32Array(this.uniforms[i].value0.flatten()));
            }
            else {
              this.webGL.uniform1f(this.uniforms[i].id, this.uniforms[i].value0);
            }
				  break;
				}
			break;
			case 2:
       switch (this.uniforms[i].type) {
          case "Int":
            if (this.uniforms[i].isArray === true) {
              this.webGL.uniform2iv(this.uniforms[i].id, this.uniforms[i].value0.flatten().length / 2, new Int32Array(this.uniforms[i].value0.flatten()));
            }
            else {
              this.webGL.uniform2i(this.uniforms[i].id, this.uniforms[i].value0, this.uniforms[i].value1);
            }
          break;
          case "Float":
            if (this.uniforms[i].isArray === true) {
              this.webGL.uniform2fv(this.uniforms[i].id, this.uniforms[i].value0.flatten().length / 2, new Float32Array(this.uniforms[i].value0.flatten()));
            }
            else if (this.uniforms[i].isMatrix === true) {
              this.webGL.uniformMatrix2fv(this.uniforms[i].id, false, new Float32Array(this.uniforms[i].value0.flatten()));
            }
            else {
              this.webGL.uniform2f(this.uniforms[i].id, this.uniforms[i].value0, this.uniforms[i].value1);
            }
          break;
        }
			break;
			case 3:
			 switch (this.uniforms[i].type) {
          case "Int":
            if (this.uniforms[i].isArray === true) {
              this.webGL.uniform3iv(this.uniforms[i].id, this.uniforms[i].value0.flatten().length / 3, new Int32Array(this.uniforms[i].value0.flatten()));
            }
            else {
              this.webGL.uniform3i(this.uniforms[i].id, this.uniforms[i].value0, this.uniforms[i].value1, this.uniforms[i].value2);
            }
          break;
          case "Float":
            if (this.uniforms[i].isArray === true) {
              this.webGL.uniform3fv(this.uniforms[i].id, this.uniforms[i].value0.flatten().length / 3, new Float32Array(this.uniforms[i].value0.flatten()));
            }
            else if (this.uniforms[i].isMatrix === true) {
              this.webGL.uniformMatrix3fv(this.uniforms[i].id, false, new Float32Array(this.uniforms[i].value0.flatten()));
            }
            else {
              var debug =  this.uniforms[i].value0;
              this.webGL.uniform3f(this.uniforms[i].id, this.uniforms[i].value0, this.uniforms[i].value1, this.uniforms[i].value2);
            }
          break;
        }
      break;
      case 4:
       switch (this.uniforms[i].type) {
          case "Int":
            if (this.uniforms[i].isArray === true) {
              this.webGL.uniform4iv(this.uniforms[i].id, this.uniforms[i].value0.flatten().length / 4, new Int32Array(this.uniforms[i].value0.flatten()));
            }
            else {
              this.webGL.uniform4i(this.uniforms[i].id, this.uniforms[i].value0, this.uniforms[i].value1, this.uniforms[i].value2, this.uniforms[i].value3);
            }
          break;
          case "Float":
            if (this.uniforms[i].isArray === true) {
              this.webGL.uniform4fv(this.uniforms[i].id, this.uniforms[i].value0.flatten().length / 4, new Float32Array(this.uniforms[i].value0.flatten()));
            }
            else if (this.uniforms[i].isMatrix === true) {
              this.webGL.uniformMatrix4fv(this.uniforms[i].id, false, new Float32Array(this.uniforms[i].value0.flatten()));
            }
            else {
              this.webGL.uniform2f(this.uniforms[i].id, this.uniforms[i].value0, this.uniforms[i].value1, this.uniforms[i].value2, this.uniforms[i].value3);
            }
          break;
        }
      break;
		}
	}
	
	return true;
};

Program.prototype.setAttributes = function(buffers) {
	if (this.status != Program.StatusEnum.PROGRAM_USING)
		return false;
	for (var i = 0; i < buffers.length; ++i) {
		var buffer = buffers[i];
		if (buffer.bufferType != this.webGL.ARRAY_BUFFER)
			continue;
		var id = this.webGL.getAttribLocation(this.program, buffer.bufferName);
		if (id == -1)
			continue;
		this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, buffer);
		this.webGL.vertexAttribPointer(id, buffer.itemSize, buffer.itemType, false, 0, 0);
		this.webGL.enableVertexAttribArray(id);
	}
	this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, null);
	return true;
};
