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
		chrome.extension.sendRequest({action: "getLocalStorage"}, function(localStorage) {
			inspector4pda.vars.prefs = localStorage;
			if (typeof callback == 'function') {
				callback();
			};
		})
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
		this.getValue('button_fontsize', 8);
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
			switch (typeof inspector4pda.vars[field]) {
				case 'number':
					inspector4pda.vars[field] = Number(inspector4pda.vars.prefs[field]) * (multiplier || 1);
					break;
				case 'boolean':
					inspector4pda.vars[field] = Boolean(inspector4pda.vars.prefs[field]);
					break;
				default:
					inspector4pda.vars[field] = inspector4pda.vars.prefs[field];
			}
		} catch (e) {
			if (defaultValue) {
				inspector4pda.vars[field] = defaultValue;
			};
			//inspector4pda.utils.log('error ' + field + ': ' + defaultValue);
		}
	}
}

inspector4pda.vars.getPrefs();