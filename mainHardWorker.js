var that = this;
// like a hash table
var events = {
    "loadModule": [loadModule]
};

this.onmessage = eventHandler;

this.on = function(event, callback, context) {
    context = (!context) ? this : context;
    if (events[event] === undefined) {
        events[event] = [];
    }
    events[event].push(callback);
};

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

function reply(type, data) {
    if (data === undefined) {
        data = type;
        type = "generic";
    }
    if (data === undefined) { throw new Error ("no type, no data, no go."); } // 2nd check 
    postMessage({
        message: type,
        data:data,
        extra: "reply from the worker..."
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
function loadModule(moduleName) {
    var xhr = new XMLHttpRequest();
    var result = null;
    xhr.open("GET", moduleName);
    xhr.onload = function(event) {
        result = eval(event.target.response); 
        that.on(moduleName, result);
        reply("moduleReady", moduleName);
    };
    xhr.send();
}
