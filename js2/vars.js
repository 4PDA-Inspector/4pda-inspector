class Vars {

    current_build = 20210701

    data = {
        interval: 10,
        open_themes_limit: 0,

        notification_sound_volume: 1,

        notification_sound_themes: true,
        notification_popup_themes: true,
        notification_sound_qms: true,
        notification_popup_qms: true,
        notification_sound_mentions: true,
        notification_popup_mentions: true,

        toolbar_pin_color: true,
        toolbar_pin_up: false,
        toolbar_only_pin: false,
        toolbar_opentheme_hide: true,
        toolbar_simple_list: false,
        toolbar_openAllFavs_button: true,
        toolbar_markAllAsRead_button: true,
        toolbar_width_fixed: false,
        toolbar_width: 400,

        open_in_current_tab: false,
        user_links: [],

        build: 0
    }

    // todo check urls
    BASE_URL = 'https://4pda.to'
    APP_URL = 'https://appbk.4pda.to'

    get interval_ms() {
        return this.data.interval * 1000
    }

    async read_storage() {
        let self = this;
        return new Promise((resolve, reject) => {
            //todo use chrome.storage.sync
            chrome.storage.local.get(null, function (items) {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError)
                }
                for (let i in items) {
                    self.set_value(i, items[i], false)
                }
                return resolve()
            });
        })
    }

    check_new_build() {
        if (!this.data.build || this.data.build < this.current_build) {
            inspector.browser.open_url('html/whatsnew.html').then()
            this.set_value('build', this.current_build)
        }
    }

    set_value(field, value, save=true) {

        switch (typeof this.data[field]) {
            case 'boolean':
                value = ((value === true) || (value === 'true') || (value === 1))
                break
            case 'number':
                value = Number(value) || 0
                break
            case 'string':
                value = String(value)
                break
            case 'undefined':
                console.error('Set value:', field, value)
                return false
        }

        switch (field) {
            case 'interval': // 5 sec < interval < 5 min
                value = Math.max( value, 5)
                value = Math.min( value, 300)
                break
            case 'toolbar_width':
                value = Math.max( value, 400)
                value = Math.min( value, 800)
                break
            case 'open_themes_limit':
                value = Math.max( value, 0)
                break
        }

        this.data[field] = value

        if (save) {
            chrome.storage.local.set({
                [field]: value
            });
        }

        // if (['interval', 'toolbar_only_pin'].indexOf(field) > -1) {
        //     inspector4pda.cScript.request();
        // }
        // todo
    }

    doForumURL(params, loFi = false) {
        return this.BASE_URL + (loFi ? '/forum/lofiversion/index.php' : '/forum/index.php') + (params ? '?' + params : '');
    }

}