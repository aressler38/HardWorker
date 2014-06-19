define([
    "./lib/utils/Events" // DO I NEED EVENTS????
], function(Events) {

    // not as powerful as jQuery's extend, but it serves its purpose
    /** @deprecated */
    function extend(base, extension) {
        for (var thing in extension) {
            base[thing] = extension[thing];
        }
    }

    /**
     * @constructor
     * Creates a new HardWorker that handles event bindings to a normal
     * Web Worker.
     */
    function HardWorker(config) {
        config = (typeof config === "object") ? config : {
            url: "mainHardWorker.js" 
        };
        configManager(config);
        var that = this;
        var events = {
            // "some event" : [list of callbacks]
        };

        this.on = function(event, callback, context) {
            context = (!context) ? this : context;
            if (events[event] === undefined) {
                events[event] = [];
            }
            events[event].push(callback);
            return this;
        };

        this.off = function(event, callbackToRemove) {
            if (!event || !callback) { throw new Error("off requires the event string and function reference"); }
            if (events[event] !== undefined) {
                events[event].every(function(callback, idx, callbacks) {
                    if (callbackToRemove === callback) {
                        callback.splice(1, idx); // splice out the callback
                        return false; // exit the every loop
                    }
                    else { return true; }
                });
            }
            else { console.warn("I can't unbind that callback because it's not in the events table"); }
            return this;
        }

        /**
         * Trigger an event, and pass arbitrary data to it
         * @param {Object} event EventHandler filters the event, so event.data.message has a callback
         */
        function trigger(event) {
            events[event.data.message].forEach(function(callback, idx, self) {
                callback(event.data.data);
            });
            return null;
        }
        
        var worker = new Worker(config.url);

        // proxy to worker
        // TODO: deprecate
        this.postMessage = function() {
            if (typeof arguments[0] === "string") {
                arguments[0] = {message: "hello", data:arguments[0]};
            }
            worker.postMessage.apply(worker, arguments);
        };

        worker.addEventListener("message", eventHandler);

        /**
         * Get an event object from the worker and trigger the associated callback(s) 
         */
        function eventHandler(event) {
            if (!event.data.message) {
                console.warn("I don't recognize the web worker event... maybe it isn't for me?");
                return null;
            }
            if (events[event.data.message] !== undefined) {
                trigger(event);
            }
            else {
                console.warn("I see no event handler callbacks for message="+event.data.message);
            }
        }

        function configManager(config) {
            if (!config.url) { throw new Error("missing a url"); }
            return;
        }

        return this;
    }

    return HardWorker;
});
