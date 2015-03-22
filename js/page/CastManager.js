(function(window) {

	"use strict";

	var CastManager = function() {
		this.available = false;
		// function(available : Boolean) { }
		this.availabilityChanged = undefined;
		// function(source : string, message : string, err : ErrorObject) { }
		this.errorLogged = undefined;
		// function(session: Session) { }
		this.sessionAcquired = undefined;
		// function(source : string, media : Media)
		this.mediaDiscovered = undefined;
		// function(currentMedia : Media, alive : Boolean)
		this.mediaStatusUpdated = undefined;
		this.currentMedia = undefined;
		this.session = undefined;
	};

	CastManager.prototype.initialize = function(successCallback, errorCallback) {
		var sessionRequest = new chrome.cast.SessionRequest(
			chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
		var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
			this.__sessionListener.bind(this),
			this.__receiverListener.bind(this),
			chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED);
		chrome.cast.initialize(apiConfig,
			this.__onInitSuccess.bind(this, successCallback),
			this.__handleErrorWithCallback.bind(this, 'onError', 'Error initializing Cast API.', errorCallback));
	};

	CastManager.prototype.__receiverListener = function(e) {
		this.available = (e === chrome.cast.ReceiverAvailability.AVAILABLE);
		if (typeof this.availabilityChanged === 'function') {
			this.availabilityChanged(this.available);
		}
	};

	CastManager.prototype.__sessionListener = function(e) {
		console.logv('Received session');
		this.session = e;

		if (typeof this.sessionAcquired === 'function') {
			this.sessionAcquired(this.session);
		}

		if (this.session.media.length != 0) {
			this.__onMediaDiscovered('onRequestSessionSuccess', this.session.media[0]);
		}
	};

	CastManager.prototype.__onInitSuccess = function(successCallback) {
		console.logv('onInitSuccess');

		if (typeof successCallback === 'function') {
			successCallback();
		}
	};

	CastManager.prototype.__handleError = function(source, msg, e) {
		console.logv('Error from "' + source + '": ' + msg);

		if (typeof e !== 'undefined') {
			console.logv(e);
		}

		if (typeof this.errorLogged === 'function') {
			this.errorLogged(source, msg, e);
		}
	};

	CastManager.prototype.__handleErrorWithCallback = function(source, msg, errorCallback, e) {
		this.__handleError(source, msg, e);

		if (typeof errorCallback === 'function') {
			errorCallback();
		}
	};

	CastManager.prototype.requestSession = function(successCallback) {
		chrome.cast.requestSession(
			this.__sessionListener.bind(this),
			this.__handleError.bind(this, 'errorCallback', 'Error requesting Cast session.'));
	};

	CastManager.prototype.playMedia = function(url, title, subtitle) {
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
			this.__onMediaDiscovered.bind(this, 'loadMedia'),
			this.__handleError.bind(this, 'loadMedia', 'Error loading media.'));
	}

	CastManager.prototype.__onMediaDiscovered = function(source, media) {
		this.currentMedia = media;

		console.logv('Discovered media from source: ' + source);
		console.logv(media);

		media.addUpdateListener(this.__onMediaStatusUpdate.bind(this));

		if (typeof this.mediaDiscovered === 'function') {
			this.mediaDiscovered(source, media);
		}
	};

	CastManager.prototype.__onMediaStatusUpdate = function() {
		console.logv('Received media status update.');

		if (typeof this.mediaStatusUpdated === 'function') {
			this.mediaStatusUpdated(this.currentMedia);
		}
	};

	CastManager.prototype.disconnect = function(callback) {
		if (!this.session)
			return;

		this.session.stop(
			(function() {
				console.logv('disconnected');
				this.session = undefined;

				if (typeof callback === 'function') {
					callback();
				}
			}).bind(this),
			this.__handleError.bind(this, 'disconnect', 'Error disconnecting from Chromecast.'));
	};

	window.CastManager = CastManager;

})(window);