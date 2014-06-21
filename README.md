# HardWorker #
An instance of HardWorker creates a new Worker and gives you an API to execute 
callbacks and load modules inside of the Worker's context. These features allow you
to manage multiple tasks  
Think of it as your Web Worker liaison.

# API #

Create a hardWorker

    var hardWorker = new HardWorker();


load an external script that you want to be executed on a `trigger` call.

    hardWorker.loadModule({
        name: "myModule", 
        path:"./modules/tasks/task1.js"
    }, workerCallback, XHRCallback);


## TODOs 
* Events on the HardWorker and mainHardWorker are organized in tables, but I am not yet able to 
differentiate the event callback results that are created in the mainHardWorker's trigger method.
I will need to add some additional metadata that helps me map the results of the trigger callbacks
to their respective handlers. Or, since the table for event X in the HardWorker and the mainHardWorker
should already be in 1-1 correspondance, I may be able to simply keep track of the index while the 
callbacks are being executed.
