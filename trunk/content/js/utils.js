var utils = {
	
	getHost: function(doc)
	{
		try {
			return doc.location.host.toLowerCase();
		} catch (e) {
			return null;
		}
	},
	
	consoleService: null,

	log: function(msg) {
		if (this.consoleService == null) {
			this.consoleService = Components.classes["@mozilla.org/consoleservice;1"];
			this.consoleService = this.consoleService.getService(Components.interfaces.nsIConsoleService);
		}
		
		this.consoleService.logStringMessage(msg);
	}
};