inspector4pda.vars = {

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
			inspector4pda.vars[field] = inspector4pda.vars.prefs.getIntPref("interval") * (multiplier || 1);
		} catch (e) {
			if (defaultValue) {
				inspector4pda.vars[field] = defaultValue;
			};
			inspector4pda.utils.log('error');
			inspector4pda.utils.log(e);
		}
	}
}

inspector4pda.vars.getPrefs();