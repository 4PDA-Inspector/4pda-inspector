if (typeof inspector4pda == "undefined") {
	var inspector4pda = {}
}

inspector4pda.vars = {

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

	prefs: {},

	init: function(callback) {
		inspector4pda.vars.prefs = inspector4pda.browser.getVarsStorageObject();
		if (typeof callback == 'function') {
			callback();
		}
	},

	getPrefs: function()
	{
		this.init();
		this.resetStorage();
	},

	resetStorage: function()
	{
		this.getValue('interval', 10);
		this.getValue('click_action', 1);
		this.getValue('MMB_click_action', 3);
		this.getValue('open_themes_limit', 0);

		this.getValue('user_links', []);

		this.getValue('notification_sound_volume', 1);
		this.getValue('notification_sound_themes', true);
		this.getValue('notification_popup_themes', true);
		this.getValue('notification_sound_qms', true);
		this.getValue('notification_popup_qms', true);

		this.getValue('toolbar_pin_color', true);
		this.getValue('toolbar_pin_up', false);
		this.getValue('toolbar_only_pin', false);
		this.getValue('toolbar_opentheme_hide', false);
		this.getValue('toolbar_simple_list', false);
		this.getValue('toolbar_openAllFavs_button', true);
		this.getValue('toolbar_markAllAsRead_button', true);
		this.getValue('toolbar_width_fixed', false);
		this.getValue('toolbar_width', 400);
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
				case 'object':
					inspector4pda.vars[field] = JSON.parse(inspector4pda.vars.prefs[field]);
					break;
				default:
					inspector4pda.vars[field] = inspector4pda.vars.prefs[field];
			}

		} catch (e) {
			if (defaultValue) {
				inspector4pda.vars[field] = defaultValue;
			}
		}

		return inspector4pda.vars[field];
	},

	setValue: function(field, value) {
		switch (field) {
			case 'interval':
				value = Math.max( value, 5);
				break;
			case 'toolbar_width':
				value = Math.max( value, 400);
				break;
			case 'open_themes_limit':
				value = Math.max( value, 0);
				break;
		}
		inspector4pda.browser.setVarToStorage(field, value);
		this.resetStorage();
		if (['interval', 'toolbar_only_pin'].indexOf(field) > -1) {
			inspector4pda.cScript.request();
		}
	},

	getAll: function() {
		var exp = {};
		var self = this;
		for (var i in self) {
			if (i == 'prefs' || ['number', 'boolean', 'string', 'object'].indexOf(typeof self[i]) == -1 ) {
				continue;
			}
			exp[i] = self[i];
		}
		return exp;
	}
};

inspector4pda.vars.getPrefs();