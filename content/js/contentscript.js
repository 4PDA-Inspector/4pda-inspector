var inspectorContentScript = {

	updateTimer: 0,
	winobj: null,

	favUrl: 'http://4pda.ru/forum/index.php?autocom=favtopics',

	newPostImgRegExp: /(http:\/\/s.4pda.ru\/forum\/style_images\/1\/newpost.gif)/ig,
	messageLinkRegExp: /\<a href\=\"http\:\/\/4pda.ru\/forum\/index\.php\?act\=Msg\&amp\;CODE\=01\"\>.*?\: (\d+?)\<\/a\>/,

	unreadMessageCount: 0,
	lastResponseText: '',

	init: function()
	{
		var obj = document.getElementById("navigator-toolbox");
		this.winobj = (obj)?window.document:window.opener.document;

		inspectorContentScript.getNewCount();
		setTimeout(function() {
			inspectorContentScript.getNewCount();
		}, 1000);
	},

	newIteration: function()
	{
		inspectorDefaultStorage.getPrefs();
		this.updateTimer = setTimeout(function() {
			inspectorContentScript.getNewCount();
		}, inspectorDefaultStorage.interval);
	},

	getNewCount: function()
	{
		// utils.log('new update - '+inspectorDefaultStorage.interval);
		var req = new XMLHttpRequest();
		req.onreadystatechange = function()
		{
			if (req.readyState != 4)
				return;
			if (req.status == 200)
			{
				if (req.responseText)
				{
					count = inspectorContentScript.getFavCount(req.responseText);
					
					mesCount = inspectorContentScript.getMesCount(req.responseText);
					inspectorContentScript.unreadMessageCount = mesCount;

					if (count === false || mesCount === false)
						inspectorContentScript.printLogout();
					else
						inspectorContentScript.printCount(count, mesCount);

					inspectorContentScript.lastResponseText = req.responseText;
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
		
		ff = text.match(inspectorContentScript.messageLinkRegExp);

		if (typeof (ff) == 'object' && ff != null && (typeof ff[1] != 'undefined'))
			return ff[1];
			else
			return false;
	},

	printCount: function(count, mesCount)
	{
		var btn = this.winobj.getElementById('inspector-button');

		if (!btn)
			return false;

		var canvas = document.getElementById("inspector_button_canvas");
		canvas.setAttribute("width", 26);
		canvas.setAttribute("height", 22);
		var ctx = canvas.getContext("2d");
		
		var img = new Image();
		img.onload = function()
		{
			ctx.textBaseline = "top";
			ctx.font = "bold 7pt tahoma";
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 2, 0, img.width, img.height);

			var w = ctx.measureText(count).width;
			var h = 9;

			var x = canvas.width - w;
			var y = canvas.height - h - 1;

			ctx.fillStyle = "#4474C4";
			ctx.fillRect(x-1, y, w+1, h+5);
			ctx.fillStyle = "#fff";
			ctx.fillText(count, x, y+1);

			var w = ctx.measureText(mesCount).width;
			ctx.fillStyle = "#4474C4";
			ctx.fillRect(0, y, w+2, h+5);
			ctx.fillStyle = "#fff";
			ctx.fillText(mesCount, 1, y+1);

			btn.image = canvas.toDataURL("image/png");
		};

		img.src = "chrome://inspector/content/icons/icon_22x.png";
		btn.setAttribute('tooltiptext', '4PDA - В сети');
	},

	printLogout: function()
	{
		var btn = this.winobj.getElementById('inspector-button');

		if (btn)
		{
			btn.image = "chrome://inspector/content/icons/icon_22x_out.png";
			btn.setAttribute('tooltiptext', '4PDA - Не в сети');
		}

	}
};

inspectorContentScript.init();