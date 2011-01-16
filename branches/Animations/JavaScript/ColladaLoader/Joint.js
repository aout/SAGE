if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Joint.js");

ColladaLoader_Joint = function() {

  this.name = undefined;
  this.parent = undefined;
  this.children = [];

  this.inverseBindMatrix = undefined;
  
  this.transformations = [];
};

ColladaLoader_Joint.prototype.generateBindShapeLocalMatrix = function() {
	var ret = mat4.create();
	mat4.identity(ret);
	
	for (var i = 0; i < this.transformations.length; ++i) {
		if (this.transformations[i] instanceof ColladaLoader_Matrix) {
			mat4.multiply(ret, this.transformations[i].matrix);
		}/* else if (this.transformations[i] instanceof ColladaLoader_Translate) {
			mat4.translate(ret, this.transformations[i].generateTransformation());		
		} else if (this.transformations[i] instanceof ColladaLoader_Rotate) {
			var rotate = this.transformations[i].generateTransformation();
			mat4.rotate(ret, rotate[3], rotate);		
		}*/		
	}
	
	return ret;
};

/*
ColladaLoader_Joint.prototype.generateLocalMatrix = function(time) {
	var ret = mat4.create();
	mat4.identity(ret);
	
	for (var i = 0; i < this.transformations.length; ++i) {
		if (this.transformations[i] instanceof ColladaLoader_Matrix) {
			mat4.multiply(ret, this.transformations[i].generateTransformation(time));
		} else if (this.transformations[i] instanceof ColladaLoader_Translate) {
			mat4.translate(ret, this.transformations[i].generateTransformation(time));		
		} else if (this.transformations[i] instanceof ColladaLoader_Rotate) {
			var rotate = this.transformations[i].generateTransformation(time);
			mat4.rotate(ret, rotate[3], rotate);		
		}		
	}
	
	return ret;
};
*/