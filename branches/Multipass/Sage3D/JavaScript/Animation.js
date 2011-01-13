if (gIncludedFiles == undefined)
	alert("You must include this file");
	

gIncludedFiles.push("Animation.js");

/**
 * State Struct
 */
function State(time, skeleton) {
    this.time = time;
	this.skeleton = skeleton;
}

/**
 * Animation Class
 */
Animation = function() {
	this.timeBetweenState = undefined;
	this.currentState = undefined;
	this.stateByTime = []; // tableau de state
};

/**
 * Create
 * @param {state} state State
 * init array de state
 */
Animation.prototype.create = function(state){
	stateByTime.push(state);
}

/**
 * Update
 * @param {elapsedTime} elapsedTime int
 */
Animation.prototype.update = function(elapsedTime){	
	index = floor( ( this.stateByTime[this.currentState].time + elapsedTime ) / this.timeBetweenState )
	if (index > this.stateByTime.lenght)
		return false;
	this.currentState = this.stateByTime[index];
	return true;
};