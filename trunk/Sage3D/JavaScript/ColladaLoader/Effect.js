if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/Effect.js");

ColladaLoader_Effect = function(ColladaFile) {
  
  this.colladaFile = ColladaFile;
  
  this.surfaces = [];
  this.samplers = [];
  
  this.attributes = {
    id: undefined,
    name: undefined,
  };
  
};

ColladaLoader_Effect.prototype.parseNewParam = function(node) {
  
  var bool = true;
  for (var i = 0; i < node.childNodes.length && bool; ++i) {
    var child = node.childNodes.item(i);
    switch (child.tagName) {
      case 'asset': break;
      case 'image': break;
      case 'newparam':
        var index = child.childNodes.length == 1 ? 0 : child.childNodes.length == 2 ? 1 : -1;
        if (index != -1) {
          var paramType = child.childNodes.item(index);
          switch (paramType.tagName) {
            case 'surface':
              var surface = new ColladaLoader_Surface(this.colladaFile, this, child.getAttribute('sid'));
              if (surface.parse(paramType)) {
                this.surfaces.push(surface);
              }
              break;
            case 'sampler2D':
              var sampler = new ColladaLoader_Sampler(this.colladaFile, this, child.getAttribute('sid'));
              if (sampler.parse(paramType)) {
                this.samplers.push(sampler);
              }
              break;
          }
        }
        break;
      default:
        bool = false;
        break;
    }
  }  
}

ColladaLoader_Effect.prototype.parse = function(node) {
  
  ColladaLoader.parseAttributes(this, node);
  
  var profileNode = ColladaLoader.getNode(this.xml, 'c:profile_COMMON', node);
  if (!profileNode) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML += '<span class="error">Couldn\'t find &lt;profile_COMMON&gt; from &lt;effect id="' + this.attributes.id + '"&gt;</span><br />' }
    return false;
  }
  
  return true;
};