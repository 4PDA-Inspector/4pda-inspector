var inspectorSettings = {

	init: function()
	{
		var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;

		if (osString == 'Linux' || inspectorDefaultStorage.button_big)
			document.getElementById('inspector_button_fontsize').style.display = 'none';
		else
			document.getElementById('inspector_button_big_fontsize').style.display = 'none';
	}

}

// window.addEventListener("load", inspectorSettings.init(), false);