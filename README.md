<pre>
       \\
       (o>
    \\_//)
     \_/_)
      _|_   .  \|/  \./      \|/ . .
    PokeNode Server
</pre>
------------------
PokeNode Server is little "push notification" utility based on NodeJS.

Picture this; you're developing an HTML file and you want to see the changes you made but you have to reload the page every time.

Not anymore! Here comes the PokeNode Server to help, it does the reloading for you.


### Running the Hello World example
Run the __helloworld.sh__ shell script in the root of the Pokenode server folder. It will start the Pokenode server with the configuration file found in this folder.

You'll see something like this
<pre>
   \\
   (o>
\\_//)
 \_/_)      
  _|_
Pokeserver

used port: 8080
config file: ./examples/helloworld/config
watched files:
  ./examples/helloworld/index.html

callback:
window.location.reload();
</pre>

The server successfully started on the 8080 port, and it's using the ./examples/helloworld/config.js config file.

Now, open the __index.html__ in your browser by simply entering the path to the file in the browser address bar or selecting "open" then browsing to the file.

After this, you're ready to change the content of the HTML and magically after you saved the changes, you'll see the changes in the browser. Hoorah for PokeNode!

### Configuration file

The configuration file is a JavaScript file containing a object literal.

Here is an example
<pre><code>
exports.serverSettings = {
    port: 8080,
    files: [
        './examples/helloworld/index.html'
    ],
    callback: './examples/helloworld/reload.js'
};
</code></pre>

The files array contains all the files that the server should watch.
