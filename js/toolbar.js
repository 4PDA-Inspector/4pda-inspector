inspector4pda.toolbar = {

	panel: null,
	refreshImgRotateInterval: 0,

	elements: {
		usernameLabel: null,
		favoritesBox: null,
		favoritesLabel: null,
		qmsBox: null,
		qmsLabel: null,
		themesList: null,
		settingsLabel: null,
		openAllLabel: null,
		openAllLabelPin: null,
		readAllLabel: null,
		manualRefresh: null
	},

	buttonId: 'inspector4pda_button',
	settingsXulUrl: 'chrome://4pdainspector/content/xul/settings.xul',

	urls: {
		login: 'http://4pda.ru/forum/index.php?act=login'
	},

	init: function()
	{
		inspector4pda.toolbar.panel = inspector4pda.cScript.winobj.getElementById('inspector4pda_panel');

		inspector4pda.toolbar.elements.usernameLabel = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelUsername');
		inspector4pda.toolbar.elements.usernameLabel.onclick = function() {
			inspector4pda.user.open(inspector4pda.user.id);
			inspector4pda.toolbar.checkOpenthemeHiding();
		}
		
		inspector4pda.toolbar.elements.favoritesBox = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelFavorites');
		inspector4pda.toolbar.elements.favoritesLabel = inspector4pda.toolbar.elements.favoritesBox.getElementsByClassName('count')[0];
		inspector4pda.toolbar.elements.favoritesBox.onclick = function() {
			inspector4pda.utils.openPage(inspector4pda.themes.vUrl);
			inspector4pda.toolbar.checkOpenthemeHiding();
		}
		
		inspector4pda.toolbar.elements.qmsBox = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelQMS');
		inspector4pda.toolbar.elements.qmsLabel = inspector4pda.toolbar.elements.qmsBox.getElementsByClassName('count')[0];
		inspector4pda.toolbar.elements.qmsBox.onclick = function() {
			inspector4pda.utils.openPage(inspector4pda.QMS.vUrl);
			inspector4pda.toolbar.checkOpenthemeHiding();
		}

		inspector4pda.toolbar.elements.settingsLabel = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelSettings');
		inspector4pda.toolbar.elements.settingsLabel.onclick = function() {
			inspector4pda.toolbar.handleHidePanel();
			inspector4pda.toolbar.showSetting();
		}
		
		inspector4pda.toolbar.elements.themesList = inspector4pda.cScript.winobj.getElementById('inspector4pda_themesList');
		inspector4pda.toolbar.elements.themesList.addEventListener('scroll', function() {
			inspector4pda.toolbar.themesListSetShadows();
		});
		
		inspector4pda.toolbar.elements.openAllLabel = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelOpenAll');
		inspector4pda.toolbar.elements.openAllLabel.onclick = function() {
			inspector4pda.themes.openAll();
			inspector4pda.toolbar.refresh();
			inspector4pda.toolbar.checkOpenthemeHiding();
		}
		
		inspector4pda.toolbar.elements.openAllPinLabel = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelOpenAllPin');
		inspector4pda.toolbar.elements.openAllPinLabel.onclick = function() {
			inspector4pda.themes.openAllPin();
			inspector4pda.toolbar.refresh();
			inspector4pda.toolbar.checkOpenthemeHiding();
		}
		
		inspector4pda.toolbar.elements.readAllLabel = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelReadAll');
		inspector4pda.toolbar.elements.readAllLabel.onclick = function() {
			inspector4pda.themes.readAll();
			inspector4pda.toolbar.refresh();
			inspector4pda.toolbar.checkOpenthemeHiding();
		}
		
		inspector4pda.toolbar.elements.manualRefresh = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelRefresh');
		inspector4pda.toolbar.elements.manualRefresh.onclick = function() {
			inspector4pda.toolbar.manualRefresh(true);
		}

	},

	showSetting: function() {
		window.openDialog(inspector4pda.toolbar.settingsXulUrl, 'inspectorSettingWindow', 'chrome, centerscreen, dependent, dialog, titlebar, modal', inspector4pda.cScript);
	},

	bClickEvent: function(clickAction, e) {
		switch (clickAction) {
			case 1:
				if (!inspector4pda.toolbar.panel) {
					inspector4pda.toolbar.init();
				};
				inspector4pda.toolbar.showPanel(e.target);
				inspector4pda.toolbar.refresh();
				break;
			case 2:
				inspector4pda.utils.openPage(inspector4pda.themes.vUrl);
				break;
			case 3:
				inspector4pda.themes.openAll();
				break;
			case 4:
				inspector4pda.toolbar.showSetting();
				break;
			case 5:
				inspector4pda.cScript.setButtonImage('chrome://4pdainspector/content/img/button_refresh-' + ((inspector4pda.vars.button_big) ? '22' : '16') + '.png');
				inspector4pda.toolbar.manualRefresh();
				break;
			case 6:
				inspector4pda.utils.openPage(inspector4pda.QMS.vUrl);
				break;
			default:
				inspector4pda.utils.log(clickAction + ' is uncorrect value');
		}
	},

	bClick: function(e)
	{
		if (e.button !== 0 && e.button !== 1) {
			return false;
		}

		if (inspector4pda.user.id) {
			inspector4pda.vars.getPrefs();

			switch (e.button) {
				case 0:
					//LMB
					inspector4pda.toolbar.bClickEvent(inspector4pda.vars.click_action, e);
					break;
				case 1:
					//MMB
					inspector4pda.toolbar.bClickEvent(inspector4pda.vars.MMB_click_action, e);
					break;
			}

		} else {
			inspector4pda.cScript.getData(function(){
				if (!inspector4pda.cScript.successLastRequest) {
					inspector4pda.cScript.siteUnavailableNotification();
				} else if (!inspector4pda.user.id) {
					inspector4pda.utils.openPage(inspector4pda.toolbar.urls.login);
				}
			});
		}
	},

	showPanel: function(parent)
	{
		if (parent) {
			inspector4pda.toolbar.panel.openPopup(parent, 'after_start', 0, 0, false, true);
		}
	},

	/*
	* подстройка высоты панели под размер окна
	*/
	tuneHeight: function()
	{
		inspector4pda.toolbar.elements.themesList.style.height = 'auto';
		inspector4pda.toolbar.elements.themesList.style.overflowY = 'visible';
		inspector4pda.toolbar.panel.style.height = 'auto';
		inspector4pda.toolbar.panel.style.maxHeight = 'none';

		var vboxHeight = inspector4pda.cScript.winobj.getElementById('inspector4pda_panelMainVBox').clientHeight;
		var documentHeight = inspector4pda.cScript.winobj.getElementById('browser').clientHeight;
		var panelHeight = inspector4pda.cScript.winobj.getElementById('inspector4pda_panel').clientHeight;

		if (panelHeight > documentHeight) {
			inspector4pda.toolbar.elements.themesList.style.height = (documentHeight - 60)+'px';
			inspector4pda.toolbar.elements.themesList.style.overflowY = 'scroll';
			inspector4pda.toolbar.panel.style.height = documentHeight + 'px';
			inspector4pda.toolbar.panel.style.maxHeight = documentHeight + 'px';
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

	refresh: function(withoutPrintThemes)
	{
		inspector4pda.toolbar.elements.usernameLabel.value = inspector4pda.user.name;

		inspector4pda.toolbar.elements.favoritesLabel.value = inspector4pda.themes.getCount();
		inspector4pda.toolbar.elements.favoritesBox.className = inspector4pda.themes.getCount()? 'hasUnread': '';
		
		inspector4pda.toolbar.elements.qmsLabel.value = inspector4pda.QMS.unreadCount;
		inspector4pda.toolbar.elements.qmsBox.className = inspector4pda.QMS.unreadCount? 'hasUnread': '';

		inspector4pda.toolbar.elements.openAllLabel.className = (inspector4pda.vars.toolbar_openAllFavs_button) ? '' : 'hidden';
		inspector4pda.toolbar.elements.readAllLabel.className = (inspector4pda.vars.toolbar_markAllAsRead_button) ? '' : 'hidden';
		inspector4pda.toolbar.elements.openAllPinLabel.className = (inspector4pda.vars.toolbar_only_pin || !inspector4pda.vars.toolbar_openAllFavs_button || !inspector4pda.themes.getPinCount()) ? 'hidden' : '';

		if (!withoutPrintThemes) {
			inspector4pda.toolbar.printThemesList();
			inspector4pda.toolbar.tuneHeight();
		}
		
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
				inspector4pda.toolbar.addThemeRow(inspector4pda.themes.list[i]);
			}
		} else {
			var noThemesLabel = document.createElement('label');
			noThemesLabel.setAttribute('value', inspector4pda.utils.getString('No unread topics'));
			noThemesLabel.className = 'oneTheme';
			inspector4pda.toolbar.elements.themesList.appendChild(noThemesLabel);
		}
	},

	addThemeRow: function(theme) {
		inspector4pda.toolbar.elements.themesList.appendChild(inspector4pda.toolbar.createThemeRow(theme));
	},

	createThemeRow: function(theme)
	{
		var themeCaptionLabel = document.createElement('label');
		themeCaptionLabel.setAttribute('value', inspector4pda.utils.htmlspecialcharsdecode(theme.title));
		themeCaptionLabel.className = 'oneTheme_caption';
		if (theme.pin && inspector4pda.vars.toolbar_pin_color) {
			themeCaptionLabel.className += ' oneTheme_pin';
		};
		themeCaptionLabel.id = 'oneThemeCaption_' + theme.id;
		themeCaptionLabel.onclick = function () {
			inspector4pda.themes.open(theme.id);
			inspector4pda.cScript.printCount();
			inspector4pda.toolbar.elements.favoritesLabel.value = inspector4pda.themes.getCount();
			this.classList.add("readed");
			inspector4pda.toolbar.checkOpenthemeHiding();
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
				inspector4pda.toolbar.printCount();
			});
		};

		if (!inspector4pda.vars.toolbar_simple_list) {
		
			var userCaptionLabel = document.createElement('label');
			var last_user_name = inspector4pda.utils.htmlspecialcharsdecode(theme.last_user_name);
			userCaptionLabel.setAttribute('value', last_user_name);
			userCaptionLabel.className = 'oneTheme_user';

			var lastPostLabel = document.createElement('label');
			lastPostLabel.setAttribute('value', new Date(theme.last_post_ts*1000).toLocaleString());
			lastPostLabel.className = 'oneTheme_lastPost';
			lastPostLabel.setAttribute('tooltiptext', inspector4pda.utils.getString('Open Last Post'));
			lastPostLabel.onclick = function () {
				inspector4pda.themes.openLast(theme.id);
				inspector4pda.cScript.printCount();
				inspector4pda.toolbar.elements.favoritesLabel.value = inspector4pda.themes.getCount();
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
		} else {
			var mainHBox = document.createElement('hbox');
			mainHBox.className = 'oneTheme';
			themeCaptionLabel.setAttribute('flex', '1');
			mainHBox.appendChild(themeCaptionLabel);
			mainHBox.appendChild(readImage);
			return mainHBox;
		}

		return false;
	},

	printCount: function()
	{
		this.refresh(true);
	},

	manualRefresh: function(showPopup)
	{
		clearInterval(inspector4pda.toolbar.refreshImgRotateInterval);

		if (showPopup) {
			var refreshImgRotate = 0;
			inspector4pda.toolbar.refreshImgRotateInterval = setInterval(function()
			{
				refreshImgRotate += 10;
				inspector4pda.toolbar.elements.manualRefresh.style.MozTransform = "rotate("+refreshImgRotate+"deg)";
			}, 30);
		}

		inspector4pda.cScript.getData(function() {
			if (showPopup) {
				inspector4pda.toolbar.panel.hidePopup();
				inspector4pda.toolbar.refresh();
				var parent = inspector4pda.cScript.winobj.getElementById( inspector4pda.toolbar.buttonId );
				inspector4pda.toolbar.panel.openPopup(parent, 'after_start', 0, 0, false, true);
			}
		});
	},

	checkOpenthemeHiding: function()
	{
		console.log('TODO toolbar :: 377');
		/*if (inspector4pda.vars.toolbar_opentheme_hide) {
			inspector4pda.toolbar.handleHidePanel();
		}*/
	}
}