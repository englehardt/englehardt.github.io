// For embedding into `embed_frame_with_script.html`
var div = document.getElementById("external");
div.innerHTML = div.innerHTML + "<iframe src='page3.html'></iframe>"

var div = document.getElementById("external-img");
div.innerHTML = div.innerHTML + "<img src='http://cs.princeton.edu/~ste/images/profile.jpg'>"
