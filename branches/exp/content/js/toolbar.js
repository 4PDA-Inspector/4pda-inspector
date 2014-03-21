var iToolbar = {

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
		iToolbar.panel = cScript.winobj.getElementById('inspectorPanel');

		iToolbar.elements.usernameLabel = cScript.winobj.getElementById('inspectorPanelUsername');
		iToolbar.elements.usernameLabel.onclick = function() {
			user.open(user.id);
		}
		
		iToolbar.elements.favoritesLabel = cScript.winobj.getElementById('inspectorPanelFavorites');
		iToolbar.elements.favoritesLabel.onclick = function() {
			utils.openPage(iToolbar.urls.favorites);
		}
		
		iToolbar.elements.qmsLabel = cScript.winobj.getElementById('inspectorPanelQMS');
		iToolbar.elements.qmsLabel.onclick = function() {
			utils.openPage(iToolbar.urls.qms);
		}

		iToolbar.elements.settingsLabel = cScript.winobj.getElementById('inspectorPanelSettings');
		iToolbar.elements.settingsLabel.onclick = function() {
			iToolbar.handleHidePanel();
			window.openDialog('chrome://4pdainspector/content/xul/settings.xul', 'inspectorSettingWindow', 'chrome, centerscreen, dependent, dialog, titlebar, modal');
		}
		
		iToolbar.elements.themesList = cScript.winobj.getElementById('inspectorThemesList');
		
		iToolbar.elements.openAllLabel = cScript.winobj.getElementById('inspectorPanelOpenAll');
		iToolbar.elements.openAllLabel.onclick = function() {
			themes.openAll();
		}
		
		iToolbar.elements.readAllLabel = cScript.winobj.getElementById('inspectorPanelReadAll');
		iToolbar.elements.readAllLabel.onclick = function() {
			themes.readAll();
		}
		
		iToolbar.elements.manualRefresh = cScript.winobj.getElementById('inspectorPanelRefresh');
		iToolbar.elements.manualRefresh.onclick = function() {
			iToolbar.manualRefresh();
		}

	},
	
	bClick: function(parent)
	{
		if (user.id) {
			if (!iToolbar.panel) {
				iToolbar.init();
			};
			iToolbar.refresh();
			iToolbar.showPanel(parent);
		} else {
			// открыть страницу авторизации
		}
	},

	showPanel: function(parent)
	{
		iToolbar.panel.openPopup(parent, 'after_start', 0, 0, false, true);

		// подстройка высоты панели под размер окна

		iToolbar.elements.themesList.style.height = 'auto';
		iToolbar.elements.themesList.style.overflowY = 'visible';

// iToolbar.panel = cScript.winobj.getElementById('inspectorPanel');
		var panelHeight = cScript.winobj.getElementById('inspectorPanelMainVBox').clientHeight;
		var documentHeight = cScript.winobj.getElementById('browser').clientHeight;
		var minusHeight = (cScript.winobj.getElementById('inspectorMainPanel').clientHeight);

		if (panelHeight > documentHeight)
		{
			iToolbar.elements.themesList.style.height = (documentHeight - minusHeight - 50)+'px';
			iToolbar.elements.themesList.style.overflowY = 'scroll';
		}

		iToolbar.themesListSetShadows();
	},

	themesListSetShadows: function()
	{
		if (iToolbar.elements.themesList.scrollTop > 0) {
			iToolbar.elements.themesList.classList.add("topShadow");
		} else {
			iToolbar.elements.themesList.classList.remove("topShadow");
		};

		if ((iToolbar.elements.themesList.scrollHeight - iToolbar.elements.themesList.clientHeight) > iToolbar.elements.themesList.scrollTop) {
			iToolbar.elements.themesList.classList.add("bottomShadow");
		} else {
			iToolbar.elements.themesList.classList.remove("bottomShadow");
		};
	},

	refresh: function()
	{
		iToolbar.elements.usernameLabel.value = user.name;
		iToolbar.elements.favoritesLabel.value = themes.list.length;
		iToolbar.elements.favoritesLabel.className = themes.list.length? 'hasUnread': '';
		
		iToolbar.elements.qmsLabel.value = QMS.unreadCount;
		iToolbar.elements.qmsLabel.className = QMS.unreadCount? 'hasUnread': '';

		iToolbar.clearThemesList();
		iToolbar.printThemesList();
		
		clearInterval(iToolbar.refreshImgRotateInterval);
		iToolbar.elements.manualRefresh.style.MozTransform = "rotate(0deg)";
	},

	handleHidePanel: function()
	{
		iToolbar.hidePanel();
		iToolbar.panel.hidePopup();
	},

	hidePanel: function()
	{
		iToolbar.clearThemesList();
	},

	clearThemesList: function()
	{
		var labels = iToolbar.elements.themesList.getElementsByClassName('oneTheme');

		for (var i = labels.length - 1; i >= 0; i--) {
			labels[i].remove();
		}
	},

	printThemesList: function()
	{
		for (var i = 0; i < themes.list.length; i++) {
			iToolbar.elements.themesList.appendChild(iToolbar.createThemeRow(themes.list[i]));
		};
	},

	createThemeRow: function(theme)
	{
		var themeCaptionLabel = document.createElement('label');
		themeCaptionLabel.setAttribute('value', utils.htmlspecialcharsdecode(theme.title));
		themeCaptionLabel.className = 'oneTheme_caption';
		themeCaptionLabel.onclick = function () {
			themes.open(theme.id);
			// utils.log(theme.posts_num);
			// utils.log(theme.last_post_ts);
			// utils.log(theme.last_read_ts);
			// prompt(theme.posts_num, 'http://4pda.ru/forum/index.php?showtopic='+theme.id+'&view=getnewpost');
		};

		var userCaptionLabel = document.createElement('label');
		userCaptionLabel.setAttribute('value', utils.htmlspecialcharsdecode(theme.last_user_name));
		userCaptionLabel.className = 'oneTheme_user';
		userCaptionLabel.onclick = function () {
			user.open(theme.last_user_id);
		};

		var lastPostLabel = document.createElement('label');
		lastPostLabel.setAttribute('value', new Date(theme.last_post_ts*1000).toLocaleString());
		lastPostLabel.className = 'oneTheme_lastPost';
		lastPostLabel.onclick = function () {
			themes.openLast(theme.id);
		};

		// BOXES

		var infoHBox = document.createElement('hbox');
		infoHBox.className = 'oneThemeInfoHBox';
		infoHBox.appendChild(userCaptionLabel);
		infoHBox.appendChild(lastPostLabel);

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
		clearInterval(iToolbar.refreshImgRotateInterval);
		var refreshImgRotate = 0;
		iToolbar.refreshImgRotateInterval = setInterval(function()
		{
			refreshImgRotate += 10;
			iToolbar.elements.manualRefresh.style.MozTransform = "rotate("+refreshImgRotate+"deg)";
		}, 30);

		cScript.getData(iToolbar.refresh);
	}
}