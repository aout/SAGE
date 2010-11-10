if (gIncludedFiles == undefined)
  alert("You must include this file");

gIncludedFiles.push("Skeleton.js");

Skeleton = function(name) {
	 this.name = name;
	 
	 this.boundMesh = undefined;
	 this.bindShapeMatrix = undefined;
	 
	 this.joints = [];
	 this.weights = [];
	 this.vertexWeights = [];
	 
	 this.root = undefined;
};
