if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Material.js");

ColladaLoader_Material = function(ColladaFile) {
  
  this.colladaFile = ColladaFile;
  this.effect = undefined;
  
  this.attributes = {
    id: undefined,
    name: undefined
  };
  
  this.sageMaterial = undefined;
};

ColladaLoader_Material.prototype.parse = function(node) {
  
  ColladaLoader.parseAttributes(this, node);
  this.sid = node.parentNode.getAttribute('sid');
  
  var instanceEffectNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:instance_effect', node);
  if (!instanceEffectNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;instance_effect&gt; in ' + this.attributes.id + '</span><br />'; }
    return false;
  }
  
  var effectUrl = instanceEffectNode.getAttribute('url');
  if (!effectUrl || effectUrl[0] != '#') {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Bad url effect in ' + this.attributes.id + '</span><br />'; }
    return false;
  }
  effectUrl = effectUrl.substr(1, effectUrl.length - 1);
  for (var i = 0; i < this.colladaFile.libraryEffects.length; ++i) {
    if (this.colladaFile.libraryEffects[i].attributes.id == effectUrl) {
      this.effect = this.colladaFile.libraryEffects[i];
      break;
    }
  }

  if (!this.effect) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find the effect with id ' + effectUrl + '</span><br />'; }
    return false;
  }
  
  if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="info">Material ' + this.attributes.id + ' loaded</span><br />'; }
  return true;
};
