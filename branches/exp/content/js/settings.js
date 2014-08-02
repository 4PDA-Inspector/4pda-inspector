inspector4pda.settings = {
	
	init: function()
	{
		inspector4pda.utils.setStringBundle();

		if (inspector4pda.vars.osString == 'Linux' || inspector4pda.vars.button_big) {
			document.getElementById('inspector4pda_button_fontsize').style.display = 'none';
		} else {
			document.getElementById('inspector4pda_button_big_fontsize').style.display = 'none';
		}

		var currentVolume = document.getElementById('inspector4pda_pref_notification_sound_volume').value;
		document.getElementById('inspector4pda_notificationSoundVolumeInput').value = currentVolume;
		document.getElementById('inspector4pda_notificationSoundVolumeLabel').value = currentVolume + '%';

		document.getElementById('inspector4pda_notificationSoundVolumeInput').onchange = function() {
			document.getElementById('inspector4pda_notificationSoundVolumeLabel').value = this.value + '%';
		}

		document.getElementById('inspector4pda_pref_toolbar_opentheme_hide_onlylast').disabled = !document.getElementById('inspector4pda_pref_toolbar_opentheme_hide').value;
		document.getElementById('inspector4pda_pref_toolbar_opentheme_hide').onchange = function() {
			document.getElementById('inspector4pda_pref_toolbar_opentheme_hide_onlylast').disabled = !this.value;
		}
	},

	checkNotificationPopup: function(el)
	{
		if (el.getAttribute('checked').toLowerCase() == 'true') {
			
			if (!inspector4pda.utils.checkNotificationSupport()) {
				el.setAttribute('checked', 'false');
				alert(inspector4pda.utils.getString('Your browser does not support notifications'));
				return false;
			}

			switch ( Notification.permission.toLowerCase() ) {
				case "granted":
					new Notification(inspector4pda.utils.getString('Notification successfully incorporated'), {
						icon : "chrome://4pdainspector/content/icons/icon_64.png"
					});
					break;

				case "denied":
					el.setAttribute('checked', 'false');
					alert(inspector4pda.utils.getString('Notification prohibited'));
					break;

				case "default":
					Notification.requestPermission( function(permission) {
						if ( permission == "granted" ) {
							new Notification(inspector4pda.utils.getString('Notification successfully incorporated'), {
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