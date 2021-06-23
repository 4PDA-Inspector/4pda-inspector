if (typeof inspector4pda == "undefined") {
	var inspector4pda = {}
}

inspector4pda.vars = {

	data: {
		interval: 10,
		open_themes_limit: 0,

		notification_sound_volume: 1,

		notification_sound_themes: true,
		notification_popup_themes: true,
		notification_sound_qms: true,
		notification_popup_qms: true,
		notification_sound_mentions: true,
		notification_popup_mentions: true,

		toolbar_pin_color: true,
		toolbar_pin_up: false,
		toolbar_only_pin: false,
		toolbar_opentheme_hide: true,
		toolbar_simple_list: false,
		toolbar_openAllFavs_button: true,
		toolbar_markAllAsRead_button: true,
		toolbar_width_fixed: false,
		toolbar_width: 400,

		open_in_current_tab: false,
		user_links: [],

		build: '0'
	},

	_base_url: undefined,
	CHECK_URLS: ['https://4pda.to', 'https://4pda.ru'],

	init: function() {
		let self = this;
		this.checkUrls([...this.CHECK_URLS], function () {
			self.resetStorage(inspector4pda.cScript.init);
		});
	},

	get BASE_URL() {
		if (this._base_url == undefined) {
			throw 'Empty BASE_URL'
		}
		return this._base_url
	},

	checkUrls: function (list, callback) {
		let self = this,
			url = list.shift()
		if (url) {
			let req = new XMLHttpRequest();
			req.timeout = 1000;
			console.log('Check URL:', url);
			req.onreadystatechange = function() {
				if (req.readyState == 4) {
					if (req.status == 200) {
						console.log(url, 'Success!')
						self._base_url = url
						inspector4pda.utils.callIfFunction(callback)
					} else {
						console.warn(url, req.status, 'not success')
						self.checkUrls(list, callback)
					}
				}
			}
			req.open("GET", url, true);
			req.send();
		} else {
			console.error('URLS: nothing available')
			inspector4pda.cScript.printLogout(true)
		}
	},

	resetStorage: function(callback) {
		let self = this;
		chrome.storage.local.get(null, function(items) {
			for (let i in items) {
				self.setValue(i, items[i]);
			}
			inspector4pda.utils.callIfFunction(callback);
		});
	},

	setValue: function(field, value) {

		switch (typeof this.data[field]) {
			case 'boolean':
				value = ((value === true) || (value === 'true') || (value === 1));
				break;
			case 'number':
				value = Number(value);
				if (isNaN(value)) {
					value = 0;
				}
				break;
			case 'string':
				value = String(value);
				break;
			case 'undefined':
				console.error('Set value:', field, value);
				return false;
		}

		switch (field) {
			case 'interval': // 5 sec < interval < 5 min
				value = Math.max( value, 5);
				value = Math.min( value, 300);
				break;
			case 'toolbar_width':
				value = Math.max( value, 400);
				value = Math.min( value, 800);
				break;
			case 'open_themes_limit':
				value = Math.max( value, 0);
				break;
		}

		this.data[field] = value;

		let stored = {};
		stored[field] = value;
		chrome.storage.local.set(stored);

		if (['interval', 'toolbar_only_pin'].indexOf(field) > -1) {
			inspector4pda.cScript.request();
		}
	},

	getAll: function() {
		return this.data;
	},

	doForumURL: function(params, loFi = false) {
		return this.BASE_URL + (loFi ? '/forum/lofiversion/index.php' : '/forum/index.php') + (params ? '?' + params : '');
	}
};