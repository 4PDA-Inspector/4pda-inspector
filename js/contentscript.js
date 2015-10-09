inspector4pda.cScript = {

	updateTimer: 0,
	prevData: {
		themes: {},
		QMS: {}
	},
	requestsCount: 0,
	notifications: [],
	successLastRequest: true,

	systemNotificationTitle: inspector4pda.browser.getString("4PDA Messages"),
	systemNotificationErrorType: 'site_unavailable',

	init: function(el)
	{
		inspector4pda.browser.csInit();
		inspector4pda.cScript.request();
	},

	request: function(interval, callback)
	{
		inspector4pda.vars.getPrefs();

		clearTimeout(inspector4pda.cScript.updateTimer);
		inspector4pda.cScript.getData(callback);

		//console.log((new Date()).toLocaleString(), 'request', inspector4pda.vars.interval);

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

		inspector4pda.cScript.prevData.themes = Object.create(inspector4pda.themes.list);
		inspector4pda.cScript.prevData.QMS = Object.create(inspector4pda.QMS.list);
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
			/*if (inspector4pda.cScript.successLastRequest) {
				inspector4pda.cScript.siteUnavailableNotification();
			}*/
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

		iBrowser.setBadgeText(unavailable ? "N/A" : 'login');
		iBrowser.setBadgeBackgroundColor(iBrowser.logoutColor);
		iBrowser.setButtonIcon(iBrowser.logoutIcon);
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
				if (inspector4pda.cScript.prevData.QMS[i].last_msg_ts < inspector4pda.QMS.list[i].last_msg_ts) {
					addNot = true;
				}
			}

			if (addNot) {
				hasNews = true;
				inspector4pda.cScript.addNotification(
					inspector4pda.QMS.list[i].opponent_id + '_' + inspector4pda.QMS.list[i].id + '_' + inspector4pda.QMS.list[i].last_msg_ts,
					'qms',
					parseInt(inspector4pda.QMS.list[i].opponent_id) ?
						inspector4pda.utils.htmlspecialcharsdecode(inspector4pda.QMS.list[i].opponent_name) :
						this.systemNotificationTitle,
					inspector4pda.utils.htmlspecialcharsdecode(inspector4pda.QMS.list[i].title) + ' (' + inspector4pda.QMS.list[i].unread_msgs + ')'
				);
			}
		}

		var themesIds = inspector4pda.themes.getThemesIds(true);
		themesIds.forEach(function(j) {
			var prevTheme = inspector4pda.cScript.prevData.themes[j];
			var newTheme = inspector4pda.themes.list[j];

			if (
				(typeof prevTheme == 'undefined' ||
				(prevTheme.isRead() && (prevTheme.last_post_ts < newTheme.last_post_ts ) ))
				&& (newTheme.last_user_id != inspector4pda.user.id)
			) {
				hasNews = true;
				inspector4pda.cScript.addNotification(
					j,
					'theme',
					inspector4pda.utils.htmlspecialcharsdecode(newTheme.title),
					inspector4pda.utils.htmlspecialcharsdecode(newTheme.last_user_name)
				);
			}
		});
		if (hasNews) {
			if (inspector4pda.vars.notification_sound) {
				inspector4pda.browser.playNotificationSound();
			}
			if (inspector4pda.vars.notification_popup) {
				inspector4pda.cScript.showNotifications();
			}
		}
	},

	addNotification: function(id, type, title, message) {

		if (!inspector4pda.vars.notification_popup) {
			return false;
		}

		var icon;
		var notificationId = "4pdainspector_" + type + '_' + id;

		switch (type) {
			case this.systemNotificationErrorType:
				icon = inspector4pda.browser.notificationOutIcon;
				notificationId += '_' + (new Date().getTime());
				break;
			case "theme":
				icon = inspector4pda.browser.notificationThemeIcon;
				notificationId += '_' + inspector4pda.themes.list[id].last_read_ts;
				break;
			case "qms":
				icon = inspector4pda.browser.notificationQMSIcon;
				break;
			default:
				icon = inspector4pda.browser.notificationIcon;
				notificationId += '_' + (new Date().getTime());
		}

		inspector4pda.cScript.notifications.push({
			title: title,
			body: message,
			type: type,
			id: notificationId,
			icon: icon
		});
	},

	showNotifications: function() {
		if (!inspector4pda.cScript.notifications.length) {
			return false;
		}

		var currentNotification = inspector4pda.cScript.notifications.shift();

		inspector4pda.browser.showNotification({
			id: currentNotification.id,
			title: currentNotification.title,
			message: currentNotification.body,
			iconUrl: currentNotification.icon
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
		inspector4pda.cScript.addNotification(
			0,
			this.systemNotificationErrorType,
			inspector4pda.browser.getString('4PDA Inspector'),
			inspector4pda.browser.getString('4PDA_Site Unavailable')
		);
		inspector4pda.cScript.showNotifications();
	}
};

inspector4pda.cScript.init();