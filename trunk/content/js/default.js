// inspectorDefaultStorage
inspector4pda.defaults = {

	interval: 5000,
	click_action: 1,
	button_fontsize: 7,
	button_bgcolor: '#4474C4',
	button_color: '#FFFFFF',
	button_big_fontsize: 12,
	button_big: false,
	notification_sound: true,
	notification_popup: true,
	notification_sound_volume: 1,

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
		try {
			inspector4pda.defaults.interval = inspector4pda.defaults.prefs.getIntPref("interval")*1000 || 5000;
		} catch (e) {}
		
		try {
			inspector4pda.defaults.click_action = inspector4pda.defaults.prefs.getIntPref("click_action");
		} catch (e) {}
		
		try {
			inspector4pda.defaults.button_fontsize = inspector4pda.defaults.prefs.getIntPref("button_fontsize");
		} catch (e) {}
		
		try {
			inspector4pda.defaults.button_big_fontsize = inspector4pda.defaults.prefs.getIntPref("button_big_fontsize");
		} catch (e) {}
		
		try {
			inspector4pda.defaults.button_big = inspector4pda.defaults.prefs.getBoolPref("button_big");
		} catch (e) {}
		
		try {
			inspector4pda.defaults.notification_sound = inspector4pda.defaults.prefs.getBoolPref("notification_sound");
		} catch (e) {}
		
		try {
			inspector4pda.defaults.notification_popup = inspector4pda.defaults.prefs.getBoolPref("notification_popup");
		} catch (e) {}
		
		try {
			inspector4pda.defaults.notification_sound_volume = inspector4pda.defaults.prefs.getIntPref("notification_sound_volume")/100;
		} catch (e) {}
		
		try {
			inspector4pda.defaults.button_bgcolor = inspector4pda.defaults.prefs.getCharPref("button_bgcolor");
		} catch (e) {}
		
		try {
			inspector4pda.defaults.button_color = inspector4pda.defaults.prefs.getCharPref("button_color");
		} catch (e) {}
	}
}

inspector4pda.defaults.getPrefs();