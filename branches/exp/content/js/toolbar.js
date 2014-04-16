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
		iToolbar.panel = cScript.winobj.getElementById('inspector4pda_panel');

		iToolbar.elements.usernameLabel = cScript.winobj.getElementById('inspector4pda_panelUsername');
		iToolbar.elements.usernameLabel.onclick = function() {
			user.open(user.id);
		}
		
		iToolbar.elements.favoritesLabel = cScript.winobj.getElementById('inspector4pda_panelFavorites');
		iToolbar.elements.favoritesLabel.onclick = function() {
			utils.openPage(iToolbar.urls.favorites);
		}
		
		iToolbar.elements.qmsLabel = cScript.winobj.getElementById('inspector4pda_panelQMS');
		iToolbar.elements.qmsLabel.onclick = function() {
			utils.openPage(iToolbar.urls.qms);
		}

		iToolbar.elements.settingsLabel = cScript.winobj.getElementById('inspector4pda_panelSettings');
		iToolbar.elements.settingsLabel.onclick = function() {
			iToolbar.handleHidePanel();
			window.openDialog('chrome://4pdainspector/content/xul/settings.xul', 'inspectorSettingWindow', 'chrome, centerscreen, dependent, dialog, titlebar, modal');
		}
		
		iToolbar.elements.themesList = cScript.winobj.getElementById('inspector4pda_themesList');
		iToolbar.elements.themesList.addEventListener('scroll', function() {
			iToolbar.themesListSetShadows();
		});
		
		iToolbar.elements.openAllLabel = cScript.winobj.getElementById('inspector4pda_panelOpenAll');
		iToolbar.elements.openAllLabel.onclick = function() {
			themes.openAll();
			cScript.printCount();
		}
		
		iToolbar.elements.readAllLabel = cScript.winobj.getElementById('inspector4pda_panelReadAll');
		iToolbar.elements.readAllLabel.onclick = function() {
			themes.readAll();
			cScript.printCount();
		}
		
		iToolbar.elements.manualRefresh = cScript.winobj.getElementById('inspector4pda_panelRefresh');
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

// iToolbar.panel = cScript.winobj.getElementById('inspector4pda_panel');
		var panelHeight = cScript.winobj.getElementById('inspector4pda_panelMainVBox').clientHeight;
		var documentHeight = cScript.winobj.getElementById('browser').clientHeight;
		var minusHeight = (cScript.winobj.getElementById('inspector4pda_mainPanel').clientHeight);

		if (panelHeight > documentHeight)
		{
			iToolbar.elements.themesList.style.height = (documentHeight - minusHeight - 20)+'px';
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
		iToolbar.elements.favoritesLabel.value = themes.getCount();
		iToolbar.elements.favoritesLabel.className = themes.getCount()? 'hasUnread': '';
		
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
		for (var i in themes.list) {
			iToolbar.elements.themesList.appendChild(iToolbar.createThemeRow(themes.list[i]));
		}

		/*for (var i = 0; i < themes.list.length; i++) {

			if (themes.readed.indexOf(themes.list[i].id) > -1) {
				utils.log(themes.list[i].id);
				continue;
			};
			iToolbar.elements.themesList.appendChild(iToolbar.createThemeRow(themes.list[i]));
		};*/
	},

	createThemeRow: function(theme)
	{
		var themeCaptionLabel = document.createElement('label');
		themeCaptionLabel.setAttribute('value', utils.htmlspecialcharsdecode(theme.title));
		themeCaptionLabel.className = 'oneTheme_caption';
		themeCaptionLabel.onclick = function () {
			themes.open(theme.id);
			cScript.printCount();
			iToolbar.elements.favoritesLabel.value = themes.getCount();

			this.classList.add("readed");
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
			cScript.printCount();
			iToolbar.elements.favoritesLabel.value = themes.getCount();
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