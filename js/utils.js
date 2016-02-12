if (typeof inspector4pda == "undefined") {
	var inspector4pda = {}
}

inspector4pda.utils = {
	
	parseStringRexp: /([^\s"']+|"([^"]*)"|'([^']*)')/g,

	log: function(msg, json) {
		if (json) {
			msg = JSON.stringify(msg);
		}

		inspector4pda.browser.log(msg);
	},

	parse: function(str) {
		var parsed = str.match(this.parseStringRexp);
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
				pq[1] = parseInt(pq[1]);
				pq[2] = parseInt(pq[2]);
				pq[3] = parseInt(pq[3]);
				if (typeof events[pq[0]] == 'undefined') {
					events[pq[0]] = pq;
					eventsNums[parsed.length - i] = pq[0];
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
		setActive = setActive || Boolean(inspector4pda.vars.toolbar_opentheme_hide);
		inspector4pda.browser.openPage(page, setActive, callback);
	},

	callIfFunction: function(callback) {
		if (typeof callback == 'function') {
			callback();
		}
	}
};

if (typeof ulog == "undefined") {
	function ulog(text, json) {
		inspector4pda.utils.log(text, json);
	}
}