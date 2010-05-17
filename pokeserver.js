var http = require("http"),
    sys = require("sys"),
    fs = require("fs"),
    url = require("url"),
    queryString = require('querystring'),
    proxy = require('../nodeproxy/nodeproxy'),
    mime = require('./mime');

var configFile = process.ARGV[2] || "./config",
    config = require(configFile),
    responses = [],
    files = config.serverSettings.files || [],
    foreignHostPort = config.serverSettings.remotePort || 8888,
    foreignHost = config.serverSettings.remoteHost || "localhost",
    customContentFile = config.serverSettings.contentFile || "pokeserver.html";

var customContent = "",
    callbackContent = "";

customContent = fs.readFileSync(customContentFile);

// PokeNode logo
drawLogo();

sys.puts("used port: " + config.serverSettings.port || 8080);
sys.puts("config file: " + configFile);


readCallback(config.serverSettings.callback || "", function (data) {
    callbackContent = data;
    sys.puts("\ncallback:");
    sys.puts(callbackContent);
    sys.puts("\n");
});


var watchedFiles = [];

// It goes through the files
files.forEach( function (file) {

    var stat = fs.statSync(file),
        fileList;
    if (stat !== undefined) {

        // if it's a directory we go into
        if (stat.isDirectory()) {
            fileList = parseFolder(file);

            watchedFiles = watchedFiles.concat(fileList);
        } else {
            watchedFiles.push(file);
        }
    }
});


watchFiles(watchedFiles);


// creating a http server
http.createServer(function (req, res) {

    var pathname = url.parse(req.url).pathname;

    switch (pathname) {

        case "/pokenodeserver/callback":

            responses.push(res);

            process.addListener("SIGINT", function () {

                // closing the responses
                responses.forEach( function (response) {

                   response.end();
                });

                sys.puts("good bye");
                process.exit(0);
            });

            res.writeHead( 200, {"Content-Type" : "text/javascript"} );

            break;

        case "pokenodeserver/admin":
            // implementation later

        default:

            proxy.nodeProxy(req, { foreignHost: foreignHost, foreignHostPort: foreignHostPort }, function (status, buffer, request, response, loc) {

                if (status > 400) {
                    res.writeHead(status);
                } else {

                    var headers = response.headers;

                    if (buffer !== undefined) {

                        var endIndex = buffer.lastIndexOf("</body>"),
                            head = buffer.substring(0, endIndex),
                            tail = buffer.substring(endIndex, buffer.length),
                            content = head + customContent + tail;


                        // set up the length
                        headers["content-length"] = content.length;
                    }

                    headers["referer"] = "http://" + foreignHost + ":" + foreignHostPort + req.url;

                    res.writeHead("200", headers);

                    if (content !== undefined && request.statusCode !== 304) {
                        res.write(content);
                    }

                }
                res.end();

            }, function (loc) {

                res.writeHead("302", { location: loc });
                res.end();
            });
    }

}).listen(config.serverSettings.port || 7777);



/**
* Parses a folder and returns a list of files
*
* @param root {String}
* @return {Array}
*/
function parseFolder(root) {

    var fileList = [];

    var files = fs.readdirSync(root);

    files.forEach( function (file) {

        var path = root + "/" + file;

        var stat = fs.statSync(path);
        if (stat !== undefined && !stat.isDirectory()) {
            fileList.push(path);
        }

        if (stat !== undefined && stat.isDirectory()) {
            fileList = fileList.concat(parseFolder(path));
        }
    });

    return fileList;
}


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

    var config = { persistent: true,
                   interval: 0
    };

    sys.puts("watched files:");

    files.forEach( function (file) {

        sys.puts(file);
        // if one of the files changed
        fs.watchFile(file, config, function (curr, prev) {

            if ((curr.mtime + "") != (prev.mtime + "")) {
                sys.puts(file + " changed");

                if (responses.length > 0) {
                    responses.forEach( function (response) {
                        if (response != null) {
                            response.write(callbackContent);
                            response.end();
                            response = null;
                        }
                    });
                    response = [];
                } else {
                    sys.puts("ERROR: no response object");
                }
            }
        });
    });
}

function drawLogo() {

    sys.puts("   \\\\");
    sys.puts("   (o>");
    sys.puts("\\\\_//)");
    sys.puts(" \\_/_)");
    sys.puts("  _|_");
    sys.puts("Pokeserver\n");
}

