popup = {

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
		openAllPinLabel: null,
		readAllLabel: null,
		manualRefresh: null
	},

	urls: {
		login: 'http://4pda.ru/forum/index.php?act=login'
	},

	bg: null,

	init: function() {
		this.bg = chrome.extension.getBackgroundPage().inspector4pda;

		if (!this.bg.user.id) {
			this.bg.utils.openPage(this.urls.login, true);
			window.close();
			return false;
		}
		
		this.elements.usernameLabel = document.getElementById('panelUsername');
		this.elements.usernameLabel.addEventListener("click", function () {
			popup.bg.user.open();
			popup.checkOpenthemeHiding();
		}, false);
		
		this.elements.favoritesLabel = document.getElementById('panelFavoritesCount');
		this.elements.favoritesBox = document.getElementById('panelFavorites');
		this.elements.favoritesBox.addEventListener("click", function () {
			popup.bg.themes.openPage();
			popup.checkOpenthemeHiding();
		}, false);

		this.elements.qmsLabel = document.getElementById('panelQMSCount');
		this.elements.qmsBox = document.getElementById('panelQMS');
		this.elements.qmsBox.addEventListener("click", function () {
			popup.bg.QMS.openPage();
			popup.checkOpenthemeHiding();
		}, false);

		this.elements.settingsLabel = document.getElementById('panelSettings');
		this.elements.settingsLabel.addEventListener("click", function () {
			popup.bg.utils.openPage('chrome-extension://' + chrome.i18n.getMessage("@@extension_id") + '/html/options.html', true);
		}, false);

		this.elements.openAllLabel = document.getElementById('panelOpenAll');
		this.elements.openAllLabel.addEventListener('click', function() {
			popup.bg.themes.openAll();
			popup.checkOpenthemeHiding();
			popup.refresh();
		}, false);
		
		this.elements.openAllPinLabel = document.getElementById('panelOpenAllPin');
		this.elements.openAllPinLabel.addEventListener('click', function() {
			popup.bg.themes.openAllPin();
			popup.checkOpenthemeHiding();
			popup.refresh();
		}, false);
		
		this.elements.readAllLabel = document.getElementById('panelReadAll');
		this.elements.readAllLabel.addEventListener('click', function() {
			popup.bg.themes.readAll();
			popup.checkOpenthemeHiding();
			popup.refresh();
		}, false);

		this.elements.themesList = document.getElementById('themesList');

		this.elements.manualRefresh = document.getElementById('panelRefresh');
		this.elements.manualRefresh.addEventListener('click', function() {
			popup.manualRefresh(true);
		}, false);

		this.refresh();
	},

	refresh: function(withoutPrintThemes) {
		this.elements.usernameLabel.innerHTML = this.bg.user.name;
		
		this.elements.favoritesLabel.innerHTML = this.bg.themes.getCount();
		this.elements.favoritesBox.className = this.bg.themes.getCount() ? 'hasUnread': '';

		this.elements.qmsLabel.innerHTML = this.bg.QMS.getCount();
		this.elements.qmsBox.className = this.bg.QMS.getCount() ? 'hasUnread': '';

		if (popup.bg.vars.toolbar_simple_list) {
			this.elements.themesList.className = 'simpleList';
		}

		if (!this.bg.vars.toolbar_openAllFavs_button) {
			this.elements.openAllLabel.classList.add('hidden');
		}
		if (!this.bg.vars.toolbar_openAllFavs_button || (this.bg.vars.toolbar_only_pin ||  !this.bg.themes.getPinCount())) {
			this.elements.openAllPinLabel.classList.add('hidden');
		}
		if (!this.bg.vars.toolbar_markAllAsRead_button) {
			this.elements.readAllLabel.classList.add('hidden');
		}

		if (popup.bg.vars.user_links && popup.bg.vars.user_links.length) {
			this.printUserLinks();
		}

		if (!withoutPrintThemes) {
			this.printThemesList();
		}

		clearInterval(this.refreshImgRotateInterval);
		this.elements.manualRefresh.style.transform = "rotate(0deg)";
	},

	manualRefresh: function() {
		clearInterval(this.refreshImgRotateInterval);
		var refreshImgRotate = 0;
		popup.refreshImgRotateInterval = setInterval(function() {
			refreshImgRotate += 10;
			popup.elements.manualRefresh.style.transform = "rotate("+refreshImgRotate+"deg)";
		}, 30);

		this.bg.cScript.request(false, function() {
			clearInterval(popup.refreshImgRotateInterval);
			popup.refresh();
		});
	},

	printCount: function() {
		this.refresh(true);
	},

	clearThemesList: function() {
		this.elements.themesList.innerHTML = "";
	},

	printThemesList: function() {

		this.clearThemesList();

		if (this.bg.themes.getCount()) {
			var themesKeys = this.bg.themes.getSortedKeys();
			for (var i = 0; i < themesKeys.length; i++) {
				this.addThemeRow(this.bg.themes.list[themesKeys[i]]);
			}
		} else {
			var noThemesLabel = document.createElement('div');
			noThemesLabel.innerHTML = inspector4pda.browser.getString('No unread topics');
			noThemesLabel.className = 'oneTheme';
			this.elements.themesList.appendChild(noThemesLabel);
		}
	},

	addThemeRow: function(theme) {
		this.elements.themesList.appendChild(this.createThemeRow(theme));
	},

	createThemeRow: function(theme)	{
		
		var themeCaptionLabel = document.createElement('span');
		themeCaptionLabel.innerHTML = inspector4pda.utils.htmlspecialcharsdecode(theme.title);
		themeCaptionLabel.className = 'oneTheme_caption';
		if (theme.pin && popup.bg.vars.toolbar_pin_color) {
			themeCaptionLabel.className += ' oneTheme_pin';
		}
		themeCaptionLabel.id = 'oneThemeCaption_' + theme.id;
		themeCaptionLabel.dataId = theme.id;
		themeCaptionLabel.addEventListener("click", function () {
			popup.bg.themes.open(theme.id);
			popup.bg.cScript.printCount();
			popup.elements.favoritesLabel.innerHTML = popup.bg.themes.getCount();
			this.classList.add("readed");
			popup.checkOpenthemeHiding();
		}, false);

		var readImage = document.createElement('span');
		readImage.className = 'oneTheme_markAsRead';
		readImage.setAttribute('data-theme', theme.id);
		readImage.setAttribute('tooltiptext', inspector4pda.browser.getString('Mark As Read'));
		readImage.addEventListener("click", function () {
			var current = this;
			var dataTheme = this.getAttribute('data-theme');
			current.classList.add('loading');

			popup.bg.themes.read(dataTheme, function() {
				current.classList.remove('loading');
				document.getElementById('oneThemeCaption_' + theme.id).classList.add('readed');
				popup.bg.cScript.printCount();
				popup.printCount();
			});
		});

		if (!popup.bg.vars.toolbar_simple_list) {
		
			var userCaptionLabel = document.createElement('span');
			userCaptionLabel.innerHTML = inspector4pda.utils.htmlspecialcharsdecode(theme.last_user_name);
			userCaptionLabel.className = 'oneTheme_user';

			var lastPostLabel = document.createElement('span');
			lastPostLabel.innerHTML = new Date(theme.last_post_ts*1000).toLocaleString();
			lastPostLabel.className = 'oneTheme_lastPost';
			lastPostLabel.setAttribute('tooltiptext', inspector4pda.browser.getString('Open Last Post'));
			lastPostLabel.addEventListener("click", function () {
				popup.bg.themes.openLast(theme.id);
				popup.bg.cScript.printCount();
				popup.printCount();
				document.getElementById('oneThemeCaption_' + theme.id).classList.add('readed');
			}, false);

			// BOXES

			var infoHBox = document.createElement('div');
			infoHBox.className = 'oneThemeInfoHBox';
			infoHBox.appendChild(userCaptionLabel);
			infoHBox.appendChild(lastPostLabel);

			infoHBox.appendChild(readImage);

			var mainHBox = document.createElement('div');
			mainHBox.appendChild(themeCaptionLabel);
			
			var themeVBox = document.createElement('div');
			themeVBox.className = 'oneTheme';
			themeVBox.appendChild(mainHBox);
			themeVBox.appendChild(infoHBox);
			return themeVBox;
		} else {
			var mainHBox = document.createElement('div');
			mainHBox.className = 'oneTheme';
			//themeCaptionLabel.setAttribute('flex', '1');
			mainHBox.appendChild(themeCaptionLabel);
			mainHBox.appendChild(readImage);
			return mainHBox;
		}
	},

	checkOpenthemeHiding: function()
	{
		if (this.bg.vars.toolbar_opentheme_hide) {
			window.close();
		}
	},

	printUserLinks: function() {
		var uLinks = document.getElementById('userLinks');
		uLinks.style.display = 'block';
		uLinks.innerHTML = '';
		for (var i = 0; i < popup.bg.vars.user_links.length; i++) {
			var item = popup.bg.vars.user_links[i];
			var link = document.createElement('a');
			link.href = item.url;
			link.target = '_blank';
			link.innerText = item.title;
			uLinks.appendChild(link);
		}
	}
};

popup.init();