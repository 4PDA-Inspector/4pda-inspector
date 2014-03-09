var utils = {
	
	consoleService: null,

	log: function(msg) {
		if (this.consoleService == null) {
			this.consoleService = Components.classes["@mozilla.org/consoleservice;1"]
				.getService(Components.interfaces.nsIConsoleService);
		}
		
		this.consoleService.logStringMessage(msg);
	}
};