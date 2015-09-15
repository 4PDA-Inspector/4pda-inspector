inspector4pda.themes = {
	rUrl: 'http://4pda.ru/forum/index.php?act=inspector&CODE=fav',
	vUrl: 'http://4pda.ru/forum/index.php?act=fav',
	list: {},

	request: function(callback) {
		var xmr = new inspector4pda.XHR();
		xmr.callback.success = function(resp) {
			inspector4pda.themes.parse(resp.responseText);
			if (callback) {
				callback();
			};
		}
		xmr.send(inspector4pda.themes.rUrl);
	},

	getThemesIds: function() {
		return Object.keys(inspector4pda.themes.list);
	},

	getCount: function() {
		return this.getThemesIds().length;
	},

	getPinCount: function() {
		var themesIds = this.getThemesIds();
		var count = 0;
		
		for (var i = 0; i < themesIds.length; i++) {
			var themeId = themesIds[i];
			if (inspector4pda.themes.list[themeId].isPin()) {
				count++;
			}
		};
		return count;
	},

	parse: function(text) {
		inspector4pda.themes.list = {};
		var tText = text.replace('\r','').split('\n');

		if (inspector4pda.vars.toolbar_pin_up) {
			var notPin = [];
		}

		for (var i = 0; i < tText.length; i++) {
			if (tText[i]) {
				var theme = Object.create(themeObj);
				if (theme.parse(tText[i])) {

					if (inspector4pda.vars.toolbar_only_pin) {
						if (!theme.pin) {
							continue;
						}
					};

					if (inspector4pda.vars.toolbar_pin_up) {
						if (theme.pin) {
							inspector4pda.themes.list[theme.id] = theme;
						} else {
							notPin.push(theme);
						}
					} else {
						inspector4pda.themes.list[theme.id] = theme;
					}
				}
			}
		}

		if (inspector4pda.vars.toolbar_pin_up && notPin) {
			for (var i = 0; i < notPin.length; i++) {
				inspector4pda.themes.list[notPin[i].id] = notPin[i];
			};
		}
	},

	open: function(id) {
		inspector4pda.utils.openPage('http://4pda.ru/forum/index.php?showtopic='+id+'&view=getnewpost');
		delete inspector4pda.themes.list[id];
	},

	read: function(id, callback) {
		var xmr = new inspector4pda.XHR();

		xmr.send('http://4pda.ru/forum/index.php?showtopic='+id);
		delete inspector4pda.themes.list[id];

		if (typeof callback == 'function') {
			callback();
		};
	},

	openLast: function(id) {
		inspector4pda.utils.openPage('http://4pda.ru/forum/index.php?showtopic='+id+'&view=getlastpost');
		delete inspector4pda.themes.list[id];
	},

	openAll: function() {
		var limit = inspector4pda.vars.open_themes_limit;

		var themesIds = this.getThemesIds();
		for (var i = 0; i < themesIds.length; i++) {
			if (limit && i >= limit) {
				break;
			}
			inspector4pda.themes.open(themesIds[i]);
		};
		inspector4pda.cScript.printCount();
	},

	openAllPin: function() {
		var limit = inspector4pda.vars.open_themes_limit;
		var themesIds = this.getThemesIds();
		
		for (var i = 0; i < themesIds.length; i++) {
			if (limit && i >= limit) {
				break;
			}
			var themeId = themesIds[i];
			if (inspector4pda.themes.list[themeId].isPin()) {
				inspector4pda.themes.open(themeId);
			}
		};
		inspector4pda.cScript.printCount();
	},

	readAll: function() {
		var themesIds = this.getThemesIds();
		for (var i = 0; i < themesIds.length; i++) {
			inspector4pda.themes.read(themesIds[i]);
		};
		inspector4pda.cScript.printCount();
	},

    openPage: function () {
        inspector4pda.utils.openPage(inspector4pda.themes.vUrl);
    }
}

var themeObj = {
	id: 0,
	title: '',
	posts_num: '',
	last_user_id: '',
	last_user_name: '',
	last_post_ts: '',
	last_read_ts: '',
	pin: false,

	parse: function(text) {
		try {
			var obj = inspector4pda.utils.parse(text);
			this.id = obj[0];
			this.title = obj[1];
			this.posts_num = obj[2];
			this.last_user_id = obj[3];
			this.last_user_name = obj[4];
			this.last_post_ts = obj[5];
			this.last_read_ts = obj[6];
			this.pin = parseInt(obj[7]);
		} catch(e) {
			return false;
		}
		return this;
	},

	isPin: function() {
		return this.pin;
	}
}