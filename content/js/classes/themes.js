var themes = {
	rUrl: 'http://4pda.ru/forum/index.php?act=inspector&CODE=fav',
	list: [],

	request: function(callback) {
		var xmr = Object.create(iXMR);
		// utils.log(themes.list.length);
		xmr.callback.success = function(resp) {
			if (resp.responseText) {
				themes.parse(resp.responseText);
			};
			if (callback) {
				callback();
			};
		}
		xmr.send(themes.rUrl);
	},

	parse: function(text) {
		themes.list = [];
		// utils.log('themes');
		var tText = text.replace('\r','').split('\n');
		for (var i = 0; i < tText.length; i++) {
			if (tText[i]) {
				var theme = Object.create(themeObj);
				if (theme.parse(tText[i])) {
					themes.list.push(theme);
				}
			}
		}
	},

	open: function(id) {
		utils.openPage('http://4pda.ru/forum/index.php?showtopic='+id+'&view=getnewpost');
	},

	read: function(id) {
		var xmr = Object.create(iXMR);
		xmr.send('http://4pda.ru/forum/index.php?showtopic='+id+'&view=getnewpost');
	},

	openLast: function(id) {
		utils.openPage('http://4pda.ru/forum/index.php?showtopic='+id+'&view=getlastpost');
	},

	openAll: function() {
		while (themes.list.length) {
			var theme = themes.list.splice(0,1)[0];
			themes.open(theme.id);
		}
	},

	readAll: function() {
		while (themes.list.length) {
			var theme = themes.list.splice(0,1)[0];
			utils.log(theme, true);
			themes.read(theme.id);
		}
	},
}

var themeObj = {
	id: 0,
	title: '',
	posts_num: '',
	last_user_id: '',
	last_user_name: '',
	last_post_ts: '',
	last_read_ts: '',

	parse: function(text) {
		try {
			var obj = utils.parse(text);
			this.id = obj[0];
			this.title = obj[1];
			this.posts_num = obj[2];
			this.last_user_id = obj[3];
			this.last_user_name = obj[4];
			this.last_post_ts = obj[5];
			this.last_read_ts = obj[6];
		} catch(e) {
			return false;
		}
		return this;
		// tid title posts_num last_user_id last_user_name last_post_ts last_read_ts
	}
}