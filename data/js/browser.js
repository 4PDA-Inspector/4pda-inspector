if (typeof inspector4pda == "undefined") {
	var inspector4pda = {};
}

inspector4pda.browser = {

	urls: {
		login: 'http://4pda.ru/forum/index.php?act=login',
		QMS: 'http://4pda.ru/forum/index.php?act=qms',
		themes: 'http://4pda.ru/forum/index.php?act=fav',
		settings: './html/options.html'
	},

	currentBuild: '20160127-0341',

	defaultIcon: './icons/icon_19.png',
	hasQmsIcon: './icons/icon_19_qms.png',
	logoutIcon: './icons/icon_19_out.png',

	notificationIcon: "./icons/icon_80.png",
	notificationQMSIcon: "./icons/icon_80_message.png",
	notificationThemeIcon: "./icons/icon_80_favorite.png",
	notificationOutIcon: "./icons/icon_80_out.png",

	defaultColor: '#3F51B5', //[63, 81, 181, 255],
	hasQmsColor: '#4CAF50',// [76, 175, 80, 255],
	logoutColor: '#9E9E9E', //[158, 158, 158, 255],

	bgClass: null, //chrome.extension.getBackgroundPage().inspector4pda,

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

	sdk: {
		storage: require("sdk/simple-storage").storage,
		prefs: require("sdk/simple-prefs").prefs,
		button: null,
		cookies: Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager2),
		tabs: require("sdk/tabs"),
		notifications: require("sdk/notifications")
	},

	getString: function(name) {

		if (this.translates.hasOwnProperty(name)) {
			return this.translates[name];
		} else {
			return name;
		}
	},

	csInit: function() {
		var self = this,
			panel = self.initPanel();

		// https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/ui_button_action
		self.sdk.button = require("sdk/ui/button/toggle").ToggleButton({
			id: "main",
			label: "4PDA Inspector",
			icon: this.defaultIcon,
			onChange: function(state) {

				if (!inspector4pda.user.id) {
					inspector4pda.utils.openPage(inspector4pda.browser.urls.login, true);
					self.sdk.button.state('window', {checked: false});
					return false;
				}

				if (state.checked) {
					panel.show({
						position: self.sdk.button
					});
				}
			}
		});

		require("sdk/simple-prefs").on("", function(prefName) {
			inspector4pda.vars.data[prefName] = inspector4pda.browser.getStorageVar(prefName);
		});

		/*
		var build = this.bgClass.vars.data.build;
		if (!build || build < this.currentBuild) {
			this.openPage(chrome.extension.getURL('html/whatsnew.html'));
			this.bgClass.vars.setValue('build', this.currentBuild);
		}*/
	},

	getPanelData: function() {
		return {
			bg: inspector4pda,
			themes: {
				count: inspector4pda.themes.getCount(),
				pinCount: inspector4pda.themes.getPinCount(),
				sortedKeys: inspector4pda.themes.getSortedKeys(),
				list: inspector4pda.themes.list
			},
			qms: {
				count: inspector4pda.QMS.getCount()
			},
			user: {
				id: inspector4pda.user.id,
				name: inspector4pda.user.name
			},
			vars: inspector4pda.vars.data,
			translates: inspector4pda.browser.translates
		};
	},

	initPanel: function() {
		var panels = require("sdk/panel"),
			self = this;

		var panel = panels.Panel({
			contentURL: "./html/popup.html",
			contentStyleFile: "./css/popup.css",
			contentScriptFile: ['./js/popup.js'],
			onShow: function() {
				panel.port.emit('show-event', self.getPanelData());
			},
			onHide: function() {
				self.sdk.button.state('window', {checked: false});
			}
		});
		panel.port.on('do-first-request', function() {
			inspector4pda.cScript.firstRequest(function() {
				panel.port.emit('show-event', self.getPanelData());
			});
		});
		panel.port.on('update-data', function() {
			panel.port.emit('updated-data', self.getPanelData());
		});
		panel.port.on('panel-resize', function(size) {
			panel.resize(size.width, size.height);
		});
		panel.port.on('button-print-count', function() {
			inspector4pda.cScript.printCount();
		});
		panel.port.on('open-page', function(page) {
			if (typeof inspector4pda.browser.urls[page] == 'string') {
				inspector4pda.utils.openPage(inspector4pda.browser.urls[page], true);
			} else {
				inspector4pda.utils.openPage(page, true);
			}
		});
		panel.port.on('open-theme-page', function(id) {
			inspector4pda.themes.open(id);
		});
		panel.port.on('open-all-themes', function() {
			inspector4pda.themes.openAll();
			panel.port.emit('show-event', self.getPanelData());
		});
		panel.port.on('read-all-themes', function() {
			inspector4pda.themes.readAll();
			panel.port.emit('show-event', self.getPanelData());
		});
		panel.port.on('open-all-pin-themes', function() {
			inspector4pda.themes.openAllPin();
			panel.port.emit('show-event', self.getPanelData());
		});
		panel.port.on('open-user-page', function() {
			inspector4pda.user.open();
		});
		panel.port.on('open-settings-page', function() {

			self.sdk.tabs.open({
				url: self.urls.settings,
				onReady: function onOpen(tab) {
					var worker = tab.attach({
						contentScriptFile: './js/options.js'
					});
					worker.port.emit('start', inspector4pda.vars.getAll());
					worker.port.on("setValue", function(name, value) {
						inspector4pda.vars.setValue(name, value);
					});
					worker.port.on("showQMSNotification", function() {
						self.showNotification({
							message: "Оповещения о QMS успешно включены",
							iconUrl: self.notificationQMSIcon
						});
					});
					worker.port.on("showThemesNotification", function() {
						self.showNotification({
							message: "Оповещения о темах успешно включены",
							iconUrl: bg.browser.notificationThemeIcon
						});
					});
					worker.port.on("playNotificationSound", function() {
						self.playNotificationSound();
					});
				}
			});
		});
		panel.port.on('read-theme', function(id) {
			inspector4pda.themes.read(id, function () {
				panel.port.emit('theme-readed', id);
			});
		});
		panel.port.on('counts-update', function(id) {
			panel.port.emit('counts-updated', {
				qms: inspector4pda.QMS.getCount(),
				themes: inspector4pda.themes.getCount()
			});
		});
		panel.port.on('open-theme-last-page', function(id) {
			inspector4pda.themes.openLast(id);
		});
		panel.port.on('panel-hide', function(check) {
			if (check) {
				if (inspector4pda.vars.data.toolbar_opentheme_hide) {
					panel.hide();
				}
			} else {
				panel.hide();
			}
		});

		return panel;
	},

	showNotification: function(params) {
		var defaultParams = {
			id: '4pdainspector_test_' + (new Date().getTime()),
			title: this.getString("4PDA Inspector"),
			message: 'Оповещения успешно включены',
			iconUrl: this.notificationIcon
		};

		params = this.mergeObjects(defaultParams, params);

		this.sdk.notifications.notify({
			title: params.title,
			text: params.message,
			data: params.id,
			iconURL: params.iconUrl,
			onClick: function(data) {
				inspector4pda.cScript.notificationClick(data);
			}
		});
	},

	clearNotification: function(id) {
		//chrome.notifications.clear(id);
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
		this.sdk.button.icon = icon;
	},

	setBadgeBackgroundColor: function(color) {
		this.sdk.button.badgeColor = color;
	},

	setBadgeText: function(text) {
		this.sdk.button.badge = text.toString();
	},

	setTitle: function(text) {
		this.sdk.button.label = text.toString();
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

		require("sdk/page-worker").Page({
			contentScript: "var audio = new Audio('../sound/sound3.ogg'); audio.volume = " + inspector4pda.vars.data.notification_sound_volume + "; audio.play();",
			contentURL: sdkSelf.data.url("html/blank.html")
		});
	},

	openPage: function(page, setActive, callback) {

		return this.sdk.tabs.open(page);

		/*chrome.tabs.query({
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
		});*/
	},

	getCookie: function(cookieName, callback) {

		var cooks = this.sdk.cookies.getCookiesFromHost("4pda.ru"),
			result = false;
		while (cooks.hasMoreElements()) {
			var cookie = cooks.getNext().QueryInterface(Ci.nsICookie2);
			if (cookie.name == cookieName) {
				result = cookie.value;
			}
		}

		callback(result);
	},

	getStorageVar: function(name) {
		return this.sdk.prefs[name];
	},

	setStorageVar: function(name, value) {
		return this.sdk.prefs[name] = value;
	},

	sendRequest: function(url, success) {
		var Request = require("sdk/request").Request;
		Request({
			url: url,
			onComplete: function (response) {
				success(response.text);
			}
		}).get();
	}

};