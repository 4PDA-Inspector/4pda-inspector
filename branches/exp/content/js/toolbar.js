var iToolbar = {

	panel: null,
	elements: {
		usernameLabel: null,
		themesList: null
	},

	init: function()
	{
		this.panel = cScript.winobj.getElementById('inspectorPanel');

		this.elements.usernameLabel = cScript.winobj.getElementById('inspectorPanelUsername');
		this.elements.usernameLabel.onclick = function() {
			alert(user.id);
		};
		this.elements.themesList = cScript.winobj.getElementById('inspectorThemesList');
	},
	
	bClick: function(parent)
	{
		if (user.id) {
			if (!this.panel) {
				this.init();
			};
			this.elements.usernameLabel.value = user.name;
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
		themeCaptionLabel.setAttribute('data-id', theme.id);
		themeCaptionLabel.className = 'oneTheme_caption'

		var userCaptionLabel = document.createElement('label');
		userCaptionLabel.setAttribute('value', utils.htmlspecialcharsdecode(theme.last_user_name));
		userCaptionLabel.setAttribute('data-id', theme.last_user_id);
		userCaptionLabel.className = 'oneTheme_user'

		var lastPostLabel = document.createElement('label');
		lastPostLabel.setAttribute('value', new Date(theme.last_post_ts*1000).toLocaleString());
		themeCaptionLabel.setAttribute('data-theme', theme.id);
		lastPostLabel.className = 'oneTheme_lastPost'

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