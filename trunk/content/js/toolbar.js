var inspectorToolbar = {

	winobj: null,
	panel: null,
	list: null,
	unreadThemes: [],
	
	link_favTopics: 'http://4pda.ru/forum/index.php?autocom=favtopics',
	link_messages: 'http://4pda.ru/forum/index.php?act=Msg&CODE=01',

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

		this.winobj.getElementById('inspector_messagesHBox').addEventListener('click', function(){
			inspectorToolbar.openPage(inspectorToolbar.link_messages);
			inspectorToolbar.handleHidePanel();
		});
	},

	buttonClick: function()
	{
		var tBrowser = top.document.getElementById("content");
		var tab = tBrowser.addTab(inspectorContentScript.favUrl);
		tBrowser.selectedTab = tab;
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
		inspectorToolbar.unreadThemes = [];
		if (!inspectorContentScript.lastResponseText)
			return false;
		var themes = inspectorContentScript.lastResponseText.match(/\<a href\=[\"\']([\w\=\&\?\.\/\;\:]+)[\"\']\>\<img.+?src=[\"\']http\:\/\/s\.4pda.ru\/forum\/style_images\/1\/newpost\.gif[\"\'].+?\>\<\/a\>.*?\<a.*?href=[\"\']http\:\/\/4pda\.ru\/forum\/index\.php\?showtopic\=[0-9]+[\"\'].*?\>(.+?)\<\/a\>.*?/ig);

		if (themes)
		{
			for (var i = 0; i<themes.length; i++)
			{
				theme = themes[i].match(/\<a.+href\=\".*?(\d+)\".*?\>(.+)?\<\/a\>/i)

				if (theme)
				{
					inspectorToolbar.unreadThemes.push({
						id: theme[1],
						caption: theme[2]
					});
				}
			};
		}
	},

	showPanel: function(parent)
	{
		if (!this.panel)
			this.init();
		
		if (this.panel)
		{
			inspectorToolbar.parseThemes();
			
			this.list = this.winobj.getElementById('inspectorPanel_themesList');

			if (inspectorToolbar.unreadThemes.length)
			{
				for (var i = 0; i<inspectorToolbar.unreadThemes.length; i++)
				{
					var newElem = document.createElement('label');
					newElem.setAttribute('value', '>> '+inspectorToolbar.unreadThemes[i].caption);
					newElem.setAttribute('data-theme', inspectorToolbar.unreadThemes[i].id);
					newElem.addEventListener('click', function(){
						inspectorToolbar.openTheme(this.getAttribute('data-theme'));
						(this).parentNode.removeChild(this);
					});
					this.list.appendChild(newElem);
				};
				this.winobj.getElementById('inspector_openAllFavs').disabled = false;
			}
			else
				this.winobj.getElementById('inspector_openAllFavs').disabled = true;

			this.winobj.getElementById('inspector_unreadMessageCount').value = inspectorContentScript.unreadMessageCount;
			
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

		// utils.log('HIDE!');
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
		if (!inspectorToolbar.unreadThemes.length)
			return false;

		for (var i = 0; i < inspectorToolbar.unreadThemes.length; i++)
		{
			inspectorToolbar.openTheme(inspectorToolbar.unreadThemes[i].id);
		};

		return true;
	}

};