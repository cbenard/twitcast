(function() {

	"use strict";

	var cast = new CastManager();
	window.castInstance = cast;
	var session = undefined;
	var pendingPlay = false;
	var changingStreams = false;
 	cast.availabilityChanged = function(e) {
 		console.logv('Chromecast availability changed: ' + e);
 	};
 	cast.sessionAcquired = function(receivedSession) {
 		session = receivedSession;
 		$('#chromecast-disconnect').show();

 		if (pendingPlay) {
 			pendingPlay = false;

 			play();
 		}
 	};
 	var mediaUpdateFunction = function(media) {
 		if (media
 			&& media.playerState !== chrome.cast.media.PlayerState.IDLE
 			&& media.playerState !== chrome.cast.media.PlayerState.PAUSED) {

	 		$('#chromecast-disconnect').show();
	 		$('#chromecast-play').hide();

	 		if (media.media
	 			&& media.media.contentId
	 			&& /\.m3u8$/i.test(media.media.contentId)) {

	 			$.cookie('chromecaststream', media.media.contentId);
	 			$('#chromecast-streamoptions').val(media.media.contentId);
	 		}
 		}
 	};
 	cast.mediaStatusUpdated = mediaUpdateFunction;
 	cast.mediaDiscovered = function(source, media) {
 		mediaUpdateFunction(media);
 	};

 	function attachEventListeners() {
	 	$('#chromecast-play').click(play);

	 	$('#chromecast-disconnect').click(function() {
	 		pendingPlay = false;

	 		$('#chromecast-disconnect').hide();
	 		$('#chromecast-play').show();

	 		cast.disconnect(function() {
	 			session = undefined;
	 		});
	 	});

		$('#chromecast-streamoptions').change(function() {
			console.logv('stream option changed');
			$.cookie('chromecaststream', $('#chromecast-streamoptions').val());
			
			if (session) {
				play();
			}
		});
	}

 	function play() {
		if (!session) {
 			pendingPlay = true;
	 		
 			console.logv('Requesting session to play into...');
 			cast.requestSession();
 			return;
 		}
 		else {
 			console.logv('Playing into existing session...');
 		}

 		$('#chromecast-disconnect').show();
 		$('#chromecast-play').hide();

 		var currentStreamUrl = $('#chromecast-streamoptions').val();
 		var currentSubtitle = $('#chromecast-streamoptions option:selected').text();
 		console.logv('Attempting to play (' + currentSubtitle + '): ' + currentStreamUrl);

 		cast.playMedia(currentStreamUrl, 'TWiT Live Stream', currentSubtitle);
 	}

 	setTimeout(function() {
 		if (!cast.available) {
 			$('#chromecast-looking-container').hide();
 			$('#chromecast-available-container').hide();
 			$('#chromecast-unavailable-container').show();
 		}
 	}, 1000);

	window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
		if (loaded) {
			console.logv("chromecast loaded (page context): " + loaded);

			cast.initialize(
				function() {
 					$('#chromecast-looking-container').hide();
		 			$('#chromecast-unavailable-container').hide();
		 			$('#chromecast-available-container').show();
				},
				function() {
 					$('#chromecast-looking-container').hide();
		 			$('#chromecast-available-container').hide();
		 			$('#chromecast-unavailable-container').show();
				});
		} else {
			console.log(errorInfo);
		}
	};

	// Intercept window.loadStream and if it's #chromecast, handle it outself. Otherwise, passthrough.
	if (typeof window.loadStream === 'function') {
		window.loadStreamInternal = window.loadStream;

		window.loadStream = function(hash) {
			console.logv('Intercepted loadStream() call with argument: ' + hash);
			if (hash === '#chromecast') {
				// clear all layers
				$('#video').removeClass('audio_play');
				$('#popoutvideo').hide();
				$('#bull1').hide();
				$('#bitgravity_bandwith').hide();
				$("#now_playing").hide();

				buildChromecastInterface($("#player"));
				attachEventListeners();
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