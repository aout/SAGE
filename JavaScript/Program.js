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
	SHADER_ERROR		: 4	
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
	
	//DEBUG
	/*---------------------------------------------------------------------------------------------*/
	this.vertexShaderString =  'const int MAX_JOINTS = 60;' + "\n";

	this.vertexShaderString += 'attribute vec3 POSITION;' + "\n";
	this.vertexShaderString += 'attribute vec3 NORMAL;' + "\n";
	this.vertexShaderString += 'attribute vec2 TEXCOORD;' + "\n";
	this.vertexShaderString += 'attribute vec3 TEXTANGENT;' + "\n";
	this.vertexShaderString += 'attribute vec3 TEXBINORMAL;' + "\n";

	this.vertexShaderString += 'attribute vec2 aVertexWeight_0;' + "\n";
	this.vertexShaderString += 'attribute vec2 aVertexWeight_1;' + "\n";
	this.vertexShaderString += 'attribute vec2 aVertexWeight_2;' + "\n";
	this.vertexShaderString += 'attribute vec2 aVertexWeight_3;' + "\n";

	this.vertexShaderString += 'uniform int uhasSkeleton;' + "\n";
	this.vertexShaderString += 'uniform mat4 uJoints[MAX_JOINTS];' + "\n";

	this.vertexShaderString += 'uniform mat4 uMVMatrix;' + "\n";
	this.vertexShaderString += 'uniform mat4 uEMatrix;' + "\n";
	this.vertexShaderString += 'uniform mat4 uPMatrix;' + "\n";
	this.vertexShaderString += 'uniform mat4 uNMatrix;' + "\n";

	this.vertexShaderString += 'uniform int uLightingEnabled;' + "\n";
	this.vertexShaderString += 'uniform vec3 uLightingDirection;' + "\n";
	this.vertexShaderString += 'uniform vec3 uAmbientColor;' + "\n";
	this.vertexShaderString += 'uniform vec3 uDirectionalColor;' + "\n";
 
	this.vertexShaderString += 'varying vec2 vTextureCoord;' + "\n";
	this.vertexShaderString += 'varying vec3 vLightWeighting;' + "\n";

  this.vertexShaderString += 'vec4  calc(vec4 pos, int index, float weight) {' + "\n";
  this.vertexShaderString += '  if (weight == 0.0) {' + "\n";
  this.vertexShaderString += '    return vec4(0.0);' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  if (index == 0) {' + "\n";
  this.vertexShaderString += '    return uJoints[0] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 1) {' + "\n";
  this.vertexShaderString += '    return uJoints[1] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 2) {' + "\n";
  this.vertexShaderString += '    return uJoints[2] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 3) {' + "\n";
  this.vertexShaderString += '    return uJoints[3] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 4) {' + "\n";
  this.vertexShaderString += '    return uJoints[4] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 5) {' + "\n";
  this.vertexShaderString += '    return uJoints[5] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 6) {' + "\n";
  this.vertexShaderString += '    return uJoints[6] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 7) {' + "\n";
  this.vertexShaderString += '    return uJoints[7] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 8) {' + "\n";
  this.vertexShaderString += '    return uJoints[8] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 9) {' + "\n";
  this.vertexShaderString += '    return uJoints[9] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 10) {' + "\n";
  this.vertexShaderString += '    return uJoints[10] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 11) {' + "\n";
  this.vertexShaderString += '    return uJoints[11] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 12) {' + "\n";
  this.vertexShaderString += '    return uJoints[12] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 13) {' + "\n";
  this.vertexShaderString += '    return uJoints[13] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 14) {' + "\n";
  this.vertexShaderString += '    return uJoints[14] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 15) {' + "\n";
  this.vertexShaderString += '    return uJoints[15] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 16) {' + "\n";
  this.vertexShaderString += '    return uJoints[16] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 17) {' + "\n";
  this.vertexShaderString += '    return uJoints[17] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 18) {' + "\n";
  this.vertexShaderString += '    return uJoints[18] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  else if (index == 19) {' + "\n";
  this.vertexShaderString += '    return uJoints[19] * pos * weight;' + "\n";
  this.vertexShaderString += '  }' + "\n";
  this.vertexShaderString += '  return vec4(0.0);' + "\n";
  this.vertexShaderString += '}' + "\n";

	this.vertexShaderString += 'void	main(void) {' + "\n";
	this.vertexShaderString += '	vec4 pos = vec4(POSITION, 1.0);' + "\n";	
	this.vertexShaderString += '	if (uhasSkeleton == 1) {' + "\n";
	this.vertexShaderString += '		vec4 outv = vec4(0.0);' + "\n";
	this.vertexShaderString += '    outv += calc(pos, int(aVertexWeight_0.x), aVertexWeight_0.y);' + "\n";
	this.vertexShaderString += '    outv += calc(pos, int(aVertexWeight_1.x), aVertexWeight_1.y);' + "\n";
	this.vertexShaderString += '    outv += calc(pos, int(aVertexWeight_2.x), aVertexWeight_2.y);' + "\n";
	this.vertexShaderString += '    outv += calc(pos, int(aVertexWeight_3.x), aVertexWeight_3.y);' + "\n";
	this.vertexShaderString += '		pos = outv;' + "\n";
	this.vertexShaderString += '	}' + "\n";
	
	this.vertexShaderString += '	gl_Position = uPMatrix * uEMatrix * uMVMatrix * pos;' + "\n";
	this.vertexShaderString += '	vTextureCoord = TEXCOORD;' + "\n";
	this.vertexShaderString += '  if (uLightingEnabled == 0) {' + "\n";
	this.vertexShaderString += '    vLightWeighting = vec3(1.0, 1.0, 1.0);' + "\n";
	this.vertexShaderString += '  }' + "\n";
	this.vertexShaderString += '  else {' + "\n";
	this.vertexShaderString += '    vec4 transformedNormal = uNMatrix * vec4(NORMAL, 1.0);' + "\n";
	this.vertexShaderString += '    vec4 tmp = vec4(uLightingDirection, 1.0);' + "\n";
	this.vertexShaderString += '    float directionalLightWeighting = max(dot(transformedNormal.xyz, tmp.xyz), 0.0);' + "\n";
	this.vertexShaderString += '    vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;' + "\n";
	this.vertexShaderString += '  }' + "\n";
	this.vertexShaderString += '}' + "\n";

	/*--------------------------------------------------------------------------------------------*/

	this.fragmentShaderString =  '#ifdef GL_ES' + "\n";
	this.fragmentShaderString += 'precision highp float;' + "\n";
	this.fragmentShaderString += '#endif' + "\n";

	this.fragmentShaderString += 'varying vec2 vTextureCoord;' + "\n";
	this.fragmentShaderString += 'varying vec3 vLightWeighting;' + "\n";

	this.fragmentShaderString += 'uniform sampler2D uSampler0;' + "\n";

	this.fragmentShaderString += 'void	main(void) {' + "\n";
	this.fragmentShaderString += '    vec4 textureColor = texture2D(uSampler0, vec2(vTextureCoord.s, vTextureCoord.t));' + "\n";
	this.fragmentShaderString += '    gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);' + "\n";
	this.fragmentShaderString += '}' + "\n";
	//FIN DEBUG
	
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

Program.prototype.isUsing = function() {
	return (this.program == this.webGL.getParameter(this.webGL.CURRENT_PROGRAM));
};

Program.prototype.use = function() {
	if (this.status == Program.StatusEnum.PROGRAM_READY && this.isUsing() == false) {
		this.webGL.useProgram(this.program);		
	}
	return this.status;
};

Program.prototype.setUniforms = function(tab) {
	if (this.isUsing() == false)
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
				      this.webGL.uniform1iv(this.uniforms[i].id, this.uniforms[i].value0);
				    }
				    else {
				      this.webGL.uniform1i(this.uniforms[i].id, this.uniforms[i].value0);
				    }
				  break;
				  case "Float":
            if (this.uniforms[i].isArray === true) {
              this.webGL.uniform1fv(this.uniforms[i].id, this.uniforms[i].value0);
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
              this.webGL.uniform2iv(this.uniforms[i].id, this.uniforms[i].value0);
            }
            else {
              this.webGL.uniform2i(this.uniforms[i].id, this.uniforms[i].value0, this.uniforms[i].value1);
            }
          break;
          case "Float":
            if (this.uniforms[i].isArray === true) {
              this.webGL.uniform2fv(this.uniforms[i].id, this.uniforms[i].value0);
            }
            else if (this.uniforms[i].isMatrix === true) {
              this.webGL.uniformMatrix2fv(this.uniforms[i].id, false, this.uniforms[i].value0);
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
              this.webGL.uniform3iv(this.uniforms[i].id, this.uniforms[i].value0);
            }
            else {
              this.webGL.uniform3i(this.uniforms[i].id, this.uniforms[i].value0, this.uniforms[i].value1, this.uniforms[i].value2);
            }
          break;
          case "Float":
            if (this.uniforms[i].isArray === true) {
              this.webGL.uniform3fv(this.uniforms[i].id, this.uniforms[i].value0);
            }
            else if (this.uniforms[i].isMatrix === true) {
              this.webGL.uniformMatrix3fv(this.uniforms[i].id, false, this.uniforms[i].value0);
            }
            else {
              this.webGL.uniform3f(this.uniforms[i].id, this.uniforms[i].value0, this.uniforms[i].value1, this.uniforms[i].value2);
            }
          break;
        }
      break;
      case 4:
       switch (this.uniforms[i].type) {
          case "Int":
            if (this.uniforms[i].isArray === true) {
              this.webGL.uniform4iv(this.uniforms[i].id, this.uniforms[i].value0);
            }
            else {
              this.webGL.uniform4i(this.uniforms[i].id, this.uniforms[i].value0, this.uniforms[i].value1, this.uniforms[i].value2, this.uniforms[i].value3);
            }
          break;
          case "Float":
            if (this.uniforms[i].isArray === true) {
              this.webGL.uniform4fv(this.uniforms[i].id, this.uniforms[i].value0);
            }
            else if (this.uniforms[i].isMatrix === true) {
              this.webGL.uniformMatrix4fv(this.uniforms[i].id, false, this.uniforms[i].value0);
              if (this.uniforms[i].name === 'uJoints') {
              	var test = this.webGL.getError();
              }
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
	if (this.isUsing() == false)
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
