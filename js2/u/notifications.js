class Notifications {

    notification_sound
    icons = {
        default: "/icons/icon_80.png",
        qms: "/icons/icon_80_message.png",
        favorite: "/icons/icon_80_favorite.png",
        mention: "/icons/icon_80_mention.png",
        out: "/icons/icon_80_out.png",
    }
    list = {}
    new_list = {}
    silent = true

    constructor() {
        this.notification_sound = new Audio('/sound/sound3.ogg')
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

    show(params) {
        let defaultParams = {
            id: '4pda_inspector_' + (Utils.now()),
            title: "4PDA Инспектор",
            message: '',
            iconUrl: this.icons.default
        };
        params = {...defaultParams, ...params}

        return new Promise((resolve, reject) => {
            chrome.notifications.create(params.id, {
                type: "basic",
                title: params.title,
                message: params.message,
                iconUrl: params.iconUrl,

                //eventTime: Utils.now() - 3600,
                //contextMessage: 'context',
                /*buttons: [
                    {title: 'test1'},
                    {title: 'test2'},
                ]*/
            }, notification_id => {
                return resolve(notification_id)
            })
        })
    }

    add(event, object) {
        if (this.silent) {
            return
        }

        let new_notification = {
            'id': '4pda_inspector',
            'url': null,
        }

        // todo check options

        switch (event) {
            case 'new_theme':
            case 'new_comment_in_theme':
                new_notification = {
                    'id': `${Utils.now()}_theme_${object.id}_${object.last_post_ts}`,
                    'url': object.URL_new_post,
                    'title': object.title,
                    'message': object.last_user_name,
                    'iconUrl': this.icons.favorite,
                }
                break
            case 'new_dialog':
            case 'new_message_in_dialog':
                new_notification = {
                    'id': `${Utils.now()}_dialog_${object.id}_${object.last_post_ts}`,
                    'url': object.URL,
                    'title': object.title,
                    'message': object.opponent_name,
                    'iconUrl': this.icons.qms,
                }
                break
            case 'mentions_inc':
                new_notification = {
                    'id': `${Utils.now()}_mentions_inc`,
                    'url': inspector.mentions.vURL,
                    'title': 'Новые упоминания',
                    //'message': object.opponent_name,
                    'iconUrl': this.icons.mention,
                }
                break
            default:
                return false
        }

        this.new_list[new_notification['id']] = new_notification
    }

    show_all() {
        if (this.silent) {
            this.silent = false
            return
        }
        if (Object.keys(this.new_list).length) {
            this.play_sound()
            for (let not_id in this.new_list) {
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
            if ('url' in this.list[notification_id]) {
                inspector.browser.open_url(this.list[notification_id]['url'], true).then(() => {
                    chrome.notifications.clear(notification_id)
                })
            }
        }
    }
    close(notification_id, by_user) {
        console.debug('notification_close', notification_id, by_user)
        if (notification_id in this.list) {
            delete this.list[notification_id]
        }
    }
}