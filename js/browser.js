if (typeof inspector4pda == "undefined") {
    var inspector4pda = {}
}

inspector4pda.browser = {

    translates: {
        "4PDA Inspector":   "4PDA Инспектор",
        "No unread topics": "Непрочитанных тем нет",
        "Mark As Read":     "Пометить как прочитанное",
        "New Message":      "Новое сообщение",
        "New Comment":      "Новый комментарий",
        "Unread Topics":    "Непрочитанных тем",
        "New Messages":     "Новых сообщений",
        "4PDA_online":      "4PDA - В сети",
        "Open Last Post":   "Открыть последнее сообщение",
        "4PDA_offline":     "4PDA - Не в сети",
        "4PDA_Site Unavailable": "4PDA - Сайт недоступен",
        "You Are Not Authorized": "Вы не авторизованы",
        "Remove From Favorites": "Удалить из избранного",
        "Add To Favorites": "Добавить в избранное",
        "4PDA Messages":    "Сообщения 4PDA"
    },

    getString: function(name) {

        if (this.translates.hasOwnProperty(name)) {
            return this.translates[name];
        } else {
            return name;
        }
    },

    csInit: function() {
        chrome.notifications.onClicked.addListener(inspector4pda.cScript.notificationClick);
    },

    showNotification: function(params) {

        var defaultParams = {
            id: '4pdainspector_test_' + (new Date().getTime()),
            title: this.getString("4PDA Inspector"),
            message: 'Оповещения успешно включены',
            iconUrl: "/icons/icon_80.png"
        };

        params = this.mergeObjects(defaultParams, params);

        chrome.notifications.create(params.id, {
            type: "basic",
            title: params.title,
            message: params.message,
            iconUrl: 'chrome-extension://' + chrome.i18n.getMessage("@@extension_id") + params.iconUrl,
            isClickable: true
        });
    },

    mergeObjects: function(ar1, ar2) {
        if (typeof Object.assign != 'function') {
            Object.prototype.assign = function(ar1, ar2) {
                for (var i in ar2) {
                    ar1[i] = ar2[i];
                }
                return ar1;
            };
        }
        return Object.assign(ar1, ar2)
    },

    setButtonIcon: function(icon) {
        chrome.browserAction.setIcon({path: icon});
    },

    setBadgeBackgroundColor: function(color) {
        chrome.browserAction.setBadgeBackgroundColor({'color': color });
    },

    setBadgeText: function(text) {
        chrome.browserAction.setBadgeText({'text': text.toString() });
    },

    setTitle: function(text) {
        chrome.browserAction.setTitle({'title': text.toString()});
    },

    printCount: function(qCount, tCount) {
        if (qCount) {
            inspector4pda.browser.setButtonIcon(inspector4pda.cScript.hasQmsIcon);
            inspector4pda.browser.setBadgeBackgroundColor(inspector4pda.cScript.hasQmsColor);
        } else {
            inspector4pda.browser.setButtonIcon(inspector4pda.cScript.defaultIcon);
            inspector4pda.browser.setBadgeBackgroundColor(inspector4pda.cScript.defaultColor);
        }

        this.setBadgeText(tCount ? tCount : '');

        this.setTitle(
            this.getString("4PDA_online") + '\n' +
            this.getString("Unread Topics") + ': ' + tCount + '\n' +
            this.getString("New Messages") + ': ' + qCount
        );
    },

    playNotificationSound: function() {
        var soundElement = document.getElementById("inspector4pda_sound");
        soundElement.volume = inspector4pda.vars.notification_sound_volume;
        soundElement.play();
    },

    log: function(msg) {
        console.log(msg);
    },

    openPage: function(page, setActive, callback) {

        chrome.tabs.query({
            url: page
        }, function (tab) {
            if (tab && tab.length) {
                var tabId = parseInt(tab[0].id);
                chrome.tabs.reload(tabId, {}, callback);
                if (setActive) {
                    chrome.tabs.highlight({
                        tabs: tab[0].index
                    });
                }
            } else {
                chrome.tabs.create({
                    url: page,
                    active: setActive
                }, callback);
            }
        });
    },

    getVarsStorageObject: function() {
        return localStorage;
    },

    setVarToStorage: function(field, value) {
        localStorage[field] = value;
    }

};