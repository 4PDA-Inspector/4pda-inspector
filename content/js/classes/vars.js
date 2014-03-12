var vars = {

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
		this.getValue('interval', 1000, 5000);
	},

	getValue: function(field, multiplier, defaultValue)
	{
		try {
			vars[field] = vars.prefs.getIntPref("interval") * (multiplier || 1);
		} catch (e) {
			if (defaultValue) {
				vars[field] = defaultValue;
			};
			utils.log(e);
		}
	}
}

vars.getPrefs();