if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/ShadedSurface.js");

ColladaLoader_ShadedSurface = function(ColladaFile, effect) {
  
  this.colladaFile = ColladaFile;
  this.effect = effect;
  
  this.technique = undefined;
  
  this.components = {
    emission  :undefined,
    ambient   :undefined,
    diffuse   :undefined,
    specular  :undefined,
    shininess :undefined    
  };
};

ColladaLoader_ShadedSurface.techniqueEnum = {
  blinn     :0,
  constant  :1,
  lambert   :2,
  phong     :3
};

ColladaLoader_ShadedSurface.phongComponentNames = ['emission', 'ambient', 'diffuse', 'specular', 'shininess'];

ColladaLoader_ShadedSurface.prototype.loadComponents = function(node) {
  var componentNameArray = ColladaLoader_ShadedSurface[node.tagName + 'ComponentNames'];
  
  for (var i = 0; i < componentNameArray.length; ++i) {
    var componentNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:' + componentNameArray[i], node);
    if (!componentNode) {
      if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Missing ' + componentNameArray[i] + ' in ' + node.tagName + '</span><br />'; }
      return false;
    }
    var colorOrTextureNode = ColladaLoader.getNode(this.colladaFile.xml, 'c:color | c:texture | c:float', componentNode);
    if (!colorOrTextureNode) {
      if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Invalid ' + componentNameArray[i] + ' in ' + node.tagName + '</span><br />'; }
      return false;
    }
    if (colorOrTextureNode.tagName == 'color') {
      var colorTab = ColladaLoader.parseFloatListString(ColladaLoader.nodeText(colorOrTextureNode));
      if (colorTab.length != 4) {
        if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Invalid ' + componentNameArray[i] + ' color in ' + node.tagName + '</span><br />'; }
        return false;        
      }
      this.components[componentNameArray[i]] = vec3.create(colorTab);
    }
    else if (colorOrTextureNode.tagName == 'texture') {
      var samplerSid = colorOrTextureNode.getAttribute('texture');
      for (var j = 0; j < this.effect.samplers.length; ++j) {
        if (samplerSid == this.effect.samplers[j].sid) {
          this.components[componentNameArray[i]] = this.effect.samplers[j];
          break;
        }
      }
      if (!this.components[componentNameArray[i]]) {
        if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Invalid ' + componentNameArray[i] + ': couldn\'t find ' + samplerSid + '</span><br />'; }
        return false;
      }
    }
    else if (colorOrTextureNode.tagName == 'float' && componentNameArray[i] == 'shininess') {
      this.components[componentNameArray[i]] = parseFloat(ColladaLoader.nodeText(colorOrTextureNode));
    }
    else {
      if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">Invalid ' + componentNameArray[i] + ' in ' + node.tagName + '</span><br />'; }
      return false;      
    }

  }
  return true;
}

ColladaLoader_ShadedSurface.prototype.parse = function(node) {
  
  this.technique = ColladaLoader_ShadedSurface.techniqueEnum[node.tagName];
  if (this.technique != ColladaLoader_ShadedSurface.techniqueEnum.phong) {
    if (this.colladaFile.debug) { this.colladaFile.debug.innerHTML +=  '<span class="error">' + node.tagName + ' is not supported yet</span><br />'; }
    return false
  }
  
  if (!this.loadComponents(node)) {
    return false;
  }
  
  if (this.colladaFile.debug && this.colladaFile.verbose) { this.colladaFile.debug.innerHTML +=  '<span class="info">ShadedSurface loaded</span><br />'; }
  return true;
};
