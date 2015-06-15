var timers = {
}


function time(name, foo) {
  var start = performance.now();
  var ret = foo();
  if (!timers[name]) timers[name] = 0;
  timers[name] += performance.now() - start;
  return ret;
}

(function() {
var myWorker = new Worker("js/workerChild.js");
var targetID = 0;
var targets = [];
targets.Document = document;
targets.Window = window;

window.printTimers = function () {
  for (var i in timers) {
    console.log("Timer " + i + " = " + timers[i]);
  }
  console.log(targets);
}

var msgs = [];
var WAIT = 1;
var realSend = debounce(function() {
    myWorker.postMessage(msgs);
    msgs = [];
}, WAIT);

function debounce(func, wait) {
    var timeout;
    var ignore = 0;

    var later = function() {
      if (ignore > 0) {
        ignore--;
        return;
      }
      ignore = 0;
      timeout = null;
      // console.log("Send parent", msgs);
      func(); // .apply(context, arguments);
    };

    return function() {
        if (timeout) { ignore++; } //clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

  myWorker.onmessage = function(e) {
      //e.data.forEach(function(data) {
      // console.log("Transit parent " + (performance.now() - e.data.timeSent));
      time("onmessage", function() {
        for (var i = 0; i < e.data.length; i++) {
          var data = e.data[i];
          if (data && data.name) {
            parseMessage(data);
          }
        }
      })
  }

  function parseMessage(msg) {
    return time("parseMessage", function() {
      var args, target;
      var messageId = msg.messageID;
      var methodName = msg.methodName;
      time("setup", function() {
        args = unwrap(msg.args);
        target = getTarget(msg.target);
      })

    var result;
    var success = false
    var name = msg.name;
    try {
      // console.log(msg.name, methodName);
      if (name == "method") {
        time("callMethod", function() {
          result = target[methodName].apply(target, args);
        })
      } else if (name == "getter") {
        result = target[methodName];
      } else if (name == "setter") {
        time("callsetter", function() {
          result = target[methodName] = args;
        })
      } else if (name == "release") {
        if (target) {
          // console.log("Release", msg.target, target);
          delete targets[msg.target];
          // targets[msg.target] = null;
        }
        return;
      } else if (name == "eventProperty") {
        target[methodName] = args ? function(event) {
          msgs.push({
            name: "EventResponse",
            methodName: methodName,
            target: msg.target,
            event: eventWrapper(event),
          });
          realSend();
        } : null;
      } else if (name == "eventListener") {
        // TODO: We need to name this if we want to remove it later...
        var listener = function(event) {
          msgs.push({
            name: "EventResponse",
            methodName: args[0],
            target: msg.target,
            event: eventWrapper(event),
          });
          realSend();
        }
        if (methodName == "addEventListener") {
          listeners[args[1]] = listener;
          target.addEventListener(args[0], listener, args[2], args[3]);
        } else if (methodName == "removeEventListener") {
          var listener = listeners[args[1]];
          target.removeEventListener(args[0], listener, args[2]);
          listeners[args[1]] = null;
        }
      }

      result = wrap(result);

      success = true;
    } catch(ex) {
      result = ex.toString();
    }

    time("Finish", function() {
      var res = {
        name: "returnMethod",
        methodName: methodName,
        success: success,
        id: messageId,
        result: result
      }
      msgs.push(res);
      realSend();
    });
    });
  }

function unwrap(result) {
  return time("unwrap", function() {
    if (!result) {
      return result;
    } else if (typeof(result) == "object" && "guid" in result) {
      return targets[result.guid];
    } else if (Array.isArray(result)) {
      return result.map(unwrap);
    }
    return result;
  });
}

  function wrap(result) {
    return time("wrap", function() {
      var start = Date.now();
      if (!result) {
        return result;
      } else if (result instanceof Window) {
        return { guid: "Window" };
      } else if (result instanceof HTMLCollection || result instanceof StyleSheetList) {
        return Array.prototype.map.call(result, wrap);
      } else if (Array.isArray(result)) {
        return result.map(wrap);
      } else if (typeof(result) == "object" && result.constructor.name != "Object") {
        return wrapObject(result, result.constructor.name);
      }
      return result;
    });
  }

  function wrapObject(obj, className) {
    if ("__guid__" in obj) {
      return {
        guid: obj.__guid__,
        className: className
      };
    }

    obj.__guid__ = targetID;
    targets[targetID] = obj;

    targetID++;
    return {
      guid: targetID-1,
      className: className
    };
  }

  function eventWrapper(event) {
    return {
              bubbles: event.bubbles,
              cancelable: event.cancelable,
              currentTarget: convertResult(event.currentTarget),
              defaultPrevented: event.defaultPrevented,
              eventPhase: event.eventPhase,
              explicitOriginalTarget: convertResult(event.explicitOriginalTarget),
              isTrusted: event.isTrusted,
              originalTarget: convertResult(event.originalTarget),
              target: convertResult(event.target),
              timeStamp: event.timeStamp,
              type: event.type,
            }
  }

  function getTarget(guid) {
    if (targets[guid]) {
      return targets[guid];
    }

    return null;
  }

  /*
  function getDOMNode(node) {
    if (node == null) return null;
    if (node.hasAttribute("guid")) {
      return {
        guid: node.getAttribute("guid"),
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
  */

  // myWorker.postMessage({ name: "start" });
  var scripts = document.querySelectorAll('script[type="dom-worker/javascript"]');
  scripts = Array.prototype.slice.call(scripts, 0).map(function(script) {
    return script.src;
  });
  msgs.push({ name: "LoadScripts", scripts: scripts });
  realSend();
})();