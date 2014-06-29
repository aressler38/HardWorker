var that = this;
var config = {
    amd : true
};

// like a hash table ... 92 octaves below the lowest B-flat
var events = {
    "__system" : {
        "loadModule": [loadModule],
        "loadScript": [loadScriptWithCallback],
        "set" : [setConfig]
    }
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
 * Trigger an event, and pass arbitrary data to it
 * @param {Object} event EventHandler filters the event, so event.data.message has a callback
 */
function trigger(event, handles) {
    var message = event.data.message;
    var data = event.data.data;
    var buff = null;
    var __system = event.__system;
    handles.forEach(function(callback, idx, callbacks) {
        buff = (callback && callback(data));
        if (!__system) {
            reply(message, buff);
        }
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
 * @param __system true causes the message to be prefixed by '__system.' 
 */
function reply(type, data, __system) {
    if (data === undefined) {
        data = type;
        type = "generic";
    }
    if (data === undefined) { throw new Error ("no type, no data, no go."); } // 2nd check 

    if (data.buffer instanceof ArrayBuffer) {
        console.log("FOUND ARRAY BUFFER");
        postMessage({message: type, data:data}, [data.buffer]); 
    }
    else {
        postMessage({
            message: ((__system) ? "__system." : "") + type,
            data:data
        });
    }
}

/**
 * Get the event object from the main thread and trigger the associated callback(s) 
 */
function eventHandler(event) {
    var message = event.data.message;
    var handles = eventMessageDecoder(message);

    event.__system =  (message.match(/__system/)) ? true : false;
    
    // if callback exists
    if ( handles instanceof Array ) {
        trigger(event, handles);
    }
    else {
        console.warn("I see no event handler callbacks for message="+event.data.message);
    }
}


function eventMessageDecoder(message) { 
    var messageSplit = message.split(".");
    var eventHandles = events; // start from events and find the handle.
    messageSplit.every(function(fragment, idx, fragments) {
        if (eventHandles[fragment] !== undefined) {
            eventHandles = eventHandles[fragment];
            return true;
        } else { 
            console.warn("No matching fragment."); 
            eventHandles = undefined;
            return false; 
        }
    });
    return eventHandles;
}


// =======================
// __system event handlers
// =======================

/**
 * Make a new XHR and load the list of modules
 * @systemEvent
 * @param moduleName string representing the path to the module
 */
function loadModule(module) {
    var xhr = new XMLHttpRequest();
    var result = null;
    if (config.amd && self.requirejs) {
        if (module.path[0] !== "/") {
            module.path = module.path.replace(/\.js$/, "");
        }
        self.requirejs([module.path], function(callback) {
            that.on(module.trigger, callback);
            reply("moduleReady", module.trigger, true);
        });

    }
    else {
        xhr.open("GET", module.path);
        xhr.onload = function(event) {
            /*
            // try to load an AMD file
            if (event.target.response.match(/define\([^)]*function/)) {
                console.log("looks like we're loading a module");
                if (self.define === undefined || self.requirejs === undefined) {
                    throw new Error("Load require.js via loadModule.");
                }
                result = self.eval(event.target.response); 
                console.log(result);
                setTimeout(function() {
                console.log(require.s.contexts._.defined);
                for (var i in require.s.contexts._.defined) {
                    console.log(i);
                    console.log(require.s.contexts._.defined[i]);
                }
                },500);
                that.on(module.trigger, result);
                reply("moduleReady", module.trigger, true);
            }
           */ 
              result = self.eval(event.target.response);  
              that.on(module.trigger, result);
              reply("moduleReady", module.trigger, true);
        };
        xhr.send();
    }
    return xhr;
}

/**
 * Set the config object
 */
function setConfig (data) {
    if (typeof data !== "object") { throw new Error("not an object"); }
    for (var key in data) {
        config[key] = data[key];
    }
    return null;
}


/**
 * @systemEvent
 * Load a script and reply to the HardWorker interface when XHR.onload executes.
 * This method does not bind a trigger/callback combination.
 */
function loadScriptWithCallback(scriptURI) {
    var xhr = new XMLHttpRequest();
    var result;
    xhr.open("GET", scriptURI);
    xhr.onload = function(event) {
        result = self.eval(event.target.response);  
        reply("scriptLoaded", scriptURI, true);
    };
    xhr.send();
    return xhr;
}
