(function() {

    function identityFunction(data, callback) {
        console.log("i have data");
        console.log("and the data is this:");
        for (var i in data) console.log(i + " : " + data[i]);

        if (typeof callback !== "function") {
            console.warn("callback isn't a function whyyyyyyy!!!????");
        } else { callback(data) }

        return arguments;
    }

    return identityFunction;

})();
