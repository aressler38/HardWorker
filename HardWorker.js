define([
    "./lib/utils/Events"
], function(Events) {

    function extend(base, extension) {
        for (var thing in extension) {
            base[thing] = extension[thing];
        }
    }

    /**
     * 
     */
    function HardWorker(config) {
        config = (typeof config === "object") ? config : {
            url: undefined
        };
        configManager(config);

        extend(this, new Events());
        var worker = new Worker (config.url);

        // proxy to worker
        this.postMessage = function() {
            if (typeof arguments[0] === "string") {
                arguments[0] = {message: "hello", data:arguments[0]};
                console.log(arguments);
            }
            worker.postMessage.apply(worker, arguments);
        };

        worker.addEventListener("message", eventHandler);

        function eventHandler(event) {
            var message;
            console.log('event handler');
            console.log(event);
        }

        function configManager(config) {
            if (!config.url) { throw new Error("missing a url"); }
            return;
        }
        return this;
    }


    return HardWorker;
});
