inspector4pda.settings = {
    
    init: function()
    {
        var currentVolume = document.getElementById('inspector4pda_pref_notification_sound_volume').value;
        document.getElementById('inspector4pda_notificationSoundVolumeInput').value = currentVolume;
        document.getElementById('inspector4pda_notificationSoundVolumeLabel').value = currentVolume + '%';

        document.getElementById('inspector4pda_notificationSoundVolumeInput').onchange = function() {
            document.getElementById('inspector4pda_pref_notification_sound_volume').value = this.value;
            document.getElementById('inspector4pda_notificationSoundVolumeLabel').value = this.value + '%';
        }
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