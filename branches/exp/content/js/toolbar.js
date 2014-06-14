inspector4pda.toolbar = {

	panel: null,
	refreshImgRotateInterval: 0,

	elements: {
		usernameLabel: null,
		favoritesLabel: null,
		qmsLabel: null,
		themesList: null,
		settingsLabel: null,
		openAllLabel: null,
		readAllLabel: null,
		manualRefresh: null
	},

	urls: {
		favorites: 'http://4pda.ru/forum/index.php?autocom=favtopics',
		qms: 'http://4pda.ru/forum/index.php?act=qms'
	},

	init: function()
	{
		inspector4pda.toolbar.panel = inspector4pda.cScript.winobj.getElementById('inspector4pda_panel');

		inspector4pda.toolbar.elements.usernameLabel = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelUsername');
		inspector4pda.toolbar.elements.usernameLabel.onclick = function() {
			inspector4pda.user.open(inspector4pda.user.id);
		}
		
		inspector4pda.toolbar.elements.favoritesLabel = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelFavorites');
		inspector4pda.toolbar.elements.favoritesLabel.onclick = function() {
			inspector4pda.utils.openPage(inspector4pda.toolbar.urls.favorites);
		}
		
		inspector4pda.toolbar.elements.qmsLabel = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelQMS');
		inspector4pda.toolbar.elements.qmsLabel.onclick = function() {
			inspector4pda.utils.openPage(inspector4pda.toolbar.urls.qms);
		}

		inspector4pda.toolbar.elements.settingsLabel = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelSettings');
		inspector4pda.toolbar.elements.settingsLabel.onclick = function() {
			inspector4pda.toolbar.handleHidePanel();
			window.openDialog('chrome://4pdainspector/content/xul/settings.xul', 'inspectorSettingWindow', 'chrome, centerscreen, dependent, dialog, titlebar, modal');
		}
		
		inspector4pda.toolbar.elements.themesList = inspector4pda.cScript.winobj.getElementById('inspector4pda_themesList');
		inspector4pda.toolbar.elements.themesList.addEventListener('scroll', function() {
			inspector4pda.toolbar.themesListSetShadows();
		});
		
		inspector4pda.toolbar.elements.openAllLabel = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelOpenAll');
		inspector4pda.toolbar.elements.openAllLabel.onclick = function() {
			inspector4pda.themes.openAll();
			inspector4pda.cScript.printCount();
			inspector4pda.toolbar.refresh();
		}
		
		inspector4pda.toolbar.elements.readAllLabel = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelReadAll');
		inspector4pda.toolbar.elements.readAllLabel.onclick = function() {
			inspector4pda.themes.readAll();
			inspector4pda.cScript.printCount();
			inspector4pda.toolbar.refresh();
		}
		
		inspector4pda.toolbar.elements.manualRefresh = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelRefresh');
		inspector4pda.toolbar.elements.manualRefresh.onclick = function() {
			inspector4pda.toolbar.manualRefresh();
		}

	},
	
	bClick: function(parent)
	{
		if (inspector4pda.user.id) {
			if (!inspector4pda.toolbar.panel) {
				inspector4pda.toolbar.init();
			};
			inspector4pda.toolbar.refresh();
			inspector4pda.toolbar.showPanel(parent);
		} else {
			// открыть страницу авторизации
		}
	},

	showPanel: function(parent)
	{
		inspector4pda.toolbar.panel.openPopup(parent, 'after_start', 0, 0, false, true);

		// подстройка высоты панели под размер окна

		inspector4pda.toolbar.elements.themesList.style.height = 'auto';
		inspector4pda.toolbar.elements.themesList.style.overflowY = 'visible';

// inspector4pda.toolbar.panel = inspector4pda.cScript.winobj.getElementById('inspector4pda_panel');
		var panelHeight = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelMainVBox').clientHeight;
		var documentHeight = inspector4pda.cScript.winobj.getElementById('browser').clientHeight;
		var minusHeight = (inspector4pda.cScript.winobj.getElementById('inspector4pda_mainPanel').clientHeight);

		if (panelHeight > documentHeight)
		{
			inspector4pda.toolbar.elements.themesList.style.height = (documentHeight - minusHeight - 20)+'px';
			inspector4pda.toolbar.elements.themesList.style.overflowY = 'scroll';
		}

		inspector4pda.toolbar.themesListSetShadows();
	},

	themesListSetShadows: function()
	{
		if (inspector4pda.toolbar.elements.themesList.scrollTop > 0) {
			inspector4pda.toolbar.elements.themesList.classList.add("topShadow");
		} else {
			inspector4pda.toolbar.elements.themesList.classList.remove("topShadow");
		};

		if ((inspector4pda.toolbar.elements.themesList.scrollHeight - inspector4pda.toolbar.elements.themesList.clientHeight) > inspector4pda.toolbar.elements.themesList.scrollTop) {
			inspector4pda.toolbar.elements.themesList.classList.add("bottomShadow");
		} else {
			inspector4pda.toolbar.elements.themesList.classList.remove("bottomShadow");
		};
	},

	refresh: function()
	{
		inspector4pda.toolbar.elements.usernameLabel.value = inspector4pda.user.name;
		inspector4pda.toolbar.elements.favoritesLabel.value = inspector4pda.themes.getCount();
		inspector4pda.toolbar.elements.favoritesLabel.className = inspector4pda.themes.getCount()? 'hasUnread': '';
		
		inspector4pda.toolbar.elements.qmsLabel.value = inspector4pda.QMS.unreadCount;
		inspector4pda.toolbar.elements.qmsLabel.className = inspector4pda.QMS.unreadCount? 'hasUnread': '';

		inspector4pda.toolbar.printThemesList();
		
		clearInterval(inspector4pda.toolbar.refreshImgRotateInterval);
		inspector4pda.toolbar.elements.manualRefresh.style.MozTransform = "rotate(0deg)";
	},

	handleHidePanel: function()
	{
		inspector4pda.toolbar.hidePanel();
		inspector4pda.toolbar.panel.hidePopup();
	},

	hidePanel: function()
	{
		inspector4pda.toolbar.clearThemesList();
	},

	clearThemesList: function()
	{
		var labels = inspector4pda.toolbar.elements.themesList.getElementsByClassName('oneTheme');

		for (var i = labels.length - 1; i >= 0; i--) {
			labels[i].remove();
		}
	},

	printThemesList: function()
	{
		inspector4pda.toolbar.clearThemesList();
		if (Object.keys(inspector4pda.themes.list).length) {
			for (var i in inspector4pda.themes.list) {
				inspector4pda.toolbar.elements.themesList.appendChild(inspector4pda.toolbar.createThemeRow(inspector4pda.themes.list[i]));
			}
		} else {
			var noThemesLabel = document.createElement('label');
			noThemesLabel.setAttribute('value', inspector4pda.utils.getString('No unread topics'));
			noThemesLabel.className = 'oneTheme';
			inspector4pda.toolbar.elements.themesList.appendChild(noThemesLabel);
		}
	},

	createThemeRow: function(theme)
	{
		var themeCaptionLabel = document.createElement('label');
		themeCaptionLabel.setAttribute('value', inspector4pda.utils.htmlspecialcharsdecode(theme.title));
		themeCaptionLabel.className = 'oneTheme_caption';
		themeCaptionLabel.id = 'oneThemeCaption_' + theme.id;
		themeCaptionLabel.onclick = function () {
			inspector4pda.themes.open(theme.id);
			inspector4pda.cScript.printCount();
			inspector4pda.toolbar.elements.favoritesLabel.value = inspector4pda.themes.getCount();
			this.classList.add("readed");
		};

		var userCaptionLabel = document.createElement('label');
		userCaptionLabel.setAttribute('value', inspector4pda.utils.htmlspecialcharsdecode(theme.last_user_name));
		userCaptionLabel.className = 'oneTheme_user';
		userCaptionLabel.onclick = function () {
			inspector4pda.user.open(theme.last_user_id);
		};

		var lastPostLabel = document.createElement('label');
		lastPostLabel.setAttribute('value', new Date(theme.last_post_ts*1000).toLocaleString());
		lastPostLabel.className = 'oneTheme_lastPost';
		lastPostLabel.onclick = function () {
			inspector4pda.themes.openLast(theme.id);
			inspector4pda.cScript.printCount();
			inspector4pda.toolbar.elements.favoritesLabel.value = inspector4pda.themes.getCount();
		};

		var readImage = document.createElement('box');
		readImage.className = 'oneTheme_markAsRead';
		readImage.setAttribute('data-theme', theme.id);
		readImage.setAttribute('tooltiptext', inspector4pda.utils.getString('Mark As Read'));
		readImage.onclick = function () {
			var current = this;
			var dataTheme = this.getAttribute('data-theme');
			current.style.opacity = '0.5';
			
			inspector4pda.themes.read(dataTheme, function() {
				current.style.opacity = '';
				document.getElementById('oneThemeCaption_' + theme.id).classList.add('readed');
				inspector4pda.cScript.printCount();
			});
		};

		// BOXES

		var infoHBox = document.createElement('hbox');
		infoHBox.className = 'oneThemeInfoHBox';
		infoHBox.appendChild(userCaptionLabel);
		infoHBox.appendChild(lastPostLabel);

		var box = document.createElement('box');
		box.setAttribute('flex', '1');
		infoHBox.appendChild(box);
		
		infoHBox.appendChild(readImage);

		var mainHBox = document.createElement('hbox');
		mainHBox.appendChild(themeCaptionLabel);
		
		var themeVBox = document.createElement('vbox');
		themeVBox.className = 'oneTheme';
		themeVBox.appendChild(mainHBox);
		themeVBox.appendChild(infoHBox);

		return themeVBox;
	},

	manualRefresh: function()
	{
		clearInterval(inspector4pda.toolbar.refreshImgRotateInterval);
		var refreshImgRotate = 0;
		inspector4pda.toolbar.refreshImgRotateInterval = setInterval(function()
		{
			refreshImgRotate += 10;
			inspector4pda.toolbar.elements.manualRefresh.style.MozTransform = "rotate("+refreshImgRotate+"deg)";
		}, 30);

		inspector4pda.cScript.getData(inspector4pda.toolbar.refresh);
	}
}