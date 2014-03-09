var inspectorToolbar = {

	winobj: null,
	panel: null,
	list: null,
	unreadThemes: {},
	
	link_favTopics: 'http://4pda.ru/forum/index.php?autocom=favtopics',
	link_messages: 'http://4pda.ru/forum/index.php?act=Msg&CODE=01',
	link_qms: 'http://4pda.ru/forum/index.php?act=qms',
	
	link_login: 'http://4pda.ru/forum/index.php?act=Login&CODE=00',

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

		this.winobj.getElementById('inspector_unreadMessage').addEventListener('click', function(){
			inspectorToolbar.openPage(inspectorToolbar.link_messages);
			inspectorContentScript.unreadMessageCount = 0;
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
	},

	buttonClick: function(parent)
	{
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
			inspectorToolbar.parseThemes();

			this.list = this.winobj.getElementById('inspectorPanel_themesList');

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
						inspectorContentScript.printCount(Object.keys(inspectorToolbar.unreadThemes).length, inspectorContentScript.unreadMessageCount);
					});
					this.list.appendChild(newElem);
				};
				this.winobj.getElementById('inspector_openAllFavs').disabled = false;
			}
			else
				this.winobj.getElementById('inspector_openAllFavs').disabled = true;

			this.winobj.getElementById('inspector_unreadMessageCount').value = inspectorContentScript.unreadMessageCount;
			this.winobj.getElementById('inspector_unreadQmsCount').value = inspectorContentScript.unreadQmsCount;
			
			this.panel.openPopup(parent, 'after_start', 0, 0, false, true);
		}
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

		inspectorContentScript.printCount(0, inspectorContentScript.unreadMessageCount);

		return true;
	}

};