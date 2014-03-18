var utils = {
	
	consoleService: null,
	firebugConsoleService: null,
	parseStringRexp: /([^\s"']+|"([^"]*)"|'([^']*)')/g,

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

	parse: function(str) {
		return str.match(this.parseStringRexp);
	},

	checkNotificationSupport: function() {
		try {
			Notification.permission;
			return true;
		} catch(e) {
			return false;
		}
	},

	htmlspecialcharsdecode: function (string = '')
	{
		var codes = string.match(/&#(\d+);/g);

		if (codes) {
			for (var i = 0; i < codes.length; i++) {
				var code = codes[i].match(/\d+/g);
				string = string.replace(new RegExp(codes[i], 'g'), String.fromCharCode(code));
			}
		}

		string = string.replace(/&lt;/g, '<');
		string = string.replace(/&gt;/g, '>');
		string = string.replace(/&quot;/g, '"');
		string = string.replace(/&amp;/g, '&');
		return string;
	},

	openPage: function(page) {
		var tBrowser = top.document.getElementById("content");
		var tab = tBrowser.addTab(page);
		tBrowser.selectedTab = tab;
	}
};