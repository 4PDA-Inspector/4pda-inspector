var inspectorContentScript = {

	updateTimer: 0,
	winobj: null,

	favUrl: 'http://4pda.ru/forum/index.php?autocom=favtopics',

	newPostImgRegExp: /(http:\/\/s.4pda.ru\/forum\/style_images\/1\/newpost.gif)/ig,
	qmsBlockRegExp: /\<span id\=\"events_count_val\"\>(\d+)\<\/span\>/,
	findLoginFormRegExp: /\<input type\=\"text\".*? name\=\"UserName\" \/\>/,
	findLoginLinkRegExp: /\<a href\=\"\/forum\/index\.php\?act\=login\&amp\;CODE\=00\"\>Вход\<\/a\>/,
	parseUserRegExp: /\"http\:\/\/4pda\.ru\/forum\/index\.php\?showuser\=(\d+)\"\>(.*?)\<\/a\>/i,

	unreadThemesCount: 0,
	unreadMessageCount: 0,
	unreadQmsCount: 0,
	isLogin: false,

	userName: '',
	userId: '',

	osString: '',

	stringBundle: Services.strings.createBundle("chrome://4pdainspector/locale/strings.properties"),

	notifications: [],

	lastCount: {
		themes: false,
		qms: false,
		themesIds: []
	},

	unreadThemes: [],

	init: function(el)
	{
		var obj = document.getElementById("navigator-toolbox");
		this.winobj = (obj)?window.document:window.opener.document;
		
		this.osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;

		inspectorContentScript.getNewCount(true, null, null, true);
		setTimeout(function() {
			inspectorContentScript.getNewCount(false, null, null, true);
		}, 2000);

	},

	newIteration: function()
	{
		inspectorDefaultStorage.getPrefs();
		this.updateTimer = setTimeout(function() {
			inspectorContentScript.getNewCount();
		}, inspectorDefaultStorage.interval);
	},

	getNewCount: function(noFuture, callback, errorCallback, hideNotification)
	{
		// utils.log('new update - '+inspectorDefaultStorage.interval);
		var req = new XMLHttpRequest();
		req.onreadystatechange = function()
		{
			if (req.readyState == 4)
			{
				if (req.status == 200)
				{
					if (req.responseText)
					{
						if (inspectorContentScript.isNotLogin(req.responseText))
						{
							inspectorContentScript.printLogout();
							if (errorCallback && typeof errorCallback == 'function')
								errorCallback();
						}
						else
						{
							inspectorContentScript.parseUserName(req.responseText);

							inspectorContentScript.parseThemes(req.responseText);

							inspectorContentScript.unreadThemesCount = inspectorContentScript.getFavCount(req.responseText);
							inspectorContentScript.unreadQmsCount = inspectorContentScript.getQmsCount(req.responseText);

							inspectorContentScript.printCount(inspectorContentScript.unreadThemesCount, inspectorContentScript.unreadQmsCount);
							inspectorContentScript.checkNews(hideNotification);
						}

						if (callback && typeof callback == 'function')
							callback();
						if (!noFuture)
							inspectorContentScript.newIteration();
						return;
					}
					else
					{
						inspectorContentScript.printLogout();
						if (errorCallback && typeof errorCallback == 'function')
							errorCallback();
						if (!noFuture)
							inspectorContentScript.newIteration();
					}
				}
				else
				{
					inspectorContentScript.printLogout(true);
				}
			}
		}

		req.onerror = function() {
			inspectorContentScript.printLogout();
			if (errorCallback && typeof errorCallback == 'function')
				errorCallback();
			if (!noFuture)
				inspectorContentScript.newIteration();
		}

		req.timeout = Math.min(inspectorDefaultStorage.interval, 2000); // не больше двух секунд. или одной
		req.ontimeout = function () {
			if (!noFuture)
				inspectorContentScript.getNewCount();
		}

		req.open("GET", inspectorContentScript.favUrl, true);
		req.send(null);
	},

	isNotLogin: function(text)
	{
		if (!text)
			return false;

		var ff = text.match(inspectorContentScript.findLoginFormRegExp);
		var ff2 = text.match(inspectorContentScript.findLoginLinkRegExp);

		inspectorContentScript.isLogin = ((typeof ff != 'object' || ff == null) && (typeof ff2 != 'object' || ff2 == null));

		return !inspectorContentScript.isLogin;
	},

	getFavCount: function(text)
	{
		if (!text)
			return 0;

		var favs = text.match(inspectorContentScript.newPostImgRegExp);

		if (typeof favs == 'object'  && favs != null)
			return favs.length;
			else
			return 0;
	},

	getQmsCount: function(text)
	{
		if (!text)
			return 0;

		var ff = text.match(inspectorContentScript.qmsBlockRegExp);

		if (typeof (ff) == 'object' && ff != null && (typeof ff[1] != 'undefined'))
			return ff[1];
			else
			return 0;
	},

	parseUserName: function(text)
	{
		if (!text)
			return false;

		var ff = text.match(inspectorContentScript.parseUserRegExp);

		if (typeof (ff) == 'object' && ff != null && (typeof ff[1] != 'undefined'))
		{
			inspectorContentScript.userName = ff[2];
			inspectorContentScript.userId = ff[1];
		}

	},

	printCount: function(count, mesCount)
	{
		var btn = this.winobj.getElementById('inspector-button');

		if (!btn)
			return false;

		if (this.osString == 'Linux' || inspectorDefaultStorage.button_big)
		{
			var canvas_width = 26;
			var canvas_height = 24;
			var canvas_img = "chrome://4pdainspector/content/icons/icon_22x.png";
			var title_padding = 0;
			var fontSize = inspectorDefaultStorage.button_big_fontsize;
		}
		else
		{
			var canvas_width = 20;
			var canvas_height = 16;
			var canvas_img = "chrome://4pdainspector/content/icons/icon_16x.png";
			var title_padding = 2;
			var fontSize = inspectorDefaultStorage.button_fontsize;
		}

		var canvas = this.winobj.getElementById("inspector_button_canvas");
		canvas.setAttribute("width", canvas_width);
		canvas.setAttribute("height", canvas_height);
		var ctx = canvas.getContext("2d");
		
		var img = new Image();
		img.onload = function()
		{
			ctx.textBaseline = 'top';
			ctx.font = 'bold '+fontSize+'px tahoma,arial';
			ctx.clearRect(0, 0, canvas_width, canvas_height);
			ctx.drawImage(img, 2, 0, img.width, img.height);

			var w = ctx.measureText(count).width;
			var h = fontSize + title_padding;

			var x = canvas_width - w;
			var y = canvas_height - h;

			ctx.fillStyle = inspectorDefaultStorage.button_bgcolor;
			ctx.fillRect(x-1, y, w+1, h);
			ctx.fillStyle = inspectorDefaultStorage.button_color;
			ctx.fillText(count, x, y+1);

			var w = ctx.measureText(mesCount).width;
			ctx.fillStyle = inspectorDefaultStorage.button_bgcolor;
			ctx.fillRect(0, y, w+2, h);
			ctx.fillStyle = inspectorDefaultStorage.button_color;
			ctx.fillText(mesCount, 1, y+1);

			btn.image = canvas.toDataURL("image/png");
		};

		img.src = canvas_img;
		btn.setAttribute('tooltiptext', this.stringBundle.GetStringFromName("4PDA_online")+
			'\n'+this.stringBundle.GetStringFromName("Unread Topics")+': '+count+
			'\n'+this.stringBundle.GetStringFromName("New Messages")+': '+inspectorContentScript.unreadQmsCount
		);
	},

	printLogout: function(unavailable)
	{
		var btn = this.winobj.getElementById('inspector-button');

		if (btn)
		{
			btn.image = 'chrome://4pdainspector/content/icons/icon_'+((this.osString == 'Linux')?'22':'16')+'x_out.png';
			btn.setAttribute('tooltiptext', unavailable?
					this.stringBundle.GetStringFromName("4PDA_Site Unavailable"):
					this.stringBundle.GetStringFromName("4PDA_offline")
				);
		}

	},

	settingsAccept: function()
	{
		clearTimeout(this.updateTimer);
		this.getNewCount();
	},

	checkNews: function(hideNotification)
	{
		if (!hideNotification)
		{
			var hasNews = false;

			if ( (this.lastCount.qms !== false) && (this.lastCount.qms < inspectorContentScript.unreadQmsCount) )
			{
				hasNews = true;
				inspectorContentScript.notifications.push({
					title: inspectorContentScript.stringBundle.GetStringFromName("New Message"),
					body: inspectorContentScript.stringBundle.GetStringFromName("New Message"),
					type: 'qms'
				});
			}

			var themesIds = Object.keys(inspectorContentScript.unreadThemes);
			for (key in themesIds)
			{
				if (this.lastCount.themesIds.indexOf(themesIds[key]) < 0)
				{
					hasNews = true;
					inspectorContentScript.notifications.push({
						title: inspectorContentScript.stringBundle.GetStringFromName("New Comment"),
						body: utils.htmlspecialcharsdecode(inspectorContentScript.unreadThemes[themesIds[key]].title),
						type: themesIds[key]
					});
				};
			}

			if (hasNews)
			{
				this.notification();
			}
		}

		this.lastCount.themes = inspectorContentScript.unreadThemesCount,
		this.lastCount.qms = inspectorContentScript.unreadQmsCount;
		this.lastCount.themesIds = Object.keys(inspectorContentScript.unreadThemes);

	},

	notification: function()
	{
		if (inspectorDefaultStorage.notification_sound)
		{
			var soundElement = this.winobj.getElementById("inspector_sound");
			soundElement.volume = inspectorDefaultStorage.notification_sound_volume;
			soundElement.play();
		}

		if (inspectorDefaultStorage.notification_popup)
		{
			this.showNotifications();
		}

	},

	showNotifications: function()
	{
		if (!this.notifications.length)
			return false;

		var currentNotification = this.notifications.shift();

		var notification = new Notification(currentNotification.title, {
			tag : "4pdainspector_"+ currentNotification.type,
			body : currentNotification.body,
			icon : "chrome://4pdainspector/content/icons/icon_64.png"
		});

		
		notification.onclick = function() {
			tagData = this.tag.split('_');
			
			if (!tagData[1])
				return false;

			if (tagData[1] == 'qms')
				inspectorToolbar.openPage(inspectorToolbar.link_qms);
			else
				inspectorToolbar.openTheme(tagData[1]);
		}

		setTimeout(function()
		{
			inspectorContentScript.showNotifications();
		}, 50);
	},

	parseThemes: function(text)
	{
		inspectorContentScript.unreadThemes = {};
		if (!text)
			return false;

		var themes = text.match(/\<a href\=[\"\']([\w\=\&\?\.\/\;\:]+)[\"\']\>\<img.+?src=[\"\']http\:\/\/s\.4pda.ru\/forum\/style_images\/1\/newpost\.gif[\"\'].+?\>\<\/a\>[\s\S]*?\<span class\=\"lastaction\"\>.*?\<\/span\>/ig);

		if (themes)
		{
			for (var i = 0; i<themes.length; i++)
			{
				var theme = themes[i].match(/\<a.+?href\=\'.*?showtopic\=(\d+).*?\'.*?\<a id\=\"tid\-link.*?\>(.+?)\<\/a\>[\S\s]*\"lastaction\"\>(.+?)\<br.*?\<b\>\<a.*\>(.+?)\<\/a\>\<\/b\>/i);

				if (theme)
				{
					inspectorContentScript.unreadThemes[theme[1]] = {
						title: theme[2],
						date: theme[3],
						author: theme[4],
					};
				}
			};
		}
	}
};

inspectorContentScript.init();