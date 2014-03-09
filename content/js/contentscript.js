var contentScript = {

	invokedErrorCallback: false,
	updateTimer: 0,
	requestFailureCount: 0,

	winobj: null,

	favUrl: 'http://4pda.ru/forum/index.php?autocom=favtopics',

	new_post_icon: "http://s.4pda.ru/forum/style_images/1/newpost.gif",
	new_mess_icon: "http://s.4pda.ru/forum/style_images/1/f_norm.gif",

	init: function()
	{
		var obj = document.getElementById("navigator-toolbox");
		this.winobj = (obj)?window.document:window.opener.document;

		setTimeout(function() {
			contentScript.getNewCount();
		}, 2000);
	},

	newIteration: function()
	{
		inspectorDefaultStorage.getPrefs();
		this.updateTimer = setTimeout(function() {
			contentScript.getNewCount();
		}, inspectorDefaultStorage.interval);
	},

	getNewCount: function()
	{
		utils.log('new update - '+inspectorDefaultStorage.interval);
		var req = new XMLHttpRequest();
		req.onreadystatechange = function()
		{
			if (req.readyState != 4)
			return;
			if (req.status == 200)
			{
				if (req.responseText)
				{
					count = contentScript.getFavCount(req.responseText);
					mesCount = contentScript.getMesCount(req.responseText);

					if (count === false || mesCount === false)
						contentScript.printLogout();
					else
						contentScript.printCount(count, mesCount);

					contentScript.newIteration();
					return;
				}
			} 
			contentScript.printLogout();
		}

		req.onerror = function() {
			contentScript.printLogout();
		}

		req.open("GET", contentScript.favUrl, true);
		req.send(null);
	},

	getFavCount: function(text)
	{
		if (!text)
			return 0;

		var regexp = /(http:\/\/s.4pda.ru\/forum\/style_images\/1\/newpost.gif)/ig;
		
		if (typeof (favs = text.match(regexp)) == 'object'  && favs != null)
			return favs.length;
			else
			return false;
	},

	getMesCount: function(text)
	{
		if (!text)
			return 0;
		ff = text.match(/\<a href\=\"http\:\/\/4pda.ru\/forum\/index\.php\?act\=Msg\&amp\;CODE\=01\"\>.*?\: (\d+?)\<\/a\>/);

		if (typeof (ff) == 'object' && ff != null && (typeof ff[1] != 'undefined'))
			return ff[1];
			else
			return false;
	},

	getMailCount: function(div)
	{
		var divs1 = div.getElementsByTagName("div");
		
		for (var i = 0; i < divs1.length; i++)
		{
			if (divs1[i].id == "userlinks")
			{
				var links = divs1[i].getElementsByTagName("a");
				for (var j = 0; j < links.length; j++)
				{
					if (links[j].href == getMailUrl())
					{
						var index = links[j].innerText.indexOf(":");
						var count_text;
						if (index == -1)
							count_text = "!!!"; 
						else 
							count_text = links[j].innerText.substring(index + 2, links[j].innerText.length);

						if (count_text == "0")
							return 0;
						return count_text;
					}
				}
			}
		}

		return -1;
	},

	printCount: function(count, mesCount)
	{
		var btn = this.winobj.getElementById('inspector-button');

		if (!btn)
			return false;

		var canvas = document.getElementById("inspector_button_canvas");
		canvas.setAttribute("width", 24);
		canvas.setAttribute("height", 22);
		var ctx = canvas.getContext("2d");
		
		var img = new Image();
		img.onload = function()
		{
			ctx.textBaseline = "top";
			ctx.font = "bold 9px tahoma";        // has to go before measureText
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 1, 0, img.width, img.height);

			var w = ctx.measureText(count).width;
			var h = 9;                  // 9 = font height

			var x = canvas.width - w;
			var y = canvas.height - h - 1;          // 1 = bottom padding

			ctx.fillStyle = "#d62f2f";
			ctx.fillRect(x-1, y, w+2, h+5);
			ctx.fillStyle = "#fff";             // text color
			ctx.fillText(count, x, y+1);

			var w = ctx.measureText(mesCount).width;

			ctx.fillStyle = "#d62f2f";
			ctx.fillRect(0, y, w+2, h+5);
			ctx.fillStyle = "#fff";             // text color
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

contentScript.init();

function inspectorToolbarButtonClick()
{
	// location.href="http://4pda.ru/forum/index.php?autocom=favtopics";
	// alert('click');
	var tBrowser = top.document.getElementById("content");
	var tab = tBrowser.addTab(contentScript.favUrl);
	// use this line to focus the new tab, otherwise it will open in background
	tBrowser.selectedTab = tab;
	//window.openDialog("chrome://inspector/content/popup.xul", "dlgTelefumConfig", "resizable=yes,centerscreen,chrome").focus();
}