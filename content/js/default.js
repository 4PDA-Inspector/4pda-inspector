var inspectorDefaultStorage = {

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
			inspectorDefaultStorage.interval = inspectorDefaultStorage.prefs.getIntPref("interval")*1000;
		} catch (e) {}
		
		try {
			inspectorDefaultStorage.click_action = inspectorDefaultStorage.prefs.getIntPref("click_action");
		} catch (e) {}
		
		try {
			inspectorDefaultStorage.button_fontsize = inspectorDefaultStorage.prefs.getIntPref("button_fontsize");
		} catch (e) {}
		
		try {
			inspectorDefaultStorage.button_big_fontsize = inspectorDefaultStorage.prefs.getIntPref("button_big_fontsize");
		} catch (e) {}
		
		try {
			inspectorDefaultStorage.button_big = inspectorDefaultStorage.prefs.getBoolPref("button_big");
		} catch (e) {}
		
		try {
			inspectorDefaultStorage.notification_sound = inspectorDefaultStorage.prefs.getBoolPref("notification_sound");
		} catch (e) {}
		
		try {
			inspectorDefaultStorage.notification_popup = inspectorDefaultStorage.prefs.getBoolPref("notification_popup");
		} catch (e) {}
		
		try {
			inspectorDefaultStorage.notification_sound_volume = inspectorDefaultStorage.prefs.getIntPref("notification_sound_volume")/100;
		} catch (e) {}
		
		try {
			inspectorDefaultStorage.button_bgcolor = inspectorDefaultStorage.prefs.getCharPref("button_bgcolor");
		} catch (e) {}
		
		try {
			inspectorDefaultStorage.button_color = inspectorDefaultStorage.prefs.getCharPref("button_color");
		} catch (e) {}
	}
}

inspectorDefaultStorage.getPrefs();