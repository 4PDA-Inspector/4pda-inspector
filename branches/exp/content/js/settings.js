var iSettings = {
    
    init: function() {
        var currentVolume = document.getElementById('pref_notification_sound_volume').value;
        document.getElementById('inspector_notification_sound_volume_input').value = currentVolume;
        document.getElementById('inspector_notification_sound_volume_label').value = currentVolume + '%';

        document.getElementById('inspector_notification_sound_volume_input').onchange = function() {
            document.getElementById('pref_notification_sound_volume').value = this.value;
            document.getElementById('inspector_notification_sound_volume_label').value = this.value + '%';
        }
    }
}