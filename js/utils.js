if (typeof inspector4pda == "undefined") {
	var inspector4pda = {}
}

inspector4pda.utils = {
	
	consoleService: null,
	stringBundle: null,
	firebugConsoleService: null,
	parseStringRexp: /([^\s"']+|"([^"]*)"|'([^']*)')/g,

	translates: {
		"4PDA Inspector": "4PDA Инспектор",
		"No unread topics": "Непрочитанных тем нет",
		"Mark As Read": "Пометить как прочитанное",
		"New Message": "Новое сообщение",
		"New Comment": "Новый комментарий",
		"Unread Topics": "Непрочитанных тем",
		"New Messages": "Новых сообщений",
		"4PDA_online": "4PDA - В сети",
		"Open Last Post": "Открыть последнее сообщение",
		"4PDA_offline": "4PDA - Не в сети",
		"4PDA_Site Unavailable": "4PDA - Сайт недоступен",
		"You Are Not Authorized": "Вы не авторизованы",
		"Remove From Favorites": "Удалить из избранного",
		"Add To Favorites": "Добавить в избранное"
	},

	log: function(msg, json) {
		/*if (this.consoleService == null) {
			this.consoleService = Components.classes["@mozilla.org/consoleservice;1"]
				.getService(Components.interfaces.nsIConsoleService);
		}*/

		if (json)
			msg = JSON.stringify(msg);
		
		console.log(msg);
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

	htmlspecialcharsdecode: function (string)
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
		chrome.tabs.create({ url: page });
	},

	setStringBundle: function() {
		inspector4pda.utils.stringBundle = (typeof Services == 'object')
			? Services.strings.createBundle("chrome://4pdainspector/locale/strings.properties")
			: null
	},

	getString: function(name) {

		if (this.translates.hasOwnProperty(name)) {
			return this.translates[name];
		} else {
			return name;
		}
		/*if (!inspector4pda.utils.stringBundle) {
			this.setStringBundle();
		};

		if (inspector4pda.utils.stringBundle) {
			return inspector4pda.utils.stringBundle.GetStringFromName(name);
		} else {
			return name;
		}*/
	}
};

if (typeof ulog == "undefined") {
	function ulog(text, json) {
		inspector4pda.utils.log(text, json);
	}
}