// For embedding into `embed_frame_with_script.html`
var iframe = document.createElement("iframe");
iframe.src = 'page1.html';
iframe.id = 'iframe-to-modify';
document.body.appendChild(iframe);

var toModify = document.getElementById('iframe-to-modify');
toModify.setAttribute('src','page2.html');

toModify = document.getElementById('iframe-to-modify');
toModify.contentDocument.location = 'page2.html';

toModify = document.getElementById('iframe-to-modify');
toModify.contentDocument.location.href = 'page2.html';
