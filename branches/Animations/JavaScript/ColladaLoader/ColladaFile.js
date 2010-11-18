if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/ColladaFile.js");

ColladaLoader_ColladaFile = function(task, xml, callback, debugDivId, verbose) {
  this.task = task;
  this.xml = xml;
  
  this.version = undefined;
  
  this.libraryAnimations = [];
  this.libraryAnimationClips = [];
  this.libraryControllers = [];
  this.libraryEffects = [];
  this.libraryGeometries = [];
  this.libraryImages = [];
  this.libraryMaterials = [];
  
  this.upAxis = undefined;
  
  this.callback = callback;
  
  this.debug = undefined;

  if (debugDivId) {
      this.debug = document.evaluate('//div[@id="' + debugDivId + '"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }
  
  this.verbose = verbose ? true : false;
};

ColladaLoader_ColladaFile.upAxisEnum = {
  X_UP:     0,
  Y_UP:     1,
  Z_UP:     2,
};

ColladaLoader_ColladaFile.supportedVersions = ['1.4.0', '1.4.1'];

ColladaLoader_ColladaFile.prototype.parse = function() {
  
  if (this.debug && this.verbose) { this.debug.innerHTML += '<span class="info">Beginning parsing file</span><br />'; }
  
  if (!this.parseVersion()) {
    return false;
  }
  this.parseUpAxis();
  this.loadImages();
  if (!this.parseEffects()) {
  	return false;
  }
  if (!this.parseMaterials()) {
  	return false;
  }
  if (!this.parseGeometries()) {
  	return false;
  }
  if (this.parseControllers()) {
	  if (this.parseAnimations()) {
	  	//this.parseAnimationClips();
	  }
  }
  this.generateEntity();
  if (this.debug && this.verbose) { this.debug.innerHTML += '<span class="info">Parsing file done</span><br />'; }
};

ColladaLoader_ColladaFile.prototype.parseVersion = function() {
  
  var ColladaNode = ColladaLoader.getNode(this.xml, '/c:COLLADA');
  if (!ColladaNode) {
    if (this.debug) { this.debug.innerHTML += '<span class="error">Couldn\'t find &lt;COLLADA&gt;</span><br />'; }
    return false;
  }
  
  this.version = ColladaNode.getAttribute('version');
  
  var supported = false;
  for (var index in ColladaLoader_ColladaFile.supportedVersions) {
    if (ColladaLoader_ColladaFile.supportedVersions[index] == this.version) {
      supported = true;
      break;
    }
  }
  
  if (!supported && this.debug) { this.debug.innerHTML += '<span class="error">This collada version:' + this.version + ' is not supported</span><br />'; }
  if (supported && this.debug && this.verbose) { this.debug.innerHTML += '<span class="success">Collada version:' + this.version + '</span><br />'; }
  return supported;
};

ColladaLoader_ColladaFile.prototype.parseUpAxis = function() {

  var upAxisNode = ColladaLoader.getNode(this.xml, '/c:COLLADA/c:asset/c:up_axis');
  if (!upAxisNode) {
    if (this.debug) { this.debug.innerHTML += '<span class="error">Couldn\'t find &lt;up_axis&gt;</span><br />'; }
  }
  else {
    var upAxisValue = ColladaLoader.nodeText(upAxisNode);
    if (upAxisValue in ColladaLoader_ColladaFile.upAxisEnum) {
      this.upAxis = ColladaLoader_ColladaFile.upAxisEnum[upAxisValue]
    }
    else {
      if (this.debug) { this.debug.innerHTML += '<span class="error">&lt;up_axis&gt; has an unknow value</span><br />'; }
    }
  }
  
  if (!this.upAxis) {
    this.upAxis = ColladaLoader_ColladaFile.upAxisEnum.Y_UP;
    if (this.debug) { this.debug.innerHTML += '<span class="warning">Assume that &lt;up_axis&gt; is Y_UP</span><br />'; }
  }
  
  if (this.debug && this.verbose) {
    var upAxisString = (this.upAxis == 0) ? ('X_UP') : (this.upAxis == 1) ? ('Y_UP') : ('Z_UP');
    this.debug.innerHTML += '<span class="success">&lt;up_axis&gt; is ' + upAxisString + '</span><br />';
  }
};

ColladaLoader_ColladaFile.prototype.loadImages = function() {
  var libraryImagesNode = ColladaLoader.getNode(this.xml, '/c:COLLADA/c:library_images');
  if (!libraryImagesNode) {
    if (this.debug && this.verbose) { this.debug.innerHTML += '<span class="info">Couldn\'t find &lt;library_images&gt;</span><br />'; }
    return;
  }
  var imageNodes = ColladaLoader.getNodes(this.xml, 'c:image', libraryImagesNode);
  for (var i = 0; i < imageNodes.snapshotLength; i++) {
    var image = new ColladaLoader_Image(this);
    if (image.parse(imageNodes.snapshotItem(i))) {
      this.libraryImages.push(image);
    }
  }
};

ColladaLoader_ColladaFile.prototype.parseEffects = function() {
  
  if (this.debug && this.verbose) { this.debug.innerHTML += '<span class="info">Loading effects</span><br />'; }
  
  var libraryEffectsNode = ColladaLoader.getNode(this.xml, '/c:COLLADA/c:library_effects');
  if (!libraryEffectsNode) {
    if (this.debug) { this.debug.innerHTML += '<span class="warning">Couldn\'t find &lt;library_effects&gt;</span><br />'; }
    return false;
  }
  
  var effectNodes = ColladaLoader.getNodes(this.xml, 'c:effect', libraryEffectsNode);
  for (var i = 0; i < effectNodes.snapshotLength; i++) {
    var effect = new ColladaLoader_Effect(this);
    if (effect.parse(effectNodes.snapshotItem(i))) {
      this.libraryEffects.push(effect);
    }
  }
  if (!this.libraryEffects.length) {
  	return false;
  }
  return true;
};

ColladaLoader_ColladaFile.prototype.parseMaterials = function() {
	
  if (this.debug && this.verbose) { this.debug.innerHTML += '<span class="info">Loading materials</span><br />'; }
  
  var libraryMaterialsNode = ColladaLoader.getNode(this.xml, '/c:COLLADA/c:library_materials');
  if (!libraryMaterialsNode) {
    if (this.debug) { this.debug.innerHTML += '<span class="error">Couldn\'t find &lt;library_materials&gt;</span><br />'; }
    return false;
  }
  
  var materialNodes = ColladaLoader.getNodes(this.xml, 'c:material', libraryMaterialsNode)
  for (var i = 0; i < materialNodes.snapshotLength; i++) {
    var material = new ColladaLoader_Material(this);
    if (material.parse(materialNodes.snapshotItem(i))) {
      this.libraryMaterials.push(material);
    }
  }
  
  if (!this.libraryMaterials.length) {
  	return false;
  }
  return true;
};

ColladaLoader_ColladaFile.prototype.parseGeometries = function() {
  if (this.debug && this.verbose) { this.debug.innerHTML += '<span class="info">Loading geometries</span><br />'; }
  
  var libraryGeometriesNode = ColladaLoader.getNode(this.xml, '/c:COLLADA/c:library_geometries');
  if (!libraryGeometriesNode) {
    if (this.debug) { this.debug.innerHTML += '<span class="error">Couldn\'t find &lt;library_geometries&gt;</span><br />'; }
    return false;
  }
  
  var geometryNodes = ColladaLoader.getNodes(this.xml, 'c:geometry', libraryGeometriesNode)
  for (var i = 0; i < geometryNodes.snapshotLength; i++) {
    var geometry = new ColladaLoader_Geometry(this);
    if (geometry.parse(geometryNodes.snapshotItem(i))) {
      this.libraryGeometries.push(geometry);
    }
  }
  
  if (!this.libraryGeometries.length) {
  	return false;
  }
  return true;
};

ColladaLoader_ColladaFile.prototype.parseControllers = function() {
  if (this.debug && this.verbose) { this.debug.innerHTML += '<span class="info">Loading controllers</span><br />'; }
  
  var libraryControllersNode = ColladaLoader.getNode(this.xml, '/c:COLLADA/c:library_controllers');
  if (!libraryControllersNode) {
    if (this.debug) { this.debug.innerHTML += '<span class="warning">Couldn\'t find &lt;library_controllers&gt;</span><br />'; }
    return false;
  }
  
  var controllerNodes = ColladaLoader.getNodes(this.xml, 'c:controller', libraryControllersNode)
  for (var i = 0; i < controllerNodes.snapshotLength; i++) {
    var controller = new ColladaLoader_Controller(this);
    if (controller.parse(controllerNodes.snapshotItem(i))) {
      this.libraryControllers.push(controller);
    }
  }
  if (!this.libraryControllers.length) {
  	return false;
  }
  return true;
};

ColladaLoader_ColladaFile.prototype.parseAnimations = function() {
  if (this.debug && this.verbose) { this.debug.innerHTML += '<span class="info">Loading animations</span><br />'; }
  
  var libraryAnimationsNode = ColladaLoader.getNode(this.xml, '/c:COLLADA/c:library_animations');
  if (!libraryAnimationsNode) {
    if (this.debug) { this.debug.innerHTML += '<span class="warning">Couldn\'t find &lt;library_animations&gt;</span><br />'; }
    return false;
  }
  
  var animationNodes = ColladaLoader.getNodes(this.xml, 'c:animation', libraryAnimationsNode)
  for (var i = 0; i < animationNodes.snapshotLength; i++) {
    var animation = new ColladaLoader_Animation(this);
    if (animation.parse(animationNodes.snapshotItem(i))) {
      this.libraryAnimations.push(animation);
    }
  }
  if (!this.libraryAnimations.length) {
  	return false;
  }
  return true;
};

ColladaLoader_ColladaFile.prototype.parseAnimationClips = function() {
  
};

ColladaLoader_ColladaFile.prototype.generateEntity = function() {
  for (var i = 0; i < this.libraryMaterials.length; ++i) {
    var material = new Material(this.libraryMaterials[i].attributes.id);
    material.load(this.libraryMaterials[i].effect.shadedSurface);
  }
};