var http = require("http"),
    puts = require("sys").puts,
    configFile = process.ARGV[2] || "./config",
    config = require(configFile),
    fs = require("fs"),
    responses = [],
    callbackContent = "";



puts("   \\\\");
puts("   (o>");
puts("\\\\_//)");
puts(" \\_/_)");
puts("  _|_");
puts("Pokeserver");

puts("  used port: " + config.serverSettings.port || 8080);
puts("  config file: " + configFile);
puts("  watched files:");
files.forEach( function (file) {
    puts("      " + file);
});


readCallback(config.serverSettings.callback || "", function (data) {
    callbackContent = data;
});

watchFiles(config.serverSettings.files || []);


// creating a http server
http.createServer(function (req, res) {

    responses.push(res);

    process.addListener("SIGINT", function () {

        // closing the responses
        responses.forEach( function (response) {

           response.close();
        });

        puts("good bye");
        process.exit(0);
    });

    res.sendHeader( 200, {"Content-Type" : "text/javascript"} );


}).listen(config.serverSettings.port || 8080);






/**
* Reads the callback file
*
* @param fn {String} Filename
* @param successHandler {Function}
*/
function readCallback(fn, successHandler) {

    if (fn !== "") {
        fs.readFile(fn, function (err, data) {
            if (err) {
              throw err;
            }

            if (successHandler !== undefined) {
                successHandler(data);
            }
        });
    }
}

/**
* Adds change listener to the files
*
* @param files {Array}
*/
function watchFiles(files) {

    files.forEach( function (file) {

        // if one of the files changed
        fs.watchFile(file, function (curr, prev) {

            if ((curr.mtime + "") != (prev.mtime + "")) {
                puts(files + " changed");

                if (responses.length > 0) {
                    responses.forEach( function (response) {
                        if (response != null) {
                            response.write("window.location.reload();");
                            response.close();
                            response = null;
                        }
                    });
                    response = [];
                } else {
                    puts("ERROR: no response object");
                }
            }
        });
    });
}