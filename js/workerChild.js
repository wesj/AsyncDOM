var timers = { }
var printTimers = function () {
  for (var i in timers) {
    console.log("ChildTimer " + i + " = " + timers[i]);
  }
}

function time(name, foo) {
  var start = performance.now();
  var ret = foo();
  if (!timers[name]) timers[name] = 0;
  timers[name] += performance.now() - start;
  return ret;
}

(function() {

function release(result) {
    if (!result) {
        return;
    } else if (typeof(result) == "object" && "guid" in result) {
        if (result.guid && !result._retain) {
            // console.log("Releasing", result);
            msgs.push({
                name: "release",
                messageID: 0,
                target: result.guid,
                methodName: "",
                args: null
            });
            realSend();
        }
    } else if (Array.isArray(result)) {
        result.map(release);
    }
}

function wrap(result) {
  return time("wrap", function() {
      if (result instanceof Window) {
        return { guid: "Window" };
      } else if (result instanceof HTMLElement) {
        return wrapObject(result, "HTMLElement");
      // } else if (result instanceof HTMLCollection) {
      //   return Array.prototype.map.call(result, wrap);
      } else if (Array.isArray(result)) {
        return result.map(wrap);
      } else if (result instanceof DOMImplementation) {
        return wrapObject(result, "DOMImplementation");
      }
      return result;
    })
}

function wrapObject(obj, className) {
    if ("guid" in obj) {
      return {
        guid: obj.guid,
        className: className
      };
    }

    targets[targetID] = obj;

    targetID++;
    return {
      guid: targetID-1,
      className: className
    };
}

onmessage = function(e) {
    for (var i in e.data) {
        if (e.data[i] && e.data[i].name) {
            parseMessage(e.data[i]);
        }
    }
}

function parseMessage(msg) {
    time("parseMessage", function() {
    if ("id" in msg) {
        // console.log("result", msg.result);
        var result = unwrap(msg.result) // .then(function(result) {
        messages[msg.id].promise.then(function() {
            release(result);
        })

        if (msg.success) { messages[msg.id].resolve(result);
        } else { messages[msg.id].reject(result); }
        messages[msg.id] = null;
        // });
    } else if (msg.name == "EventResponse") {
        targets[msg.target].eventListeners[msg.methodName](msg.event);
    } else if (msg.name == "LoadScripts") {
        importScripts.call(this, msg.scripts);
    }
    });
}

var messages = { };
var msgs = [];
var messageID = 0;

function sendDOMMessage(type, target, method, args) {
    var id = messageID++;
    messages[id] = {};
    var p = new Promise(function (resolve, reject) {
        messages[id].resolve = resolve;
        messages[id].reject = reject;
        msgs.push({
            name: type,
            messageID: id,
            target: target,
            methodName: method,
            args: wrap(args)
        });
        realSend();
    });
    messages[id].promise = p;
    return p;
}

function addPrototype(obj, properties, methods, eventProperties) {
  properties.forEach(function(property) {
    addGetter(obj, property);
  })

  methods.forEach(function(method) {
    addMethod(obj, method);
  })

  eventProperties.forEach(function(prop) {
    addEventProperty(obj, prop);
  });
}

function addGetter(obj, name) {
  Object.defineProperty(obj, name, {
    enumerable: true,
    get: function() { return sendDOMMessage("getter", this.guid, name); },
    set: function(val) { return sendDOMMessage("setter", this.guid, name, val); }
  });

  Object.defineProperty(obj, "set" + name.charAt(0).toUpperCase() + name.substring(1), {
    value: function(newValue) {
        return sendDOMMessage("setter", this.guid, name, newValue);
    }
  })
}

function addMethod(obj, name) {
  obj[name] = function() {
    var args = Array.prototype.slice.call(arguments,0)
    return sendDOMMessage("method", this.guid, name, args);
  }
}

function addEventProperty(obj, name) {
  Object.defineProperty(obj, name, {
    get: function() {
      return this.eventListeners[name];
    },
    set: function(val) {
      this.eventListeners[name] = val;
      return sendDOMMessage("eventProperty", this.guid, name, val ? name : null);
    }
  })
}

var WindowProperties = [
    // "applicationCache",
    // "caches",
    // "closed",
    // "controllers",
    // "crypto",
    // "defaultStatus",
    // "devicePixelRatio",
    // "dialogArguments",
    // "directories",
    // "document",
    // "frameElement",
    // "frames",
    /*
    "fullScreen",
    "history",
    "innerHeight",
    "innerWidth",
    "length",
    "localStorage",
    "location",
    "locationbar",
    "menubar",
    "messageManager",
    "mozAnimationStartTime",
    "mozInnerScreenX",
    "mozInnerScreenY",
    "mozPaintCount",
    "name",
    "onbeforeinstallprompt",
    //WindowEventHandlers.onbeforeunload
    //WindowEventHandlers.onafterprint
    //WindowEventHandlers.onpopstate
    //WindowEventHandlers.onunload
    //GlobalEventHandlers.onabort
    //GlobalEventHandlers.onblur
    //GlobalEventHandlers.onchange
    //GlobalEventHandlers.onclick
    //GlobalEventHandlers.onclose
    //GlobalEventHandlers.oncontextmenu
    //GlobalEventHandlers.ondblclick
    //GlobalEventHandlers.onerror
    //GlobalEventHandlers.onfocus
    //WindowEventHandlers.onhashchange
    //GlobalEventHandlers.oninput
    //GlobalEventHandlers.onkeydown
    //GlobalEventHandlers.onkeypress
    //GlobalEventHandlers.onkeyup
    //WindowEventHandlers.onlanguagechange
    //GlobalEventHandlers.onload
    //GlobalEventHandlers.onmousedown
    //GlobalEventHandlers.onmousemove
    //GlobalEventHandlers.onmouseout
    //GlobalEventHandlers.onmouseover
    //GlobalEventHandlers.onmouseup
    //GlobalEventHandlers.onreset
    //GlobalEventHandlers.onresize
    //GlobalEventHandlers.onscroll
    //GlobalEventHandlers.onselect
    //GlobalEventHandlers.onsubmit
    "ondevicelight",
    "ondevicemotion",
    "ondeviceorientation",
    "ondeviceproximity",
    "ondragdrop",
    "onmozbeforepaint",
    "onmoztimechange",
    "onpaint",
    "onuserproximity",
    "opener",
    "outerHeight",
    "outerWidth",
    "parent",
    "performance",
    "personalbar",
    "pkcs11",
    "screen",
    "screenX",
    "screenY",
    "scrollbars",
    "scrollMaxX",
    "scrollMaxY",
    "scrollX",
    "scrollY",
    "self",
    "sessionStorage",
    "status",
    "statusbar",
    "toolbar",
    "top",
    "URL",
    "window",
    */
]

var URLUtilsProperties = [
    "hash",
    "host",
    "hostname",
    "href",
    "origin",
    "password",
    "pathname",
    "port",
    "protocol",
    "search",
    "searchParams",
    "username",
]

var URLUtilsMethods = [
    "toString",
]

var LocationMethods = [
    "assign",
    "reload",
    "replace",
]

var ElementProperties = [
    "accessKey",
    "attributes",
    "childElementCount",
    "children",
    "classList",
    "className",
    "clientHeight",
    "clientLeft",
    "clientTop",
    "clientWidth",
    "firstElementChild",
    "id",
    "innerHTML",
    "lastElementChild",
    "name",
    "nextElementSibling",
    "onwheel",
    "outerHTML",
    "previousElementSibling",
    "scrollHeight",
    "scrollLeft",
    "scrollLeftMax",
    "scrollTop",
    "scrollTopMax",
    "scrollWidth",
    "tagName",
];
var DOMImplementationMethod = [
    "createDocument",
    "createDocumentType",
    "createHTMLDocument",
    "hasFeature"
]
var ElementMethods = [
    "closest",
    "getAttribute",
    "getAttributeNode",
    "getAttributeNodeNS",
    "getAttributeNS",
    "getBoundingClientRect",
    "getClientRects",
    "getElementsByClassName",
    "getElementsByTagName",
    "getElementsByTagNameNS",
    "hasAttribute",
    "hasAttributeNS",
    "hasAttributes",
    "insertAdjacentHTML",
    "matches",
    "querySelector",
    "querySelectorAll",
    "remove",
    "removeAttribute",
    "removeAttributeNode",
    "removeAttributeNS",
    "requestFullscreen",
    "requestPointerLock",
    "scrollIntoView",
    "setAttribute",
    "setAttributeNode",
    "setAttributeNodeNS",
    "setAttributeNS",
    "setCapture",
]

var DocumentProperties = [
    "activeElement",
    "alinkColor",
    "anchors",
    "applets",
    "async",
    "bgColor",
    "body",
    "characterSet",
    "childElementCount",
    "children",
    "compatMode",
    "contentType",
    "currentScript",
    "defaultView",
    "designMode",
    "dir",
    "doctype",
    "documentElement",
    "documentURI",
    "documentURIObject",
    "domain",
    "domConfig",
    "embeds",
    "fgColor",
    "firstElementChild",
    "forms",
    "head",
    "height",
    "images",
    "implementation",
    "inputEncoding",
    "lastElementChild",
    "lastModified",
    "lastStyleSheetSet",
    "linkColor",
    "links",
    "location",
    "mozFullScreen",
    "mozFullScreenElement",
    "mozFullScreenEnabled",
    "mozSyntheticDocument",
    "onafterscriptexecute",
    "onbeforescriptexecute",
    "onoffline",
    "ononline",
    "origin",
    "plugins",
    "pointerLockElement",
    "popupNode",
    "preferredStyleSheetSet",
    "readyState",
    "referrer",
    "scripts",
    "scrollingElement",
    "selectedStyleSheetSet",
    "styleSheets",
    "styleSheetSets",
    "title",
    "tooltipNode",
    "URL",
    "vlinkColor",
    "width",
    "xmlEncoding",
    "xmlVersion",
]
var DocumentMethods = [
    "adoptNode",
    "caretPositionFromPoint",
    "caretRangeFromPoint",
    "clear",
    "close",
    "createAttribute",
    "createCDATASection",
    "createComment",
    "createDocumentFragment",
    "createElement",
    "createElementNS",
    "createEntityReference",
    "createEvent",
    "createExpression",
    "createNodeIterator",
    "createNSResolver",
    "createProcessingInstruction",
    "createRange",
    "createTextNode",
    "createTouch",
    "createTouchList",
    "createTreeWalker",
    "elementFromPoint",
    "enableStyleSheetsForSet",
    "evaluate",
    "execCommand",
    "exitPointerLock",
    "getBoxObjectFor",
    "getElementById",
    "getElementsByClassName",
    "getElementsByName",
    "getElementsByTagName",
    "getElementsByTagNameNS",
    "getSelection",
    "hasFocus",
    "importNode",
    "loadOverlay",
    "mozCancelFullScreen",
    "mozSetImageElement",
    "open",
    "queryCommandSupported",
    "querySelector",
    "querySelectorAll",
    "registerElement",
    "releaseCapture",
    "write",
    "writeln",
]

var NodeProperties = [
    "baseURI",
    "baseURIObject",
    "childNodes",
    "firstChild",
    "lastChild",
    "localName",
    "namespaceURI",
    "nextSibling",
    "nodeName",
    "nodePrincipal",
    "nodeType",
    "nodeValue",
    "ownerDocument",
    "parentElement",
    "parentNode",
    "prefix",
    "previousSibling",
    "textContent"
];
var NodeMethods = [
    "appendChild",
    "cloneNode",
    "compareDocumentPosition",
    "contains",
    "getUserData",
    "hasChildNodes",
    "insertBefore",
    "isDefaultNamespace",
    "isEqualNode",
    "isSameNode",
    "isSupported",
    "lookupNamespaceURI",
    "lookupPrefix",
    "normalize",
    "removeChild",
    "replaceChild",
    "setUserData",
]
var HTMLProperties = [
    "contentEditable",
    "dataset",
    "dir",
    "isContentEditable",
    "lang",
    "offsetHeight",
    "offsetLeft",
    "offsetParent",
    "offsetTop",
    "offsetWidth",
    "style",
    "tabIndex",
    "title",
]
var HTMLEventProperites = [
  "onabort",
  "onblur",
  "onchange",
  "onclick",
  "onclose",
  "oncontextmenu",
  "oncopy",
  "oncut",
  "ondblclick",
  "onerror",
  "onfocus",
  "oninput",
  "onkeydown",
  "onkeypress",
  "onkeyup",
  "onload",
  "onmousedown",
  "onmousemove",
  "onmouseout",
  "onmouseover",
  "onmouseup",
  "onpaste",
  "onreset",
  "onresize",
  "onscroll",
  "onselect",
  "onsubmit",
]

function EventTarget() { this.eventListeners = {} }
EventTarget.prototype = {
    addEventListener: function(event, listener, capture, untrusted) {
        var name = listener.name;
        this.eventListeners[event][name] = listener;
        return sendDOMMessage("eventListener", this.guid, "addEventListener", [event, capture, untrusted]);
    },
    removeEventListener: function(event, listener, capture) {
        var name = listener.name;
        this.eventListeners[event][name] = null;
        return sendDOMMessage("eventListener", this.guid, "removeEventListener", [event, name, capture]);
    }
}

var WAIT = 1;
var realSend = debounce(function() {
    postMessage(msgs);
    msgs = [];
}, WAIT);
function debounce(func, wait, immediate) {
    var timeout;
    var ignore = 0;
    var later = function() {
        if (ignore > 0) {
            ignore--;
            return;
        }
        ignore = 0;
        timeout = null;
        func();
    };

    return function() {
        if (timeout) { ignore++; } //clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

var URLUtils = function() { }
Window.prototype.URLUtils = URLUtils;
addPrototype(URLUtils.prototype, URLUtilsProperties, URLUtilsMethods, []);

var Location = function() { URLUtils.call(this); }
Window.prototype.Location = Location;
addPrototype(Location.prototype, [], LocationMethods, []);

var Node = function() { EventTarget.call(this); }
Node.prototype = Object.create(EventTarget.prototype);
Node.prototype.toString = function() { return "[object Node]"; }
Node.prototype.retain = function() { this._retain = true; }
Node.prototype.release = function() { this._retain = false; release(this); }
Window.prototype.Node = Node;
addPrototype(Node.prototype, NodeProperties, NodeMethods, []);

var Document = function() { Node.call(this); }
Document.prototype = Object.create(Node.prototype);
Window.prototype.Document = Document;
addPrototype(Document.prototype, DocumentProperties, DocumentMethods, [])

var Element = function() { Node.call(this); }
Element.prototype = Object.create(Node.prototype);
Window.prototype.Element = Element;
addPrototype(Element.prototype, ElementProperties, ElementMethods, []);

var HTMLElement = function() { Element.call(this); }
HTMLElement.prototype = Object.create(Element.prototype);
Window.prototype.HTMLElement = HTMLElement;
addPrototype(HTMLElement.prototype, HTMLProperties, [], HTMLEventProperites);

var HTMLUnknownElement = function() { HTMLElement.call(this); }
HTMLUnknownElement.prototype = Object.create(HTMLElement.prototype);
Window.prototype.HTMLUnknownElement = HTMLUnknownElement;

var HTMLHtmlElement = function() { HTMLElement.call(this); }
HTMLHtmlElement.prototype = Object.create(HTMLElement.prototype);
Window.prototype.HTMLHtmlElement = HTMLHtmlElement;

var HTMLBodyElement = function() { HTMLElement.call(this); }
HTMLBodyElement.prototype = Object.create(HTMLElement.prototype);
Window.prototype.HTMLBodyElement = HTMLBodyElement;

var HTMLHeadElement = function() { HTMLElement.call(this); }
HTMLHeadElement.prototype = Object.create(HTMLElement.prototype);
Window.prototype.HTMLHeadElement = HTMLHeadElement;

var HTMLAnchorElement = function() { HTMLElement.call(this); }
HTMLAnchorElement.prototype = Object.create(HTMLElement.prototype);
Window.prototype.HTMLAnchorElement = HTMLAnchorElement;

var HTMLLIElement = function() { HTMLElement.call(this); }
HTMLLIElement.prototype = Object.create(HTMLElement.prototype);
Window.prototype.HTMLLIElement = HTMLLIElement;
HTMLLIElement.prototype.toString = function() { return "[object HTMLLIElement]"; }

var HTMLScriptElement = function() { HTMLElement.call(this); }
HTMLScriptElement.prototype = Object.create(HTMLElement.prototype);
Window.prototype.HTMLScriptElement = HTMLScriptElement;
HTMLScriptElement.prototype.toString = function() { return "[object HTMLScriptElement]"; }

var HTMLUListElement = function() { HTMLElement.call(this); }
HTMLUListElement.prototype = Object.create(HTMLElement.prototype);
Window.prototype.HTMLUListElement = HTMLUListElement;
HTMLUListElement.prototype.toString = function() { return "[object HTMLUListElement]"; }

var HTMLDocument = function() { Document.call(this); }
HTMLDocument.prototype = Object.create(Document.prototype);
HTMLDocument.prototype.guid = "Document";
Window.prototype.HTMLDocument = HTMLDocument;
addPrototype(HTMLDocument.prototype, [], ["getElementById"], []);

var DOMStringList = function() { }
Window.prototype.DOMStringList = DOMStringList;
addPrototype(DOMStringList.prototype, ["length"], ["item", "contains"], []);

var CSSStyleSheet = function() { }
Window.prototype.CSSStyleSheet = CSSStyleSheet;
addPrototype(CSSStyleSheet.prototype, [], [], []);

var DOMImplementation = function() { }
DOMImplementation.prototype = {}
addPrototype(DOMImplementation.prototype, [], DOMImplementationMethod, []);
Window.prototype.DOMImplementation = DOMImplementation;
addPrototype(Window.prototype, WindowProperties, ["alert"], []);

var targetID = 0;
addPrototype(Window.prototype, WindowProperties, ["printTimers"], []);
})();

function Window() { }
Window.prototype.console = Promise.resolve(console);
Window.prototype.navigator = Promise.resolve(navigator);

var document = new Window.prototype.HTMLDocument();
var window = new Window();
window.guid = "Window";
var targets = {"Document": document, "Window": window };

function unwrap(result) {
  return time("unwrap", function() {
      if (!result) {
        return result;
      } else if (typeof(result) == "object" && "guid" in result) {
        if (targets[result.guid]) {
            return targets[result.guid];
        }
        return unwrapObject(result);
      } else if (Array.isArray(result)) {
        return result.map(unwrap);
      }

      return result;
    })
}

function unwrapObject(result) {
    // console.log(result);
    var obj = new Window.prototype[result.className]();
    obj.guid = result.guid;
    targets[result.guid] = obj;
    return obj;
}

