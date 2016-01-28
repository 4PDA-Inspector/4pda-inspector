inspector4pda.cScript = {

	updateTimer: 0,
	notifications: [],

	systemNotificationTitle: inspector4pda.browser.getString("4PDA Messages"),
	systemNotificationErrorType: 'site_unavailable',
	lastEvent: 0,

	updatesTurn: {},

	init: function(el)
	{
		inspector4pda.browser.csInit();
		inspector4pda.cScript.firstRequest();
	},

	firstRequest: function(callback) {
		inspector4pda.vars.getPrefs();

		var interval = inspector4pda.vars.interval * 1000;

		clearTimeout(inspector4pda.cScript.updateTimer);

		inspector4pda.user.getCookieId(function(uid){
			if (uid) {
				inspector4pda.user.request(function() {
					if (inspector4pda.user.id) {
						inspector4pda.themes.request(function() {
							inspector4pda.QMS.request(function() {
								inspector4pda.cScript.printCount();
								inspector4pda.utils.callIfFunction(callback);
							});
						});
					} else {
						inspector4pda.cScript.printCount();
						inspector4pda.cScript.clearData();
						inspector4pda.utils.callIfFunction(callback);
					}
				}, function() {
					inspector4pda.cScript.clearData();
					inspector4pda.cScript.printLogout(true);
					inspector4pda.utils.callIfFunction(callback);
				});
			} else {
				interval = 1000;
				inspector4pda.cScript.printLogout();
			}

			inspector4pda.cScript.updateTimer = setTimeout(function() {
				inspector4pda.cScript.request();
			}, interval);
		});
	},

	request: function(callback)
	{
		if (!inspector4pda.user.id) {
			inspector4pda.cScript.firstRequest();
			return false;
		}

		inspector4pda.vars.getPrefs();
		clearTimeout(inspector4pda.cScript.updateTimer);
		inspector4pda.cScript.getData(callback);

		inspector4pda.cScript.updateTimer = setTimeout(function() {
			inspector4pda.cScript.request();
		}, inspector4pda.vars.interval * 1000);
	},

	getData: function(callback)
	{
		inspector4pda.user.getCookieId(function(uid){
			if (uid && uid == inspector4pda.user.id) {
				inspector4pda.cScript.checkUpdates(callback);
			} else {
				inspector4pda.cScript.clearData();
				inspector4pda.cScript.firstRequest(callback);
			}
		});
	},

	checkUpdates: function(callback) {

		var finishCallback = function(){
			inspector4pda.cScript.printCount();
			inspector4pda.cScript.checkNotifications();
			inspector4pda.utils.callIfFunction(callback);
		};

		var xmr = new inspector4pda.XHR();
		xmr.callback.timeout = function() {
			finishCallback();
		};
		xmr.callback.error = function() {
			finishCallback();
		};
		xmr.callback.not200Success = function() {
			finishCallback();
		};
		xmr.callback.success = function(resp) {
			if (resp.responseText) {
				var updates = inspector4pda.utils.appParse(resp.responseText);
				for (var i in updates) {
					var id =  parseInt(updates[i][0].substr(1));

					var isAddAction = true;
					if (updates[i][1] == 1) {
						isAddAction = true;
					} else if (updates[i][1] == 2) {
						isAddAction = false;
					} else {
						continue;
					}

					switch (updates[i][0].substr(0,1)) {
						case 't':
							if (isAddAction) {

								if (inspector4pda.themes.list[id] && inspector4pda.themes.list[id].last_post_ts == updates[i][2]) {
									// do nothing
								} else {
									inspector4pda.cScript.updatesTurn['theme' + id] = {
										type: 'theme',
										action: 'add',
										id: id
									};
								}
							} else {
								inspector4pda.cScript.updatesTurn['theme' + id] = {
									type: 'theme',
									action: 'delete',
									id: id
								};
							}
							break;
						case 'q':
							if (isAddAction) {
								if (inspector4pda.QMS.list[id] && inspector4pda.QMS.list[id].last_msg_id == updates[i][2]) {
									// do nothing
								} else {
									inspector4pda.cScript.updatesTurn['QMS' + id] = {
										type: 'QMS',
										action: 'add',
										id: id
									};
								}
							} else {
								inspector4pda.cScript.updatesTurn['QMS' + id] = {
									type: 'QMS',
									action: 'delete',
									id: id
								};
							}
							break;
						default:
							continue;
					}

					if (updates[i][3] > inspector4pda.cScript.lastEvent) {
						inspector4pda.cScript.lastEvent = updates[i][3];
					}
				}

				var checkLastUpdate = function(key) {
					delete inspector4pda.cScript.updatesTurn[key];
					if (!Object.keys(inspector4pda.cScript.updatesTurn).length) {
						finishCallback();
					}
				};

				var updateKeys = Object.keys(inspector4pda.cScript.updatesTurn);
				if (updateKeys.length) {
					for (var j = 0; j < updateKeys.length; j++) {
						var updateElement = inspector4pda.cScript.updatesTurn[updateKeys[j]];
						switch (updateElement.type) {
							case 'theme':
								if (updateElement.action == 'add') {
									inspector4pda.themes.requestTheme(updateElement.id, function (themesResp, themeId) {
										if (themesResp) {
											var theme = new themeObj();
											if (theme.parse(themesResp)) {
												var isNewTheme = (!inspector4pda.themes.list[theme.id]);
												inspector4pda.themes.list[theme.id] = theme;
												inspector4pda.cScript.printCount();

												if (isNewTheme) {
													// todo checkbox "Оповещения при каждом новом комментарии"
													if (theme.last_user_id != inspector4pda.user.id) {
														inspector4pda.cScript.addNotification(
															theme.id,
															'theme',
															inspector4pda.utils.htmlspecialcharsdecode(theme.title),
															inspector4pda.utils.htmlspecialcharsdecode(theme.last_user_name)
														);
													}
												}
											}
										}
										checkLastUpdate('theme' + themeId);
									});
								} else {
									delete inspector4pda.themes.list[updateElement.id];
									checkLastUpdate(updateKeys[j]);
								}
								break;
							case 'QMS':
								if (updateElement.action == 'add') {
									inspector4pda.QMS.requestDialog(updateElement.id, function (resp, dialogId) {
										if (resp) {
											var dialog = new qDialog();
											if (dialog.parse(resp)) {
												if (dialog.unread_msgs > 0) {
													inspector4pda.QMS.list[dialog.id] = dialog;
													inspector4pda.cScript.addNotification(
														dialog.opponent_id + '_' + dialog.id + '_' + dialog.last_msg_ts,
														'qms',
														parseInt(dialog.opponent_id) ?
															inspector4pda.utils.htmlspecialcharsdecode(dialog.opponent_name) :
															this.systemNotificationTitle,
														inspector4pda.utils.htmlspecialcharsdecode(dialog.title) + ' (' + dialog.unread_msgs + ')'
													);
												}
											}
										}
										checkLastUpdate('QMS' + dialogId);
									});
								} else {
									delete inspector4pda.QMS.list[updateElement.id];
									checkLastUpdate(updateKeys[j]);
								}
								break;
						}
					}
				} else {
					finishCallback();
				}
			} else {
				finishCallback();
			}
		};
		xmr.send('http://app.4pda.ru/er/u' + inspector4pda.user.id + '/s' + inspector4pda.cScript.lastEvent);
	},

	printCount: function() {
		if (!inspector4pda.user.id) {
			inspector4pda.cScript.printLogout();
			return false;
		}
		var qCount = inspector4pda.QMS.getCount();
		var tCount = inspector4pda.themes.getCount();

		inspector4pda.browser.printCount(qCount, tCount);
	},

	printLogout: function(unavailable) {
		var iBrowser = inspector4pda.browser;
		iBrowser.setBadgeText(unavailable ? "N/A" : 'login');
		iBrowser.setBadgeBackgroundColor(iBrowser.logoutColor);
		iBrowser.setButtonIcon(iBrowser.logoutIcon);
		iBrowser.setTitle( iBrowser.getString( unavailable ? "4PDA_Site Unavailable" : "4PDA_offline" ) );
	},

	addNotification: function(id, type, title, message) {

		var icon;
		var notificationId = "4pdainspector_" + type + '_' + id;

		switch (type) {
			case this.systemNotificationErrorType:
				icon = inspector4pda.browser.notificationOutIcon;
				notificationId += '_' + (new Date().getTime());
				break;
			case "theme":
				if (inspector4pda.vars.toolbar_only_pin && !inspector4pda.themes.list[id].pin) {
					return false;
				}
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

	checkNotifications: function() {
		if (!inspector4pda.cScript.notifications.length) {
			return false;
		}
		var hasQMS = false,
			hasTheme = false;
		for (var i = 0; i < inspector4pda.cScript.notifications.length; i++) {
			hasTheme |= (inspector4pda.cScript.notifications[i].type == 'theme');
		    hasQMS |= (inspector4pda.cScript.notifications[i].type == 'qms');
		}
		if ((hasQMS && inspector4pda.vars.notification_sound_qms) || (hasTheme && inspector4pda.vars.notification_sound_themes)) {
			inspector4pda.browser.playNotificationSound();
		}
		inspector4pda.cScript.showNotifications();
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

		inspector4pda.browser.clearNotification(tag);
	},

	settingsAccept: function() {
		// Chrome - TODO
		inspector4pda.cScript.request();
	},

	clearData: function() {
		inspector4pda.user.clearData();
	}
};

inspector4pda.cScript.init();