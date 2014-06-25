(function() {

    function taskFunction(data) {
        console.log("Inside the task loaded by the Worker, I see this data :");
        var byteLength = 1024;
        var buffer = new Uint8Array(byteLength);

        for (var i=0; i< byteLength; i++) {
            buffer[i] = i % 255;
        }

        return buffer;
    }

    return taskFunction;

})();
