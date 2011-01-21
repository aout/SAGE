if (gIncludedFiles == undefined)
  alert("You must include this file");

gIncludedFiles.push("Skeleton.js");

Skeleton = function(joints, root, BSM) {

	this.root = root;
	this.joints = joints;
	this.bindShapeMatrix = BSM;
};

Skeleton.prototype.getShaderMatrices = function() {
	/*var ret = new Float32Array();
	for (var i = 0; i < this.joints.length; ++i) {
		ret = ret.concat(this.joints[i].getShaderMatrix());
	}
	return ret;*/
	
	
	var ret = new Float32Array(this.joints.length * 16);
	for (var i = 0; i < this.joints.length; ++i) {
		for (var j = 0; j < 16; ++j) {
			ret[i * 16 + j] = this.joints[i].getShaderMatrix()[j];
		}
	}
	return ret;	
};
