if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("ResourceManager.js");

/**
 * ResourceManager Class
 */
ResourceManager = function() {
	this.colladaLoader = new ColladaLoader();
	
	this.quotas = {
		Textures	: 10240,
		Meshs		: 10240,
		Programs	: 30,
		Entities	: 100
	};
	
	this.usage = {
		Textures	: 0,
		Meshs		: 0,
		Programs	: 0,
		Entities	: 0
	};
	
	this.entities = [];
	this.textures = [];
	this.meshs = [];
	this.programs = [];
	
	this.taskList = [];
	
	this.callback = undefined;
	
	this.status = ResourceManager.StatusEnum.RM_READY;
	this.error = "no error";
	
	this.overallProgress = 0.0;
};

/**
 * Texture Status
 */
ResourceManager.StatusEnum = {
	RM_READY		: 0,
	RM_PREPARING	: 1,
	RM_LOADING		: 2,
	RM_COMPLETE		: 3,
	RM_ERROR		: 4,
};

ResourceManager.instance = undefined;

ResourceManager.getInstance = function() {
	if (ResourceManager.instance == undefined) {
		ResourceManager.instance = new ResourceManager();
	}
	return ResourceManager.instance;
};

ResourceManager.onTaskComplete = function(resource) {
	var rm = ResourceManager.getInstance();
	var tempProgress = 0.0;
	if (resource instanceof Mesh) {
		rm.meshs[resource.name] = resource;
	}
	else if (resource instanceof Texture) {
		rm.textures[resource.name] = resource;
	}
	else if (resource instanceof Program) {
		rm.programs[resource.name] = resource;
	}
	
	for (var i = 0; i < rm.taskList.length; ++i) {
		if (resource != undefined && rm.taskList[i].name == resource.name){
			switch (rm.taskList[i].type){
				case "Mesh":
				if (resource instanceof Mesh) {
					rm.taskList[i].progress = 1.0;
					if (rm.taskList[i].owner) {
						rm.taskList[i].owner.progress += 1 / rm.taskList[i].owner.children.length;
						if (rm.taskList[i].owner.progress == 1) {
							ResourceManager.onTaskComplete(undefined);
						}
					}
				}
				break;
				
				case "Texture":
				if (resource instanceof Texture) {
					rm.taskList[i].progress = 1.0;
					if (rm.taskList[i].owner) {
						rm.taskList[i].owner.progress += 1 / rm.taskList[i].owner.children.length;
					if (rm.taskList[i].owner.progress == 1) {
							ResourceManager.onTaskComplete(undefined);
						}
					}
				}
				break;
				
				case "Program":
				if (resource instanceof Program)
					rm.taskList[i].progress = 1.0;
				break;
			}
		}
		tempProgress += rm.taskList[i].progress;
	}
	rm.overallProgress = tempProgress / rm.taskList.length;
	if (rm.overallProgress == 1)
		rm.callback();
}

/**
 * Prepares mesh load
 * @param {String} name
 * @param {String} location
 */
ResourceManager.prototype.prepareMesh = function(name, location) {
	if (this.status >= ResourceManager.StatusEnum.RM_LOADING && this.meshs[name] != undefined) {
		this.status = ResourceManager.StatusEnum.RM_ERROR;
		this.error = "Name already exits";
		return false;
	}
	for (i = 0; i < this.taskList.lenght; ++i) {
		if (taskList[i].name == name && taskList[i].type == "Mesh") {
			return false;
		}
	}
	this.status = ResourceManager.StatusEnum.RM_PREPARING;
	var task = {
		type		: "Mesh",
		name		: name,
		location	: location,
		progress	: 0.0
	};
	this.taskList.push(task);
};

/**
 * Prepares texture load
 * @param {String} name
 * @param {String} location
 */
ResourceManager.prototype.prepareTexture = function(name, location) {
	if (this.status >= ResourceManager.StatusEnum.RM_LOADING && this.textures[name] != undefined) {
		this.status = ResourceManager.StatusEnum.RM_ERROR;
		this.error = "Name already exits";
		return false;
	}
	this.status = ResourceManager.StatusEnum.RM_PREPARING;
	var task = {
		type		: "Texture",
		name		: name,
		location	: location,
		progress	: 0.0
	};
	this.taskList.push(task);
};

/**
 * Prepares program load
 * @param {String} name
 * @param {String} location
 */
ResourceManager.prototype.prepareProgram = function(name, location) {
	if (this.status >= ResourceManager.StatusEnum.RM_LOADING && this.programs[name] != undefined) {
		this.status = ResourceManager.StatusEnum.RM_ERROR;
		this.error = "Name already exits";
		return false;
	}
	this.status = ResourceManager.StatusEnum.RM_PREPARING;
	var task = {
		type		: "Program",
		name		: name,
		vertex		: location + '.vs',
		fragment	: location + '.fs',
		progress	: 0.0
	};
	this.taskList.push(task);
};

/**
 * Prepares collada load
 * @param {String} name
 * @param {String} location
 */
ResourceManager.prototype.prepareCollada = function(name, location) {
	if (this.status >= ResourceManager.StatusEnum.RM_LOADING && this.programs[name] != undefined) {
		this.status = ResourceManager.StatusEnum.RM_ERROR;
		this.error = "Name already exits";
		return false;
	}
	this.status = ResourceManager.StatusEnum.RM_PREPARING;
	var task = {
		type		: "Collada",
		name		: name,
		location	: location,
		progress	: 0.0,
		children	: []
	};
	this.taskList.push(task);
	
	var mesh = {
		type		: "Mesh",
		owner		: task,
		name		: task.name + '_mesh',
		progress	: 0.0
	};
	
	task.children.push(mesh);
	ResourceManager.getInstance().taskList.push(mesh);	
};

/**
 * Executes the previously prepared tasks then calls the callback on campletion
 * @param {Function} callback Function to be executed at the completion of the Load
 */
ResourceManager.prototype.doLoad = function(callback) {
	if (this.status != ResourceManager.StatusEnum.RM_PREPARING) {
		this.status = ResourceManager.StatusEnum.RM_ERROR;
		this.error = "Already loading";
		return false;
	}
	this.status = ResourceManager.StatusEnum.RM_LOADING;
	for (var i = 0; i < this.taskList.length; ++i) {
		switch (this.taskList[i].type) {
			case "Mesh":
				this.loadMesh(this.taskList[i]);
				break;
			case "Texture":
				this.loadTexture(this.taskList[i]);
				break;
			case "Program":
				this.loadProgram(this.taskList[i]);
				break;
			case "Collada":
				this.loadCollada(this.taskList[i]);
				break;
		}
	}
	this.callback = callback;
};

ResourceManager.prototype.loadMesh = function(task) {
	switch(task.location) {
		case "cube":
			Primitives.cube(task.name, ResourceManager.onTaskComplete);
			break;
	}
};

ResourceManager.prototype.loadTexture = function(task) {
	var texture = new Texture(task.name);
	texture.load(0, task.location, ResourceManager.onTaskComplete);
};

ResourceManager.prototype.loadProgram = function(task) {
};

ResourceManager.prototype.loadCollada = function(task) {
	this.colladaLoader.load(task, ResourceManager.onTaskComplete);
};

ResourceManager.prototype.getTextureByName = function(name) {
	return this.textures[name];
}

ResourceManager.prototype.getMeshByName = function(name) {
	return this.meshs[name];
}

ResourceManager.prototype.getProgramByName = function(name){
	return this.programs[name];
}
