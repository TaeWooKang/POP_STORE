var watermark = require('image-watermark');
var path = require('path');
var fs = require('fs');
(function() {
    var childProcess = require("child_process");
    var oldSpawn = childProcess.spawn;
    function mySpawn() {
        console.log('spawn called');
        console.log(arguments);
        var result = oldSpawn.apply(this, arguments);
        return result;
    }
    childProcess.spawn = mySpawn;
})();


/*
var imagePath = path.resolve(__dirname, '3333.jpg');
var options = {
    'text':"hi"
}
console.log(imagePath)
watermark.embedWatermarkWithCb(imagePath, options, function(err) {
    if (err){
        console.log("###########",err)
    }
    else{
        console.log('Succefully embeded watermark');
    }
});
*/