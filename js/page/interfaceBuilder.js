(function() {

	"use strict";

	var defaultChromecastStream = chromecastStreamUrls[0];

	window.buildChromecastInterface = function (player) {
		player.empty();

		var container = $('<div id="chromecast-container">');
		player.append(container);
		var lookingContainer = $('<div id="chromecast-looking-container"><h2>Searching for Chromecast...</h2></div>');
		container.append(lookingContainer);
		var availableContainer = $('<div id="chromecast-available-container">');
		container.append(availableContainer);
		var unavailableContainer = $('<div id="chromecast-unavailable-container"><h2>The Chromecast is unavailable. Please check the status of the Chromecast and ensure the Chromecast extension is installed.</h2></div>');
		container.append(unavailableContainer);
		var select = $('<select id="chromecast-streamoptions">');
		availableContainer.append(select);
		var play = $('<span class="button" id="chromecast-play">Play</button>').appendTo(availableContainer);
		var disconnect = $('<span class="button" id="chromecast-disconnect">Stop</button>').appendTo(availableContainer);

		unavailableContainer.hide();
		availableContainer.hide();
		disconnect.hide();

		populateChromecastStreams(select);

		if ($.cookie('chromecaststream') == null ) {
			$('#chromecast-streamoptions').val(defaultChromecastStream);
		}
		else {
			$('#chromecast-streamoptions').val($.cookie('chromecaststream'));
		};
	}

	function populateChromecastStreams(select) {
		for (var streamIndex in chromecastStreamUrls) {
			var stream = chromecastStreamUrls[streamIndex];
			var option = $("<option>");
			select.append(option);
			option.attr('value', stream.url);
			option.text(stream.title);
		}
	}
})();