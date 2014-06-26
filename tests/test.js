(function() {

    function taskFunction(data) {
        var byteLength = 1024;
        var buffer = new Uint8Array(byteLength);

        for (var i=0; i< byteLength; i++) {
            buffer[i] = i % 255;
        }

        return buffer;
    }

    return taskFunction;

})();
