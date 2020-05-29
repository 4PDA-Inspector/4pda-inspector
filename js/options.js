const urlRegexp = /^(https?:\/\/)4pda\.ru([\/\w\.-\?\=\&\#]*)*\/?$/;
options = {
    bg: null,
    inputs: null,

    init: function() {
        this.bg = chrome.extension.getBackgroundPage().inspector4pda;
        this.inputs = document.getElementById('mainDiv').getElementsByTagName('input');

        this.addEventListeners();
        this.printValues();
    },

    addEventListeners: function () {
        var self = this;

        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].name) {
                this.inputs[i].addEventListener('change', function() {
                    switch (this.type) {
                        case "checkbox":
                            self.setValue(this.name, this.checked);
                            break;
                        case "text":
                        case "number":
                        case "range":
                            self.setValue(this.name, this.value);
                            break;
                    }
                });
            }
        }

        document.getElementById('notification_sound_volume').addEventListener('input', function() {
            self.printNotificationSoundVolume(this.value);
        });

        document.getElementById('notification_popup_qms').addEventListener('change', function() {
            if (this.checked) {
                self.bg.browser.showNotification({
                    message: "Оповещения о QMS успешно включены",
                    iconUrl: self.bg.browser.notificationQMSIcon
                });
            }
        });
        document.getElementById('notification_popup_themes').addEventListener('change', function() {
            if (this.checked) {
                self.bg.browser.showNotification({
                    message: "Оповещения о темах успешно включены",
                    iconUrl: self.bg.browser.notificationThemeIcon
                });
            }
        });
        document.getElementById('notification_popup_mentions').addEventListener('change', function() {
            if (this.checked) {
                self.bg.browser.showNotification({
                    message: "Оповещения об упоминаниях успешно включены",
                    iconUrl: self.bg.browser.notificationMentionIcon
                });
            }
        });
        document.getElementById('testNotifications').addEventListener('click', function() {
            self.bg.browser.playNotificationSound();
        });
        document.getElementById('addUserLink').addEventListener('click', function() {
            var div = document.getElementsByClassName('userLinkDiv')[0].cloneNode(true),
                inputs = div.getElementsByTagName('input');
            for (let i = 0; i < inputs.length; i++) {
                inputs[i].value = '';
                inputs[i].addEventListener('change', function() {
                    self.saveUserLinks();
                });
            }
            document.getElementById('userLinksDiv').insertBefore(div, document.getElementById('addUserLink'));
        });
    },

    printValues: function() {
        var vars = this.bg.vars.getAll();
        for (let i in vars) {
            if (i == 'user_links') {
                this.printUserLinks(vars[i]);
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
                        this.printNotificationSoundVolume(vars[i]);
                    }
                }
            }
        }
    },

    printNotificationSoundVolume: function(value) {
        document.getElementById('inspector4pda_notificationSoundVolumeLabel').textContent = parseInt(value * 100) + '%';
    },

    setValue: function(name, value) {
        this.bg.vars.setValue(name, value);
    },

    printUserLinks: function (links) {
        var self = this;
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
                        self.saveUserLinks();
                    });
                }
                inputs[0].value = links[i].url;
                inputs[1].value = links[i].title;
            }
        } else {
            let userLinkInputs = document.querySelectorAll('.userLinkDiv input');
            for (let i = 0; i < userLinkInputs.length; i++) {
                userLinkInputs[i].addEventListener('change', function() {
                    self.saveUserLinks();
                });
            }
        }
    },

    saveUserLinks: function () {
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
        this.setValue('user_links', result);
    }
};

options.init();