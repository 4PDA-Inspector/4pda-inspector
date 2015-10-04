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
			}
		};
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
		}
		return count;
	},

	parse: function(text) {
		inspector4pda.themes.list = {};
		var tText = text.replace('\r','').split('\n');

		for (var i = 0; i < tText.length; i++) {
			if (tText[i]) {
				var theme = Object.create(themeObj);
				if (theme.parse(tText[i])) {
					if (inspector4pda.vars.toolbar_only_pin && !theme.pin) {
						continue;
					}
					inspector4pda.themes.list[theme.id] = theme;
				}
			}
		}
	},

	getSortedKeys: function(sort_by_acs) {
		var list = inspector4pda.themes.list;
		var sort = sort_by_acs ? -1 : 1;
		var keysSorted = Object.keys(list).sort(function(a,b){
			if (inspector4pda.vars.toolbar_pin_up) {
				var pinDef = list[b].pin - list[a].pin;
				if (pinDef !== 0) {
					return pinDef;
				}
			}
			return  (list[b].last_post_ts - list[a].last_post_ts)*sort;
		});
		return keysSorted;
	},

	open: function(id, setActive) {
		inspector4pda.utils.openPage('http://4pda.ru/forum/index.php?showtopic='+id+'&view=getnewpost', setActive);
		delete inspector4pda.themes.list[id];
	},

	read: function(id, callback) {
		var xmr = new inspector4pda.XHR();
		xmr.callback.success = function () {
			if (typeof callback == 'function') {
				callback();
			}
		};
		xmr.send('http://4pda.ru/forum/index.php?showtopic='+id);
		delete inspector4pda.themes.list[id];
	},

	openLast: function(id) {
		inspector4pda.utils.openPage('http://4pda.ru/forum/index.php?showtopic='+id+'&view=getlastpost');
		delete inspector4pda.themes.list[id];
	},

	openAll: function() {
		var limit = inspector4pda.vars.open_themes_limit;
		var themesIds = this.getSortedKeys(true);

		for (var i = 0; i < themesIds.length; i++) {
			if (limit && i >= limit) {
				break;
			}
			inspector4pda.themes.open(themesIds[i]);
		}
		inspector4pda.cScript.printCount();
	},

	openAllPin: function() {
		var limit = inspector4pda.vars.open_themes_limit;
		var themesIds = this.getSortedKeys();

		var openedPagesCount = 0;
		for (var i = 0; i < themesIds.length; i++) {
			if (limit && openedPagesCount >= limit) {
				break;
			}
			var themeId = themesIds[i];
			if (inspector4pda.themes.list[themeId].isPin()) {
				inspector4pda.themes.open(themeId);
				openedPagesCount++;
			}
		}
		inspector4pda.cScript.printCount();
	},

	readAll: function() {
		var themesIds = this.getSortedKeys();
		for (var i = 0; i < themesIds.length; i++) {
			inspector4pda.themes.read(themesIds[i]);
		}
		inspector4pda.cScript.printCount();
	},

    openPage: function () {
        inspector4pda.utils.openPage(inspector4pda.themes.vUrl, true);
    }
};

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
};