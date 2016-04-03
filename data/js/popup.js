var data = {
	themes: {
		count: 0,
		pinCount: 0,
		sortedKeys: []
	},
	qms: {
		count: 0
	},
	user: {
		id: 0,
		name: ''
	},
	vars: {},
	translates: {}
};

var popup = {

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

	init: function() {

		if (!data.user.id) {
			popupPort.openPage('login');
			popupPort.hidePanel();
			return false;
		}

		if (data.vars.toolbar_width_fixed) {
			document.getElementsByTagName("body")[0].style.width = data.vars.toolbar_width;
			document.getElementsByTagName("body")[0].className = 'widthFixed';
		}
		
		this.elements.usernameLabel = document.getElementById('panelUsername');
		this.elements.usernameLabel.onclick = function () {
			popupPort.openUserPage();
			popup.checkOpenthemeHiding();
		};
		
		this.elements.favoritesLabel = document.getElementById('panelFavoritesCount');
		this.elements.favoritesBox = document.getElementById('panelFavorites');
		this.elements.favoritesBox.onclick = function () {
			popupPort.openPage('themes');
			popup.checkOpenthemeHiding();
		};

		this.elements.qmsLabel = document.getElementById('panelQMSCount');
		this.elements.qmsBox = document.getElementById('panelQMS');
		this.elements.qmsBox.onclick = function () {
			popupPort.openPage('QMS');
			popup.checkOpenthemeHiding();
		};

		this.elements.settingsLabel = document.getElementById('panelSettings');
		this.elements.settingsLabel.onclick = function () {
			popupPort.openSettingsPage();
			popup.checkOpenthemeHiding();
		};

		this.elements.openAllLabel = document.getElementById('panelOpenAll');
		this.elements.openAllLabel.onclick = function() {
			popupPort.openAllThemesPages();
			popup.checkOpenthemeHiding();
			popup.refresh();
		};
		
		this.elements.openAllPinLabel = document.getElementById('panelOpenAllPin');
		this.elements.openAllPinLabel.onclick = function() {
			popupPort.openAllPinThemesPages();
			popup.checkOpenthemeHiding();
			popup.refresh();
		};
		
		this.elements.readAllLabel = document.getElementById('panelReadAll');
		this.elements.readAllLabel.onclick = function() {
			popupPort.readAllThemes();
			popup.checkOpenthemeHiding();
			popup.refresh();
		};

		this.elements.themesList = document.getElementById('themesList');

		this.elements.manualRefresh = document.getElementById('panelRefresh');
		this.elements.manualRefresh.onclick = function() {
			popup.manualRefresh(true);
		};

		this.refresh();
	},

	refresh: function(withoutPrintThemes) {

		popupPort.updateData();

		this.elements.usernameLabel.textContent = data.user.name;

		this.elements.favoritesLabel.textContent = data.themes.count;
		this.elements.favoritesBox.className = data.themes.count ? 'hasUnread': '';

		this.elements.qmsLabel.textContent = data.qms.count;
		this.elements.qmsBox.className = data.qms.count ? 'hasUnread': '';

		if (data.vars.toolbar_simple_list) {
			this.elements.themesList.className = 'simpleList';
		}

		if (!data.vars.toolbar_openAllFavs_button) {
			this.elements.openAllLabel.classList.add('hidden');
		}
		if (!data.vars.toolbar_openAllFavs_button || (data.vars.toolbar_only_pin ||  !data.themes.pinCount )) {
			this.elements.openAllPinLabel.classList.add('hidden');
		}
		if (!data.vars.toolbar_markAllAsRead_button) {
			this.elements.readAllLabel.classList.add('hidden');
		}

		if (data.vars.user_links && data.vars.user_links.length) {
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

		popupPort.firstRequest();
	},

	printCount: function() {
		this.refresh(true);
	},

	clearThemesList: function() {
		this.elements.themesList.textContent = "";
	},

	printThemesList: function() {

		this.clearThemesList();

		if (data.themes.count) {
			for (var i = 0; i < data.themes.sortedKeys.length; i++) {
				this.addThemeRow(data.themes.list[data.themes.sortedKeys[i]]);
			}
		} else {
			var noThemesLabel = document.createElement('div');
			noThemesLabel.textContent = popupPort.getString('No unread topics');
			noThemesLabel.className = 'oneTheme';
			this.elements.themesList.appendChild(noThemesLabel);
		}

		/*console.log( document.getElementById('content').offsetHeight );
		console.log( document.getElementById('content').clientHeight );
		console.log( window.innerWidth );*/

		self.port.emit('panel-resize', {
			width: 400,
			height: document.getElementById('content').offsetHeight + 20
		});
	},

	addThemeRow: function(theme) {
		this.elements.themesList.appendChild(this.createThemeRow(theme));
	},

	createThemeRow: function(theme)	{
		
		var themeCaptionLabel = document.createElement('span');
		themeCaptionLabel.textContent = theme.title;
		themeCaptionLabel.className = 'oneTheme_caption';
		if (theme.pin && data.vars.toolbar_pin_color) {
			themeCaptionLabel.className += ' oneTheme_pin';
		}
		themeCaptionLabel.id = 'oneThemeCaption_' + theme.id;
		themeCaptionLabel.dataId = theme.id;
		themeCaptionLabel.onclick = function () {
			popupPort.openThemePage(theme.id);
			popupPort.buttonPrintCount();
			this.classList.add("readed");
			popup.checkOpenthemeHiding();
		};

		var readImage = document.createElement('span');
		readImage.id = 'oneTheme_markAsRead_' + theme.id;
		readImage.className = 'oneTheme_markAsRead';
		readImage.setAttribute('data-theme', theme.id);
		readImage.setAttribute('title', popupPort.getString('Mark As Read'));
		readImage.onclick = function () {
			var current = this;
			var dataTheme = this.getAttribute('data-theme');
			current.classList.add('loading');
			popupPort.readTheme(dataTheme);
		};

		if (!data.vars.toolbar_simple_list) {
		
			var userCaptionLabel = document.createElement('span');
			userCaptionLabel.textContent = theme.last_user_name;
			userCaptionLabel.className = 'oneTheme_user';

			var lastPostLabel = document.createElement('span');
			lastPostLabel.textContent = new Date(theme.last_post_ts*1000).toLocaleString();
			lastPostLabel.className = 'oneTheme_lastPost';
			lastPostLabel.setAttribute('title', popupPort.getString('Open Last Post'));
			lastPostLabel.onclick = function () {
				popupPort.openThemeLastPage(theme.id);
				popupPort.buttonPrintCount();
				document.getElementById('oneThemeCaption_' + theme.id).classList.add('readed');
			};

			// BOXES

			var infoHBox = document.createElement('div');
			infoHBox.className = 'oneThemeInfoHBox';
			infoHBox.appendChild(userCaptionLabel);
			infoHBox.appendChild(lastPostLabel);

			infoHBox.appendChild(readImage);

			var mainHDBox = document.createElement('div');
			mainHDBox.appendChild(themeCaptionLabel);
			
			var themeVBox = document.createElement('div');
			themeVBox.className = 'oneTheme';
			themeVBox.appendChild(mainHDBox);
			themeVBox.appendChild(infoHBox);
			return themeVBox;
		} else {
			var mainHBox = document.createElement('div');
			mainHBox.className = 'oneTheme';
			mainHBox.appendChild(themeCaptionLabel);
			mainHBox.appendChild(readImage);
			return mainHBox;
		}
	},

	themeReaded: function(id) {
		var current = document.getElementById('oneTheme_markAsRead_' + id);
		current.classList.remove('loading');
		document.getElementById('oneThemeCaption_' + id).classList.add('readed');
		popupPort.buttonPrintCount();
		popup.printCount();
	},

	checkOpenthemeHiding: function() {
		popupPort.hidePanel(true);
	},

	printUserLinks: function() {
		var uLinks = document.getElementById('userLinks');
		uLinks.style.display = 'block';
		uLinks.textContent = '';
		for (var i = 0; i < data.vars.user_links.length; i++) {
			var item = data.vars.user_links[i];
			if (typeof item != 'object') {
				continue;
			}
			var link = document.createElement('span');
			link.innerText = item.title;
			link.setAttribute('data-url', item.url);
			link.onclick = function () {
				var url = this.getAttribute('data-url');
				popupPort.openPage(url);
			};
			uLinks.appendChild(link);
		}
	}
};

var popupPort = {

	getString: function(name) {
		if (data.translates.hasOwnProperty(name)) {
			return data.translates[name];
		} else {
			return name;
		}
	},

	buttonPrintCount: function() {
		self.port.emit('button-print-count');
	},

	openPage: function(url) {
		self.port.emit('open-page', url);
	},

	openUserPage: function() {
		self.port.emit('open-user-page');
	},

	openSettingsPage: function() {
		self.port.emit('open-settings-page');
	},

	openAllThemesPages: function() {
		self.port.emit('open-all-themes');
	},

	openAllPinThemesPages: function() {
		self.port.emit('open-all-pin-themes');
	},

	openThemePage: function(id) {
		self.port.emit('open-theme-page', id);
		popupPort.updateCounts();
	},

	openThemeLastPage: function(id) {
		self.port.emit('open-theme-last-page', id);
		popupPort.updateCounts();
	},

	hidePanel: function(check) {
		self.port.emit('panel-hide', check);
	},

	readTheme: function(id) {
		self.port.emit('read-theme', id);
	},

	readAllThemes: function() {
		self.port.emit('read-all-themes');
	},

	updateCounts: function() {
		self.port.emit('counts-update');
	},

	updateData: function() {
		self.port.emit('update-data');
	},

	firstRequest: function() {
		self.port.emit('do-first-request');
	}

};

self.port.on("show-event", function (dataP) {
	data = dataP;
	popup.init();
});
self.port.on("updated-data", function (dataP) {
	data = dataP;
});
self.port.on("theme-readed", function (id) {
	popup.themeReaded(id);
	popupPort.updateCounts();
});
self.port.on("counts-updated", function (counts) {
	data.themes.count = counts.themes;
	data.qms.count = counts.qms;
	popup.printCount();
});