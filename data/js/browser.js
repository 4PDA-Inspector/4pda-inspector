if (typeof inspector4pda == "undefined") {
	var inspector4pda = {};
}
var _ = require("sdk/l10n").get;

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
		"4PDA Inspector":_("4PDA Inspector"),
		"No unread topics":_("No unread topics"),
		"Mark As Read":_("Mark As Read"),
		"New Message":_("New Message"),
		"New Comment":_("New Comment"),
		"Unread Topics":_("Unread Topics"),
		"Unread Dialogs":_("Unread Dialogs"),
		"New Messages":_("New Messages"),
		"4PDA_online":_("4PDA_online"),
		"Open Last Post":_("Open Last Post"),
		"4PDA_offline":_("4PDA_offline"),
		"4PDA_Site Unavailable":_("4PDA_Site Unavailable"),
		"You Are Not Authorized":_("You Are Not Authorized"),
		"Remove From Favorites":_("Remove From Favorites"),
		"Add To Favorites":_("Add To Favorites"),
		"4PDA Messages":_("4PDA Messages"),
		"Notifications are enabled": _("Notifications are enabled"),
		"Notifications about themes enabled": _("Notifications about themes enabled"),
		"Notifications about QMS enabled": _("Notifications about QMS enabled")
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

		for (let tab of self.sdk.tabs) {
			if (tab.url == 'resource://4pda_inspector-at-coddism-dot-com/data/html/options.html') {
				tab.close();
			}
		}

		// https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/ui_button_action
		self.sdk.button = require("sdk/ui/button/toggle").ToggleButton({
			id: "main",
			label: "4PDA Inspector",
			/*icon: {
				"16": "./icon-16.png",
				"32": "./icon-32.png",
				"64": "./icon-64.png"
			},*/
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
					require('sdk/view/core').getActiveView(panel).setAttribute('tooltip', 'aHTMLTooltip');
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
			self.openSettingsPage();
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

	openSettingsPage: function() {
		var self = this;
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
						message: self.getString('Notifications about QMS enabled'),
						iconUrl: self.notificationQMSIcon
					});
				});
				worker.port.on("showThemesNotification", function() {
					self.showNotification({
						message: self.getString('Notifications about themes enabled'),
						iconUrl: self.notificationThemeIcon
					});
				});
				worker.port.on("playNotificationSound", function() {
					self.playNotificationSound();
				});
			}
		});
	},

	showNotification: function(params) {
		var defaultParams = {
			id: '4pdainspector_test_' + (new Date().getTime()),
			title: this.getString("4PDA Inspector"),
			message: this.getString('Notifications are enabled'),
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
			contentScript: "var audio = new Audio('../sound/sound3.ogg'); audio.volume = " + (inspector4pda.vars.data.notification_sound_volume / 100) + "; audio.play();",
			contentURL: sdkSelf.data.url("html/blank.html")
		});
	},

	openPage: function(page, setActive, callback) {

		var actualTab = null,
			browserWindows = require("sdk/windows").browserWindows;

		for (let tab of browserWindows.activeWindow.tabs) {
			if (tab.url == page) {
				actualTab = tab;
				break;
			}
		}
		if (actualTab) {
			actualTab.activate();
			actualTab.reload();
			return actualTab;
		} else {
			return this.sdk.tabs.open(page);
		}
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