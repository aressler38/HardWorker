(function() {

    function identityFunction(data) {
        console.log("Inside the task loaded by the Worker, I see this data :");
        for (var i in data) { console.log(i + " : " + data[i]); }
        return data;
    }

    return identityFunction;

})();
