if (typeof inspector4pda == "undefined") {
	var inspector4pda = {}
}

inspector4pda.utils = {
	
	consoleService: null,
	stringBundle: null,
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
		var parsed = str.match(this.parseStringRexp);
		var pq = '';
		for (var i = 0; i < parsed.length; i++) {
			if (pq = parsed[i].match(/\"(.*)\"/)) {
				parsed[i] = pq[1];
			};
		};
		return parsed;
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
	},

	setStringBundle: function() {
		inspector4pda.utils.stringBundle = (typeof Services == 'object')
			? Services.strings.createBundle("chrome://4pdainspector/locale/strings.properties")
			: null
	},

	getString: function(name) {
		if (!inspector4pda.utils.stringBundle) {
			this.setStringBundle();
		};

		if (inspector4pda.utils.stringBundle) {
			return inspector4pda.utils.stringBundle.GetStringFromName(name);
		} else {
			return name;
		}
	}
};

if (typeof ulog == "undefined") {
	function ulog(text, json) {
		inspector4pda.utils.log(text, json);
	}
}