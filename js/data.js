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
