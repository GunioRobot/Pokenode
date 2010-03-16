var http = require("http"),
    puts = require("sys").puts,
    config = require(process.ARGV[2] || "./config"),
    fs = require("fs"),
    files = config.serverSettings.files || [],
    responses = [];


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


puts("Pokeserver");
puts("----------");
puts("Port: " + config.serverSettings.port || 8080);
puts("Watched files");
files.forEach( function (file) {
    puts(file);
});
puts("----------");


