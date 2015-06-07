onmessage = function(e) {
  if (e.data.name == "returnMethod") {
    if (e.data.success) {
      if (e.data.result && e.data.result.nodeName) {
        e.data.result = createElement(e.data.result);
      } else if (e.data.result && Array.isArray(e.data.result)) {
        e.data.result = e.data.result.map(function(item) {
          if (item.nodeName) {
            return createElement(item);
          }
          return item;
        })
      }
      messages[e.data.id].resolve(e.data.result);
    } else {
      messages[e.data.id].reject(e.data.result);
    }
  } else if (e.data.name == "EventResponse") {
    targets[e.data.target].eventListeners[e.data.methodName](e.data.event);
  } else if (e.data.name == "LoadScripts") {
    importScripts.call(this, e.data.scripts);
  }
}

var messages = { };
var messageID = 0;

function sendDOMMessage(type, target, method, args) {
  return new Promise(function (resolve, reject) {
    var id = messageID++;
    messages[id] = {resolve: resolve, reject: reject};
    try {
      postMessage({
        name: type,
        messageID: id,
        target: target,
        methodName: method,
        args: args
      });
    } catch(ex) {
      console.log(ex, type, target, method, args);
      reject(ex);
    }
  })
}

function createElement(result) {
  if (targets[result.id]) {
    return targets[result.id];
  }
  var node = new HTMLElement(result.nodeName);
  targets[result.id] = node;
  node.guid = result.id;
  return node;
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
    get: function() { return sendDOMMessage("getter", this.guid, name); },
    set: function(val) { return sendDOMMessage("setter", this.guid, name, val); }
  });
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
    // "nodeName",
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

var WindowProperties = [
    "applicationCache",
    "caches",
    "closed",
    "controllers",
    "crypto",
    "defaultStatus",
    "devicePixelRatio",
    "dialogArguments",
    "directories",
    "document",
    "frameElement",
    "frames",
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
    // "navigator",
    "onbeforeinstallprompt",
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
]

function EventTarget() { this.eventListeners = {} }
EventTarget.prototype = {
    addEventListener: function(name, listener, capture, untrusted) {
      console.log("addEventListener");
      this.eventListeners[name] = listener;
      return sendDOMMessage("eventListener", this.guid, "addEventListener", [name, capture, untrusted]);
    },
    dispatchEvent: function() { },
    removeEventListener: function() { }
}

function Node(nodeName) { this.nodeName = nodeName; EventTarget.call(this); }
Node.prototype = Object.create(EventTarget.prototype);
addPrototype(Node.prototype, NodeProperties, NodeMethods, []);

function Document() { }
Document.prototype = Object.create(Node.prototype);
addPrototype(Document.prototype, DocumentProperties, DocumentMethods, [])

function Element(nodeName) { Node.call(this, nodeName); }
Element.prototype = Object.create(Node.prototype);
addPrototype(Element.prototype, ElementProperties, ElementMethods, []);

function HTMLElement(nodeName) { Element.call(this, nodeName); }
HTMLElement.prototype = Object.create(Element.prototype);
addPrototype(HTMLElement.prototype, HTMLProperties, [], HTMLEventProperites);

function HTMLDocument() { Document.call(this); }
HTMLDocument.prototype = Object.create(Document.prototype);
HTMLDocument.prototype.guid = "Document";
addPrototype(HTMLDocument.prototype, [], ["getElementById"], []);

function Window() { }
Window.prototype.guid = "Window";
Window.prototype.console = Promise.resolve(console);
Window.prototype.navigator = Promise.resolve(navigator);
addPrototype(Window.prototype, WindowProperties, ["alert"], []);

var document = new HTMLDocument();
var targets = { "Document": document, "Window": window };
var window = new Window();
