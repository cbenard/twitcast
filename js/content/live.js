"use strict";

(function() {
	// From: https://gist.github.com/tavisrudd/1174381
	// here is the previous snippet without jquery and with proper removal
	// of the injected script tag.
	// Note, this is untested and the author of the previous blog post
	// claims it doesn't work.
	function inject_page_script (script_file) { 
	    // script_file lives in the extension 
	    var script = document.createElement('script');
	    script.setAttribute("type", "text/javascript");
	    script.setAttribute("src", script_file);
	    document.documentElement.appendChild(script);
	    console.logv('Injected: ' + script_file);
	    //document.documentElement.removeChild(script);
	}

	inject_page_script(chrome.runtime.getURL('js/common/config.js'));
	inject_page_script(chrome.runtime.getURL('js/page/streams.js'));
	inject_page_script(chrome.runtime.getURL('js/page/castPlayer.js'));
	inject_page_script(chrome.runtime.getURL('js/page/interfaceBuilder.js'));
	inject_page_script(chrome.runtime.getURL('js/page/live.js'));
	inject_page_script(chrome.runtime.getURL('lib/cast_sender.js'));

	console.logv('Finished injected scripts.');

	var streams = document.querySelector('#streams-selector');
	if (streams) {
		var li = document.createElement('li');
		li.setAttribute('id', 'chromecast');
		li.setAttribute('class', 'stream_up');

		var liLink = document.createElement('a');
		liLink.setAttribute('href', '#chromecast');
		liLink.addEventListener("click", function() {
			console.log(this);
			var request = { "eventName": "playStream", "hash": this.hash };
			window.postMessage(request, window.location.href);
		});

		var linkImage = document.createElement('img');
		linkImage.setAttribute('src', chrome.runtime.getURL('img/stream_chromecast_off.jpg'));
		linkImage.setAttribute('alt', 'Chromecast');
		linkImage.setAttribute('title', 'Chromecast Stream');
		liLink.appendChild(linkImage);

		li.appendChild(liLink);
		streams.appendChild(li);
	}

})();