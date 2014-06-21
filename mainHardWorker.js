var that = this;

// like a hash table ... 92 octaves below the lowest B-flat
var events = {
    "loadModule": [loadModule]
};

this.onmessage = eventHandler;

/**
 * This method binds a string to a function in this context.
 */
this.on = function(event, callback) {
    if (events[event] === undefined) {
        events[event] = [];
    }
    events[event].push(callback);
};

/**
 * SPLICE a callback from the events table.
 */
this.off = function(event, callbackToRemove) {
    if (!event || !callbackToRemove) { throw new Error("off requires the event string and function reference"); }
    if (events[event] !== undefined) {
        events[event].every(function(callback, idx, callbacks) {
            if (callbackToRemove === callback) {
                callbacks.splice(1, idx); // splice out the callback
                return false; // exit the every loop
            }
            else { return true; }
        });
    }
    else { console.warn("I can't unbind that callback because it's not in the events table"); }
    return this;
};

/**
 * @meow
 * Trigger an event, and pass arbitrary data to it
 * @param {Object} event EventHandler filters the event, so event.data.message has a callback
 */
function trigger(event) {
    events[event.data.message].forEach(function(callback, idx, self) {
        callback(event.data.data);
    });
}

/** @deprecated */
function whoami() {
    //this.importScripts("main.js");
    var stuff = [];
    for (var i in this) {
        stuff.push(i);
    }
    return stuff;
}

/**
 * Wraper around postMessage! This method will format the inputs and call postMessage
 */
function reply(type, data) {
    if (data === undefined) {
        data = type;
        type = "generic";
    }
    if (data === undefined) { throw new Error ("no type, no data, no go."); } // 2nd check 
    postMessage({
        message: type,
        data:data
    });
}

/**
 * Get the event object from the main thread and trigger the associated callback(s) 
 */
function eventHandler(event) {
    // if callback exists
    if (events[event.data.message] !== undefined) {
        trigger(event);
    }
    else {
        console.warn("I see no event handler callbacks for message="+event.data.message);
    }
}

/**
 * Make a new XHR and load the list of modules
 * @param moduleName string representing the path to the module
 */
function loadModule(module) {
    var xhr = new XMLHttpRequest();
    var result = null;
    xhr.open("GET", module.path);
    xhr.onload = function(event) {
        result = eval(event.target.response);  //TODO eval? what about AMD or require?
        that.on(module.name, result);
        reply("moduleReady", module.name);
    };
    xhr.send();
}
