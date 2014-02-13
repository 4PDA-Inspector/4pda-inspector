var contentScript = {

	invokedErrorCallback: false,
	updateTimer: 0,
	requestFailureCount: 0,

	favUrl: 'http://4pda.ru/forum/index.php?autocom=favtopics',

	new_post_icon: "http://s.4pda.ru/forum/style_images/1/newpost.gif",

	init: function()
	{
		this.getNewCount();

		this.updateTimer = setInterval(function() {
			contentScript.getNewCount();
		}, 2000); // test

	},

	getNewCount: function()
	{
		utils.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		var req = new XMLHttpRequest();
		try
		{
			req.onreadystatechange = function()
			{
				if (req.readyState != 4)
				return;
				if (req.status == 200)
				{
					if (req.responseText)
					{
						count = contentScript.getFavCount(req.responseText);
						utils.log(count);

						return;
						
						div.innerHTML = req.responseText;
					
						div = null;
						utils.log(count);
						// utils.log(countType);
						// handleSuccess(count, countType);
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
		} catch(e) {
			contentScript.handleError();
		}
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
		regexp = /(http:\/\/s.4pda.ru\/forum\/style_images\/1\/newpost.gif)/ig;
		return text.match(regexp).length;
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
	}
};

contentScript.init();

function inspectorToolbarButtonClick()
{
	// location.href="http://4pda.ru/forum/index.php?autocom=favtopics";
	alert('click');
	//window.openDialog("chrome://inspector/content/popup.xul", "dlgTelefumConfig", "resizable=yes,centerscreen,chrome").focus();
}