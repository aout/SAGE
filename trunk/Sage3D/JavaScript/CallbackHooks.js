if (gIncludedFiles == undefined)
 alert("You must include this file");
gIncludedFiles.push("CallbackHooks.js");

/**
 * CallbackHooks Class
 * @param {Object} Enum
 * @param {Int} maxCallbacksPerHooks
 */
CallbackHooks = function(Enum){
    // Json object holding Arrays of callbacks
    this.callbacks = {};


    // For every Hook in the input Enum, we add an Array to hold the callbacks
    for (Hook in Enum){
        this.callbacks[Hook] = [];
        // Set Maximum Callbacks per Hook
        this.callbacks[Hook].maxCallbacks = Enum[Hook];
    }
};

// Executes all callbacks assigned to a particular Hook
CallbackHooks.prototype.executeCallbacks = function(hook, elapsedTime){
    if (this.callbacks.hasOwnProperty(hook)){
        for (var i = 0; i <= this.callbacks[hook].length; ++i){
            if (this.callbacks[hook][i] != undefined && this.callbacks[hook][i] != null){
                if (this.callbacks[hook][i].code != undefined
                && this.callbacks[hook][i].code != null){
                    this.callbacks[hook][i].code(elapsedTime);
                }
            }
        }
    }
};

// Adds a calback to a particular hook
// Returns true of succesful, or false if fail
CallbackHooks.prototype.addCallback = function(name, callback, hook){
    if (this.callbacks.hasOwnProperty(hook)){
        if (this.callbacks[hook].length <= this.callbacks[hook].maxCallbacks){
            var call = {
              name: name,
              code: callback
            };
            this.callbacks[hook].push(call);
            return true;
        }
    }
    return false;
};

// Removes a particular callback from a particular hook
// Returns the callback if succesfull, or null if fail
CallbackHooks.prototype.removeCallback = function(name, hook){
    var ret = null;
    if (this.callbacks.hasOwnProperty(hook)){
        for (var i = 0; i < this.callbacks[hook].length; ++i){
            if (this.callbacks.hook[i].name == name){
                ret = this.callbacks[hook].splice(i, 1);
            }
        }
    }
    return ret;
};

// Removes all callbacks fro ma particular hook
// Return an Array of callbacks if succesful.
CallbackHooks.prototype.removeAllCallbacks = function(hook){
    if (this.callbacks.hasOwnProperty(hook)){
        ret = this.callbacks[hook].splice(0, this.callbacks[hook].length);
    }
    return ret;
};

// Return the number of callbacks on a a particular hook
CallbackHooks.prototype.getNumberofCallbacks = function(hook){
    if (this.callbacks.hasOwnProperty(hook)){
        return this.callbacks[hook].length;
    }
    return 0;
};
