chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.method == 'sendData') {
			console.log('popup onMessage');
			popup.init(request.data);
		}
	}
);
chrome.runtime.sendMessage({method: 'getData'});

popup = {

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

	themes: null,
	qms: null,
	user: null,

	init: function(data) {
		this.themes = data.themes;
		this.qms = data.qms;
		this.user = data.user;
		
		this.elements.themesList = document.getElementById('themesList');

		this.printThemesList();
	},

	clearThemesList: function() {
		this.elements.themesList.innerHTML = "";
	},

	printThemesList: function() {

		this.clearThemesList();

		if (Object.keys(this.themes.list).length) {
			for (var i in this.themes.list) {
				this.addThemeRow(this.themes.list[i]);
			}
		}/* else {
			var noThemesLabel = document.createElement('label');
			noThemesLabel.setAttribute('value', inspector4pda.utils.getString('No unread topics'));
			noThemesLabel.className = 'oneTheme';
			inspector4pda.toolbar.elements.themesList.appendChild(noThemesLabel);
		}*/
	},

	addThemeRow: function(theme) {
		this.elements.themesList.appendChild(this.createThemeRow(theme));
	},

	createThemeRow: function(theme)	{
		
		var themeCaptionLabel = document.createElement('div');
		themeCaptionLabel.innerHTML = inspector4pda.utils.htmlspecialcharsdecode(theme.title);
		themeCaptionLabel.className = 'oneTheme_caption';
		/*if (theme.pin && inspector4pda.vars.toolbar_pin_color) {
			themeCaptionLabel.className += ' oneTheme_pin';
		};*/
		themeCaptionLabel.id = 'oneThemeCaption_' + theme.id;
		/*themeCaptionLabel.onclick = function () {
			inspector4pda.themes.open(theme.id);
			inspector4pda.cScript.printCount();
			inspector4pda.toolbar.elements.favoritesLabel.value = inspector4pda.themes.getCount();
			this.classList.add("readed");
			inspector4pda.toolbar.checkOpenthemeHiding();
		};*/

		var readImage = document.createElement('span');
		readImage.className = 'oneTheme_markAsRead';
		readImage.setAttribute('data-theme', theme.id);
		readImage.setAttribute('tooltiptext', inspector4pda.utils.getString('Mark As Read'));
		/*readImage.onclick = function () {
			var current = this;
			var dataTheme = this.getAttribute('data-theme');
			current.style.opacity = '0.5';
			
			inspector4pda.themes.read(dataTheme, function() {
				current.style.opacity = '';
				document.getElementById('oneThemeCaption_' + theme.id).classList.add('readed');
				inspector4pda.cScript.printCount();
				inspector4pda.toolbar.printCount();
			});
		};*/

		//if (!inspector4pda.vars.toolbar_simple_list) {
		if (1) {
		
			var userCaptionLabel = document.createElement('span');
			var last_user_name = inspector4pda.utils.htmlspecialcharsdecode(theme.last_user_name);
			userCaptionLabel.innerHTML = last_user_name;
			userCaptionLabel.className = 'oneTheme_user';

			var lastPostLabel = document.createElement('span');
			lastPostLabel.innerHTML = new Date(theme.last_post_ts*1000).toLocaleString();
			lastPostLabel.className = 'oneTheme_lastPost';
			lastPostLabel.setAttribute('tooltiptext', inspector4pda.utils.getString('Open Last Post'));
			/*lastPostLabel.onclick = function () {
				inspector4pda.themes.openLast(theme.id);
				inspector4pda.cScript.printCount();
				inspector4pda.toolbar.elements.favoritesLabel.value = inspector4pda.themes.getCount();
			};*/

			// BOXES

			var infoHBox = document.createElement('div');
			infoHBox.className = 'oneThemeInfoHBox';
			infoHBox.appendChild(userCaptionLabel);
			infoHBox.appendChild(lastPostLabel);

			/*var box = document.createElement('div');
			box.setAttribute('flex', '1');
			infoHBox.appendChild(box);*/
			
			infoHBox.appendChild(readImage);

			var mainHBox = document.createElement('div');
			mainHBox.appendChild(themeCaptionLabel);
			
			var themeVBox = document.createElement('div');
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
	}
}