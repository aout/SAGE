if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Surface.js");

ColladaLoader_Surface = function(ColladaFile, effect) {
  
  this.colladaFile = ColladaFile;
  this.effect = effect;
  
  this.sid = undefined;
  this.image = undefined;
  
  this.attributes = {
    type: undefined
  };
  
};

ColladaLoader_Surface.prototype.parse = function(node) {
  
  ColladaLoader.parseAttributes(this, node);
  this.sid = node.parentNode.getAttribute('sid');
  
  var initFromNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:init_from', node);
  if (!initFromNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;init_from&gt; in ' + this.sid + '</span><br />'; }
    return false;
  }
  
  var imageId = ColladaLoader.nodeText(initFromNode);
  for (var i = 0; i < this.colladaFile.libraryImages.length; ++i) {
    if (this.colladaFile.libraryImages[i].attributes.id == imageId) {
      this.image = this.colladaFile.libraryImages[i];
      break;
    }
  }

  if (!this.image) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find the image with id ' + imageId + '</span><br />'; }
    return false;
  }
  
  if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="info">Surface ' + this.sid + ' loaded</span><br />'; }
  return true;
};
