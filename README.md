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

Before the pleasure
------------
PokeNode requires [NodeJS](http://nodejs.org).


Running the Hello World example
------------
Run the __helloworld.sh__ shell script in the root of the Pokenode server folder. It will start the Pokenode server with the configuration file found in the examples/helloworld folder.

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

Configuration file
------------

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

Contributors
------------

* [Viktor Kelemen](http://yikulju.com)


License
------------

(The MIT License)

Copyright (c) 2009 RosePad &lt;dev@rosepad.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.