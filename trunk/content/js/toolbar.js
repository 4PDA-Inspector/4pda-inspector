// inspectorToolbar
inspector4pda.toolbar = {

	winobj: null,
	panel: null,
	list: null,
	unreadThemes: {},
	removedThemes: {},
	
	link_favTopics: 'http://4pda.ru/forum/index.php?autocom=favtopics',
	link_qms: 'http://4pda.ru/forum/index.php?act=qms',
	
	link_homepage: 'http://4pda.ru',
	link_forum: 'http://4pda.ru/forum/index.php',
	link_subscriptionTopics: 'http://4pda.ru/forum/index.php?act=UserCP&CODE=26',
	link_devdb: 'http://devdb.ru/',
	link_devfaq: 'http://devfaq.ru/',
	
	link_login: 'http://4pda.ru/forum/index.php?act=Login&CODE=00',

	refreshImg: null,
	refreshImgRotateInterval: 0,

	init: function()
	{
		var obj = document.getElementById("navigator-toolbox");
		this.winobj = (obj)?window.document:window.opener.document;
		this.panel = this.winobj.getElementById('inspector4pda_panel_panel');
		
		this.winobj.getElementById('inspector4pda_goToQms').addEventListener('click', function()
		{
			inspector4pda.toolbar.openPage(inspector4pda.toolbar.link_qms);
			inspector4pda.toolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector4pda_goToFavs').addEventListener('click', function()
		{
			inspector4pda.toolbar.openPage(inspector4pda.toolbar.link_favTopics);
			inspector4pda.toolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector4pda_openSettings').addEventListener('click', function()
		{
			inspector4pda.toolbar.handleHidePanel();
			window.openDialog('chrome://4pdainspector/content/settings.xul', 'inspectorSettingWindow', 'chrome, centerscreen, dependent, dialog, titlebar, modal', inspector4pda.cScript);
		});
		////

		this.winobj.getElementById('inspector4pda_goToHomepage').addEventListener('click', function()
		{
			inspector4pda.toolbar.openPage(inspector4pda.toolbar.link_homepage);
			inspector4pda.toolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector4pda_goToForum').addEventListener('click', function()
		{
			inspector4pda.toolbar.openPage(inspector4pda.toolbar.link_forum);
			inspector4pda.toolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector4pda_goToSubscriptions').addEventListener('click', function()
		{
			inspector4pda.toolbar.openPage(inspector4pda.toolbar.link_subscriptionTopics);
			inspector4pda.toolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector4pda_goToDevDB').addEventListener('click', function()
		{
			inspector4pda.toolbar.openPage(inspector4pda.toolbar.link_devdb);
			inspector4pda.toolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector4pda_goToDevFAQ').addEventListener('click', function()
		{
			inspector4pda.toolbar.openPage(inspector4pda.toolbar.link_devfaq);
			inspector4pda.toolbar.handleHidePanel();
		});

		////

		this.winobj.getElementById('inspector4pda_openAllFavs').addEventListener('click', function()
		{
			if (inspector4pda.toolbar.openAll())
				inspector4pda.toolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector4pda_readAllFavs').addEventListener('click', function()
		{
			inspector4pda.toolbar.readAll();
		});

		this.refreshImg = this.winobj.getElementById('refreshImg');

		this.refreshImg.addEventListener('click', function()
		{
			inspector4pda.toolbar.manualRefresh(true);
		});

		this.winobj.getElementById('inspector4pda_panel_loginBox').addEventListener('click', function()
		{
			if (inspector4pda.cScript.isLogin && inspector4pda.cScript.userId)
				inspector4pda.toolbar.openPage('http://4pda.ru/forum/index.php?showuser='+inspector4pda.cScript.userId);
			else
				inspector4pda.toolbar.openPage(inspector4pda.toolbar.link_login);

			inspector4pda.toolbar.handleHidePanel();
		});

		this.list = this.winobj.getElementById('inspector4pda_panel_themesList');

		this.list.addEventListener('scroll', function()
		{
			inspector4pda.toolbar.themesListSetShadows();
		});
	},

	buttonClick: function(parent)
	{
		if (inspector4pda.cScript.isLogin)
			inspector4pda.toolbar.buttonClickAction(parent);
		else
			inspector4pda.toolbar.manualRefresh(false);
	},

	buttonClickAction: function(parent)
	{
		inspector4pda.defaults.getPrefs();
		switch (inspector4pda.defaults.click_action)
		{
			case 1:
				inspector4pda.toolbar.showPanel(parent);
				break;
			case 2:
				inspector4pda.toolbar.openPage(inspector4pda.toolbar.link_favTopics);
				break;
			case 3:
				inspector4pda.toolbar.openAll();
				break;
			default:
				alert(inspector4pda.defaults.click_action + ' is uncorrect value');
		}
	},

	showPanel: function(parent)
	{
		if (!inspector4pda.cScript.isLogin)
		{
			inspector4pda.toolbar.openPage(inspector4pda.toolbar.link_login);
			return false;
		}

		if (!this.panel)
			this.init();
		
		this.refreshToolbar();
		this.panel.openPopup(parent, 'after_start', 0, 0, false, true);

		// подстройка высоты панели под размер окна

		inspector4pda.toolbar.list.style.height = 'auto';
		inspector4pda.toolbar.list.style.overflowY = 'visible';

		var panelHeight = this.winobj.getElementById('inspector4pda_panel_mainVBox').clientHeight;
		var documentHeight = this.winobj.getElementById('browser').clientHeight;
		var topAndBottomBoxes = (this.winobj.getElementById('inspector4pda_panel_menuBox').clientHeight) + (this.winobj.getElementById('inspector4pda_panel_linksBox').clientHeight);

		if (panelHeight > documentHeight)
		{
			inspector4pda.toolbar.list.style.height = (documentHeight - topAndBottomBoxes - 50)+'px';
			inspector4pda.toolbar.list.style.overflowY = 'scroll';
		}

		inspector4pda.toolbar.themesListSetShadows();

	},

	refreshToolbar: function ()
	{
		if (inspector4pda.cScript.isLogin && inspector4pda.cScript.userName)
			inspector4pda.toolbar.winobj.getElementById('inspector4pda_panel_loginBox').value = inspector4pda.utils.htmlspecialcharsdecode(inspector4pda.cScript.userName);
		else
			inspector4pda.toolbar.winobj.getElementById('inspector4pda_panel_loginBox').value = inspector4pda.stringBundle.GetStringFromName("You Are Not Authorized");

		inspector4pda.toolbar.hidePanel();

		if (Object.keys(inspector4pda.cScript.unreadThemes).length)
		{
			for (var i in inspector4pda.cScript.unreadThemes)
			{
				if (typeof inspector4pda.toolbar.removedThemes[i] != 'undefined')
					continue;
				var newLabel = document.createElement('label');
				newLabel.setAttribute('value', inspector4pda.utils.htmlspecialcharsdecode(inspector4pda.cScript.unreadThemes[i].title));
				newLabel.setAttribute('data-theme', i);
				newLabel.setAttribute('flex', 1);
				newLabel.setAttribute('id', 'label_'+i);
				newLabel.setAttribute('class', 'inspector4pda_panel_theme');
				newLabel.addEventListener('click', function()
				{
					var dataTheme = this.getAttribute('data-theme');
					this.classList.add("inspector4pda_panel_readedTheme");
					inspector4pda.toolbar.openTheme(dataTheme, true);
				});

				var dateLabel = document.createElement('label');
				dateLabel.setAttribute('value', inspector4pda.cScript.unreadThemes[i].date);
				dateLabel.setAttribute('class', 'inspector4pda_panel_dateLabel');
				dateLabel.setAttribute('data-theme', i);
				dateLabel.setAttribute('tooltiptext', inspector4pda.stringBundle.GetStringFromName("Open Last Post"));
				dateLabel.addEventListener('click', function()
				{
					var dataTheme = this.getAttribute('data-theme');
					inspector4pda.toolbar.openPage('http://4pda.ru/forum/index.php?showtopic='+dataTheme+'&view=getlastpost');
					inspector4pda.toolbar.newReadedTheme(dataTheme);
				});
				
				var authorLabel = document.createElement('label');
				authorLabel.setAttribute('value', inspector4pda.utils.htmlspecialcharsdecode(inspector4pda.cScript.unreadThemes[i].author));
				authorLabel.setAttribute('class', 'inspector4pda_panel_authorLabel');

				var infoBox = document.createElement('hbox');
				infoBox.setAttribute('class', 'inspector4pda_panel_infoBox');
				infoBox.appendChild(dateLabel);
				infoBox.appendChild(authorLabel);

				var readedImage = document.createElement('image');
				readedImage.setAttribute('src', 'chrome://4pdainspector/content/images/view-16.png');
				readedImage.setAttribute('data-theme', i);
				readedImage.setAttribute('tooltiptext', inspector4pda.stringBundle.GetStringFromName("Mark As Read"));
				readedImage.addEventListener('click', function()
				{
					var current = this;
					var dataTheme = this.getAttribute('data-theme');
					current.style.opacity = '0.5';
					inspector4pda.toolbar.getRequest('http://4pda.ru/forum/index.php?showtopic='+dataTheme, function () {
						inspector4pda.toolbar.winobj.getElementById('label_'+dataTheme).style.color = '#aaa';
						inspector4pda.toolbar.newReadedTheme(dataTheme);
						current.style.opacity = '';
					});
				});

				var removeFavImage = document.createElement('image');
				removeFavImage.setAttribute('src', 'chrome://4pdainspector/content/images/keditbookmark.png');
				removeFavImage.setAttribute('data-theme', i);
				removeFavImage.setAttribute('tooltiptext', inspector4pda.stringBundle.GetStringFromName("Remove From Favorites"));
				removeFavImage.addEventListener('click', function()
				{
					var current = this;
					var dataTheme = this.getAttribute('data-theme');
					current.style.opacity = '0.5';
					if (typeof inspector4pda.toolbar.removedThemes[dataTheme] == 'undefined')
					{
						inspector4pda.toolbar.getRequest(
							'http://4pda.ru/forum/index.php?autocom=favtopics&CODE=02&selectedtids='+dataTheme, function()
							{
								inspector4pda.toolbar.winobj.getElementById('label_'+dataTheme).style.color = '#aaa';
								inspector4pda.toolbar.winobj.getElementById('label_'+dataTheme).style.textDecoration = 'line-through';
								inspector4pda.toolbar.removedThemes[dataTheme] = dataTheme;
								current.setAttribute('tooltiptext', inspector4pda.stringBundle.GetStringFromName("Add To Favorites"));
								current.setAttribute('src', 'chrome://4pdainspector/content/images/favorites.png');
								current.style.opacity = '';
								inspector4pda.toolbar.printCount();
							}
						);
					}
					else
					{
						inspector4pda.toolbar.getRequest(
							'http://4pda.ru/forum/index.php?autocom=favtopics&CODE=03&f=1&t='+dataTheme, function()
							{
								inspector4pda.toolbar.winobj.getElementById('label_'+dataTheme).style.color = '';
								inspector4pda.toolbar.winobj.getElementById('label_'+dataTheme).style.textDecoration = 'none';
								delete inspector4pda.toolbar.removedThemes[dataTheme];
								current.setAttribute('tooltiptext', inspector4pda.stringBundle.GetStringFromName("Remove From Favorites"));
								current.setAttribute('src', 'chrome://4pdainspector/content/images/keditbookmark.png');
								current.style.opacity = '';
								inspector4pda.toolbar.printCount();
							}
						);
					}
				});

				var newTopHBox = document.createElement('hbox');
				newTopHBox.appendChild(newLabel);
				
				var newBottomHBox = document.createElement('hbox');
				newBottomHBox.setAttribute('class', 'inspector4pda_panel_bottomBox');

				infoBox.setAttribute('flex', '1');
				newBottomHBox.appendChild(infoBox);

				var newVBox = document.createElement('vbox');
				newVBox.appendChild(readedImage);
				newBottomHBox.appendChild(newVBox);

				var newVBox = document.createElement('vbox');
				newVBox.appendChild(removeFavImage);
				newBottomHBox.appendChild(newVBox);

				var newVBox = document.createElement('vbox');
				newVBox.setAttribute('class', 'inspector4pda_panel_themeBox');
				newVBox.appendChild(newTopHBox);
				newVBox.appendChild(newBottomHBox);

				inspector4pda.toolbar.list.appendChild(newVBox);
			};
			inspector4pda.toolbar.winobj.getElementById('inspector4pda_openAllFavs').disabled = false;
		}
		else
		{
			var newLabel = document.createElement('label');
			newLabel.setAttribute('value', inspector4pda.stringBundle.GetStringFromName("No unread topics"));
			newLabel.setAttribute('class', 'inspector4pda_panel_themeBox inspector4pda_panel_noThemesLabel');
			newLabel.style.textAlign = 'center';

			inspector4pda.toolbar.list.appendChild(newLabel);
			inspector4pda.toolbar.winobj.getElementById('inspector4pda_openAllFavs').disabled = true;
		}

		inspector4pda.toolbar.winobj.getElementById('inspector4pda_unreadQmsCount').value = (inspector4pda.cScript.isLogin)? inspector4pda.cScript.unreadQmsCount: 0;
		inspector4pda.toolbar.winobj.getElementById('inspector4pda_unreadThemesCount').value = Object.keys(inspector4pda.cScript.unreadThemes).length - Object.keys(inspector4pda.toolbar.removedThemes).length;
		clearInterval(inspector4pda.toolbar.refreshImgRotateInterval);
		inspector4pda.toolbar.refreshImg.style.MozTransform = "rotate(0deg)";
	},

	handleHidePanel: function()
	{
		if (this.panel)
			this.panel.hidePopup();
	},

	hidePanel: function()
	{
		var labels = this.list.getElementsByClassName('inspector4pda_panel_themeBox');

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

	openTheme: function(id, newReadedTheme)
	{
		if (id)
		{
			inspector4pda.toolbar.openPage('http://4pda.ru/forum/index.php?showtopic='+id+'&view=getnewpost');
			if (newReadedTheme)
			{
				inspector4pda.toolbar.newReadedTheme(id);
			}
		}
	},

	openAll: function ()
	{
		if (!Object.keys(inspector4pda.cScript.unreadThemes).length)
			return false;
		
		for (i in inspector4pda.cScript.unreadThemes)
		{
			inspector4pda.toolbar.openTheme(i);
		};

		inspector4pda.toolbar.printCount(0);
		inspector4pda.cScript.unreadThemes = [];

		return true;
	},

	readAll: function ()
	{
		if (!Object.keys(inspector4pda.cScript.unreadThemes).length)
			return false;
		
		for (var i in inspector4pda.cScript.unreadThemes)
		{
			inspector4pda.toolbar.winobj.getElementById('label_'+i).style.color = '#aaa';
			inspector4pda.toolbar.getRequest('http://4pda.ru/forum/index.php?showtopic='+i, function () {});
		};

		inspector4pda.toolbar.printCount(0);
		inspector4pda.cScript.unreadThemes = [];

		return true;
	},

	manualRefresh: function(callback)
	{
		var errorCallback = false;
		clearTimeout(inspector4pda.cScript.updateTimer);
		if (callback)
		{
			clearInterval(inspector4pda.toolbar.refreshImgRotateInterval);
			var refreshImgRotate = 0;
			this.refreshImgRotateInterval = setInterval(function()
			{
				refreshImgRotate+=10;
				inspector4pda.toolbar.refreshImg.style.MozTransform = "rotate(-"+refreshImgRotate+"deg)";
			}, 30);
			callback = inspector4pda.toolbar.refreshToolbar;
			errorCallback = 12;
		}
		else
			errorCallback = function(){
				inspector4pda.toolbar.openPage(inspector4pda.toolbar.link_login)
			};
		inspector4pda.cScript.lastUpdateRequest = 0;
		inspector4pda.cScript.getNewCount(false, callback, errorCallback);
	},

	getRequest: function(url, callback)
	{
		if (url)
		{
			var req = new XMLHttpRequest();
			req.onreadystatechange = function()
			{
				if (req.readyState == 4 && req.status == 200)
				{
					if (callback && typeof callback == 'function') callback();
				}
			}
			req.open("GET", url, true);
			req.send(null);
		}
	},

	newReadedTheme: function(dataTheme)
	{
		delete inspector4pda.cScript.unreadThemes[dataTheme];
		inspector4pda.toolbar.printCount();
	},

	printCount: function(count)
	{
		if (typeof count == 'undefined')
			count = (Object.keys(inspector4pda.cScript.unreadThemes).length - Object.keys(inspector4pda.toolbar.removedThemes).length);
		
		inspector4pda.cScript.printCount(count, inspector4pda.cScript.unreadQmsCount);
		inspector4pda.toolbar.winobj.getElementById('inspector4pda_unreadThemesCount').setAttribute('value', count);
	},

	themesListSetShadows: function()
	{
		if (inspector4pda.toolbar.list.scrollTop > 0) {
			inspector4pda.toolbar.list.classList.add("topShadow");
		} else {
			inspector4pda.toolbar.list.classList.remove("topShadow");
		};

		if ((inspector4pda.toolbar.list.scrollHeight - inspector4pda.toolbar.list.clientHeight) > inspector4pda.toolbar.list.scrollTop) {
			inspector4pda.toolbar.list.classList.add("bottomShadow");
		} else {
			inspector4pda.toolbar.list.classList.remove("bottomShadow");
		};
	}

};