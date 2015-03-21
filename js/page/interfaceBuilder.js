"use strict";

(function() {
	window.buildInterface = function (player) {
		player.empty();

		var container = $('<div id="chromecast-container">');
		player.append(container);
		var select = $('<select id="chromecast-streamoptions">');
		container.append(select);
		var beginChromecast = container.append("<button>Connect to Chromecast</button>");

		populateStreams(select);
	}

	function populateStreams(select) {
		for (var streamIndex in chromecastStreamUrls) {
			var stream = chromecastStreamUrls[streamIndex];
			var option = $("<option>");
			select.append(option);
			option.attr('value', stream.url);
			option.text(stream.title);
		}
	}
})();