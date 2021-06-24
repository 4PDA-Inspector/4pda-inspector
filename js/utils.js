if (typeof inspector4pda == "undefined") {
	var inspector4pda = {}
}

inspector4pda.utils = {
	parseStringRegexp: /([^\s"']+|"([^"]*)"|'([^']*)')/g,

	parse: function(str) {
		var parsed = str.match(this.parseStringRegexp);
		for (let i = 0; i < parsed.length; i++) {
			let pq = parsed[i].match(/"(.*)"/);
			if (pq) {
				parsed[i] = pq[1];
			}
		}
		return parsed;
	},

	appParse: function(str) {
		if (!str) {
			return [];
		}
		var parsed = str.split(','),
			eventsNums = {},
			events = {},
			lastEvent = false;
		for (let i = parsed.length - 1; i >= 0; i--) {
			let pq = parsed[i].split(':');
			if (pq) {
				if (pq.length < 4) {
					continue;
				}

				pq[1] = parseInt(pq[1]);
				pq[2] = parseInt(pq[2]);
				pq[3] = parseInt(pq[3]);

				let key = pq[0];
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

		let returnArray = [];
		for (let i in eventsNums) {
			returnArray.push(events[eventsNums[i]]);
		}

		return {
			events: returnArray,
			lastEvent: lastEvent
		};
	},

	appParseLastEvent: function (str) {
		if (str) {
			let pq = str.split(':');
			if (pq.length >= 3) {
				return pq[2]
			}
		}
		return 0
	},

	htmlspecialcharsdecode: function (string)
	{
		if (typeof string != "string") {
			string = '' + string;
		}

		let codes = string.match(/&#(\d+);/g);
		if (codes) {
			for (let i = 0; i < codes.length; i++) {
				let code = codes[i].match(/\d+/g);
				string = string.replace(new RegExp(codes[i], 'g'), String.fromCharCode(parseInt(code[0])));
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