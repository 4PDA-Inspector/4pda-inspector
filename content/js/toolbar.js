var inspectorToolbar = {

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

	stringBundle: Services.strings.createBundle("chrome://4pdainspector/locale/strings.properties"),

	init: function()
	{
		var obj = document.getElementById("navigator-toolbox");
		this.winobj = (obj)?window.document:window.opener.document;
		this.panel = this.winobj.getElementById('inspectorPanel_panel');
		
		this.winobj.getElementById('inspector_goToQms').addEventListener('click', function()
		{
			inspectorToolbar.openPage(inspectorToolbar.link_qms);
			inspectorToolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector_goToFavs').addEventListener('click', function()
		{
			inspectorToolbar.openPage(inspectorToolbar.link_favTopics);
			inspectorToolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector_openSettings').addEventListener('click', function()
		{
			inspectorToolbar.handleHidePanel();
			window.openDialog('chrome://4pdainspector/content/settings.xul', 'inspectorSettingWindow', 'chrome, centerscreen, dependent, dialog, titlebar, modal', inspectorContentScript);
		});
		////

		this.winobj.getElementById('inspector_goToHomepage').addEventListener('click', function()
		{
			inspectorToolbar.openPage(inspectorToolbar.link_homepage);
			inspectorToolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector_goToForum').addEventListener('click', function()
		{
			inspectorToolbar.openPage(inspectorToolbar.link_forum);
			inspectorToolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector_goToSubscriptions').addEventListener('click', function()
		{
			inspectorToolbar.openPage(inspectorToolbar.link_subscriptionTopics);
			inspectorToolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector_goToDevDB').addEventListener('click', function()
		{
			inspectorToolbar.openPage(inspectorToolbar.link_devdb);
			inspectorToolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector_goToDevFAQ').addEventListener('click', function()
		{
			inspectorToolbar.openPage(inspectorToolbar.link_devfaq);
			inspectorToolbar.handleHidePanel();
		});

		////

		this.winobj.getElementById('inspector_openAllFavs').addEventListener('click', function()
		{
			if (inspectorToolbar.openAll())
				inspectorToolbar.handleHidePanel();
		});

		this.winobj.getElementById('inspector_readAllFavs').addEventListener('click', function()
		{
			inspectorToolbar.readAll();
		});

		this.refreshImg = this.winobj.getElementById('refreshImg');

		this.refreshImg.addEventListener('click', function()
		{
			inspectorToolbar.manualRefresh(true);
		});

		this.winobj.getElementById('inspectorPanel_loginBox').addEventListener('click', function()
		{
			if (inspectorContentScript.isLogin && inspectorContentScript.userId)
				inspectorToolbar.openPage('http://4pda.ru/forum/index.php?showuser='+inspectorContentScript.userId);
			else
				inspectorToolbar.openPage(inspectorToolbar.link_login);

			inspectorToolbar.handleHidePanel();
		});

		this.list = this.winobj.getElementById('inspectorPanel_themesList');

		this.list.addEventListener('scroll', function()
		{
			inspectorToolbar.themesListSetShadows();
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
				inspectorToolbar.openAll();
				break;
			default:
				alert(inspectorDefaultStorage.click_action + ' is uncorrect value');
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
		
		this.refreshToolbar();
		this.panel.openPopup(parent, 'after_start', 0, 0, false, true);

		// подстройка высоты панели под размер окна

		inspectorToolbar.list.style.height = 'auto';
		inspectorToolbar.list.style.overflowY = 'visible';

		var panelHeight = this.winobj.getElementById('inspectorPanel_mainVBox').clientHeight;
		var documentHeight = this.winobj.getElementById('browser').clientHeight;
		var topAndBottomBoxes = (this.winobj.getElementById('inspectorPanel_menuBox').clientHeight) + (this.winobj.getElementById('inspectorPanel_linksBox').clientHeight);

		if (panelHeight > documentHeight)
		{
			inspectorToolbar.list.style.height = (documentHeight - topAndBottomBoxes - 50)+'px';
			inspectorToolbar.list.style.overflowY = 'scroll';
		}

		inspectorToolbar.themesListSetShadows();

	},

	refreshToolbar: function ()
	{
		if (inspectorContentScript.isLogin && inspectorContentScript.userName)
			inspectorToolbar.winobj.getElementById('inspectorPanel_loginBox').value = utils.htmlspecialcharsdecode(inspectorContentScript.userName);
		else
			inspectorToolbar.winobj.getElementById('inspectorPanel_loginBox').value = inspectorToolbar.stringBundle.GetStringFromName("You Are Not Authorized");

		inspectorToolbar.hidePanel();

		if (Object.keys(inspectorContentScript.unreadThemes).length)
		{
			for (var i in inspectorContentScript.unreadThemes)
			{
				if (typeof inspectorToolbar.removedThemes[i] != 'undefined')
					continue;
				var newLabel = document.createElement('label');
				newLabel.setAttribute('value', utils.htmlspecialcharsdecode(inspectorContentScript.unreadThemes[i].title));
				newLabel.setAttribute('data-theme', i);
				newLabel.setAttribute('flex', 1);
				newLabel.setAttribute('id', 'label_'+i);
				newLabel.setAttribute('class', 'inspectorPanel_theme');
				newLabel.addEventListener('click', function()
				{
					var dataTheme = this.getAttribute('data-theme');
					this.classList.add("inspectorPanel_readedTheme");
					inspectorToolbar.openTheme(dataTheme, true);
				});

				var dateLabel = document.createElement('label');
				dateLabel.setAttribute('value', inspectorContentScript.unreadThemes[i].date);
				dateLabel.setAttribute('class', 'inspectorPanel_dateLabel');
				dateLabel.setAttribute('data-theme', i);
				dateLabel.setAttribute('tooltiptext', inspectorToolbar.stringBundle.GetStringFromName("Open Last Post"));
				dateLabel.addEventListener('click', function()
				{
					var dataTheme = this.getAttribute('data-theme');
					inspectorToolbar.openPage('http://4pda.ru/forum/index.php?showtopic='+dataTheme+'&view=getlastpost');
					inspectorToolbar.newReadedTheme(dataTheme);
				});
				
				var authorLabel = document.createElement('label');
				authorLabel.setAttribute('value', utils.htmlspecialcharsdecode(inspectorContentScript.unreadThemes[i].author));
				authorLabel.setAttribute('class', 'inspectorPanel_authorLabel');

				var infoBox = document.createElement('hbox');
				infoBox.setAttribute('class', 'inspectorPanel_infoBox');
				infoBox.appendChild(dateLabel);
				infoBox.appendChild(authorLabel);

				var readedImage = document.createElement('image');
				readedImage.setAttribute('src', 'chrome://4pdainspector/content/images/view-16.png');
				readedImage.setAttribute('data-theme', i);
				readedImage.setAttribute('tooltiptext', inspectorToolbar.stringBundle.GetStringFromName("Mark As Read"));
				readedImage.addEventListener('click', function()
				{
					var current = this;
					var dataTheme = this.getAttribute('data-theme');
					current.style.opacity = '0.5';
					inspectorToolbar.getRequest('http://4pda.ru/forum/index.php?showtopic='+dataTheme, function () {
						inspectorToolbar.winobj.getElementById('label_'+dataTheme).style.color = '#aaa';
						inspectorToolbar.newReadedTheme(dataTheme);
						current.style.opacity = '';
					});
				});

				var removeFavImage = document.createElement('image');
				removeFavImage.setAttribute('src', 'chrome://4pdainspector/content/images/keditbookmark.png');
				removeFavImage.setAttribute('data-theme', i);
				removeFavImage.setAttribute('tooltiptext', inspectorToolbar.stringBundle.GetStringFromName("Remove From Favorites"));
				removeFavImage.addEventListener('click', function()
				{
					var current = this;
					var dataTheme = this.getAttribute('data-theme');
					current.style.opacity = '0.5';
					if (typeof inspectorToolbar.removedThemes[dataTheme] == 'undefined')
					{
						inspectorToolbar.getRequest(
							'http://4pda.ru/forum/index.php?autocom=favtopics&CODE=02&selectedtids='+dataTheme, function()
							{
								inspectorToolbar.winobj.getElementById('label_'+dataTheme).style.color = '#aaa';
								inspectorToolbar.winobj.getElementById('label_'+dataTheme).style.textDecoration = 'line-through';
								inspectorToolbar.removedThemes[dataTheme] = dataTheme;
								current.setAttribute('tooltiptext', inspectorToolbar.stringBundle.GetStringFromName("Add To Favorites"));
								current.setAttribute('src', 'chrome://4pdainspector/content/images/favorites.png');
								current.style.opacity = '';
								inspectorToolbar.printCount();
							}
						);
					}
					else
					{
						inspectorToolbar.getRequest(
							'http://4pda.ru/forum/index.php?autocom=favtopics&CODE=03&f=1&t='+dataTheme, function()
							{
								inspectorToolbar.winobj.getElementById('label_'+dataTheme).style.color = '';
								inspectorToolbar.winobj.getElementById('label_'+dataTheme).style.textDecoration = 'none';
								delete inspectorToolbar.removedThemes[dataTheme];
								current.setAttribute('tooltiptext', inspectorToolbar.stringBundle.GetStringFromName("Remove From Favorites"));
								current.setAttribute('src', 'chrome://4pdainspector/content/images/keditbookmark.png');
								current.style.opacity = '';
								inspectorToolbar.printCount();
							}
						);
					}
				});

				var newTopHBox = document.createElement('hbox');
				newTopHBox.appendChild(newLabel);
				
				var newBottomHBox = document.createElement('hbox');
				newBottomHBox.setAttribute('class', 'inspectorPanel_bottomBox');

				infoBox.setAttribute('flex', '1');
				newBottomHBox.appendChild(infoBox);

				var newVBox = document.createElement('vbox');
				newVBox.appendChild(readedImage);
				newBottomHBox.appendChild(newVBox);

				var newVBox = document.createElement('vbox');
				newVBox.appendChild(removeFavImage);
				newBottomHBox.appendChild(newVBox);

				var newVBox = document.createElement('vbox');
				newVBox.setAttribute('class', 'inspectorPanel_themeBox');
				newVBox.appendChild(newTopHBox);
				newVBox.appendChild(newBottomHBox);

				inspectorToolbar.list.appendChild(newVBox);
			};
			inspectorToolbar.winobj.getElementById('inspector_openAllFavs').disabled = false;
		}
		else
		{
			var newLabel = document.createElement('label');
			newLabel.setAttribute('value', inspectorToolbar.stringBundle.GetStringFromName("No unread topics"));
			newLabel.setAttribute('class', 'inspectorPanel_themeBox inspectorPanel_noThemesLabel');
			newLabel.style.textAlign = 'center';

			inspectorToolbar.list.appendChild(newLabel);
			inspectorToolbar.winobj.getElementById('inspector_openAllFavs').disabled = true;
		}

		inspectorToolbar.winobj.getElementById('inspector_unreadQmsCount').value = (inspectorContentScript.isLogin)? inspectorContentScript.unreadQmsCount: 0;
		inspectorToolbar.winobj.getElementById('inspector_unreadThemesCount').value = Object.keys(inspectorContentScript.unreadThemes).length - Object.keys(inspectorToolbar.removedThemes).length;
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
		var labels = this.list.getElementsByClassName('inspectorPanel_themeBox');

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
			inspectorToolbar.openPage('http://4pda.ru/forum/index.php?showtopic='+id+'&view=getnewpost');
			if (newReadedTheme)
			{
				inspectorToolbar.newReadedTheme(id);
			}
		}
	},

	openAll: function ()
	{
		if (!Object.keys(inspectorContentScript.unreadThemes).length)
			return false;
		
		for (i in inspectorContentScript.unreadThemes)
		{
			inspectorToolbar.openTheme(i);
		};

		inspectorToolbar.printCount(0);
		inspectorContentScript.unreadThemes = [];

		return true;
	},

	readAll: function ()
	{
		if (!Object.keys(inspectorContentScript.unreadThemes).length)
			return false;
		
		for (i in inspectorContentScript.unreadThemes)
		{
			inspectorToolbar.winobj.getElementById('label_'+i).style.color = '#aaa';
			inspectorToolbar.getRequest('http://4pda.ru/forum/index.php?showtopic='+i, function () {});
		};

		inspectorToolbar.printCount(0);
		inspectorContentScript.unreadThemes = [];

		return true;
	},

	manualRefresh: function(callback)
	{
		var errorCallback = false;
		clearTimeout(inspectorContentScript.updateTimer);
		if (callback)
		{
			clearInterval(inspectorToolbar.refreshImgRotateInterval);
			var refreshImgRotate = 0;
			this.refreshImgRotateInterval = setInterval(function()
			{
				refreshImgRotate+=10;
				inspectorToolbar.refreshImg.style.MozTransform = "rotate(-"+refreshImgRotate+"deg)";
			}, 30);
			callback = inspectorToolbar.refreshToolbar;
			errorCallback = 12;
		}
		else
			errorCallback = function(){
				inspectorToolbar.openPage(inspectorToolbar.link_login)
			};
		inspectorContentScript.lastUpdateRequest = 0;
		inspectorContentScript.getNewCount(false, callback, errorCallback);
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
		delete inspectorContentScript.unreadThemes[dataTheme];
		inspectorToolbar.printCount();
	},

	printCount: function(count)
	{
		if (typeof count == 'undefined')
			count = (Object.keys(inspectorContentScript.unreadThemes).length - Object.keys(inspectorToolbar.removedThemes).length);
		
		inspectorContentScript.printCount(count, inspectorContentScript.unreadQmsCount);
		inspectorToolbar.winobj.getElementById('inspector_unreadThemesCount').setAttribute('value', count);
	},

	themesListSetShadows: function()
	{
		if (inspectorToolbar.list.scrollTop > 0) {
			inspectorToolbar.list.classList.add("topShadow");
		} else {
			inspectorToolbar.list.classList.remove("topShadow");
		};

		if ((inspectorToolbar.list.scrollHeight - inspectorToolbar.list.clientHeight) > inspectorToolbar.list.scrollTop) {
			inspectorToolbar.list.classList.add("bottomShadow");
		} else {
			inspectorToolbar.list.classList.remove("bottomShadow");
		};
	}

};