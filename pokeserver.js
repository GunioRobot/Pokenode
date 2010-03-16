var http = require("http"),
    puts = require("sys").puts,
    config = require("./config"),
    fs = require("fs");

http.createServer(function (req, res) {

    var files = config.serverSettings.files || [];

    // if one of the files changed

    // fs.watchFile(files[0], function (curr, prev) {
    //     res.write("window.location.reload();");
    //     res.close();
    //     puts("changed");
    // });

    files.forEach( function (file) {
        fs.watchFile(file, function (curr, prev) {
            res.write("window.location.reload();");
            res.close();
        });
    });


    process.addListener("SIGINT", function () {
        res.close();
        puts("good bye");
        process.exit(0)
    });

    res.sendHeader( 200, {"Content-Type" : "text/javascript"} );


}).listen(config.serverSettings.port || 8080);