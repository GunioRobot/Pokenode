alert("Don't worry, file changed.");

// we have to make a request to the server again
var script = document.createElement("script"),
    head = document.getElementsByTagName('head')[0],
    rnd = Math.random() * 10000;

if (head !== undefined) {
    script.setAttribute("src","http://localhost:8080/?rnd=" + Math.round(rnd));
    head.appendChild(script);
}

