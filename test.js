(function() {
    function someTask(data) {
        console.log("i have data");
        console.log("and the data is this:");
        for (var i in data) console.log(i + " : " + data[i]);
    }
    return someTask;
})();
