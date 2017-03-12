inspector4pda.themes = {
	rUrl: 'https://4pda.ru/forum/index.php?act=inspector&CODE=fav',
	vUrl: 'https://4pda.ru/forum/index.php?act=fav',
	list: {},

	clear: function() {
		this.list = {};
	},

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

	requestTheme: function(id, callback) {
		var xmr = new inspector4pda.XHR();
		xmr.callback.success = function(resp) {
			if (callback) {
				callback(resp.responseText, id);
			}
		};
		xmr.send(inspector4pda.themes.rUrl + '&t=' + id);
	},

	getThemesIds: function(withRead) {
		var ids = [];
		Object.keys(inspector4pda.themes.list).forEach(function(id){
			if (inspector4pda.vars.data.toolbar_only_pin && !inspector4pda.themes.list[id].pin) {
				return false;
			}

			if (withRead || !inspector4pda.themes.list[id].isRead()) {
				ids.push(id);
			}
		});
		return ids;
	},

	getCount: function() {
		return this.getThemesIds().length;
	},

	getPinCount: function() {
		var themesIds = this.getThemesIds();
		var count = 0;
		
		for (var i = 0; i < themesIds.length; i++) {
			var themeId = themesIds[i];
			if (inspector4pda.themes.list[themeId].isRead()) {
				continue;
			}
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
				var theme = new themeObj();
				if (theme.parse(tText[i])) {
					inspector4pda.themes.list[theme.id] = theme;
				}
			}
		}
	},

	getSortedKeys: function(sort_by_acs) {
		var list = inspector4pda.themes.list,
			sort = sort_by_acs ? -1 : 1,
			keysSorted;
		keysSorted = inspector4pda.themes.getThemesIds().sort(function (a, b) {
			if (inspector4pda.vars.data.toolbar_pin_up) {
				var pinDef = list[b].pin - list[a].pin;
				if (pinDef !== 0) {
					return pinDef;
				}
			}
			return (list[b].last_post_ts - list[a].last_post_ts) * sort;
		});
		return keysSorted;
	},

	open: function(id, setActive) {
		inspector4pda.utils.openPage('https://4pda.ru/forum/index.php?showtopic='+id+'&view=getnewpost', setActive);
        if (typeof inspector4pda.themes.list[id] == 'object') {
            inspector4pda.themes.list[id].setRead();
        }
	},

	read: function(id, callback) {
		var xmr = new inspector4pda.XHR();
		xmr.callback.success = function () {
			if (typeof callback == 'function') {
				callback();
			}
		};
		xmr.send('https://4pda.ru/forum/index.php?showtopic='+id+'&view=getlastpost');
		inspector4pda.themes.list[id].setRead();
	},

	openLast: function(id) {
		inspector4pda.utils.openPage('https://4pda.ru/forum/index.php?showtopic='+id+'&view=getlastpost');
		inspector4pda.themes.list[id].setRead();
	},

	openAll: function() {
		var limit = inspector4pda.vars.data.open_themes_limit;
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
		var limit = inspector4pda.vars.data.open_themes_limit;
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

var themeObj = function () {

	this.id = 0;
	this.title = '';
	this.posts_num = '';
	this.last_user_id = '';
	this.last_user_name = '';
	this.last_post_ts = '';
	this.last_read_ts = '';
	this.pin = false;
	this.read = false;

	this.parse = function(text) {
		try {
			var obj = inspector4pda.utils.parse(text);

			this.id = obj[0];
			this.title = obj[1];
			this.posts_num = obj[2];
			this.last_user_id = parseInt(obj[3]);
			this.last_user_name = obj[4];
			this.last_post_ts = parseInt(obj[5]);
			this.last_read_ts = parseInt(obj[6]);
			this.pin = parseInt(obj[7]);
		} catch(e) {
			return false;
		}
		return this;
	};

	this.isRead = function() {
		return (this.read == true);
	};

	this.setRead = function() {
		this.read = true;
	};

	this.isPin = function() {
		return this.pin;
	};
};