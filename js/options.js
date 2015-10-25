var bg = chrome.extension.getBackgroundPage().inspector4pda;
var inputs = document.getElementById('mainDiv').getElementsByTagName('input');

printValues();

for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('change', function() {
        var name = this.name;
        switch (this.type) {
            case "checkbox":
                setValue(name, this.checked);
                break;
            case "text":
            case "number":
            case "range":
                setValue(name, this.value);
                break;
        }
    });
}

function printValues() {
    var vars = bg.vars.getAll();
    for (var i in vars) {
        var input = document.getElementsByName(i);
        if (input.length) {
            input = input[0];
            switch (typeof vars[i]) {
                case 'boolean':
                    input.checked = vars[i];
                    break;
                default:
                    input.value = vars[i];
            }
        }
    }
}

function setValue(name, value) {
    bg.vars.setValue(name, value);
}

document.getElementById('inspector4pda_notificationSoundVolumeLabel').innerHTML = parseInt(document.getElementById('notification_sound_volume').value * 100) + '%';
document.getElementById('notification_sound_volume').addEventListener('input', function() {
    document.getElementById('inspector4pda_notificationSoundVolumeLabel').innerHTML = parseInt(this.value * 100) + '%';
});

document.getElementById('notification_popup_qms').addEventListener('change', function() {
    if (this.checked) {
        inspector4pda.browser.showNotification({
            message: "Оповещения о QMS успешно включены",
            iconUrl: inspector4pda.browser.notificationQMSIcon
        });
    }
});
document.getElementById('notification_popup_themes').addEventListener('change', function() {
    if (this.checked) {
        inspector4pda.browser.showNotification({
            message: "Оповещения о темах успешно включены",
            iconUrl: inspector4pda.browser.notificationThemeIcon
        });
    }
});

document.getElementById('testNotifications').addEventListener('click', function() {
    bg.browser.playNotificationSound();
});