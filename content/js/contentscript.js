var cScript = {

	winobj: null,
	osString: '',

	init: function(el)
	{
		var obj = document.getElementById("navigator-toolbox");
		this.winobj = (obj) ? window.document : window.opener.document;
		// this.osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
        // utils.log(this.osString);

        // iToolbar.init();
        iToolbar.panel = this.winobj.getElementById('inspector_panel');

        user.rAuth(function() {
            if (user.auth) {
                utils.log(user.name);
            };
        });
	}
};

cScript.init();