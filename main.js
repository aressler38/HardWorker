this.onmessage = function(event) {
    //importScripts("main.js");
    switch(event.data.message) {
        case "hello":
            reply("HI I CAN SEE YOU");
            console.log("HI I CAN SEE YOU");
            break;
        default:
            reply("I don't have a binding for message: "+event.data.message);

    }
}

function reply(type, data) {
    data = (data === undefined) ? type : data;
    if (!data) { throw new Error ("no type, no data, no go."); }
    postMessage({
        message: type,
        data:data,
        extra: "reply from the worker..."
    });
}
