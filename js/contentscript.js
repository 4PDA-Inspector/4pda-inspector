inspector4pda.cScript = {

	updateTimer: 0,
	notifications: [],

	systemNotificationTitle: inspector4pda.browser.getString("4PDA Messages"),
	systemNotificationErrorType: 'site_unavailable',

    eventTheme: 'theme',
    eventQMS: 'QMS',
    eventMention: 'mention',

	lastEvent: 0,
	lastRequest: 0,
	criticalBreak: 300000, //5 minutes

	updatesTurn: {},

	init: function(el) {
		// convert old settings
		if (!inspector4pda.vars.data.build && localStorage.build) {
			console.warn('Convert settings');
			for (let i in inspector4pda.vars.data) {
				if (typeof localStorage[i] != 'undefined') {
					if (i === 'user_links') {
						inspector4pda.vars.setValue(i, JSON.parse(localStorage['user_links']));
					} else {
						inspector4pda.vars.setValue(i, localStorage[i]);
					}
				}
			}
		}

		inspector4pda.browser.csInit();
		inspector4pda.cScript.firstRequest();
	},

	firstRequest: function(callback) {
		var interval = inspector4pda.vars.data.interval * 1000;

		clearTimeout(inspector4pda.cScript.updateTimer);

		inspector4pda.user.getCookieId(function(uid){
			if (uid) {
				inspector4pda.user.request(function() {
					if (inspector4pda.user.id) {
						inspector4pda.themes.request(function() {
							inspector4pda.QMS.request(function() {
								inspector4pda.cScript.printCount();
								inspector4pda.utils.callIfFunction(callback);
								inspector4pda.mentions.request(function() {})
							})
						})
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
				interval = 2000;
				inspector4pda.cScript.printLogout();
			}

			inspector4pda.cScript.updateTimer = setTimeout(function() {
				inspector4pda.cScript.lastEvent = 0;
				inspector4pda.cScript.lastRequest = inspector4pda.utils.now();
				inspector4pda.cScript.request();
			}, interval);
		});
	},

	request: function(callback)	{
		var now = inspector4pda.utils.now();
		if ( (!inspector4pda.user.id) || (now - inspector4pda.cScript.lastRequest > inspector4pda.cScript.criticalBreak) ) {
			console.info('Do first request.', new Date());
			inspector4pda.cScript.firstRequest();
			return false;
		}
		inspector4pda.cScript.lastRequest = now;

		clearTimeout(inspector4pda.cScript.updateTimer);
		inspector4pda.cScript.getData(callback);

		inspector4pda.cScript.updateTimer = setTimeout(function() {
			inspector4pda.cScript.request();
		}, inspector4pda.vars.data.interval * 1000);
	},

	getData: function(callback) {
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

		var unavailableFinishCallback = function() {
			inspector4pda.cScript.clearData();
			inspector4pda.cScript.printLogout(true);
			inspector4pda.utils.callIfFunction(callback);
		};

		var xmr = new inspector4pda.XHR();
		xmr.callback.timeout = function() {
			console.warn('XHR Timeout');
			unavailableFinishCallback();
		};
		xmr.callback.error = function() {
			console.warn('XHR Error');
			unavailableFinishCallback();
		};
		xmr.callback.not200Success = function() {
			console.warn('XHR Not success');
			unavailableFinishCallback();
		};
		xmr.callback.success = function(resp) {
			var responseText = resp.responseText;
			if (responseText) {
				let parsed = inspector4pda.utils.appParse(responseText);
				//console.log(parsed);

				if (parsed.lastEvent) {
					inspector4pda.cScript.lastEvent = parsed.lastEvent;
				}
				let updates = parsed.events,
					clearAllThemes = false;

				for (let i = 0; i < updates.length; i++) {

					let currentUpdate = updates[i],
						id = parseInt(currentUpdate[0].substr(1)),
						action = 'add';
					switch (currentUpdate[1]) {
						case 2:
							action = 'delete';
							break;
						/*case 3:
							action = 'mention';
							break;*/
					}

					switch (currentUpdate[0].substr(0,1)) {
						case 't':
							if (clearAllThemes) {
								continue;
							}

							if (currentUpdate[1] == 3) {
								inspector4pda.cScript.updatesTurn['mention' + currentUpdate[2]] = {
									type: 'mention',
									action: 'add',
									id: id,
									commentId: currentUpdate[2]
								};
							} else {
								inspector4pda.cScript.updatesTurn['theme' + id] = {
									type: 'theme',
									action: action,
									id: id
								};
							}
							break;
						case 'q':
							inspector4pda.cScript.updatesTurn['QMS' + id] = {
								type: 'QMS',
								action: action,
								id: id
							};
							break;
						case 'f':
							if (id === 0 && currentUpdate[1] == 3) {
								// отметка всего форума прочитанным
								clearAllThemes = true;
								inspector4pda.themes.clear();
							}
							break;
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
					for (let j = 0; j < updateKeys.length; j++) {
						let updateElement = inspector4pda.cScript.updatesTurn[updateKeys[j]];
						switch (updateElement.type) {
							case inspector4pda.cScript.eventTheme:
								if (updateElement.action == 'add') {
									inspector4pda.themes.requestTheme(updateElement, function (themesResp, themeId, rawData) {
										if (themesResp) {
											let theme = new themeObj();
											if (theme.parse(themesResp)) {

												if (theme.last_post_ts <= theme.last_read_ts) {
													delete inspector4pda.themes.list[theme.id];
												} else {
													var isNewTheme = (!inspector4pda.themes.list[theme.id]);
													inspector4pda.themes.list[theme.id] = theme;

													if (isNewTheme) {
														// todo checkbox "Оповещения при каждом новом комментарии"
														if (theme.last_user_id != inspector4pda.user.id) {
															inspector4pda.cScript.addNotification(
																theme.id,
																inspector4pda.cScript.eventTheme,
																inspector4pda.utils.htmlspecialcharsdecode(theme.title),
																inspector4pda.utils.htmlspecialcharsdecode(theme.last_user_name)
															);
														}
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
															inspector4pda.cScript.systemNotificationTitle,
														inspector4pda.utils.htmlspecialcharsdecode(dialog.title) + ' (' + dialog.unread_msgs + ')'
													);
												} else {
													delete inspector4pda.QMS.list[dialog.id];
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
							case inspector4pda.cScript.eventMention:
								if (updateElement.action == 'add') {

									let isNew = inspector4pda.mentions.add(updateElement.id, updateElement.commentId);
									if (!isNew) {
										checkLastUpdate('mention' + updateElement.commentId);
										continue;
									}

									inspector4pda.themes.requestTheme(updateElement, function (themesResp, themeId, rawData) {

										var themeTitle = false;
										if (themesResp) {
											let theme = new themeObj();
											if (theme.parse(themesResp)) {
												themeTitle = theme.title;

												inspector4pda.cScript.addNotification(
													themeId + '_' + rawData.commentId,
													inspector4pda.cScript.eventMention,
													inspector4pda.utils.htmlspecialcharsdecode(themeTitle),
													'#' + rawData.commentId
												);

												checkLastUpdate('mention' + rawData.commentId);
											}
										}

										if (!themeTitle) {
											// костыль
											inspector4pda.themes.requestUnknownThemeTitle(rawData, function (themeTitle, themeId, rawData) {
												inspector4pda.cScript.addNotification(
													themeId + '_' + rawData.commentId,
													inspector4pda.cScript.eventMention,
													inspector4pda.utils.htmlspecialcharsdecode(themeTitle),
													'#' + rawData.commentId
												);
												checkLastUpdate('mention' + rawData.commentId);
											});
										}

									});
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
		xmr.send('https://app.4pda.ru/er/u' + inspector4pda.user.id + '/s' + inspector4pda.cScript.lastEvent);
	},

	printCount: function() {
		if (!inspector4pda.user.id) {
			inspector4pda.cScript.printLogout();
			return false;
		}
		var qCount = inspector4pda.QMS.getCount(),
			tCount = inspector4pda.themes.getCount();

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

		var icon,
			notificationId = "4pdainspector_" + type + '_' + id;

		switch (type) {
			case this.systemNotificationErrorType:
				icon = inspector4pda.browser.notificationOutIcon;
				notificationId += '_' + (new Date().getTime());
				break;
			case this.eventTheme:
				if (inspector4pda.vars.data.toolbar_only_pin && !inspector4pda.themes.list[id].pin) {
					return false;
				}
				icon = inspector4pda.browser.notificationThemeIcon;
				notificationId += '_' + inspector4pda.themes.list[id].last_read_ts;
				break;
			case this.eventMention:
				icon = inspector4pda.browser.notificationMentionIcon;
				//notificationId += '_' + (new Date().getTime());
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
			hasTheme = false,
			hasMention = false;
		for (let i = 0; i < inspector4pda.cScript.notifications.length; i++) {
			hasTheme |= (inspector4pda.cScript.notifications[i].type == 'theme');
			hasQMS |= (inspector4pda.cScript.notifications[i].type == 'qms');
			hasMention |= (inspector4pda.cScript.notifications[i].type == inspector4pda.cScript.eventMention);
		}
		if (
			(hasQMS && inspector4pda.vars.data.notification_sound_qms) ||
			(hasTheme && inspector4pda.vars.data.notification_sound_themes) ||
			(hasMention && inspector4pda.vars.data.notification_sound_mentions)
		) {
			inspector4pda.browser.playNotificationSound();
		}
		inspector4pda.cScript.showNotifications();
	},

	showNotifications: function() {
		if (!inspector4pda.cScript.notifications.length) {
			return false;
		}

		setTimeout(function() {
			inspector4pda.cScript.showNotifications();
		}, 50);

		var currentNotification = inspector4pda.cScript.notifications.shift();
		if (currentNotification.type == 'theme' && !inspector4pda.vars.data.notification_popup_themes) {
			return false;
		}
		if (currentNotification.type == 'qms' && !inspector4pda.vars.data.notification_popup_qms) {
			return false;
		}
		if (currentNotification.type == inspector4pda.cScript.eventMention && !inspector4pda.vars.data.notification_popup_mentions) {
			return false;
		}

		inspector4pda.browser.showNotification({
			id: currentNotification.id,
			title: currentNotification.title,
			message: currentNotification.body,
			iconUrl: currentNotification.icon
		});
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
		} else if (tagData[1] == 'mention') {
			inspector4pda.themes.open(parseInt(tagData[2]), true, tagData[3]);
		}
		inspector4pda.cScript.printCount();

		inspector4pda.browser.clearNotification(tag);
	},

	clearData: function() {
		inspector4pda.user.clearData();
		inspector4pda.cScript.lastEvent = 0;
	}
};

inspector4pda.vars.init(function() {
	inspector4pda.cScript.init();
});
