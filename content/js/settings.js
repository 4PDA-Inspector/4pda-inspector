// inspectorSettings
inspector4pda.settings = {

	init: function()
	{
		var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;

		if (osString == 'Linux' || inspector4pda.defaults.button_big)
			document.getElementById('inspector_button_fontsize').style.display = 'none';
		else
			document.getElementById('inspector_button_big_fontsize').style.display = 'none';
		
		if (!inspector4pda.utils.checkNotificationSupport()) {
			document.getElementById('inspector_notification_popup_checkbox').setAttribute('checked', 'false');
			document.getElementById('inspector_notification_popup_hbox').style.display = 'none';
		}
		
		// notification sound
		var currentVolume = document.getElementById('pref_notification_sound_volume').value;
		document.getElementById('inspector_notification_sound_volume_input').value = currentVolume;
		document.getElementById('inspector_notification_sound_volume_label').value = currentVolume + '%';

		document.getElementById('inspector_notification_sound_volume_input').onchange = function() {
			document.getElementById('pref_notification_sound_volume').value = this.value;
			document.getElementById('inspector_notification_sound_volume_label').value = this.value + '%';
		}
	},

	testNotification: function()
	{
		Notification.requestPermission( function(permission) {
    		if( permission != "granted" )
    		{
    			alert('Оповещения запрещены');
    			return false;
    		}
    		new Notification('Оповещения успешно включены', {
    			icon : "chrome://4pdainspector/content/icons/icon_64.png"
    		});
    	} );
	},

	checkNotificationPopup: function(el)
	{
		if (el.getAttribute('checked').toLowerCase() == 'true') {
			
			if (!inspector4pda.utils.checkNotificationSupport()) {
				el.setAttribute('checked', 'false');
				alert('Ваш браузер не поддерживает оповещения');
				return false;
			}

			switch ( Notification.permission.toLowerCase() ) {
			    case "granted":
			        break;

			    case "denied":
			        el.setAttribute('checked', 'false');
			        alert('Оповещения запрещены');
			        break;

			    case "default":
			    	Notification.requestPermission( function(permission) {
			    		if ( permission == "granted" ) {
			    			new Notification('Оповещения успешно включены', {
				    			icon : "chrome://4pdainspector/content/icons/icon_64.png"
				    		});
			    		} else {
			    			el.setAttribute('checked', 'false');
			    		}
			    	} )
			}
		};
	}

}