# HardWorker #
A better way of running tasks in a Worker thread.

# API #

Create a hardWorker

    var hardWorker = new HardWorker();


load an external script that you want to be executed on a `trigger` call.

    hardWorker.loadModule({
        name: "myModule", 
        path:"./modules/tasks/task1.js"
    }, workerCallback, XHRCallback);


