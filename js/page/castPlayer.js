"use strict";

(function(window) {

	var CastPlayer = function() {
		this.available = false;
		// function(available : Boolean) { }
		this.availabilityChanged = undefined;
		// function(source : string, message : string, err : ErrorObject) { }
		this.errorLogged = undefined;
		// function(session: Session) { }
		this.sessionAcquired = undefined;
		// function(source : string, media : Media)
		this.mediaDiscovered = undefined;
		this.currentMedia = undefined;
		this.session = undefined;
	};

	CastPlayer.prototype.initialize = function() {
		var sessionRequest = new chrome.cast.SessionRequest(
			chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
		var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
			this.sessionListener.bind(this),
			this.receiverListener.bind(this));
		chrome.cast.initialize(apiConfig,
			this.onInitSuccess.bind(this),
			this.handleError.bind('onError', 'Error initializing Cast API.'));
	};

	CastPlayer.prototype.receiverListener = function(e) {
		this.available = (e === chrome.cast.ReceiverAvailability.AVAILABLE);
		if (typeof this.availabilityChanged === 'function') {
			this.availabilityChanged(this.available);
		}
	};

	CastPlayer.prototype.sessionListener = function(e) {
		console.logv('Received session');
		this.session = e;

		if (typeof this.sessionAcquired === 'function') {
			this.sessionAcquired(session);
		}
	};

	CastPlayer.prototype.onInitSuccess = function() {
		console.logv('onInitSuccess');
	};

	CastPlayer.prototype.handleError = function(source, msg, e) {
		console.logv('Error from "' + source + '": ' + msg);
		if (typeof e !== 'undefined') {
			console.logv(e);
		}

		if (typeof this.errorLogged === 'function') {
			this.errorLogged(source, msg, e);
		}
	};

	CastPlayer.prototype.requestSesssion = function() {
		chrome.cast.requestSession(
			this.sessionListener.bind(this),
			this.handleError.bind('errorCallback', 'Error requesting Cast session.'));
	};

	CastPlayer.prototype.playMedia = function(url, title, subtitle) {
		if (!this.session)
			return;

		var mediaInfo = new chrome.cast.media.MediaInfo(url);

		if (title && typeof title === 'string') {
			var metadata = new chrome.cast.media.GenericMediaMetadata();
			metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
			metadata.title = title;

			if (subtitle && typeof subtitle === 'string') {
				metadata.subtitle = subtitle;
			}

			mediaInfo.metadata = metadata;
		}

		if (/.m3u8$/i.test(url) || /.mp4$/i.test(url)) {
			mediaInfo.contentType = 'video/mp4';
		}

		if (/.m3u8$/i.test(url)) {
			mediaInfo.streamType = chrome.cast.media.StreamType.LIVE;
		}
		else {
			mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
		}

		var request = new chrome.cast.media.LoadRequest(mediaInfo);
		this.session.loadMedia(request,
			this.onMediaDiscovered.bind(this, 'loadMedia'),
			this.handleError.bind('loadMedia', 'Error loading media.'));
	}

	CastPlayer.prototype.onMediaDiscovered = function(source, media) {
		this.currentMedia = media;

		console.logv('Discovered media from source: ' + source);
		console.logv(media);
	};

	CastPlayer.prototype.disconnect = function() {
		if (!this.session)
			return;

		this.session.stop(
			function() { console.logv('disconnected'); },
			this.handleError.bind('disconnect', 'Error disconnecting from Chromecast.'));
	};

	window.CastPlayer = CastPlayer;

})(window);