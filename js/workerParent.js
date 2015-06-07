(function() {
  var myWorker = new Worker("js/workerChild.js");
  var targetID = 0;
  var targets = [];

  myWorker.onmessage = function(e) {
    var messageId = e.data.messageID;
    var target = getTarget(e.data.target);
    var methodName = e.data.methodName;
    var args = e.data.args;
    args = (args && args.map) ? args.map(function(arg) {
      if (arg && arg.guid) {
        return getTarget(arg.guid);
      }
      return arg;
    }) : args;

    var result;
    var success = false
    try {
      // console.log(e.data.name, methodName);
      if (e.data.name == "method") {
        result = target[methodName].apply(target, args);
        // console.log("result", methodName, result);
      } else if (e.data.name == "getter") {
        // console.log("Get", methodName);
        result = target[methodName];
        methodName = "get_" + methodName;
      } else if (e.data.name == "setter") {
        target[methodName] = args;
        methodName = "set_" + methodName;
      } else if (e.data.name == "eventProperty") {
        target[methodName] = args ? function(event) {
          myWorker.postMessage({
            name: "EventResponse",
            methodName: methodName,
            target: e.data.target,
            event: eventWrapper(event),
          })
        } : null;
      } else if (e.data.name == "eventListener") {
        console.log('eventListener', methodName);
        // TODO: We need to name this if we want to remove it later...
        var listener = function(event) {
          myWorker.postMessage({
            name: "EventResponse",
            methodName: args[0],
            target: e.data.target,
            event: eventWrapper(event),
          })
        }
        target.addEventListener(args[0], listener, args[1], args[2]);
      }

      if (result instanceof Node) {
        targets.push(result);
        result = getDOMNode(result);
      } else if (result instanceof HTMLCollection) {
        result = Array.prototype.map.call(result, function(node) {
          targets.push(node);
          return getDOMNode(node);
        });
      }

      success = true;
      //console.log("result", methodName, result);
    } catch(ex) {
      console.log("Err", e.data, target, ex);
      result = ex.toString();
    }

    myWorker.postMessage({
      name: "returnMethod",
      methodName: methodName,
      success: success,
      id: messageId,
      result: result
    })
  }

  function eventWrapper(event) {
    return {
              bubbles: event.bubbles,
              cancelable: event.cancelable,
              currentTarget: getDOMNode(event.currentTarget),
              defaultPrevented: event.defaultPrevented,
              eventPhase: event.eventPhase,
              explicitOriginalTarget: getDOMNode(event.explicitOriginalTarget),
              isTrusted: event.isTrusted,
              originalTarget: getDOMNode(event.originalTarget),
              target: getDOMNode(event.target),
              timeStamp: event.timeStamp,
              type: event.type,
            }
  }

  function getTarget(guid) {
    if (guid == "Document") {
      return document;
    } else if (guid == "Window") {
      return window;
    }
    var res = document.querySelector('*[guid="' + guid + '"]')
    if (res) { return res; }

    for (target of targets) {
      if (target.getAttribute("guid") == guid) {
        return target;
      }
    }

    return null;
  }

  function getDOMNode(node) {
    if (node == null) return null;
    if (node.hasAttribute("guid")) {
      return {
        id: node.getAttribute("guid"),
        nodeName: node.nodeName,
        attributes: [],
      }
    }

    node.setAttribute("guid", targetID);
    var result = {
      id: targetID,
      nodeName: node.nodeName,
    }

    targetID++;

    return result;
  } 
  // myWorker.postMessage({ name: "start" });
  var scripts = document.querySelectorAll('script[type="dom-worker/javascript"]');
  scripts = Array.prototype.slice.call(scripts, 0).map(function(script) {
    return script.src;
  });
  myWorker.postMessage({ name: "LoadScripts", scripts: scripts });
})();