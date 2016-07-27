// For embedding into `embed_frame_with_script.html`
var iframe = document.createElement("iframe");
iframe.src = "javascript:&quot;<html><body style='background:transparent'></body></html>&quot;"
iframe.id = "javascript-src-url"
document.body.appendChild(iframe)
