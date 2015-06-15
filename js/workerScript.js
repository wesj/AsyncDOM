var n = 0;
var pass = 0;
var fail = 0;
function is(a, b, msg) {
  n++;
  if (a === b) {
    // console.log("PASS: " + msg, a, b);
    pass++;
  } else {
    console.error("FAIL: " + msg, a, b);
    fail++;
  }
}

function testSetGetProperty(obj, name, value, test, expected, expected2) {
  var stored;
  // console.log("Test " + name);
  return obj["set" + name.charAt(0).toUpperCase() + name.substring(1)](value).then(function(result) {
    stored = result;
    return unwrap(expected);
  }).then(function(res) {
    // console.log("Compare set", name, res, stored);
    is(res, test ? test(stored) : stored, "Got expected value setter " + name);      
    return obj[name];
  }).then(function(result) {
    stored = result;
    return unwrap(expected2 === undefined ? expected : expected2)
  }).then(function(res) {
    // console.log("Compare get", name, res, stored);
    is(res, test ? test(stored) : stored, "Got expected value for " + name);
    return res;
  });
}

function testGetProperty(obj, name, test, expected) {
  // console.log("Get", name);
  return obj[name].then(function(result) {
    var res = unwrap(expected) // .then(function(res) {
      is(res,
        test ? test(result) : result,
        "Got expected value for " + name);
    // })
  })
}

function testGetterProperty(obj, name, value, test, expected, expected2) {
  return obj["set" + name.charAt(0).toUpperCase() + name.substring(1)](value).then(function(result) {
    is(true, false, "Got expected value setter " + result);
  }).catch(function(result) {
    is(true, true, "Got expected value setter " + result);
    return obj[name];
  }).then(function(result) {
    var res = unwrap(expected2 === undefined ? expected : expected2) //.then(function(res) {
      is(res, test ? test(result) : result, "Got expected value for " + name);
      return res;
    // })
  })
}

function testDocument() {
return document.createElement("Foo").then(function(fakeNode) {
  var nodeCheck = function(res) { return res.guid; }
  var nodeLength = function(res) { return res.length; }
  return document.body.then(function(body) {
    return testSetGetProperty(document, "activeElement", fakeNode, null, fakeNode, body)
      .then(function() { return testSetGetProperty(document, "alinkColor", 0x00FFFF, null, 65535, "65535") })
      .then(function() { return testSetGetProperty(document, "anchors", [fakeNode], nodeLength, 1, 2) })
      .then(function() { return testSetGetProperty(document, "applets", [fakeNode], nodeLength, 1, 0) })
      .then(function() { return testSetGetProperty(document, "bgColor", 0x00FFFF, null, 65535, "65535") })
      .then(function() { return testSetGetProperty(document, "async", false, null, false, false) })
      .then(function() { return testGetterProperty(document, "body", fakeNode, null, fakeNode, body) })
      .then(function() { return testSetGetProperty(document, "characterSet", "en", null, "en", "windows-1252") })
      .then(function() { return testSetGetProperty(document, "childElementCount", "foo", null, "foo", 1) })
      .then(function() { return testSetGetProperty(document, "children", [fakeNode], nodeLength, 1, 1) })
      .then(function() { return testSetGetProperty(document, "compatMode", false, null, false, "BackCompat") })
      .then(function() { return testSetGetProperty(document, "contentType", "foo", null, "foo", "text/html") })
      .then(function() { return testSetGetProperty(document, "currentScript", "foo", null, "foo", null) })
      .then(function() { return testSetGetProperty(document, "defaultView", "foo", null, "foo", window) })
      .then(function() { return testSetGetProperty(document, "designMode", false, null, false, "off") })
      .then(function() { return testSetGetProperty(document, "dir", "rtl", null, "rtl") })
      .then(function() { return testSetGetProperty(document, "doctype", "doc", null, "doc", null) })
      .then(function() { return testSetGetProperty(document, "documentElement", fakeNode, null, fakeNode, {guid:4}) })
      .then(function() { return testSetGetProperty(document, "documentURI", "foo", function(res) { return res.endsWith("AsyncDom.html"); }, false, true) })
      .then(function() { return testSetGetProperty(document, "documentURIObject", "foo", null, "foo", "foo") })
      .then(function() { return testSetGetProperty(document, "domain", "foo", null, "foo", "") })
      .then(function() { return testSetGetProperty(document, "domConfig", "foo", null, "foo", "foo") })
      .then(function() { return testSetGetProperty(document, "embeds", { length: 1 }, nodeLength, 1, 0) })
      .then(function() { return testSetGetProperty(document, "fgColor", 0x00FFFF, null, 65535, "65535") })
      .then(function() { return testSetGetProperty(document, "firstElementChild", fakeNode, null, fakeNode, {guid:4}) })
      .then(function() { return testSetGetProperty(document, "forms", { length: 13}, nodeLength, 13, 0) })
      .then(function() { return testSetGetProperty(document, "head", fakeNode, null, fakeNode, {guid:5}) })
      .then(function() { return testSetGetProperty(document, "height", 4422, null, 4422) })
      .then(function() { return testSetGetProperty(document, "images", { length: 13 }, nodeLength, 13, 0) })
      .then(function() { return testSetGetProperty(document, "implementation", "foo", null, "foo", {guid:6}) })
      .then(function() { return testSetGetProperty(document, "inputEncoding", "foo", null, "foo", "windows-1252") })
      .then(function() { return testSetGetProperty(document, "lastElementChild", "foo", null, "foo", {guid:4}) })
      .then(function() { return testSetGetProperty(document, "lastModified", "foo", function(res) { return new Date(res) != "Invalid Date"; }, false, true) })
      .then(function() { return testSetGetProperty(document, "lastStyleSheetSet", "foo", null, "foo", null) })
      .then(function() { return testSetGetProperty(document, "linkColor", 0x00FFFF, null, 65535, "65535") })
      .then(function() { return testSetGetProperty(document, "links", {length:3}, nodeLength, 3, 2) })
      .then(function() { return testGetProperty(document, "location", null, {guid:7}) }) // Setting the location has bad consequences.
      .then(function() { return testSetGetProperty(document, "mozFullScreen", true, null, true, false) })
      .then(function() { return testSetGetProperty(document, "mozFullScreenElement", fakeNode, null, fakeNode, null) })
      .then(function() { return testSetGetProperty(document, "mozFullScreenEnabled", false, null, false, true) })
      .then(function() { return testSetGetProperty(document, "mozSyntheticDocument", false, null, false) })
      .then(function() { return testSetGetProperty(document, "onafterscriptexecute", false, null, false, null) }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "onbeforescriptexecute", false, null, false, null) }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "onoffline", false, null, false, false) }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "ononline", false, null, false, false) }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "origin", "foo", null, "foo") }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "plugins", {length: 5}, nodeLength, 5, 0) }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "pointerLockElement", fakeNode, null, fakeNode, {guid:0}) }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "popupNode", fakeNode, null, fakeNode, {guid:0}) }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "preferredStyleSheetSet", fakeNode, null, fakeNode, "") }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "readyState", fakeNode, null, fakeNode, "complete") }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "referrer", fakeNode, null, fakeNode, "") }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "scripts", {length: 5}, nodeLength, 5, 3) }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "scrollingElement", fakeNode, null, fakeNode, {guid:0}) }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "selectedStyleSheetSet", fakeNode, null, fakeNode, "") }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "styleSheets", {length: 10000}, nodeLength, 10000, 1) }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "styleSheetSets", fakeNode, null, fakeNode, {guid:12}) }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "title", fakeNode, null, fakeNode, "[object HTMLUnknownElement]") }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "tooltipNode", fakeNode, null, fakeNode, {guid:0}) }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "URL", "foo", function(res) { return res.endsWith("AsyncDom.html"); }, false, true) }) // TODO: Assign a fucntion...
      .then(function() { return testSetGetProperty(document, "vlinkColor", 0x00FFFF, null, 65535, "65535") })
      .then(function() { return testSetGetProperty(document, "width", 200, null, 200) })
      .then(function() { return testSetGetProperty(document, "xmlEncoding", 200, null, 200) })
      .then(function() { return testSetGetProperty(document, "xmlVersion", 200, null, 200) })
  })
  .catch(function(ex) {
    console.log(ex);
    is(false, true, "Exception " + ex);
  }).then(function() {
    console.log("Pass: " + pass + " / " + n + ", Failed: " + fail + " / " + n);
  })
})
}

function addNode(i, list) {
  return document.createElement("li").then(function(node) {
    node.textContent = "Node " + i;
    return list.appendChild(node)
  })  
}

function testDocPerf() {
  var start = Date.now();
  return document.getElementById("workerList").then(function(list) {
    var promises = []
    for (var i = 0; i < 1; i++) {
      promises.push(addNode(i, list));
    }
    return Promise.all(promises);
  }).then(function() {
    var end = Date.now();
    console.log("Done " + (end - start));
    setTimeout(function() {
      printTimers();
      window.printTimers();
    }, 100);
  }).catch(function(ex) {
    console.log("Err",ex);
  })
}

testDocument().then(function() {
  testDocPerf();
});
/*
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
    "writeln"
*/

/*
document.querySelector("#Fish").then(function(node) {
  n = node;
  node.setAttribute("cat", "dog");
  return node.getAttribute("cat");
}).then(function(value) {
  n.textContent = "Fish";
  return n.textContent;
}).then(function(text) {
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
  return n.baseURI;
}).then(function(uri) {
  console.log(uri);
}).catch(function(ex) {
  console.error(ex);
});


importScripts("Task.js");
Task.spawn(function* () {
  var button = yield document.getElementById("Button");
  button.addEventListener("click", Task.async(function* () {
    var nav = yield window.navigator;
    window.alert("Clicked " + nav);
    console.log("Done");
  }), true);
});
*/
