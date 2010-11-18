if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Effect.js");

ColladaLoader_Effect = function(ColladaFile) {
  
  this.colladaFile = ColladaFile;
  
  this.surfaces = [];
  this.samplers = [];

  this.shadedSurface = undefined;
  
  this.attributes = {
    id: undefined,
    name: undefined,
  };
  
};

ColladaLoader_Effect.prototype.parseNewParam = function(node) {
  
  var surfaceNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:newparam/c:surface', node);
  for (var i = 0; i < surfaceNodes.snapshotLength; ++i) {
    var surface = new ColladaLoader_Surface(this.colladaFile, this);
    if (surface.parse(surfaceNodes.snapshotItem(i))) {
      this.surfaces.push(surface);
    }
  }

  var samplerNodes = ColladaLoader.getNodes(this.colladaFile.xml, 'c:newparam/c:sampler2D', node);
  for (var i = 0; i < samplerNodes.snapshotLength; ++i) {
    var sampler = new ColladaLoader_Sampler2D(this.colladaFile, this);
    if (sampler.parse(samplerNodes.snapshotItem(i))) {
      this.samplers.push(sampler);
    }
  }
}

ColladaLoader_Effect.prototype.parse = function(node) {
  
  ColladaLoader.parseAttributes(this, node);
  
  var profileNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:profile_COMMON', node);
  if (!profileNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML += '<span class="error">Couldn\'t find &lt;profile_COMMON&gt; from &lt;effect id="' + this.attributes.id + '"&gt;</span><br />' }
    return false;
  }
  this.parseNewParam(profileNode);
  
  var techniqueNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:technique', profileNode);
  if (!techniqueNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML += '<span class="error">Couldn\'t find &lt;technique&gt; in &lt;profile_COMMON&gt; from &lt;effect id="' + this.attributes.id + '"&gt;</span><br />' }
    return false;
  }
  this.parseNewParam(techniqueNode);
  
  var shadedSurfaceNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:blinn | c:constant | c:lambert | c:phong', techniqueNode);
  if (!shadedSurfaceNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML += '<span class="error">Couldn\'t find any shadedSurface from &lt;effect id="' + this.attributes.id + '"&gt;</span><br />' }
    return false;
  }  
  
  var tmp = new ColladaLoader_ShadedSurface(this.colladaFile, this);
  if (tmp.parse(shadedSurfaceNode)) {
    this.shadedSurface = tmp;
    if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="info">Effect ' + this.attributes.id + ' loaded</span><br />'; }
    return true;
  }
  
  return false;
};