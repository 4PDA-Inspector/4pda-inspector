if (typeof inspector4pda == "undefined") {
	var inspector4pda = {}
}

inspector4pda.vars = {

	interval: 10000,
	click_action: 1,
	MMB_click_action: 3,
	open_themes_limit: 0,
	
	notification_sound: true,
	notification_popup: true,
	notification_sound_volume: 1,
	
	toolbar_pin_color: true,
	toolbar_pin_up: false,
	toolbar_only_pin: false,
	toolbar_opentheme_hide: false,
	toolbar_simple_list: false,	
	toolbar_openAllFavs_button: true,
	toolbar_markAllAsRead_button: true,

	button_big: false,
	button_bgcolor: '#3333FF',
	button_color: '#FFFFFF',
	button_fontsize: 8,
	button_show_qms: true,
	button_show_themes: true,
	button_show_onlyMoreZero: true,

	prefs: {},

	init: function(callback) {
		inspector4pda.vars.prefs = localStorage;
		if (typeof callback == 'function') {
			callback();
		}
		/*chrome.extension.sendRequest({action: "getLocalStorage"}, function(localStorage) {
			inspector4pda.vars.prefs = localStorage;
			console.log('vars init finish', inspector4pda.vars.prefs);
			//console.log('toolbar_pin_color', localStorage.toolbar_pin_color);
			if (typeof callback == 'function') {
				callback();
			}
		})*/
	},

	getPrefs: function()
	{
		this.init();
		this.resetStorage();
	},

	resetStorage: function()
	{
		this.getValue('interval', 10000, 1000);
		this.getValue('click_action', 1);
		this.getValue('MMB_click_action', 3);
		this.getValue('open_themes_limit', 0);

		this.getValue('button_bgcolor', '#3333FF');
		this.getValue('button_color', '#FFFFFF');
		this.getValue('button_fontsize', 10);
		this.getValue('button_show_qms', true);
		this.getValue('button_show_themes', true);
		this.getValue('button_show_onlyMoreZero', true);
		
		this.getValue('notification_sound', true);
		this.getValue('notification_popup', false); //
		this.getValue('notification_sound_volume', 1, 0.01);
		
		this.getValue('toolbar_pin_color', true);
		this.getValue('toolbar_pin_up', false);
		this.getValue('toolbar_only_pin', false);
		this.getValue('toolbar_opentheme_hide', false);
		this.getValue('toolbar_simple_list', false);
		this.getValue('toolbar_openAllFavs_button', true);
		this.getValue('toolbar_markAllAsRead_button', true);
	},

	getValue: function(field, defaultValue, multiplier)
	{
		try {
			if (typeof inspector4pda.vars.prefs[field] == 'undefined') {
				throw new Error();
			}

			switch (typeof inspector4pda.vars[field]) {
				case 'number':
					inspector4pda.vars[field] = Number(inspector4pda.vars.prefs[field]) * (multiplier || 1);
					break;
				case 'boolean':
					inspector4pda.vars[field] = (inspector4pda.vars.prefs[field] === 'true');
					break;
				default:
					inspector4pda.vars[field] = inspector4pda.vars.prefs[field];
			}

		} catch (e) {
			if (defaultValue) {
				inspector4pda.vars[field] = defaultValue;
			}
		}
	},

	setValue: function(field, value) {
		localStorage[field] = value;
		this.resetStorage();
		console.log(field, value);
	},

	getAll: function() {
		var exp = {};
		var self = this;
		for (var i in self) {
			if (['number', 'boolean', 'string'].indexOf(typeof self[i]) == -1 ) {
				continue;
			}
			if (i == 'interval') {
				self[i] = Math.max( self[i] / 1000, 5);
			}
			exp[i] = self[i];
		}
		return exp;
	}
};

inspector4pda.vars.getPrefs();