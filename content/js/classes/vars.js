inspector4pda.vars = {

	interval: 5000,
	click_action: 1,
	
	notification_sound: true,
	notification_popup: true,
	notification_sound_volume: 1,
	
	toolbar_pin_color: true,
	toolbar_pin_up: false,
	toolbar_only_pin: false,
	toolbar_opentheme_hide: false,
	toolbar_simple_list: false,

	button_big: false,
	button_bgcolor: '#3333FF',
	button_color: '#FFFFFF',
	button_fontsize: 8,
	button_show_qms: true,
	button_show_themes: true,

	osString: '',

	prefs: {},

	getPrefs: function()
	{
		this.osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;

		this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.4pda-inspector.");
		this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch);
		this.prefs.addObserver("", this, false);

		var toolbar = document.getElementById("nav-bar");
		this.button_big = toolbar ?
				(toolbar.getAttribute('iconsize') != 'small') || inspector4pda.vars.prefs.getBoolPref('button_big') :
				inspector4pda.vars.prefs.getBoolPref('button_big');

		this.resetStorage();
	},

	resetStorage: function()
	{
		this.getValue('interval', 5000, 1000);
		this.getValue('click_action', 1);

		this.getValue('button_bgcolor', '#3333FF');
		this.getValue('button_color', '#FFFFFF');
		this.getValue('button_fontsize', 8);
		this.getValue('button_show_qms', true);
		this.getValue('button_show_themes', true);
		
		this.getValue('notification_sound', true);
		this.getValue('notification_popup', true);
		this.getValue('notification_sound_volume', 1, 0.01);
		
		this.getValue('toolbar_pin_color', true);
		this.getValue('toolbar_pin_up', false);
		this.getValue('toolbar_only_pin', false);
		this.getValue('toolbar_opentheme_hide', false);
		this.getValue('toolbar_simple_list', false);
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
					inspector4pda.vars[field] = inspector4pda.vars.prefs.getCharPref(field);
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