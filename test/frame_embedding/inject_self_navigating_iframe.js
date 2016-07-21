iframe = document.createElement('iframe');
iframe.onload = function(){this.onload=''; this.contentDocument.location = 'page5.html'}
document.body.appendChild(iframe)
