if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Image.js");

ColladaLoader_Image = function(ColladaFile) {
  
  this.colladaFile = ColladaFile;
  
  this.imageSrc = undefined;
  
  this.attributes = {
    id: undefined,
    name: undefined,
    format: undefined,
    height: undefined,
    width: undefined,
    depth: undefined
  };
  
  this.initFrom = undefined;
};

ColladaLoader_Image.prototype.parse = function(node) {
  
  ColladaLoader.parseAttributes(this, node);
  
  var initFromNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:init_from', node);
  if (!initFromNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML += '<span class="error">Couldn\'t find &lt;init_from&gt; from &lt;image id="' + this.attributes.id + '"&gt;</span><br />' }
    return false;
  }
  this.imageSrc = ColladaLoader.nodeText(initFromNode);
  //if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML += '<span class="info">Loading ' + this.attributes.id + '</span><br />' }
  return true;
};
