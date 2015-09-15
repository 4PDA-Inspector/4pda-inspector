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

	bg: null,

	init: function(data) {

		this.bg = chrome.extension.getBackgroundPage().inspector4pda;
		
		this.elements.usernameLabel = document.getElementById('panelUsername');
		this.elements.usernameLabel.addEventListener("click", function () {
			popup.bg.user.open();
		}, false);
		
		this.elements.favoritesLabel = document.getElementById('panelFavoritesCount');
		this.elements.favoritesBox = document.getElementById('panelFavorites');
		this.elements.favoritesBox.addEventListener("click", function () {
			popup.bg.themes.openPage();
		}, false);

		this.elements.qmsLabel = document.getElementById('panelQMSCount');
		this.elements.qmsBox = document.getElementById('panelQMS');
		this.elements.qmsBox.addEventListener("click", function () {
			popup.bg.QMS.openPage();
		}, false);

		this.elements.openAllLabel = document.getElementById('panelOpenAll');
		this.elements.openAllLabel.addEventListener('click', function() {
			popup.bg.themes.openAll();
			popup.refresh();
		}, false);
		
		this.elements.openAllPinLabel = document.getElementById('panelOpenAllPin');
		this.elements.openAllPinLabel.addEventListener('click', function() {
			popup.bg.themes.openAllPin();
			popup.refresh();
		}, false);
		
		this.elements.readAllLabel = document.getElementById('panelReadAll');
		this.elements.readAllLabel.addEventListener('click', function() {
			popup.bg.themes.readAll();
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

		this.bg.cScript.getData(function() {
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
			for (var i in this.bg.themes.list) {
				this.addThemeRow(this.bg.themes.list[i]);
			}
		} else {
			var noThemesLabel = document.createElement('div');
			noThemesLabel.setAttribute('value', inspector4pda.utils.getString('No unread topics'));
			noThemesLabel.className = 'oneTheme';
			this.elements.themesList.appendChild(noThemesLabel);
		}
	},

	addThemeRow: function(theme) {
		this.elements.themesList.appendChild(this.createThemeRow(theme));
	},

	createThemeRow: function(theme)	{
		
		var themeCaptionLabel = document.createElement('div');
		themeCaptionLabel.innerHTML = inspector4pda.utils.htmlspecialcharsdecode(theme.title);
		themeCaptionLabel.className = 'oneTheme_caption';
		if (theme.pin && popup.bg.vars.toolbar_pin_color) {
			themeCaptionLabel.className += ' oneTheme_pin';
		};
		themeCaptionLabel.id = 'oneThemeCaption_' + theme.id;
		themeCaptionLabel.dataId = theme.id;
		themeCaptionLabel.addEventListener("click", function () {
			popup.bg.themes.open(theme.id);
			popup.bg.cScript.printCount();
			popup.elements.favoritesLabel.innerHTML = popup.bg.themes.getCount();
			this.classList.add("readed");
			inspector4pda.toolbar.checkOpenthemeHiding();
		}, false);

		var readImage = document.createElement('span');
		readImage.className = 'oneTheme_markAsRead';
		readImage.setAttribute('data-theme', theme.id);
		readImage.setAttribute('tooltiptext', inspector4pda.utils.getString('Mark As Read'));
		readImage.addEventListener("click", function () {
			var current = this;
			var dataTheme = this.getAttribute('data-theme');
			current.style.opacity = '0.5';
			
			popup.bg.themes.read(dataTheme, function() {
				current.style.opacity = '';
				document.getElementById('oneThemeCaption_' + theme.id).classList.add('readed');
				popup.bg.cScript.printCount();
				popup.printCount();
			});
		});

		if (!popup.bg.vars.toolbar_simple_list) {
		
			var userCaptionLabel = document.createElement('span');
			var last_user_name = inspector4pda.utils.htmlspecialcharsdecode(theme.last_user_name);
			userCaptionLabel.innerHTML = last_user_name;
			userCaptionLabel.className = 'oneTheme_user';

			var lastPostLabel = document.createElement('span');
			lastPostLabel.innerHTML = new Date(theme.last_post_ts*1000).toLocaleString();
			lastPostLabel.className = 'oneTheme_lastPost';
			lastPostLabel.setAttribute('tooltiptext', inspector4pda.utils.getString('Open Last Post'));
			lastPostLabel.addEventListener("click", function () {
				popup.bg.themes.openLast(theme.id);
				popup.bg.cScript.printCount();
				//popup.elements.favoritesLabel.innerHTML = popup.bg.themes.getCount();
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

		return false;
	}
}

popup.init();