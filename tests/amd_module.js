define(["tests/amd_module_dependency"], function(dep) {
    return function testAMD(data) {
        console.log("amd test triggered with data: "+ data); 
        console.log("and loaded dependency: \n"+ dep());
        return {test:"finished"};
    };
});
