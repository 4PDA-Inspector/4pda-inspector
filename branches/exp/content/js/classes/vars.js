inspector4pda.vars = {

	interval: 5000,
	notification_sound: true,
	notification_popup: true,
	notification_sound_volume: 1,
	click_action: 1,
	toolbar_pin_color: true,
	toolbar_pin_up: false,
	toolbar_opentheme_hide: false,
	toolbar_opentheme_hide_onlylast: false,

	prefs: {},

	getPrefs: function()
	{
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.4pda-inspector.");
		this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch);
		this.prefs.addObserver("", this, false);

		this.resetStorage();
	},

	resetStorage: function()
	{
		this.getValue('interval', 5000, 1000);
		this.getValue('notification_sound', true);
		this.getValue('notification_popup', true);
		this.getValue('notification_sound_volume', 1, 0.01);
		this.getValue('click_action', 1);
		this.getValue('toolbar_pin_color', true);
		this.getValue('toolbar_pin_up', false);
		this.getValue('toolbar_opentheme_hide', false);
		this.getValue('toolbar_opentheme_hide_onlylast', false);
	},

	getValue: function(field, defaultValue, multiplier)
	{
		try {

			switch (typeof inspector4pda.vars[field]) {
				case 'number':
					inspector4pda.vars[field] = inspector4pda.vars.prefs.getIntPref(field) * (multiplier || 1);
					break;
				case 'boolean':
					inspector4pda.vars[field] = inspector4pda.vars.prefs.getBoolPref(field);
					break;
				default:
					inspector4pda.vars[field] = inspector4pda.defaults.prefs.getCharPref(field);
			}
		} catch (e) {
			if (defaultValue) {
				inspector4pda.vars[field] = defaultValue;
			};
			inspector4pda.utils.log('error ' + field);
			inspector4pda.utils.log(e);
		}
	}
}

inspector4pda.vars.getPrefs();