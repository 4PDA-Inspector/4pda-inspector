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
		toolbar_opentheme_hide: false,
		toolbar_simple_list: false,
		toolbar_openAllFavs_button: true,
		toolbar_markAllAsRead_button: true,
		toolbar_width_fixed: false,
		toolbar_width: 400,

		user_links: [],

		build: '0'
	},

	init: function(callback) {
		this.resetStorage(callback);
	},

	resetStorage: function(callback)
	{
		var self = this;
		chrome.storage.local.get(null, function(items) {
			for (var i in items) {
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
				console.warn('Set value:', field, value);
				return false;
		}

		switch (field) {
			case 'interval': // 5 sec < interval < 5 min
				value = Math.max( value, 5);
				value = Math.min( value, 300);
				break;
			case 'toolbar_width':
				value = Math.max( value, 400);
				break;
			case 'open_themes_limit':
				value = Math.max( value, 0);
				break;
		}

		this.data[field] = value;

		var stored = {};
		stored[field] = value;
		chrome.storage.local.set(stored);

		if (['interval', 'toolbar_only_pin'].indexOf(field) > -1) {
			inspector4pda.cScript.request();
		}
	},

	getAll: function() {
		return this.data;
	}
};