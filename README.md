
# HardWorker #
An instance of HardWorker creates a new Worker and gives you an API to execute 
callbacks and load modules inside of the Worker's context. These features allow you
to manage multiple tasks  
Think of it as your Web Worker liaison.

# API #

First, make a new `HardWorker` instance.

    var hardWorker = new HardWorker();


## loadModule
Use `loadModule` to GET a JavaScript IIFE or AMD file. In either case, the module needs to return a function.

    hardWorker.loadModule({
        trigger: "foo", 
        path: "./some_url_path/myModule.js"
    }, `workerCallback`, `XHRCallback`);

The `loadModule` method takes three arguments: (1) an object representing where the physical file resides and 
an alias (trigger) that allows you to execute the module, (2) the `workerCallback` that is executed after you 
trigger the module, and (3) the `XHRCallback`, which becomes the onload of an XMLHttpRequest, and is called after 
the module finishes transfering into the browser. 

The module loaded can be a sell calling function:
    
    (function (global) {
        return identityTask(trigger_data) {
            return trigger_data;
        }
    })(this);

If you have already loaded an AMD loader (like require) via `loadModule`, then you can start loading AMD files:

    define(["dependency"], function(baz) {
        return task(data) {
            return baz(data);
        };
    }); 
    
Trigger a worker module and pass data to your task function. 

    hardWorker.trigger( "foo" , { bar: "baz" } ); 




## TODOs 
* test cases for requirejs support. 

