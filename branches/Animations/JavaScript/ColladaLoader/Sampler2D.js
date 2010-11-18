if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Sampler2D.js");

ColladaLoader_Sampler2D = function(ColladaFile, effect) {
  
  this.colladaFile = ColladaFile;
  this.effect = effect;
  this.sid = undefined;
  
  this.surface = undefined;
  this.minFilter = undefined;
  this.magFilter = undefined;
};

ColladaLoader_Sampler2D.minFilterEnum = {
  NEAREST:                0,
  LINEAR:                 1,
  NEAREST_MIPMAP_NEAREST: 2,
  LINEAR_MIPMAP_NEAREST:  3,
  NEAREST_MIPMAP_LINEAR:  4,
  LINEAR_MIPMAP_LINEAR:   5
};

ColladaLoader_Sampler2D.magFilterEnum = {
  NEAREST:                0,
  LINEAR:                 1,  
};

ColladaLoader_Sampler2D.minFilterDefaultValue = 'LINEAR_MIPMAP_LINEAR';
ColladaLoader_Sampler2D.magFilterDefaultValue = 'LINEAR';

ColladaLoader_Sampler2D.prototype.parse = function(node) {
  
  this.sid = node.parentNode.getAttribute('sid');
  
  var sourceNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:source', node);
  if (!sourceNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find &lt;source&gt; in ' + this.sid + '</span><br />'; }
    return false;
  }
  
  var surfaceSid = ColladaLoader.nodeText(sourceNode);
  for (var i = 0; i < this.effect.surfaces.length; ++i) {
    if (this.effect.surfaces[i].sid == surfaceSid) {
      this.surface = this.effect.surfaces[i];
      break;
    }
  }

  if (!this.surface) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Couldn\'t find the surface with sid ' + surfaceSid + '</span><br />'; }
    return false;
  }
  
  var minFilterNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:minfilter', node);
  if (!minFilterNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="warning">Couldn\'t find &lt;minfilter&gt; in ' + this.sid + '<br />Default value is ' + ColladaLoader_Sampler2D.minFilterDefaultValue + '</span><br />'; }
    this.minFilter = ColladaLoader_Sampler2D.minFilterDefaultValue;
  }
  else {
    this.minFilter = ColladaLoader.nodeText(minFilterNode);
    if (!(this.minFilter in ColladaLoader_Sampler2D.minFilterEnum)) {
      if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">&lt;minfilter&gt; value in ' + this.sid + ' is unknown<br />Default value is ' + ColladaLoader_Sampler2D.minFilterDefaultValue + '</span><br />'; }
      this.minFilter = ColladaLoader_Sampler2D.minFilterDefaultValue;
    }
  }

  var magFilterNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:magfilter', node);
  if (!magFilterNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="warning">Couldn\'t find &lt;magfilter&gt; in ' + this.sid + '<br />Default value is ' + ColladaLoader_Sampler2D.magFilterDefaultValue + '</span><br />'; }
    this.magFilter = ColladaLoader_Sampler2D.magFilterDefaultValue;
  }
  else {
    this.magFilter = ColladaLoader.nodeText(magFilterNode);
    if (!(this.magFilter in ColladaLoader_Sampler2D.magFilterEnum)) {
      if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">&lt;magfilter&gt; value in ' + this.sid + ' is unknown<br />Default value is ' + ColladaLoader_Sampler2D.magFilterDefaultValue + '</span><br />'; }
      this.magFilter = ColladaLoader_Sampler2D.magFilterDefaultValue;
    }
  }
  
  if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="info">Sampler 2d ' + this.sid + ' loaded</span><br />'; }
  return true;
};
