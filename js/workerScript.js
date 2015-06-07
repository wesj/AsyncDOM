var n;
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
