class Notifications {

    constructor() {
        this.notification_sound = new Audio(NOTIFICATION_SOUND)
        this.list = {}
        this.new_list = {}
        this.silent = true

        chrome.notifications.onClicked.addListener(notificationId => {
            this.click(notificationId)
        })
        chrome.notifications.onClosed.addListener((notificationId, byUser) => {
            this.close(notificationId, byUser)
        })
    }

    play_sound() {
        console.debug('play_sound')
        this.notification_sound.volume = inspector.vars.data.notification_sound_volume
        this.notification_sound.play()
    }

    show_site_unavailable() {
        this.show({
            title: "4PDA - Сайт недоступен",
            iconUrl: NOTIFICATION_ICONS.out
        }).then()
    }
    show_site_available() {
        this.show({
            title: "4PDA - Сайт доступен",
            iconUrl: NOTIFICATION_ICONS.default
        }).then()
    }

    show(params) {
        let defaultParams = {
            type: "basic",
            id: '4pda_inspector_' + (Utils.now()),
            title: "4PDA Инспектор",
            message: '',
            iconUrl: NOTIFICATION_ICONS.default
        };
        params = {...defaultParams, ...params}
        let notification_params = {}

        for (let key in params) {
            if (['type','title','message','iconUrl','eventTime','contextMessage'].includes(key)) {
                notification_params[key] = params[key]
            }
        }

        return new Promise((resolve, reject) => {
            chrome.notifications.create(params.id, notification_params, notification_id => {
                return resolve(notification_id)
            })
        })
    }

    add(event, object) {
        if (this.silent) {
            return
        }

        let new_notification

        switch (event) {
            case 'new_comment_in_theme': // Оповещения при каждом новом комментарии
                if (!inspector.vars.data.notification_themes_all_comments) {
                    return
                }
            case 'new_theme':
                new_notification = {
                    'id': `${Utils.now()}_theme_${object.id}_${object.last_post_ts}`,
                    'contextMessage': 'Новый комментарий',
                    'title': object.title,
                    'message': object.last_user_name,
                    'eventTime': object.last_post_ts*1000,
                    'iconUrl': NOTIFICATION_ICONS.favorite,
                    'callback': () => {
                        inspector.browser.open_url(object.URL_new_post, true, true).then(() => {
                            inspector.favorites.list[object.id].view()
                        })
                    }
                }
                break
            case 'new_message_in_dialog':
                if (!inspector.vars.data.notification_qms_all_messages) {
                    return
                }
            case 'new_dialog':
                new_notification = {
                    'id': `${Utils.now()}_dialog_${object.id}_${object.last_msg_ts}`,
                    'contextMessage': 'Новое сообщение',
                    'title': object.title,
                    'message': object.opponent_name,
                    'eventTime': object.last_msg_ts*1000,
                    'iconUrl': NOTIFICATION_ICONS.qms,
                    'callback': () => {
                        inspector.browser.open_url(object.URL, true, true).then(() => {
                            delete inspector.qms.list[object.id]
                            inspector.browser.action_button.print_count()
                        })
                    },
                }
                break
            case 'new_mention':
                new_notification = {
                    'id': `${Utils.now()}_new_mention`,
                    'contextMessage': 'Новое упоминание',
                    'title': object.title,
                    'message': object.poster_name,
                    'eventTime': object.timestamp*1000,
                    'iconUrl': NOTIFICATION_ICONS.mention,
                    'callback': () => {
                        inspector.browser.open_url(object.URL, true, true).then(() => {
                            delete inspector.mentions.list[object.key]
                        })
                    }
                }
                break
            default:
                return false
        }

        new_notification['event'] = event
        this.new_list[new_notification['id']] = new_notification
    }

    show_all() {
        if (this.silent) {
            this.silent = false
            this.new_list = {}
            return
        }
        if (Object.keys(this.new_list).length) {
            let sound_played = false
            for (let not_id in this.new_list) {
                let notification = this.new_list[not_id],
                    play = true,
                    show = true
                switch (notification['event']) {
                    case 'new_theme':
                    case 'new_comment_in_theme':
                        play = inspector.vars.data.notification_themes_sound
                        show = inspector.vars.data.notification_themes_popup
                        break
                    case 'new_dialog':
                    case 'new_message_in_dialog':
                        play = inspector.vars.data.notification_qms_sound
                        show = inspector.vars.data.notification_qms_popup
                        break
                    case 'new_mention':
                        play = inspector.vars.data.notification_mentions_sound
                        show = inspector.vars.data.notification_mentions_popup
                        break
                    default:
                        continue
                }
                if (play && !sound_played) {
                    sound_played = true
                    this.play_sound()
                }
                if (!show) {
                    delete this.new_list[not_id]
                    continue
                }

                this.show(this.new_list[not_id]).then(() => {
                    this.list[not_id] = this.new_list[not_id]
                    delete this.new_list[not_id]
                })
            }
        }
    }

    click(notification_id) {
        console.debug('notification_click', notification_id)
        if (notification_id in this.list) {
            let notification = this.list[notification_id]
            if ('callback' in notification) {
                notification.callback()
            }
        }
        chrome.notifications.clear(notification_id)
    }
    close(notification_id, by_user) {
        console.debug('notification_close', notification_id, by_user)
        if (notification_id in this.list) {
            delete this.list[notification_id]
        }
    }
}