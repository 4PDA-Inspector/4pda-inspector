var themes = {
	rUrl: 'http://4pda.ru/forum/index.php?act=inspector&CODE=fav',
	
	list: [],

	request: function(callback) {
		var xmr = Object.create(iXMR);
		xmr.callback.success = function(resp) {

			if (resp.responseText) {
				themes.parse(resp.responseText);
				/*var res = utils.parse(resp.responseText);
				if (res.length == 2) {
					user.id = res[0];
					user.name = res[1];
					callback();
				};*/
			};
		}
		xmr.send(this.rUrl);
	},

	parse: function(text) {
		// utils.log(text);
		var tText = text.replace('\r','').split('\n');
		// utils.log(tText, true);
		// themes.list = [];
		for (var i = 0; i < tText.length; i++) {
			if (tText[i]) {
				// utils.log(typeof tText[i]);
				var theme = Object.create(themeObj);
				theme.parse(tText[i]);

				themes.list.push(theme);
				// var theme = utils.parse(tText[i]);
				// utils.log(theme.title);
			}
		}
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

	parse: function(text) {
		var obj = utils.parse(text);
		this.id = obj[0];
		this.title = obj[1];
		this.posts_num = obj[2];
		this.last_user_id = obj[3];
		this.last_user_name = obj[4];
		this.last_post_ts = obj[5];
		this.last_read_ts = obj[6];
		// tid title posts_num last_user_id last_user_name last_post_ts last_read_ts
	}
}