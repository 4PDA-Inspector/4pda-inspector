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

		this.getNewCount();

		this.updateTimer = setInterval(function() {
			contentScript.getNewCount();
		}, 5000); // test

	},

	getNewCount: function()
	{
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
					contentScript.printCount(count, mesCount);
					return;
				}
			} 
			contentScript.handleError();
		}

		req.onerror = function()
		{
			contentScript.handleError();
		}

		req.open("GET", contentScript.favUrl, true);
		req.send(null);
	},

	handleError: function()
	{
		this.requestFailureCount++;
		/*
		window.clearTimeout(abortTimerId);
		if (onError && !this.invokedErrorCallback)
			onError();
		this.invokedErrorCallback = true;
		*/
	},

	getFavCount: function(text)
	{
		if (!text)
			return 0;

		var regexp = /(http:\/\/s.4pda.ru\/forum\/style_images\/1\/newpost.gif)/ig;
		
		if (typeof (favs = text.match(regexp)) == 'object'  && favs != null)
			return favs.length;
			else
			return 0;
	},

	getMesCount: function(text)
	{
		if (!text)
			return 0;
		ff = text.match(/\<a href\=\"http\:\/\/4pda.ru\/forum\/index\.php\?act\=Msg\&amp\;CODE\=01\"\>.*?\: (\d+?)\<\/a\>/);

		if (typeof (ff) == 'object' && ff != null && (typeof ff[1] != 'undefined'))
			return ff[1];
			else
			return 0;
	},

	getMailCount: function(div)
	{
		var divs1 = div.getElementsByTagName("div");
		if (this.hasQMS(divs1)) 
			return "QMS";

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

	hasQMS: function(divs1)
	{
		for (var i = 0; i < divs1.length; i++)
		{
			if (divs1[i].innerText.substring(0,5) == "QMS: ")
				return true;
		}
		return false;
	},

	printCount: function(count, mesCount)
	{
		var btn = this.winobj.getElementById('inspector-button');

		if (!btn)
			return false;

		var canvas = document.getElementById("inspector_button_canvas");
		canvas.setAttribute("width", 22);
		canvas.setAttribute("height", 22);
		var ctx = canvas.getContext("2d");
		
		var img = new Image();
		img.onload = function()
		{
			ctx.textBaseline = "top";
			ctx.font = "bold 9px sans-serif";        // has to go before measureText
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, -1, img.width, img.height);

			var w = ctx.measureText(count).width;
			var h = 9;                  // 9 = font height

			var rp = 1;  // right padding
			var x = canvas.width - w - rp;
			var y = canvas.height - h - 1;          // 1 = bottom padding

			ctx.fillStyle = "#4ea8ea";
			ctx.fillRect(x-rp, y, w+rp+rp, h+5);
			ctx.fillStyle = "#fff";             // text color
			ctx.fillText(count, x, y+1);

			var w = ctx.measureText(mesCount).width;

			ctx.fillStyle = "#4ea8ea";
			ctx.fillRect(1, y, w+rp+rp, h+5);
			ctx.fillStyle = "#fff";             // text color
			ctx.fillText(mesCount, 2, y+1);

			btn.image = canvas.toDataURL("image/png");
		};

		img.src = "chrome://inspector/content/icons/favicon_in.png";
		// this.winobj.getElementById('inspector-button').setAttribute('tooltiptext', count);
	}
};

contentScript.init();

function inspectorToolbarButtonClick()
{
	// location.href="http://4pda.ru/forum/index.php?autocom=favtopics";
	alert('click');
	//window.openDialog("chrome://inspector/content/popup.xul", "dlgTelefumConfig", "resizable=yes,centerscreen,chrome").focus();
}