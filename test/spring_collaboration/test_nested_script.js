window.onload = function() {
	var iframe = document.createElement("iframe");
	iframe.addEventListener('load', function(e) {
    this.src = 'https://englehardt-tracker.com/spring_collaboration/test_nested.html'
    this.removeEventListener('load', arguments.callee, false);
  }, false);
	document.body.appendChild(iframe);
}
