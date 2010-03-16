var http = require("http"),
    puts = require("sys").puts,
    fs = require("fs"),
    fn = "index.html"

http.createServer(function (req, res) {

    fs.watchFile(fn, function (curr, prev) {
        res.write("window.location.reload();");
        res.close();        
    });
        
    process.addListener("SIGINT", function () {
        res.close();
        puts("good bye"); 
        process.exit(0) 
    });    
    
    // we handle the /pokenode only
    if (req.url === "/pokenode") {
        res.sendHeader( 200, {"Content-Type" : "text/javascript"} );
    } else {
        // bad request
        res.sendHeader(400);
        res.close();
    }
    
    
}).listen(8000);