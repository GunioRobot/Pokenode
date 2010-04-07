var http = require("http"),
    sys = require("sys"),
    fs = require("fs"),
    url = require("url"),
    queryString = require('querystring'),
    mime = require('./mime');

var configFile = process.ARGV[2] || "./config",
    config = require(configFile),
    responses = [],
    files = config.serverSettings.files || [],
    foreignHostPort = config.serverSettings.remotePort || 8888,
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

                   response.close();
                });

                sys.puts("good bye");
                process.exit(0);
            });

            res.writeHead( 200, {"Content-Type" : "text/javascript"} );

            break;

        case "pokenodeserver/admin":
            // implementation later

        default:

            proxy(req, function (status, buffer, response) {

                var endIndex = buffer.lastIndexOf("</body>"),
                    head = buffer.substring(0, endIndex),
                    tail = buffer.substring(endIndex, buffer.length),
                    content = head + customContent + tail;

                // modifying the length
                var headers = response.headers;

                headers["content-length"] = content.length;
                delete headers["Content-Length"];

                res.writeHead(response.statusCode, headers);

                res.write(content);
                res.close();
            }, function (loc) {

                res.writeHead("302", { location: loc });
                res.close();
            });
    }

}).listen(config.serverSettings.port || 8080);



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
                            response.close();
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

function proxy(req, htmlCallback, nonHtmlCallback) {


    var header = req.headers,
        host = header.host;

    var parsed = url.parse("http://"+host);

    var path = req.url.split("."),
        fileExtension = path[path.length - 1],
        loc = "http://" + parsed.hostname + ":" + foreignHostPort + req.url,
        sentData = "";

    var mimeType = mime.types[fileExtension] || "text/html";


    switch (mimeType) {

      case "text/html":
      case "application/xhtml+xml":

            // if it is HTML, we insert our custom code

            req.addListener("data", function (data) {
                sentData += data;
            });


            req.addListener("end", function () {

               // fetching the content from the server
               fetchData(req.method,"http://" + parsed.hostname + ":" + foreignHostPort + req.url, sentData, header, function (status, buffer, response) {

                   if (htmlCallback !== undefined) {

                       htmlCallback(status, buffer, response);
                   }
               });
            });

            break;

      default:

        if (nonHtmlCallback !== undefined) {
            nonHtmlCallback(loc);
        }
    }

}


/**
 * Mega super awesome private request utility.
 *
 * @param  {string} method
 * @param  {string} url
 * @param  {hash} data
 * @param  {hash} headers
 * @param  {function} callback
 * @param  {number} redirects
 * @api private
 */
function fetchData(method, uri, data, headers, callback, redirects) {

  var buf = '',
      redirects = redirects || 3,
      uri = url.parse(uri || ""),
      path = uri.pathname || '/',
      search = uri.search || '',
      hash = uri.hash || '',
      port = uri.port || 80,
      client = http.createClient(port, uri.hostname);

  headers.host = uri.hostname;

  if (headers.redirect) {
      redirects = headers.redirect;
      delete headers.redirect;
  }

   if (data) {

        if (typeof data != 'string') {
           data = queryString.stringify(data);
        }

        if (method === 'GET') {
          search += (search ? '&' : '?') + data;
        } else {
          headers['content-length'] = data.length;
          headers['content-type'] = 'application/x-www-form-urlencoded';
        }
  }

  var req = client.request(method, path + search + hash, headers);

  if (data && method !== 'GET') {
      req.write(data);
  }

  req.addListener('response', function(res) {

    if (req.statusCode < 200 || req.statusCode >= 400) {
      callback(new Error('request failed with status ' + res.statusCode + ' "' + http.STATUS_CODES[res.statusCode] + '"'));

    } else if (res.statusCode >= 300 && res.statusCode < 400) {

      redirects--;
      if (redirects > 0) {
        fetchData(method, res.headers.location, headers, data, callback, redirects);
      } else {
        callback(new Error('maximum number of redirects reached'));
      }
    } else {
      res.setBodyEncoding('utf8');
      res.addListener('data', function (chunk) {
          buf += chunk ;
      });

      res.addListener('end', function () {
          callback(null, buf, res);
      });
    }
  });

  req.close();
}

function drawLogo() {

    sys.puts("   \\\\");
    sys.puts("   (o>");
    sys.puts("\\\\_//)");
    sys.puts(" \\_/_)");
    sys.puts("  _|_");
    sys.puts("Pokeserver\n");
}

