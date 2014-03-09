var utils = {
	
	consoleService: null,

	log: function(msg, json) {
		if (this.consoleService == null) {
			this.consoleService = Components.classes["@mozilla.org/consoleservice;1"]
				.getService(Components.interfaces.nsIConsoleService);
		}

		if (json)
			msg = JSON.stringify(msg);
		
		this.consoleService.logStringMessage(msg);
	},

	htmlspecialcharsdecode: function (string)
	{
		var string = string.replace(/&quot;/g, '"');
		string = string.replace(/&lt;/g, '<');
		string = string.replace(/&gt;/g, '>');
		string = string.replace(/&#39;/g, "'");
		string = string.replace(/&#9733;/g, "★");
		string = string.replace(/&amp;/g, '&');
		string = string.replace(/&#124;/g, '|');
		return string;
	}
};