if (typeof inspector4pda == "undefined") {
    var inspector4pda = {}
}

inspector4pda.browser = {

    currentBuild: '20151025-1711',

    defaultIcon: '/icons/icon_19.png',
    hasQmsIcon: '/icons/icon_19_qms.png',
    logoutIcon: '/icons/icon_19_out.png',

    notificationIcon: "/icons/icon_80.png",
    notificationQMSIcon: "/icons/icon_80_message.png",
    notificationThemeIcon: "/icons/icon_80_favorite.png",
    notificationOutIcon: "/icons/icon_80_out.png",

    defaultColor: [63, 81, 181, 255],
    hasQmsColor: [76, 175, 80, 255],
    logoutColor: [158, 158, 158, 255],

    bgClass: chrome.extension.getBackgroundPage().inspector4pda,

    translates: {
        "4PDA Inspector":   "4PDA Инспектор",
        "No unread topics": "Непрочитанных тем нет",
        "Mark As Read":     "Пометить как прочитанное",
        "New Message":      "Новое сообщение",
        "New Comment":      "Новый комментарий",
        "Unread Topics":    "Непрочитанных тем",
        "Unread Dialogs":   "Непрочитанных диалогов",
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
        chrome.notifications.onClicked.addListener(this.bgClass.cScript.notificationClick);

        var build = this.bgClass.vars.getValue('build', false);
        if (!build || build < this.currentBuild) {
            this.openPage('chrome-extension://' + chrome.i18n.getMessage("@@extension_id") + '/html/whatsnew.html');
            this.bgClass.vars.setValue('build', this.currentBuild);
        }
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

        setTimeout(function() {
            inspector4pda.browser.clearNotification(params.id);
        }, 30000);
    },

    clearNotification: function(id) {
        chrome.notifications.clear(id);
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
            inspector4pda.browser.setButtonIcon(inspector4pda.browser.hasQmsIcon);
            inspector4pda.browser.setBadgeBackgroundColor(inspector4pda.browser.hasQmsColor);
        } else {
            inspector4pda.browser.setButtonIcon(inspector4pda.browser.defaultIcon);
            inspector4pda.browser.setBadgeBackgroundColor(inspector4pda.browser.defaultColor);
        }

        this.setBadgeText(tCount ? tCount : '');

        this.setTitle(
            this.getString("4PDA_online") + '\n' +
            this.getString("Unread Topics") + ': ' + tCount + '\n' +
            this.getString("Unread Dialogs") + ': ' + qCount
        );
    },

    playNotificationSound: function() {
        var soundElement = document.getElementById("inspector4pda_sound");
        soundElement.volume = this.bgClass.vars.notification_sound_volume;
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

                var currentTab = tab[0];
                var tabId = parseInt(currentTab.id);
                var tabWindowId = parseInt(currentTab.windowId);

                chrome.windows.getCurrent( {populate:false}, function(window) {

                    var moveProperties = {
                        index: -1
                    };
                    if (window.id == tabWindowId || currentTab.pinned) {
                        moveProperties.index = currentTab.index;
                    } else {
                        moveProperties.windowId = window.id;
                        tabWindowId = window.id;
                    }

                    chrome.tabs.move(tabId, moveProperties, function(tab) {
                        if (setActive) {
                            chrome.tabs.highlight({
                                tabs: tab.index,
                                windowId: tabWindowId
                            });
                        }
                        chrome.tabs.reload(tab.id, {}, callback);
                    });
                });
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