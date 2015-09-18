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

		console.log('request', inspector4pda.vars.interval);

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
			};
		});
	},

	printCount: function()
	{
		// http://chrome-ext.blogspot.ru/2014/02/browser-actions.html
		if (!inspector4pda.user.id) {
			inspector4pda.cScript.printLogout();
			return;
		}
		var qCount = inspector4pda.QMS.getCount();
		var tCount = inspector4pda.themes.getCount();

		chrome.browserAction.setBadgeText({text: qCount + '-' + tCount });
		/*console.log('print count');
		return false;*/

		/*var btn = inspector4pda.cScript.getPanelButton();
		if (!btn) {
			return false;
		}*/

		/*var canvas_width = 20;
		var canvas_height = 18;
		var canvas_img = "chrome://4pdainspector/content/icons/icon_16x.png";
		var title_padding = 2;
		var fontSize = inspector4pda.vars.button_fontsize;

		if (inspector4pda.vars.button_big) {
			var canvas_width = 26;
			var canvas_height = 24;
			var canvas_img = "chrome://4pdainspector/content/icons/icon_22x.png";
		}

		var button_bgcolor = inspector4pda.vars.button_bgcolor;
		var button_color = inspector4pda.vars.button_color;

		var canvas = inspector4pda.cScript.winobj.getElementById("inspector4pda_canvas");
		canvas.setAttribute("width", canvas_width);
		canvas.setAttribute("height", canvas_height);
		var ctx = canvas.getContext("2d");

		var img = new Image();
		img.onload = function()
		{
			ctx.textBaseline = 'top';
			ctx.font = 'bold '+fontSize+'px tahoma,arial,sans-serif';
			ctx.clearRect(0, 0, canvas_width, canvas_height);
			ctx.drawImage(img, 2, 0, img.width, img.height);

			var w = ctx.measureText(tCount).width;
			var h = fontSize + title_padding;

			var x = canvas_width - w;
			var y = canvas_height - h;

			if (inspector4pda.vars.button_show_themes && (!inspector4pda.vars.button_show_onlyMoreZero || tCount) ) {
				ctx.fillStyle = button_bgcolor;
				ctx.fillRect(x-1, y, w+1, h);
				ctx.fillStyle = button_color;
				ctx.fillText(tCount, x, y+1);
			}

			if (inspector4pda.vars.button_show_qms && (!inspector4pda.vars.button_show_onlyMoreZero || qCount)) {
				var w = ctx.measureText(qCount).width;
				ctx.fillStyle = button_bgcolor;
				ctx.fillRect(0, y, w+2, h);
				ctx.fillStyle = button_color;
				ctx.fillText(qCount, 1, y+1);
			};

			inspector4pda.cScript.setButtonImage( canvas.toDataURL("image/png") );
		};
		img.src = canvas_img;*/

		chrome.browserAction.setTitle({'title': inspector4pda.utils.getString("4PDA_online") + 
			'\n' + inspector4pda.utils.getString("Unread Topics") + ': ' + tCount + 
			'\n' + inspector4pda.utils.getString("New Messages") + ': ' + qCount
		});
	},

	printLogout: function(unavailable)
	{
		chrome.browserAction.setBadgeText({ text: "logout" });

		chrome.browserAction.setTitle({'title': unavailable?
					inspector4pda.utils.getString("4PDA_Site Unavailable"):
					inspector4pda.utils.getString("4PDA_offline")
		});

		console.log('print logout');
		//TODO сменить иконку
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
				icon = "/icons/icon_64_out.png"
				break;
			default:
				icon = "/icons/icon_128.png"
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
		var btn = inspector4pda.cScript.getPanelButton();
		if (!btn) {
			return false;
		}
		btn.setAttribute('image', image);
		btn.style.listStyleImage = "url('" + image + "')";
	}
};

inspector4pda.cScript.init();