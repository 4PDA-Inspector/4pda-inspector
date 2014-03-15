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
			this.panel.openPopup(parent, 'after_start', 0, 0, false, true);
			this.elements.usernameLabel.value = user.name;
			this.clearThemesList();
			this.printThemesList();
		} else {
			// открыть страницу авторизации
		}
	},

	clearThemesList: function()
	{
		var labels = this.elements.themesList.getElementsByTagName('label');

		for (var i = 0, length = labels.length; i < length; i++) {
			labels[0].remove();
		};
	},

	printThemesList: function()
	{
		var labels = iToolbar.elements.themesList.getElementsByTagName('label');
		
		for (var i = 0; i < themes.list.length; i++) {
			iToolbar.elements.themesList.appendChild(iToolbar.createThemeRow(themes.list[i]));
		};

	},

	createThemeRow: function(theme)
	{
		var newLabel = document.createElement('label');
		newLabel.setAttribute('value', utils.htmlspecialcharsdecode(theme.title));
		return newLabel;
	}
}