"use strict";

(function() {

	window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
	  if (loaded) {
	 //   initializeCastApi();
	 	console.logv("chromecast loaded (page context): " + loaded);
	  } else {
	    console.log(errorInfo);
	  }
	}

	// Intercept window.loadStream and if it's #chromecast, handle it outself. Otherwise, passthrough.
	if (typeof window.loadStream === 'function') {
		window.loadStreamInternal = window.loadStream;

		window.loadStream = function(hash) {
			console.log('Intercepted loadStream() call with argument: ' + hash);
			if (hash === '#chromecast') {
				// clear all layers
				$('#video').removeClass('audio_play');
				$('#popoutvideo').hide();
				$('#bull1').hide();
				$('#bitgravity_bandwith').hide();
				$("#now_playing").hide();

				buildInterface($("#player"));
			}
			else {
				loadStreamInternal(hash);
			}
		}
	}

	function onMessage(evt) {
		if(evt.source === window) {
			console.logv(evt);
			var request = evt.data;
			if (request.eventName === "playStream" && request.hash) {
				console.logv('Play stream request received: ' + request.hash);

				playStream(request.hash);
			}
		}
	}

	// Listen for events and send them to onMessage
	window.addEventListener('message', onMessage, false);

	// Duplicate their startup since we get injected just after their document ready
	if (window.selectStream === '#chromecast') {
		playStream(window.selectStream);
	}

})();