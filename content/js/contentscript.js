// inspectorContentScript
inspector4pda.cScript = {

	updateTimer: 0,
	winobj: null,

	favUrl: 'http://4pda.ru/forum/index.php?autocom=favtopics',

	newPostImgRegExp: /(http:\/\/s.4pda.ru\/forum\/style_images\/1\/newpost.gif)/ig,
	qmsBlockRegExp: /\<a href\=\"http\:\/\/4pda\.ru\/forum\/index\.php\?act\=qms\&\" id\=\"events\-count\"\>Сообщений\: (\d+)\<\/a\>/,
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

	notifications: [],

	lastCount: {
		themes: false,
		qms: false,
		themesIds: []
	},

	unreadThemes: [],

	timeoutUpdateTime: 3000,
	lastUpdateRequest: 0,

	/*constructor: function()
	{
		alert(typeof inspector4pda.stringBundle);
	}(),*/

	init: function(el)
	{
		var obj = document.getElementById("navigator-toolbox");
		this.winobj = (obj)?window.document:window.opener.document;
		
		this.osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;

		inspector4pda.cScript.getNewCount(true, null, null, true);
		setTimeout(function() {
			inspector4pda.cScript.getNewCount(false, null, null, true);
		}, 2000);

	},

	newIteration: function(interval)
	{
		inspector4pda.defaults.getPrefs();
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function() {
			inspector4pda.cScript.getNewCount();
		}, (interval || inspector4pda.defaults.interval));
	},

	getNewCount: function(noFuture, callback, errorCallback, hideNotification)
	{
		// inspector4pda.utils.log('new update - '+inspector4pda.defaults.interval);
		var nowTime = new Date().getTime();
		if (nowTime - this.lastUpdateRequest < 1000) {
			return false;
		}
		this.lastUpdateRequest = nowTime;

		var req = new XMLHttpRequest();
		req.onreadystatechange = function()
		{
			if (req.readyState == 4)
			{
				if (req.status == 200)
				{
					if (req.responseText)
					{
						inspector4pda.toolbar.removedThemes = {};
						if (inspector4pda.cScript.isNotLogin(req.responseText))
						{
							inspector4pda.cScript.printLogout();
							if (errorCallback && typeof errorCallback == 'function')
								errorCallback();
						}
						else
						{
							inspector4pda.cScript.parseUserName(req.responseText);

							inspector4pda.cScript.parseThemes(req.responseText);

							inspector4pda.cScript.unreadThemesCount = inspector4pda.cScript.getFavCount(req.responseText);
							inspector4pda.cScript.unreadQmsCount = inspector4pda.cScript.getQmsCount(req.responseText);

							inspector4pda.cScript.printCount(inspector4pda.cScript.unreadThemesCount, inspector4pda.cScript.unreadQmsCount);
							inspector4pda.cScript.checkNews(hideNotification);
						}

						if (callback && typeof callback == 'function')
							callback();
						if (!noFuture)
							inspector4pda.cScript.newIteration();
						return;
					}
					else
					{
						inspector4pda.cScript.printLogout();
						if (errorCallback && typeof errorCallback == 'function')
							errorCallback();
						if (!noFuture)
							inspector4pda.cScript.newIteration();
					}
				}
				else
				{
					inspector4pda.cScript.printLogout(true);
				}
			}
		}

		req.onerror = function() {
			inspector4pda.cScript.printLogout();
			if (errorCallback && typeof errorCallback == 'function')
				errorCallback();
			if (!noFuture)
				inspector4pda.cScript.newIteration();
		}

		req.timeout = inspector4pda.cScript.timeoutUpdateTime;
		req.ontimeout = function () {
			if (!noFuture) {
				inspector4pda.cScript.newIteration(inspector4pda.cScript.timeoutUpdateTime);
			}
		}

		req.open("GET", inspector4pda.cScript.favUrl, true);
		req.send(null);
	},

	isNotLogin: function(text)
	{
		if (!text)
			return false;

		var ff = text.match(inspector4pda.cScript.findLoginFormRegExp);
		var ff2 = text.match(inspector4pda.cScript.findLoginLinkRegExp);

		inspector4pda.cScript.isLogin = ((typeof ff != 'object' || ff == null) && (typeof ff2 != 'object' || ff2 == null));

		return !inspector4pda.cScript.isLogin;
	},

	getFavCount: function(text)
	{
		if (!text)
			return 0;

		var favs = text.match(inspector4pda.cScript.newPostImgRegExp);

		if (typeof favs == 'object' && favs != null)
			return favs.length;
			else
			return 0;
	},

	getQmsCount: function(text)
	{
		if (!text)
			return 0;

		var ff = text.match(inspector4pda.cScript.qmsBlockRegExp);

		if (typeof (ff) == 'object' && ff != null && (typeof ff[1] != 'undefined'))
			return ff[1];
			else
			return 0;
	},

	parseUserName: function(text)
	{
		if (!text)
			return false;

		var ff = text.match(inspector4pda.cScript.parseUserRegExp);

		if (typeof (ff) == 'object' && ff != null && (typeof ff[1] != 'undefined'))
		{
			inspector4pda.cScript.userName = ff[2];
			inspector4pda.cScript.userId = ff[1];
		}

	},

	printCount: function(count, mesCount)
	{
		var btn = this.winobj.getElementById('inspector-button');

		if (!btn)
			return false;

		if (this.osString == 'Linux' || inspector4pda.defaults.button_big)
		{
			var canvas_width = 26;
			var canvas_height = 24;
			var canvas_img = "chrome://4pdainspector/content/icons/icon_22x.png";
			var title_padding = 0;
			var fontSize = inspector4pda.defaults.button_big_fontsize;
		}
		else
		{
			var canvas_width = 20;
			var canvas_height = 16;
			var canvas_img = "chrome://4pdainspector/content/icons/icon_16x.png";
			var title_padding = 2;
			var fontSize = inspector4pda.defaults.button_fontsize;
		}

		var canvas = this.winobj.getElementById("inspector4pda_button_canvas");
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

			ctx.fillStyle = inspector4pda.defaults.button_bgcolor;
			ctx.fillRect(x-1, y, w+1, h);
			ctx.fillStyle = inspector4pda.defaults.button_color;
			ctx.fillText(count, x, y+1);

			var w = ctx.measureText(mesCount).width;
			ctx.fillStyle = inspector4pda.defaults.button_bgcolor;
			ctx.fillRect(0, y, w+2, h);
			ctx.fillStyle = inspector4pda.defaults.button_color;
			ctx.fillText(mesCount, 1, y+1);

			btn.image = canvas.toDataURL("image/png");
		};

		img.src = canvas_img;
		btn.setAttribute('tooltiptext', inspector4pda.stringBundle.GetStringFromName("4PDA_online")+
			'\n'+inspector4pda.stringBundle.GetStringFromName("Unread Topics")+': '+count+
			'\n'+inspector4pda.stringBundle.GetStringFromName("New Messages")+': '+inspector4pda.cScript.unreadQmsCount
		);
	},

	printLogout: function(unavailable)
	{
		var btn = this.winobj.getElementById('inspector-button');

		if (btn)
		{
			btn.image = 'chrome://4pdainspector/content/icons/icon_'+((this.osString == 'Linux')?'22':'16')+'x_out.png';
			btn.setAttribute('tooltiptext', unavailable?
					inspector4pda.stringBundle.GetStringFromName("4PDA_Site Unavailable"):
					inspector4pda.stringBundle.GetStringFromName("4PDA_offline")
				);
		}

	},

	settingsAccept: function()
	{
		inspector4pda.defaults.getPrefs();
		clearTimeout(this.updateTimer);
		inspector4pda.cScript.lastUpdateRequest = 0;
		this.getNewCount();
	},

	checkNews: function(hideNotification)
	{
		if (!hideNotification)
		{
			var hasNews = false;

			if ( (this.lastCount.qms !== false) && (this.lastCount.qms < inspector4pda.cScript.unreadQmsCount) )
			{
				hasNews = true;
				inspector4pda.cScript.notifications.push({
					title: inspector4pda.stringBundle.GetStringFromName("New Message"),
					body: inspector4pda.stringBundle.GetStringFromName("New Message"),
					type: 'qms'
				});
			}

			var themesIds = Object.keys(inspector4pda.cScript.unreadThemes);
			for (var key in themesIds)
			{
				if (this.lastCount.themesIds.indexOf(themesIds[key]) < 0)
				{
					hasNews = true;
					inspector4pda.cScript.notifications.push({
						title: inspector4pda.stringBundle.GetStringFromName("New Comment"),
						body: inspector4pda.utils.htmlspecialcharsdecode(inspector4pda.cScript.unreadThemes[themesIds[key]].title),
						type: themesIds[key]
					});
				};
			}

			if (hasNews)
			{
				this.notification();
			}
		}

		this.lastCount.themes = inspector4pda.cScript.unreadThemesCount,
		this.lastCount.qms = inspector4pda.cScript.unreadQmsCount;
		this.lastCount.themesIds = Object.keys(inspector4pda.cScript.unreadThemes);

	},

	notification: function()
	{
		if (inspector4pda.defaults.notification_sound)
		{
			var soundElement = this.winobj.getElementById("inspector4pda_sound");
			soundElement.volume = inspector4pda.defaults.notification_sound_volume;
			soundElement.play();
		}

		if (inspector4pda.defaults.notification_popup)
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
				inspector4pda.toolbar.openPage(inspector4pda.toolbar.link_qms);
			else
				inspector4pda.toolbar.openTheme(tagData[1]);
		}

		setTimeout(function()
		{
			inspector4pda.cScript.showNotifications();
		}, 50);
	},

	parseThemes: function(text)
	{
		inspector4pda.cScript.unreadThemes = {};
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
					inspector4pda.cScript.unreadThemes[theme[1]] = {
						title: theme[2],
						date: theme[3],
						author: theme[4],
					};
				}
			};
		}
	}
};

// inspector4pda.cScript.init();