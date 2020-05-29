var bg = chrome.extension.getBackgroundPage().inspector4pda,
    inputs = document.getElementById('mainDiv').getElementsByTagName('input');
const urlRegexp = /^(https?:\/\/)4pda\.ru([\/\w\.-\?\=\&\#]*)*\/?$/;

printValues();

for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].name) {
        inputs[i].addEventListener('change', function() {
            switch (this.type) {
                case "checkbox":
                    setValue(this.name, this.checked);
                    break;
                case "text":
                case "number":
                case "range":
                    setValue(this.name, this.value);
                    break;
            }
        });
    }
}

function printValues() {
    var vars = bg.vars.getAll();
    for (let i in vars) {
        if (i == 'user_links') {
            printUserLinks(vars[i]);
        } else {
            let input = document.getElementsByName(i);
            if (input.length) {
                input = input[0];
                switch (input.type) {
                    case "checkbox":
                        input.checked = vars[i];
                        break;
                    default:
                        input.value = vars[i];
                }
                if (i == 'notification_sound_volume') {
                    printNotificationSoundVolume(vars[i]);
                }
            }
        }
    }
}

function printNotificationSoundVolume(value) {
    document.getElementById('inspector4pda_notificationSoundVolumeLabel').textContent = parseInt(value * 100) + '%';
}

function setValue(name, value) {
    bg.vars.setValue(name, value);
}

document.getElementById('notification_sound_volume').addEventListener('input', function() {
    printNotificationSoundVolume(this.value);
});

document.getElementById('notification_popup_qms').addEventListener('change', function() {
    if (this.checked) {
        bg.browser.showNotification({
            message: "Оповещения о QMS успешно включены",
            iconUrl: bg.browser.notificationQMSIcon
        });
    }
});
document.getElementById('notification_popup_themes').addEventListener('change', function() {
    if (this.checked) {
        bg.browser.showNotification({
            message: "Оповещения о темах успешно включены",
            iconUrl: bg.browser.notificationThemeIcon
        });
    }
});
document.getElementById('notification_popup_mentions').addEventListener('change', function() {
    if (this.checked) {
        bg.browser.showNotification({
            message: "Оповещения об упоминаниях успешно включены",
            iconUrl: bg.browser.notificationMentionIcon
        });
    }
});

document.getElementById('testNotifications').addEventListener('click', function() {
    bg.browser.playNotificationSound();
});

document.getElementById('addUserLink').addEventListener('click', function() {
    var div = document.getElementsByClassName('userLinkDiv')[0].cloneNode(true),
        inputs = div.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = '';
        inputs[i].addEventListener('change', function() {
            saveUserLinks();
        });
    }
    document.getElementById('userLinksDiv').insertBefore(div, document.getElementById('addUserLink'));
});

function printUserLinks(links) {
    if (links.length) {
        for (let i = 0; i < links.length; i++) {
            let div = document.getElementsByClassName('userLinkDiv')[i];
            if (!div) {
                div = document.getElementsByClassName('userLinkDiv')[0].cloneNode(true);
                document.getElementById('userLinksDiv').insertBefore(div, document.getElementById('addUserLink'));
            }
            let inputs = div.getElementsByTagName('input');
            for (let j = 0; j < inputs.length; j++) {
                inputs[j].addEventListener('change', function() {
                    saveUserLinks();
                });
            }
            inputs[0].value = links[i].url;
            inputs[1].value = links[i].title;
        }
    } else {
        let userLinkInputs = document.querySelectorAll('.userLinkDiv input');
        for (let i = 0; i < userLinkInputs.length; i++) {
            userLinkInputs[i].addEventListener('change', function() {
                saveUserLinks();
            });
        }
    }
}

function saveUserLinks() {
    var result = [],
        userLinkDivs = document.getElementsByClassName('userLinkDiv');
    for (let i = 0; i < userLinkDivs.length; i++) {

        if (
            (userLinkDivs[i].getElementsByClassName('userLinkUrl').length)
            && (userLinkDivs[i].getElementsByClassName('userLinkUrlTitle').length)
        ) {
            let newUserLink = {
                url  : userLinkDivs[i].getElementsByClassName('userLinkUrl')[0].value,
                title: userLinkDivs[i].getElementsByClassName('userLinkUrlTitle')[0].value
            };
            if (urlRegexp.test(newUserLink.url) && newUserLink.title) {
                result.push(newUserLink);
            }
        }
    }
    bg.vars.setValue('user_links', result);
}