popup = {

	refreshImgRotateInterval: 0,

	elements: {
		usernameLabel: null,
		favoritesBox: null,
		favoritesLabel: null,
		mentionsBox: null,
		mentionsLabel: null,
		qmsBox: null,
		qmsLabel: null,
		themesList: null,
		settingsLabel: null,
		openAllLabel: null,
		openAllPinLabel: null,
		readAllLabel: null,
		manualRefresh: null,
		header: null,
		body: null
	},

	urls: {
		login: 'https://4pda.ru/forum/index.php?act=login'
	},

	bg: null,

	init: function() {
		var self = this;
		this.bg = chrome.extension.getBackgroundPage().inspector4pda;

		if (!this.bg.user.id) {
			this.bg.utils.openPage(this.urls.login, true);
			window.close();
			return false;
		}

		this.elements.body = document.body;
		if (this.bg.vars.data.toolbar_width_fixed) {
			this.elements.body.style.width = Math.min(this.bg.vars.data.toolbar_width, 790);
			this.elements.body.className = 'widthFixed';
		}

		this.elements.usernameLabel = document.getElementById('panelUsername');
		this.elements.usernameLabel.addEventListener("click", function () {
			self.bg.user.open();
			self.checkOpenthemeHiding();
		}, false);
		
		this.elements.mentionsLabel = document.getElementById('panelMentionsCount');
		this.elements.mentionsBox = document.getElementById('panelMentions');
		this.elements.mentionsBox.addEventListener("click", function () {
			self.bg.mentions.openPage();
			self.checkOpenthemeHiding();
		}, false);

		this.elements.favoritesLabel = document.getElementById('panelFavoritesCount');
		this.elements.favoritesBox = document.getElementById('panelFavorites');
		this.elements.favoritesBox.addEventListener("click", function () {
			self.bg.themes.openPage();
			self.checkOpenthemeHiding();
		}, false);

		this.elements.qmsLabel = document.getElementById('panelQMSCount');
		this.elements.qmsBox = document.getElementById('panelQMS');
		this.elements.qmsBox.addEventListener("click", function () {
			self.bg.QMS.openPage();
			self.checkOpenthemeHiding();
		}, false);

		this.elements.settingsLabel = document.getElementById('panelSettings');
		this.elements.settingsLabel.addEventListener("click", function () {
			self.bg.utils.openPage(chrome.extension.getURL('/html/options.html'), true);
		}, false);

		this.elements.openAllLabel = document.getElementById('panelOpenAll');
		this.elements.openAllLabel.addEventListener('click', function() {
			self.bg.themes.openAll();
			self.checkOpenthemeHiding();
			self.refresh();
		}, false);
		
		this.elements.openAllPinLabel = document.getElementById('panelOpenAllPin');
		this.elements.openAllPinLabel.addEventListener('click', function() {
			self.bg.themes.openAllPin();
			self.checkOpenthemeHiding();
			self.refresh();
		}, false);
		
		this.elements.readAllLabel = document.getElementById('panelReadAll');
		this.elements.readAllLabel.addEventListener('click', function() {
			self.bg.themes.readAll();
			self.checkOpenthemeHiding();
			self.refresh();
		}, false);

		this.elements.themesList = document.getElementById('themesList');

		this.elements.manualRefresh = document.getElementById('panelRefresh');
		this.elements.manualRefresh.addEventListener('click', function() {
			self.manualRefresh(true);
		}, false);

		this.elements.header = document.getElementById('header');

		this.refresh();

		window.onload = function() {
			setTimeout(function () {
				self.printUserLinks();
				self.fixMainPanel();
			}, 1);
		};
	},

	refresh: function(withoutPrintThemes) {
		var self = this;
		this.elements.usernameLabel.textContent = inspector4pda.utils.htmlspecialcharsdecode(this.bg.user.name);
		
		this.elements.favoritesLabel.textContent = this.bg.themes.getCount();
		this.elements.favoritesBox.className = this.bg.themes.getCount() ? 'hasUnread': '';

		this.elements.qmsLabel.textContent = this.bg.QMS.getCount();
		this.elements.qmsBox.className = this.bg.QMS.getCount() ? 'hasUnread': '';

        this.bg.mentions.request(function(mCount){
            self.elements.mentionsLabel.textContent = mCount;
            self.elements.mentionsBox.className = mCount ? 'hasUnread': '';
        });

		if (self.bg.vars.data.toolbar_simple_list) {
			this.elements.themesList.className = 'simpleList';
		}

		if (!this.bg.vars.data.toolbar_openAllFavs_button) {
			this.elements.openAllLabel.classList.add('hidden');
		}
		if (!this.bg.vars.data.toolbar_openAllFavs_button || (this.bg.vars.data.toolbar_only_pin ||  !this.bg.themes.getPinCount())) {
			this.elements.openAllPinLabel.classList.add('hidden');
		}
		if (!this.bg.vars.data.toolbar_markAllAsRead_button) {
			this.elements.readAllLabel.classList.add('hidden');
		}

		if (!withoutPrintThemes) {
			this.printThemesList();
		}

		clearInterval(this.refreshImgRotateInterval);
		this.elements.manualRefresh.style.transform = "rotate(0deg)";
	},

	fixMainPanel: function() {
		if (this.elements.body.scrollHeight > this.elements.body.clientHeight) { //has scroll
			this.elements.body.style.minWidth = this.elements.body.offsetWidth;
			this.elements.themesList.style.marginTop = this.elements.header.offsetHeight;
			this.elements.header.className = 'fixed';
		}
	},

	manualRefresh: function() {
		clearInterval(this.refreshImgRotateInterval);
		var self = this,
			refreshImgRotate = 0;
		this.refreshImgRotateInterval = setInterval(function() {
			refreshImgRotate += 10;
			self.elements.manualRefresh.style.transform = "rotate("+refreshImgRotate+"deg)";
		}, 30);

		this.bg.cScript.firstRequest(function() {
			clearInterval(self.refreshImgRotateInterval);
			self.refresh();
		});
	},

	printCount: function() {
		this.refresh(true);
	},

	clearThemesList: function() {
		this.elements.themesList.textContent = "";
	},

	printThemesList: function() {
		this.clearThemesList();

		if (this.bg.themes.getCount()) {
			let themesKeys = this.bg.themes.getSortedKeys();
			for (let i = 0; i < themesKeys.length; i++) {
				this.addThemeRow(this.bg.themes.list[themesKeys[i]]);
			}
		} else {
			let noThemesLabel = document.createElement('div');
			noThemesLabel.textContent = inspector4pda.browser.getString('No unread topics');
			noThemesLabel.className = 'oneTheme';
			this.elements.themesList.appendChild(noThemesLabel);
		}
	},

	addThemeRow: function(theme) {
		this.elements.themesList.appendChild(this.createThemeRow(theme));
	},

	createThemeRow: function(theme)	{
		var self = this,
			themeCaptionLabel = document.createElement('span');
		themeCaptionLabel.textContent = inspector4pda.utils.htmlspecialcharsdecode(theme.title);
		themeCaptionLabel.className = 'oneTheme_caption';
		if (theme.pin && this.bg.vars.data.toolbar_pin_color) {
			themeCaptionLabel.className += ' oneTheme_pin';
		}
		themeCaptionLabel.id = 'oneThemeCaption_' + theme.id;
		themeCaptionLabel.dataId = theme.id;
		themeCaptionLabel.addEventListener("click", function () {
			self.bg.themes.open(theme.id);
			self.bg.cScript.printCount();
			self.elements.favoritesLabel.textContent = self.bg.themes.getCount();
			this.classList.add("readed");
			self.checkOpenthemeHiding();
		}, false);

		let readImage = document.createElement('span');
		readImage.className = 'oneTheme_markAsRead';
		readImage.setAttribute('data-theme', theme.id);
		readImage.setAttribute('title', inspector4pda.browser.getString('Mark As Read'));
		readImage.addEventListener("click", function () {
			var current = this,
				dataTheme = this.getAttribute('data-theme');
			current.classList.add('loading');
			self.bg.themes.read(dataTheme, function() {
				current.classList.remove('loading');
				document.getElementById('oneThemeCaption_' + theme.id).classList.add('readed');
				self.bg.cScript.printCount();
				self.printCount();
			});
		});

		if (self.bg.vars.data.toolbar_simple_list) {
			let mainHBox = document.createElement('div');
			mainHBox.className = 'oneTheme';
			//themeCaptionLabel.setAttribute('flex', '1');
			mainHBox.appendChild(themeCaptionLabel);
			mainHBox.appendChild(readImage);
			return mainHBox;
		} else {

			let userCaptionLabel = document.createElement('span');
			userCaptionLabel.textContent = inspector4pda.utils.htmlspecialcharsdecode(theme.last_user_name);
			userCaptionLabel.className = 'oneTheme_user';

			let lastPostLabel = document.createElement('span');
			lastPostLabel.textContent = new Date(theme.last_post_ts*1000).toLocaleString();
			lastPostLabel.className = 'oneTheme_lastPost';
			lastPostLabel.setAttribute('title', inspector4pda.browser.getString('Open Last Post'));
			lastPostLabel.addEventListener("click", function () {
				self.bg.themes.openLast(theme.id);
				self.bg.cScript.printCount();
				self.printCount();
				document.getElementById('oneThemeCaption_' + theme.id).classList.add('readed');
			}, false);

			// BOXES

			let infoHBox = document.createElement('div');
			infoHBox.className = 'oneThemeInfoHBox';
			infoHBox.appendChild(userCaptionLabel);
			infoHBox.appendChild(lastPostLabel);

			infoHBox.appendChild(readImage);

			let mainHBox = document.createElement('div');
			mainHBox.appendChild(themeCaptionLabel);

			let themeVBox = document.createElement('div');
			themeVBox.className = 'oneTheme';
			themeVBox.appendChild(mainHBox);
			themeVBox.appendChild(infoHBox);
			return themeVBox;
		}
	},

	checkOpenthemeHiding: function() {
		if (this.bg.vars.data.toolbar_opentheme_hide) {
			window.close();
		}
	},

	printUserLinks: function() {
		var uLinks = document.getElementById('userLinks');
		if (this.bg.vars.data.user_links && this.bg.vars.data.user_links.length) {
			uLinks.textContent = '';
			let self = this;
			for (let i = 0; i < this.bg.vars.data.user_links.length; i++) {
				let item = this.bg.vars.data.user_links[i];
				if (typeof item != 'object') {
					continue;
				}
				let link = document.createElement('span');
				link.innerText = item.title;
				link.addEventListener("click", function () {
					self.bg.utils.openPage(item.url, true);
				}, false);
				uLinks.appendChild(link);
			}
		} else {
			uLinks.className = 'hidden';
		}
	}
};

popup.init();