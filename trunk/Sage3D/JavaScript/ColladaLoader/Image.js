if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Image.js");

ColladaLoader_Image = function(ColladaFile) {
  
  var self = this;
  
  this.colladaFile = ColladaFile;
  
  this.image = new Image();
  
  
  this.attributes = {
    id: undefined,
    name: undefined,
    format: undefined,
    height: undefined,
    width: undefined,
    depth: undefined
  };
  
  this.initFrom = undefined;

  this.image.onload = function() {
    if (self.colladaFile.debug && self.colladaFile.verbose) { self.colladaFile.debug.innerHTML += '<span class="success">' + self.attributes.id + ' loaded successfuly</span><br />' }
  };

  this.image.onerror = function() {
    if (self.colladaFile.debug) { self.colladaFile.debug.innerHTML += '<span class="error">Error while loading ' + self.attributes.id + '</span><br />' }
  };
  
};

ColladaLoader_Image.prototype.parse = function(node) {
  
  ColladaLoader.parseAttributes(this, node);
  
  var initFromNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:init_from', node);
  if (!initFromNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML += '<span class="error">Couldn\'t find &lt;init_from&gt; from &lt;image id="' + this.attributes.id + '"&gt;</span><br />' }
    return false;
  }
  this.image.src = ColladaLoader.nodeText(initFromNode);
  if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML += '<span class="info">Loading ' + this.attributes.id + '</span><br />' }
  return true;
};
