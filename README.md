
# HardWorker #
An instance of HardWorker creates a new Worker and gives you an API to execute 
callbacks and load modules inside of the Worker's context. These features allow you
to manage multiple tasks  
Think of it as your Web Worker liaison.

# API #

First, make a new `HardWorker` instance.

    var hardWorker = new HardWorker();

#### loadScript

Use `loadScript` when you need to import a library file. For example:

    hardWorker.loadScript( "./lib/require.js" , callback );

The first parameter is a url path to the JavaScript file that you want. The second parameer is optional, but
it's triggered when the `onload` of the `XMLHttpRequest` *inside* the worker executes. It's executed in the 
context of the window (not the worker). A call to `loadScript` is similar to a call to `loadModule` except that
no `workerCallback` function are bound.

#### loadModule

Use `loadModule` to GET a JavaScript IIFE or AMD file. In either case, the module needs to return a function.

    hardWorker.loadModule({
        trigger: "foo", 
        path: "./some_url_path/myModule.js"
    }, workerCallback, XHRCallback);

The `loadModule` method takes three arguments: (1) an object representing where the physical file resides and 
an alias (trigger) that allows you to execute the module, (2) the `workerCallback` that is executed after you 
trigger the module, and (3) the `XHRCallback`, which becomes the onload of an XMLHttpRequest, and is called after 
the module finishes transfering into the browser. 

*Example Modules*

A module file can be a self calling function:
    
    (function (global) {
        return function identityTask(trigger_data) {
            return trigger_data;
        }
    })(this);

If you've already loaded an AMD loader via `loadModule`, then you can start loading AMD files:

    define(["dependency"], function(baz) {
        return task(data) {
            return baz(data);
        };
    }); 

#### trigger

Trigger a worker module and pass data to your task function. 

    hardWorker.trigger( "foo" , { bar: "baz" } ); 

This example will signal `HardWorker` to find the module associated with the "foo" trigger and execute it by
passing any additional parameters (e.g. `{bar:"baz"}`).


#### on

Bind additional event handlers to a given trigger. 

    hardWorker.on( "foo", function(data_from_module_return_value) {
        // You needed to bind another worker callback for whatever reason. 
    });


## TODOs 
* test cases for requirejs support. 
* allow loading scripts like worker.loadScript, however don't use loadScript because it gives no callback support.
* combine scriptLoaderHandler and moduleReadyHandler into a pending[whatever] handler
