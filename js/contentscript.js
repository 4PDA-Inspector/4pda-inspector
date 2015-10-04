inspector4pda.cScript = {

	updateTimer: 0,
	prevData: {
		themes: {},
		QMS: {}
	},
	requestsCount: 0,
	notifications: [],
	successLastRequest: true,

	defaultColor: [63, 81, 181, 255],
	hasQmsColor: [76, 175, 80, 255],
	logoutColor: [158, 158, 158, 255],

	defaultIcon: '/icons/icon_19.png',
	hasQmsIcon: '/icons/icon_19_green.png',
	logoutIcon: '/icons/icon_19_out.png',

	notificationIcon: "/icons/icon_80.png",
	notificationQMSIcon: "/icons/icon_80_message.png",
	notificationThemeIcon: "/icons/icon_80_favorite.png",
	notificationOutIcon: "/icons/icon_80_out.png",

	systemMessagesTitle: "Сообщения 4PDA",

	init: function(el)
	{
		inspector4pda.browser.csInit();
		inspector4pda.cScript.request();
	},

	request: function(interval)
	{
		inspector4pda.vars.getPrefs();

		clearTimeout(inspector4pda.cScript.updateTimer);
		inspector4pda.cScript.getData();

		inspector4pda.cScript.updateTimer = setTimeout(function() {
			inspector4pda.cScript.request();
		}, (interval || inspector4pda.vars.interval * 1000));
	},

	getData: function(callback)
	{
		var finishCallback = function(){
			inspector4pda.cScript.printCount();
			if (inspector4pda.user.id && inspector4pda.cScript.requestsCount++) {
				inspector4pda.cScript.checkNews();
			}
			if (typeof callback == 'function') {
				callback();
			}
		};

		inspector4pda.cScript.prevData.themes = inspector4pda.themes.list;
		inspector4pda.cScript.prevData.QMS = inspector4pda.QMS.list;
		inspector4pda.user.request(function() {
			inspector4pda.cScript.successLastRequest = true;
			if (inspector4pda.user.id) {
				inspector4pda.themes.request(function() {
					inspector4pda.QMS.request(finishCallback);
				});
			} else {
				inspector4pda.cScript.requestsCount = 0;
				finishCallback();
				inspector4pda.cScript.clearData();
			}
		}, function() {
			if (inspector4pda.cScript.successLastRequest) {
				inspector4pda.cScript.siteUnavailableNotification();
			}
			inspector4pda.cScript.successLastRequest = false;
			inspector4pda.cScript.clearData();
			if (typeof callback == 'function') {
				callback();
			}
		});
	},

	printCount: function()
	{
		if (!inspector4pda.user.id) {
			inspector4pda.cScript.printLogout();
			return;
		}
		var qCount = inspector4pda.QMS.getCount();
		var tCount = inspector4pda.themes.getCount();

		inspector4pda.browser.printCount(qCount, tCount);
	},

	printLogout: function(unavailable)
	{
		var iBrowser = inspector4pda.browser;

		iBrowser.setBadgeText('login');
		iBrowser.setBadgeBackgroundColor(this.logoutColor);
		iBrowser.setButtonIcon(this.logoutIcon);
		iBrowser.setTitle( iBrowser.getString( unavailable ? "4PDA_Site Unavailable" : "4PDA_offline" ) );
	},

	checkNews: function () {
		var hasNews = false;

		if (!(inspector4pda.vars.notification_popup || inspector4pda.vars.notification_sound)) {
			return false;
		}

		for (var i in inspector4pda.QMS.list) {
			var addNot = false;
			if (typeof inspector4pda.cScript.prevData.QMS[i] == 'undefined') {
				addNot = true;
			} else {
				if (inspector4pda.cScript.prevData.QMS[i].unread_msgs < inspector4pda.QMS.list[i].unread_msgs) {
					addNot = true;
				}
			}

			if (addNot) {
				hasNews = true;
				inspector4pda.cScript.notifications.push({
					title: parseInt(inspector4pda.QMS.list[i].opponent_id) ? inspector4pda.utils.htmlspecialcharsdecode(inspector4pda.QMS.list[i].opponent_name) : this.systemMessagesTitle,
					body: inspector4pda.utils.htmlspecialcharsdecode(inspector4pda.QMS.list[i].title) + ' (' + inspector4pda.QMS.list[i].unread_msgs + ')',
					type: 'qms',
					id: inspector4pda.QMS.list[i].opponent_id + '_' + inspector4pda.QMS.list[i].id
				});
			}
		}

		for (var j in inspector4pda.themes.list) {
			if (typeof inspector4pda.cScript.prevData.themes[j] == 'undefined') {
				hasNews = true;
				inspector4pda.cScript.notifications.push({
					title: inspector4pda.utils.htmlspecialcharsdecode(inspector4pda.themes.list[j].title),
					body: inspector4pda.utils.htmlspecialcharsdecode(inspector4pda.themes.list[j].last_user_name),
					type: 'theme',
					id: j
				});
			}
		}
		if (hasNews) {
			if (inspector4pda.vars.notification_sound) {
				inspector4pda.browser.playNotificationSound();
			}
			if (inspector4pda.vars.notification_popup) {
				inspector4pda.cScript.showNotifications();
			}
		}
	},

	showNotifications: function() {
		if (!inspector4pda.cScript.notifications.length) {
			return false;
		}

		var currentNotification = inspector4pda.cScript.notifications.shift();

		var icon;
		switch (currentNotification.type) {
			case "info_SiteUnavailable":
				icon = this.notificationOutIcon;
				break;
			case "theme":
				icon = this.notificationThemeIcon;
				break;
			case "qms":
				icon = this.notificationQMSIcon;
				break;
			default:
				icon = this.notificationIcon;
		}

		inspector4pda.browser.showNotification({
			id: "4pdainspector_" + currentNotification.type + '_' + currentNotification.id + '_' + (new Date().getTime()),
			title: currentNotification.title,
			message: currentNotification.body,
			iconUrl: icon,
			isClickable: true
		});

		setTimeout(function() {
			inspector4pda.cScript.showNotifications();
		}, 50);
	},

	notificationClick: function(tag) {
		var tagData = tag.split('_');

		if (typeof tagData[1] == 'undefined' || typeof tagData[2] == 'undefined') {
			return false;
		}

		if (tagData[1] == 'qms'){
			inspector4pda.QMS.openChat(parseInt(tagData[2]), (typeof tagData[3] == 'undefined' ? false : parseInt(tagData[3])), true);
		} else if (tagData[1] == 'theme') {
			inspector4pda.themes.open(parseInt(tagData[2]), true);
		} else {
			this.cancel();
		}
		inspector4pda.cScript.printCount();
	},

	settingsAccept: function() {
		// Chrome - TODO
		inspector4pda.cScript.request();
	},

	clearData: function() {
		inspector4pda.user.clearData();
	},

	siteUnavailableNotification: function() {

		if (!inspector4pda.vars.notification_popup) {
			return false;
		}

		inspector4pda.cScript.notifications.push({
			title: inspector4pda.browser.getString('4PDA Inspector'),
			body: inspector4pda.browser.getString('4PDA_Site Unavailable'),
			type: 'info_SiteUnavailable',
			id: 0
		});
		inspector4pda.cScript.showNotifications();
	}
};

inspector4pda.cScript.init();