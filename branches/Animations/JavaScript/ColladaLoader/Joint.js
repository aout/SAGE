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
