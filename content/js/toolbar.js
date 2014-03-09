var inspectorToolbar = {

	winobj: null,
	panel: null,
	list: null,
	unreadThemes: {},
	
	link_favTopics: 'http://4pda.ru/forum/index.php?autocom=favtopics',
	link_qms: 'http://4pda.ru/forum/index.php?act=qms',
	
	link_login: 'http://4pda.ru/forum/index.php?act=Login&CODE=00',

	refreshImg: null,
	refreshImgRotateInterval: 0,

	init: function()
	{
		var obj = document.getElementById("navigator-toolbox");
		this.winobj = (obj)?window.document:window.opener.document;
		this.panel = this.winobj.getElementById('inspectorPanel');

		this.winobj.getElementById('inspector_goToFavs').addEventListener('click', function(){
			inspectorToolbar.openPage(inspectorToolbar.link_favTopics);
			inspectorToolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector_openAllFavs').addEventListener('click', function(){
			if (inspectorToolbar.openAll())
				inspectorToolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector_unreadQms').addEventListener('click', function(){
			inspectorToolbar.openPage(inspectorToolbar.link_qms);
			inspectorToolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector_openSettings').addEventListener('click', function(){
			inspectorToolbar.handleHidePanel();
			window.openDialog('chrome://4pdainspector/content/settings.xul', 'inspectorSettingWindow', 'chrome, centerscreen, dependent, dialog, titlebar, modal', inspectorContentScript);
		});

		this.refreshImg = this.winobj.getElementById('refreshImg');

		this.refreshImg.addEventListener('click', function(){
			inspectorToolbar.manualRefresh(true);
		});

		this.winobj.getElementById('inspectorPanel_loginBox').addEventListener('click', function(){
			if (inspectorContentScript.isLogin && inspectorContentScript.userId)
				inspectorToolbar.openPage('http://4pda.ru/forum/index.php?showuser='+inspectorContentScript.userId);
			else
				inspectorToolbar.openPage(inspectorToolbar.link_login);

			inspectorToolbar.handleHidePanel();
		});
	},

	buttonClick: function(parent)
	{
		if (inspectorContentScript.isLogin)
			inspectorToolbar.buttonClickAction(parent);
		else
			inspectorToolbar.manualRefresh(false);
	},

	buttonClickAction: function(parent)
	{
		inspectorDefaultStorage.getPrefs();
		switch (inspectorDefaultStorage.click_action)
		{
			case 1:
				inspectorToolbar.showPanel(parent);
				break;
			case 2:
				inspectorToolbar.openPage(inspectorToolbar.link_favTopics);
				break;
			case 3:
				inspectorToolbar.parseThemes();
				inspectorToolbar.openAll();
				break;
			default:
				alert(inspectorDefaultStorage.click_action + ' is uncorrect value');
		}
	},

	parseThemes: function()
	{
		inspectorToolbar.unreadThemes = {};
		if (!inspectorContentScript.lastResponseText)
			return false;
		var themes = inspectorContentScript.lastResponseText.match(/\<a href\=[\"\']([\w\=\&\?\.\/\;\:]+)[\"\']\>\<img.+?src=[\"\']http\:\/\/s\.4pda.ru\/forum\/style_images\/1\/newpost\.gif[\"\'].+?\>\<\/a\>.*?\<a.*?href=[\"\']http\:\/\/4pda\.ru\/forum\/index\.php\?showtopic\=[0-9]+[\"\'].*?\>(.+?)\<\/a\>.*?/ig);

		if (themes)
		{
			for (var i = 0; i<themes.length; i++)
			{
				theme = themes[i].match(/\<a.+href\=\".*?(\d+)\".*?\>(.+)?\<\/a\>/i)

				if (theme && inspectorContentScript.visitedThemes.indexOf(theme[1]) == -1)
				{
					inspectorToolbar.unreadThemes[theme[1]] = theme[2];
				}
			};
		}
	},

	showPanel: function(parent)
	{
		if (!inspectorContentScript.isLogin)
		{
			inspectorToolbar.openPage(inspectorToolbar.link_login);
			return false;
		}

		if (!this.panel)
			this.init();
		
		if (this.panel)
		{
			this.refreshToolbar();
			this.panel.openPopup(parent, 'after_start', 0, 0, false, true);
		}
	},

	refreshToolbar: function ()
	{
		inspectorToolbar.parseThemes();

		if (inspectorContentScript.isLogin && inspectorContentScript.userName)
			inspectorToolbar.winobj.getElementById('inspectorPanel_loginBox').value = "Вы вошли как: "+inspectorContentScript.userName;
			else
			inspectorToolbar.winobj.getElementById('inspectorPanel_loginBox').value = "Вы не авторизовались";

		inspectorToolbar.list = inspectorToolbar.winobj.getElementById('inspectorPanel_themesList');
		inspectorToolbar.hidePanel();

		if (Object.keys(inspectorToolbar.unreadThemes).length)
		{
			for (i in inspectorToolbar.unreadThemes)
			{
				var newElem = document.createElement('label');
				newElem.setAttribute('value', '>> '+inspectorToolbar.unreadThemes[i]);
				newElem.setAttribute('data-theme', i);
				newElem.addEventListener('click', function(){
					var dataTheme = this.getAttribute('data-theme');
					inspectorToolbar.openTheme(dataTheme);
					delete inspectorToolbar.unreadThemes[dataTheme];
					this.parentNode.removeChild(this);
					inspectorContentScript.visitedThemes.push(dataTheme);
					inspectorContentScript.printCount(Object.keys(inspectorToolbar.unreadThemes).length, inspectorContentScript.unreadQmsCount);
				});
				inspectorToolbar.list.appendChild(newElem);
			};
			inspectorToolbar.winobj.getElementById('inspector_openAllFavs').disabled = false;
		}
		else
			inspectorToolbar.winobj.getElementById('inspector_openAllFavs').disabled = true;

		inspectorToolbar.winobj.getElementById('inspector_unreadQmsCount').value = (inspectorContentScript.isLogin)?inspectorContentScript.unreadQmsCount:0;
		clearInterval(inspectorToolbar.refreshImgRotateInterval);
		inspectorToolbar.refreshImg.style.MozTransform = "rotate(0deg)";
	},

	handleHidePanel: function()
	{
		if (this.panel)
			this.panel.hidePopup();
	},

	hidePanel: function()
	{
		this.list = this.winobj.getElementById('inspectorPanel_themesList');

		var labels = this.list.getElementsByTagName('label');

		for (var i = labels.length - 1; i >= 0; i--) {
			this.list.removeChild(labels[i]);
		};
	},

	openPage: function(page)
	{
		var tBrowser = top.document.getElementById("content");
		var tab = tBrowser.addTab(page);
		tBrowser.selectedTab = tab;
	},

	openTheme: function(id)
	{
		if (id)
			inspectorToolbar.openPage('http://4pda.ru/forum/index.php?showtopic='+id+'&view=getnewpost');
	},

	openAll: function ()
	{
		if (!Object.keys(inspectorToolbar.unreadThemes).length)
			return false;
		
		for (i in inspectorToolbar.unreadThemes)
		{
			inspectorToolbar.openTheme(i);
			delete inspectorToolbar.unreadThemes[i];
			inspectorContentScript.visitedThemes.push(i);
		};

		inspectorContentScript.printCount(0, inspectorContentScript.unreadQmsCount);

		return true;
	},

	manualRefresh: function(callback)
	{
		clearTimeout(inspectorContentScript.updateTimer);
		if (callback)
		{
			clearInterval(inspectorToolbar.refreshImgRotateInterval);
			var refreshImgRotate = 0;
			this.refreshImgRotateInterval = setInterval(function(){
				refreshImgRotate+=10;
				inspectorToolbar.refreshImg.style.MozTransform = "rotate(-"+refreshImgRotate+"deg)";
			}, 30);
			callback = inspectorToolbar.refreshToolbar;
			errorCallback = false;
		}
		else
			errorCallback = function(){inspectorToolbar.openPage(inspectorToolbar.link_login)};
		inspectorContentScript.getNewCount(false, callback, errorCallback);
	}

};