window.onload = function() {
	var iframe = document.createElement("iframe");
	iframe.addEventListener('load', function(e) {
    this.src = 'https://englehardt-tracker.com/spring_collaboration/test_nested.html'
  }, false);
	document.body.appendChild(iframe);
}
