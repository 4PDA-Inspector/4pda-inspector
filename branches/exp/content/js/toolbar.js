var iToolbar = {

	panel: null,
	elements: {
		usernameLabel: null,
		favoritesLabel: null,
		qmsLabel: null,
		themesList: null,
		openAllLabel: null,
		readAllLabel: null
	},

	urls: {
		favorites: 'http://4pda.ru/forum/index.php?autocom=favtopics',
		qms: 'http://4pda.ru/forum/index.php?act=qms'
	},

	init: function()
	{
		this.panel = cScript.winobj.getElementById('inspectorPanel');

		this.elements.usernameLabel = cScript.winobj.getElementById('inspectorPanelUsername');
		this.elements.usernameLabel.onclick = function() {
			user.open(user.id);
		}
		
		this.elements.favoritesLabel = cScript.winobj.getElementById('inspectorPanelFavorites');
		this.elements.favoritesLabel.onclick = function() {
			utils.openPage(iToolbar.urls.favorites);
		}
		
		this.elements.qmsLabel = cScript.winobj.getElementById('inspectorPanelQMS');
		this.elements.qmsLabel.onclick = function() {
			utils.openPage(iToolbar.urls.qms);
		}
		
		this.elements.themesList = cScript.winobj.getElementById('inspectorThemesList');
		
		this.elements.openAllLabel = cScript.winobj.getElementById('inspectorPanelOpenAll');
		this.elements.openAllLabel.onclick = function() {
			themes.openAll();
		}
		
		this.elements.readAllLabel = cScript.winobj.getElementById('inspectorPanelReadAll');
		this.elements.readAllLabel.onclick = function() {
			themes.readAll();
		}
	},
	
	bClick: function(parent)
	{
		if (user.id) {
			if (!this.panel) {
				this.init();
			};
			this.elements.usernameLabel.value = user.name;
			this.elements.favoritesLabel.value = themes.list.length;
			this.elements.favoritesLabel.className = themes.list.length? 'hasUnread': '';
			
			this.elements.qmsLabel.value = QMS.unreadCount;
			this.elements.qmsLabel.className = QMS.unreadCount? 'hasUnread': '';

			this.printThemesList();
			this.panel.openPopup(parent, 'after_start', 0, 0, false, true);
		} else {
			// открыть страницу авторизации
		}
	},

	hidePanel: function()
	{
		this.clearThemesList();
	},

	clearThemesList: function()
	{
		var labels = this.elements.themesList.getElementsByClassName('oneTheme');

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
	}
}