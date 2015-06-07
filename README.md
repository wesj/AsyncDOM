# AsyncDOM
Playing around with what an asynchronous-DOM would look like on the web.

I've had this idea in my head for awhile now that you could proxy objects, specifically the DOM, over to a Web-Worker. That means that all DOM access essentially becomes async, which should result in a kinda interesting API.

As it is, that doesn't gain you a whole lot. All the DOM calls still have to happen on the main thread though. It just makes it a bit easier to avoid clogging it up with non-DOM stuff. Still, I think its interesting to see what an async-DOM api could look like. This one uses Promises for everything.

I also have an AsyncTask.js implementation which might be interesting to you if you're here:
https://github.com/wesj/AsyncTask.js

## Usage
The code right now is contained in two scripts, workerParent.js and workerChild.js. You only have to import workerParent.js into your html though:

    <script type="text/javascript" src="js/workerParent.js"></script>

This worker will load workerChild.js for you. It will also feed any scripts listed in your source as type "dom-worker/javascript" into the worker as well. i.e. you only need to put:

    <script type="dom-worker/javascript" src="js/myScript.js"></script>

in your HTML and you're off to the races. The worker script has access to some DOM-like objects, but rather than returning values, they all return promises. Heck, even methods that don't return values return Promises so you can know when they've finished. Your DOM code winds up looking something like:

    var n;
    document.querySelector("#Fish").then(function(node) {
      n = node; // Node is really a proxy to the real DOM node.
                // If we want to hold a reference to this
                // "node" ouside this block, we have to do it manually.
      node.setAttribute("cat", "dog"); // This is async, but we're ignoring the return.
                                       // Commands still happen in order (since they're
                                       // just postMessaging them over to the main thread).
      node.textContent = "Fish";       // Also async, ignored!
      return node.getAttribute("cat"); // Alternatively, we could call .then()
                                       // here and avoid holding the reference to node above.
    }).then(function(value) {
      // value == "dog"
      return n.textContent;
    }).then(function(text) {
      // text == "Fish"
      console.log(text);
      return document.anchors;
    }).then(function(nodes) {
      nodes.forEach(function(anchor) {
        anchor.setAttribute("style", "color: green;");
        document.createElement("input").then(function(input) {
          input.setAttribute("type", "range");
          return anchor.appendChild(input);
        })
      });
    }).catch(function(ex) {
      // If any of the above calls fail, we'll fall through to here.
      console.error(ex);
    });

If you want (and you're in a browser that supports it, you can use Task.js to make this look better:

    importScripts("Task.js");
    Task.spawn(function* () {
      var button = yield document.getElementById("Button");
      // Event listeners are also proxied in the current implementation
      // as well as event properties, i.e. button.onclick = function() { }
      button.addEventListener("click", Task.async(function* () {
        var nav = yield window.navigator;
        window.alert("Clicked " + nav);
        console.log("Done");
      }), true);
    });

## Support
This is a pretty early relaese. I should probably write this using Proxies themselves, but... I get the feeling they're on the outs from most browser vendors (I haven't seen much happen with them in 4 years). Instead, I'm just manually proxying interfaces. Most simple ones are easy. Some are... not (addEventListener for instance works by storing a reference to a function in the worker, and then attaching a real function in the parent. The parent's listener just postMessages the event to the child when its called).

Many objects just aren't proxied yet. For instance the CSSProperties interface isn't so node.style.backgroundColor won't work. I'll probably refactor soon to make that work, since its a recurring pattern. Simple types work fine though (as do DOMNodes).
