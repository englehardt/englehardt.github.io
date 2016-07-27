// For embedding into `embed_frame_with_script.html`
var iframe = document.createElement("iframe");
iframe.src = "javascript:\'<html><body style='background:transparent'></body></html>\';";
iframe.id = "javascript-src-url";
document.body.appendChild(iframe);

var elem = document.getElementById("javascript-src-url");
var img = elem.contentDocument.createElement("img");
img.src = "blah.jpg";
elem.contentDocument.body.appendChild(img);
