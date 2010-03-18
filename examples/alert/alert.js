alert("Don't worry, file changed.");

// we have to make a request to the server again
var script = document.getElementById("pokenode-server-callback"),
    head,
    rnd = Math.random() * 10000,
    portNumber = 8080;

// removing the old script tag
if (script != null && script.parentNode != null) {
    script.parentNode.removeChild(script);
}

// inserting the new one
script = document.createElement("script");
script.setAttribute("src","http://localhost:" + portNumber + "/?rnd=" + Math.round(rnd));
head = document.getElementsByTagName('head')[0];

if (head !== undefined) {
    head.appendChild(script);
}
script.setAttribute("id","pokenode-server-callback");
