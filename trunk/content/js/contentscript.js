var inspectorContentScript = {

	updateTimer: 0,
	winobj: null,

	favUrl: 'http://4pda.ru/forum/index.php?autocom=favtopics',

	newPostImgRegExp: /(http:\/\/s.4pda.ru\/forum\/style_images\/1\/newpost.gif)/ig,
	messageLinkRegExp: /\<a href\=\"http\:\/\/4pda.ru\/forum\/index\.php\?act\=Msg\&amp\;CODE\=01\"\>.*?\: (\d+?)\<\/a\>/,
	qmsBlockRegExp: /\<span id\=\"events_count_val\"\>(\d+)\<\/span\>/,
	findLoginFormRegExp: /\<input type\=\"text\".*? name\=\"UserName\" \/\>/,

	unreadThemesCount: 0,
	unreadMessageCount: 0,
	unreadQmsCount: 0,
	lastResponseText: '',
	isLogin: false,

	osString: '',

	visitedThemes: [],

	init: function()
	{
		var obj = document.getElementById("navigator-toolbox");
		this.winobj = (obj)?window.document:window.opener.document;

		this.osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;

		inspectorContentScript.getNewCount(true);
		setTimeout(function() {
			inspectorContentScript.getNewCount();
		}, 1500);
	},

	newIteration: function()
	{
		inspectorDefaultStorage.getPrefs();
		this.updateTimer = setTimeout(function() {
			inspectorContentScript.getNewCount();
		}, inspectorDefaultStorage.interval);
	},

	getNewCount: function(noFuture)
	{
		// utils.log('new update. '+inspectorDefaultStorage.interval);
		// toJavaScriptConsole('loggg');
		var req = new XMLHttpRequest();
		req.onreadystatechange = function()
		{
			if (req.readyState != 4)
				return;
			if (req.status == 200)
			{
				if (req.responseText)
				{
					if (inspectorContentScript.isNotLogin(req.responseText))
					{
						inspectorContentScript.printLogout();
					}
					else
					{
						mesCount = inspectorContentScript.getMesCount(req.responseText);
						if (mesCount === false)
							inspectorContentScript.printLogout();
						else
						{
							inspectorContentScript.unreadMessageCount = mesCount;

							count = inspectorContentScript.getFavCount(req.responseText);
							inspectorContentScript.unreadThemesCount = count;

							qmsCount = inspectorContentScript.getQmsCount(req.responseText);
							inspectorContentScript.unreadQmsCount = qmsCount;

							inspectorContentScript.printCount(count, mesCount);
						}
					}


					inspectorContentScript.lastResponseText = req.responseText;
					inspectorContentScript.visitedThemes = [];
					if (!noFuture)
						inspectorContentScript.newIteration();
					return;
				}
			}
			inspectorContentScript.printLogout();
		}

		req.onerror = function() {
			inspectorContentScript.printLogout();
		}

		req.open("GET", inspectorContentScript.favUrl, true);
		req.send(null);
	},

	isNotLogin: function(text)
	{
		if (!text)
			return false;

		var ff = text.match(inspectorContentScript.findLoginFormRegExp);

		inspectorContentScript.isLogin = (typeof ff != 'object' || ff == null);

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

	getMesCount: function(text)
	{
		if (!text)
			return 0;
		
		var ff = text.match(inspectorContentScript.messageLinkRegExp);

		if (typeof ff == 'object' && ff != null && (typeof ff[1] != 'undefined'))
			return ff[1];
			else
			return false;
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
			// ctx.strokeRect(0, y, w+2, h+5);
			ctx.fillStyle = inspectorDefaultStorage.button_color;
			ctx.fillText(mesCount, 1, y+1);

			btn.image = canvas.toDataURL("image/png");
		};

		img.src = canvas_img;
		btn.setAttribute('tooltiptext', '4PDA - В сети'+
				'\nНовых сообщений: '+mesCount+
				'\nИзменений в темах: '+count+
				'\nНовых QMS сообщений: '+inspectorContentScript.unreadQmsCount
				);
	},

	printLogout: function()
	{
		var btn = this.winobj.getElementById('inspector-button');

		if (btn)
		{
			btn.image = 'chrome://4pdainspector/content/icons/icon_'+((this.osString == 'Linux')?'22':'16')+'x_out.png';
			btn.setAttribute('tooltiptext', '4PDA - Не в сети');
		}

	},

	settingsAccept: function()
	{
		inspectorDefaultStorage.getPrefs();
		this.printCount(inspectorContentScript.unreadThemesCount, inspectorContentScript.unreadMessageCount);
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function() {
			inspectorContentScript.getNewCount();
		}, inspectorDefaultStorage.interval);
	}
};

inspectorContentScript.init();