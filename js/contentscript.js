inspector4pda.cScript = {

	winobj: null,
	button: null,
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

	init: function(el)
	{
		inspector4pda.cScript.request();
		chrome.notifications.onClicked.addListener(inspector4pda.cScript.notificationClick);
	},

	request: function(interval)
	{
		inspector4pda.vars.getPrefs();

		clearTimeout(inspector4pda.cScript.updateTimer);
		inspector4pda.cScript.getData();

		//console.log('request', inspector4pda.vars.interval);

		inspector4pda.cScript.updateTimer = setTimeout(function() {
			inspector4pda.cScript.request();
		}, (interval || inspector4pda.vars.interval));
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
		// http://chrome-ext.blogspot.ru/2014/02/browser-actions.html
		if (!inspector4pda.user.id) {
			inspector4pda.cScript.printLogout();
			return;
		}
		chrome.browserAction.setIcon({
			path: '/icons/icon_19.png'
		});
		var qCount = inspector4pda.QMS.getCount();
		var tCount = inspector4pda.themes.getCount();

		if (qCount) {
			chrome.browserAction.setBadgeBackgroundColor({ color: this.hasQmsColor });
		} else {
			chrome.browserAction.setBadgeBackgroundColor({ color: this.defaultColor });
		}

		chrome.browserAction.setBadgeText({text: '' + tCount });
		//chrome.browserAction.setBadgeText({text: qCount + '-' + tCount });

		chrome.browserAction.setTitle({'title': inspector4pda.utils.getString("4PDA_online") +
			'\n' + inspector4pda.utils.getString("Unread Topics") + ': ' + tCount + 
			'\n' + inspector4pda.utils.getString("New Messages") + ': ' + qCount
		});
	},

	printLogout: function(unavailable)
	{
		chrome.browserAction.setBadgeText({ text: "logout" });
		chrome.browserAction.setBadgeBackgroundColor({ color: this.logoutColor });
		chrome.browserAction.setIcon({path: '/icons/icon_19_out.png'});

		chrome.browserAction.setTitle({'title': unavailable?
					inspector4pda.utils.getString("4PDA_Site Unavailable"):
					inspector4pda.utils.getString("4PDA_offline")
		});
	},

	checkNews: function () {
		var hasNews = false;

		if (!(inspector4pda.vars.notification_popup || inspector4pda.vars.notification_sound)) {
			return false;
		}

		for (var i in inspector4pda.QMS.list) {
			var addNot = false
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
					title: inspector4pda.utils.getString('New Message'),
					body: inspector4pda.QMS.list[i].opponent_id?
							inspector4pda.utils.htmlspecialcharsdecode(inspector4pda.QMS.list[i].opponent_name) +
							' (' + inspector4pda.utils.htmlspecialcharsdecode(inspector4pda.QMS.list[i].title) + ')':
							inspector4pda.utils.htmlspecialcharsdecode(inspector4pda.QMS.list[i].title),
					type: 'qms',
					id: inspector4pda.QMS.list[i].opponent_id + '_' + inspector4pda.QMS.list[i].id
				});
			};
		}

		for (var i in inspector4pda.themes.list) {
			if (typeof inspector4pda.cScript.prevData.themes[i] == 'undefined') {
				hasNews = true;
				inspector4pda.cScript.notifications.push({
					title: inspector4pda.utils.getString('New Comment'),
					body: inspector4pda.utils.htmlspecialcharsdecode(inspector4pda.themes.list[i].title),
					type: 'theme',
					id: i
				});
			}
		}
		if (hasNews) {
			if (inspector4pda.vars.notification_sound) {
				var soundElement = document.getElementById("inspector4pda_sound");
				soundElement.volume = inspector4pda.vars.notification_sound_volume;
				soundElement.play();
			};
			if (inspector4pda.vars.notification_popup) {
				inspector4pda.cScript.showNotifications();
			};
		};
	},

	showNotifications: function() {
		if (!inspector4pda.cScript.notifications.length) {
			return false;
		}

		var currentNotification = inspector4pda.cScript.notifications.shift();

		var icon;
		switch (currentNotification.type) {
			case "info_SiteUnavailable":
				icon = "/icons/icon_80_out.png";
				break;
			default:
				icon = "/icons/icon_80.png";
		}

		chrome.notifications.create("4pdainspector_" + currentNotification.type + '_' + currentNotification.id, {
			type: "basic",
			title: currentNotification.body,
			message: currentNotification.title,
			iconUrl: icon,
			isClickable: true
		});

		chrome.notifications.onClicked.addListener(function () {});

		setTimeout(function() {
			inspector4pda.cScript.showNotifications();
		}, 50);
	},

	notificationClick: function(tag) {
		var tagData = tag.split('_');

		if (typeof tagData[1] == 'undefined' || typeof tagData[2] == 'undefined') {
			//ulog(tag);
			return false;
		}

		if (tagData[1] == 'qms'){
			inspector4pda.QMS.openChat(parseInt(tagData[2]), (typeof tagData[3] == 'undefined' ? false : parseInt(tagData[3])));
		} else if (tagData[1] == 'theme') {
			inspector4pda.themes.open(parseInt(tagData[2]));
		} else {
			this.cancel();
		}
		inspector4pda.cScript.printCount();
	},

	settingsAccept: function() {
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
			title: inspector4pda.utils.getString('4PDA Inspector'),
			body: inspector4pda.utils.getString('4PDA_Site Unavailable'),
			type: 'info_SiteUnavailable',
			id: 0
		});
		inspector4pda.cScript.showNotifications();
	},

	getPanelButton: function() {
		if (!inspector4pda.cScript.button) {
			inspector4pda.cScript.button = inspector4pda.cScript.winobj.getElementById('inspector4pda_button');
		}
		return inspector4pda.cScript.button;
	},

	setButtonImage: function(image) {
		chrome.browserAction.setIcon({
			imageData: image
		});
	}
};

inspector4pda.cScript.init();