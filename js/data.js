export class Data {
    data = {
        interval: 30,
        open_themes_limit: 0,

        notification_sound_volume: 0.5,

        notification_themes_sound: true,
        notification_themes_popup: true,
        notification_themes_all_comments: false,

        notification_qms_sound: true,
        notification_qms_popup: true,
        notification_qms_all_messages: false,

        notification_mentions_sound: true,
        notification_mentions_popup: true,

        toolbar_pin_color: true,
        toolbar_pin_up: false,
        toolbar_only_pin: false,
        toolbar_open_theme_hide: true,
        toolbar_simple_list: false,

        toolbar_button_open_all: true,
        toolbar_button_read_all: true,

        toolbar_width_fixed: false,
        toolbar_width: 400,
        toolbar_theme: 'auto',

        open_in_current_tab: false,
        user_links: [],

        build: 20231212
    }

    read_storage() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get().then((items) => {
                // console.log(items)
                for (let i in items) {
                    if (i in this.data) {
                        // console.log(i, items[i])
                        if (i == 'build') {
                            if (items[i] < this.data[i]) {
                                console.warn('New build')
                                // inspector.browser.open_url('html/whatsnew.html').then()
                                // this.set_value('build', CURRENT_BUILD)
                            }
                        } else {
                            this.data[i] = items[i]
                        }
                    }
                    // todo this.set_value(i, items[i], false)
                }
                resolve()
            }).catch(reason => {
                reject(reason)
            })
        })
    }
}

// export const NOTIFICATION_ICONS = {
//     default: "/icons/icon_80.png",
//     qms: "/icons/icon_80_message.png",
//     favorite: "/icons/icon_80_favorite.png",
//     mention: "/icons/icon_80_mention.png",
//     out: "/icons/icon_80_out.png",
// }
//
// export const NOTIFICATION_SOUND = '/sound/sound3.ogg'

export const ACTION_BUTTON_ICONS = {
    default: '/icons/icon_19.png',
    has_qms: '/icons/icon_19_qms.png',
    logout: '/icons/icon_19_out.png'
}

export const ACTION_BUTTON_COLORS = {
    default: [63, 81, 181, 255],
    has_qms: [76, 175, 80, 255],
    logout: [158, 158, 158, 255],
}
