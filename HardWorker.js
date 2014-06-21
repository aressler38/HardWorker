define([ 
], function() {

    // not as powerful as jQuery's extend, but it serves its purpose
    /** @deprecated */
    function extend(base, extension) {
        for (var thing in extension) {
            base[thing] = extension[thing];
        }
        return base;
    }


    /**
     * @constructor
     * Creates a new HardWorker that handles event bindings to a normal
     * Web Worker.
     */
    function HardWorker(config) {
        var that = this;
        var defaultConfig = {
            url: "mainHardWorker.js" 
        };
        // this is like a hash table...
        var events = {
            // "some event" : [list of callbacks]
            "__system" : {
                "moduleReady" : [moduleReadyHandler]
            },
            "loadModule" : [function() {console.log("HOW");}]
        };
        var pending = {
            modules: []
        };
        config = (typeof config === "object") ? config : defaultConfig;
        config = extend(defaultConfig, config);
        configManager(config);

        /**
         * Load some 'moduleName' into the worker. When the module is executed, the reverseTrigger 
         * will fire the associated 'handler' function. The 'callback' is a function that is executed
         * after the worker has loaded and executed the file corresponding to 'moduleName'
         * @param module an object containing 'name' and 'path' keys.
         */
        this.loadModule = function(module, handler, callback) {
            this.on(module.name, handler);
            pending.modules.push({name: module.name, callback:callback});
            postMessage({
                "message" : "__system.loadModule",
                "data": module
            });
            return this;
        };

        this.on = function(event, handler) {
            if (events[event] === undefined) { events[event] = []; }
            events[event].push(handler);
            return this;
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


        this.trigger = function(event, data) {
            postMessage({
                message:event, 
                data: data
            });
            return this;
        };

        /**
         * This is the method that the worker uses to trigger a callback on the HardWorker object.
         * @param {Object} handles EventHandler filters the event, so handles is a list of callbacks.
         */
        function reverseTrigger(handles) {
            handles.forEach(function(callback, idx, self) {
                callback(event.data.data);
            });
            return null;
        }
        
        var worker = new Worker(config.url);

        // proxy to worker
        // TODO: deprecate
        function postMessage() {
            if (typeof arguments[0] === "string") {
                arguments[0] = {message: "hello", data:arguments[0]};
            }
            worker.postMessage.apply(worker, arguments);
        }

        worker.addEventListener("message", eventHandler);

        /**
         * Get an event object from the worker and trigger the associated callback(s) 
         */
        function eventHandler(event) {
            var message = event.data.message;
            var handles = eventMessageDecoder(message);
            if ( !message ) {
                console.warn("I don't recognize the web worker event... maybe it isn't for me?");
                return null;
            }
            if ( handles instanceof Array ) {
                reverseTrigger(handles);
            }
            else {
                console.warn("I see no event handler callbacks for message="+message);
            }
        }

        function configManager(config) {
            if (!config.url) { throw new Error("missing a url"); }
            return;
        }

        /**
         *
         * Run the callback that was bound when loadModule was called. 
         * This is the callback of the XHR that is initiated within the worker.
         * The worker triggers moduleReady with the string representing the 
         * module.name. 
         */
        function moduleReadyHandler(moduleName) {
            pending.modules.every(function(module, idx) {
                if (moduleName === module.name) {
                    module.callback();
                    return false;
                }
                return true;
            });
        }

        /**
         * TODO: split on '.' and construct the resulting tree from the events object. 
         */
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

        return this;
    }

    return HardWorker;
});
