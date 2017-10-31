if (typeof inspector4pda == "undefined") {
	var inspector4pda = {}
}

inspector4pda.utils = {
	
	parseStringRegexp: /([^\s"']+|"([^"]*)"|'([^']*)')/g,

	parse: function(str) {
		var parsed = str.match(this.parseStringRegexp);
		var pq = '';
		for (var i = 0; i < parsed.length; i++) {
			if (pq = parsed[i].match(/\"(.*)\"/)) {
				parsed[i] = pq[1];
			}
		}
		return parsed;
	},

	appParse: function(str) {
		if (!str) {
			return [];
		}
		var parsed = str.split(',');
		var pq;
		var eventsNums = {};
		var events = {};
		var lastEvent = false;
		for (var i = parsed.length - 1; i >= 0; i--) {
			if (pq = parsed[i].split(':')) {

				if (pq.length < 4) {
					continue;
				}

				pq[1] = parseInt(pq[1]);
				pq[2] = parseInt(pq[2]);
				pq[3] = parseInt(pq[3]);

				var key = pq[0];
				if (pq[1] == 3 ) {
					// mention
					key = 'm_' + pq[0] + '_' + pq[3];
				}

				if (typeof events[key] == 'undefined') {
					events[key] = pq;
					eventsNums[parsed.length - i] = key;
				}
				if (lastEvent === false) {
					lastEvent = pq[3];
				}
			}
		}

		var returnArray = [];
		for (i in eventsNums) {
			returnArray.push(events[eventsNums[i]]);
		}

		return {
			events: returnArray,
			lastEvent: lastEvent
		};
	},

	htmlspecialcharsdecode: function (string)
	{
		if (typeof string != "string") {
			string = '' + string;
		}

		var codes = string.match(/&#(\d+);/g);

		if (codes) {
			for (var i = 0; i < codes.length; i++) {
				var code = codes[i].match(/\d+/g);
				string = string.replace(new RegExp(codes[i], 'g'), String.fromCharCode(code));
			}
		}

		string = string.replace(/&lt;/g, '<');
		string = string.replace(/&gt;/g, '>');
		string = string.replace(/&quot;/g, '"');
		string = string.replace(/&amp;/g, '&');
		return string;
	},

	openPage: function(page, setActive, callback) {
		setActive = setActive || Boolean(inspector4pda.vars.data.toolbar_opentheme_hide);
		inspector4pda.browser.openPage(page, setActive, callback);
	},

	callIfFunction: function(callback) {
		if (typeof callback == 'function') {
			callback();
		}
	},

	now: function() {
		return new Date().getTime();
	}
};