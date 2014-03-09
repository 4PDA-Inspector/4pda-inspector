var inspectorDefaultStorage = {

	interval: 5000,

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
	}
}

inspectorDefaultStorage.getPrefs();