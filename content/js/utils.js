var utils = {
	
	consoleService: null,
	firebugConsoleService: null,

	log: function(msg, json) {
		if (this.consoleService == null) {
			this.consoleService = Components.classes["@mozilla.org/consoleservice;1"]
				.getService(Components.interfaces.nsIConsoleService);
		}

		if (json)
			msg = JSON.stringify(msg);
		
		this.consoleService.logStringMessage(msg);
	},

	flog: function(msg) {
		if (this.firebugConsoleService == null) {
			this.firebugConsoleService = 
				window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIWebNavigation)
				.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
				.rootTreeItem
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIDOMWindow).Firebug;
		}
		
		this.firebugConsoleService.Console.log(msg);
	},

	htmlspecialcharsdecode: function (string = '')
	{
		string = string.replace(/&lt;/g, '<');
		string = string.replace(/&gt;/g, '>');
		string = string.replace(/&amp;/g, '&');
		string = string.replace(/&quot;/g, '"');
		string = string.replace(/&#33;/g, '!');
		string = string.replace(/&#39;/g, "'");
		string = string.replace(/&#124;/g, '|');
		string = string.replace(/&#9733;/g, "★");
		return string;
	}
};