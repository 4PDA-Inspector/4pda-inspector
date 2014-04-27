inspector4pda.settings = {
    
    init: function() {
        var currentVolume = document.getElementById('inspector4pda_pref_notification_sound_volume').value;
        document.getElementById('inspector4pda_notificationSoundVolumeInput').value = currentVolume;
        document.getElementById('inspector4pda_notificationSoundVolumeLabel').value = currentVolume + '%';

        document.getElementById('inspector4pda_notificationSoundVolumeInput').onchange = function() {
            document.getElementById('inspector4pda_pref_notification_sound_volume').value = this.value;
            document.getElementById('inspector4pda_notificationSoundVolumeLabel').value = this.value + '%';
        }
    }
}