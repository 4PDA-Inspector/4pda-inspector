var bg = chrome.extension.getBackgroundPage().inspector4pda;
var inputs = document.getElementById('mainDiv').getElementsByTagName('input');

const urlRegexp = /^(https?:\/\/)4pda\.ru([\/\w \.-\?\=]*)*\/?$/;

printValues();

for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].name) {
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
}

function printValues() {
    var vars = bg.vars.getAll();
    for (var i in vars) {
        if (i == 'user_links') {
            printUserLinks(vars[i]);
        } else {
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

/* **** *** ** * */

/*var userLinksArray = bg.vars.getValue('user_links', []);
var userLinkDivs = document.getElementsByClassName('userLinkDiv');

for (i = 0; i < userLinksArray.length; i++) {

}*/

/*var userLinkInputs = document.querySelectorAll('.userLinkDiv input');
for (i = 0; i < userLinkInputs.length; i++) {
    userLinkInputs[i].addEventListener('change', function() {
        saveUserLinks();
    });
}*/

document.getElementById('addUserLink').addEventListener('click', function() {
    var div = document.getElementsByClassName('userLinkDiv')[0].cloneNode(true);
    var inputs = div.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].value = '';
        inputs[i].addEventListener('change', function() {
            saveUserLinks();
        });
    }
    document.getElementById('userLinksDiv').insertBefore(div, document.getElementById('addUserLink'));
});

function printUserLinks(links) {

    if (links.length) {
        for (var i = 0; i < links.length; i++) {
            var div = document.getElementsByClassName('userLinkDiv')[i];
            if (!div) {
                div = document.getElementsByClassName('userLinkDiv')[0].cloneNode(true);
                document.getElementById('userLinksDiv').insertBefore(div, document.getElementById('addUserLink'));
            }
            var inputs = div.getElementsByTagName('input');
            for (var j = 0; j < inputs.length; j++) {
                inputs[j].addEventListener('change', function() {
                    saveUserLinks();
                });
            }
            inputs[0].value = links[i].url;
            inputs[1].value = links[i].title;
        }
    } else {
        var userLinkInputs = document.querySelectorAll('.userLinkDiv input');
        for (var i = 0; i < userLinkInputs.length; i++) {
            userLinkInputs[i].addEventListener('change', function() {
                saveUserLinks();
            });
        }
    }
}

function saveUserLinks() {
    var result = [];
    var userLinkDivs = document.getElementsByClassName('userLinkDiv');
    for (var i = 0; i < userLinkDivs.length; i++) {
        var inputs = userLinkDivs[i].getElementsByTagName('input');
        var newUserLink = {};
        for (var j = 0; j < inputs.length; j++) {
            if (inputs[j].className == 'userLinkUrl') {
                if (urlRegexp.test(inputs[j].value)) {
                    newUserLink.url = inputs[j].value;
                }
            } else if (inputs[j].className == 'userLinkUrlTitle') {
                newUserLink.title = inputs[j].value;
            }
        }

        if (newUserLink.url && newUserLink.title) {
            result.push(newUserLink);
        }
    }
    bg.vars.setValue('user_links', JSON.stringify(result));
}