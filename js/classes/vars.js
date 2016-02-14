if (typeof inspector4pda == "undefined") {
	var inspector4pda = {}
}

inspector4pda.vars = {

	data: {
		interval: 10,
		click_action: 1,
		MMB_click_action: 3,
		open_themes_limit: 0,

		notification_sound_volume: 1,

		notification_sound_themes: true,
		notification_popup_themes: true,
		notification_sound_qms: true,
		notification_popup_qms: true,

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

		button_big: false,
		build: false
	},

	init: function(callback) {
		this.resetStorage(callback);
	},

	resetStorage: function(callback)
	{
		var self = this;
		chrome.storage.local.get(null, function(items) {
			for (var i in items) {
				self.data[i] = items[i];
			}
			inspector4pda.utils.callIfFunction(callback);
		});
	},

	setValue: function(field, value) {
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