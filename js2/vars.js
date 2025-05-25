class Vars {

    constructor() {
        this.data = DEFAULT_SETTINGS

        this._base_url = 'https://4pda.to'
        this._app_url = 'https://appbk.4pda.to'
    }

    get BASE_URL() {
        return this._base_url
    }
    get APP_URL() {
        return this._app_url
    }

    get interval_ms() {
        return this.data.interval * 1000
    }

    async read_storage() {
        return new Promise((resolve, reject) => {
            // todo use storage.sync
            chrome.storage.local.get(null,  (items) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError)
                }
                for (let i in items) {
                    this.set_value(i, items[i], false)
                }
                //this.check_new_build()
                return resolve()
            });
        })
    }

    /*check_new_build() {
        if (!this.data.build || this.data.build < CURRENT_BUILD) {
            inspector.browser.open_url('html/whatsnew.html').then()
            this.set_value('build', CURRENT_BUILD)
        }
    }*/

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
                chrome.storage.local.remove(field)
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

            switch (field) {
                case 'interval':
                    inspector.check_need_update()
                    break
                case 'toolbar_only_pin':
                    inspector.update_all_data(true).then()
                    break
            }

        }
    }

    doForumURL(params, loFi = false) {
        return this.BASE_URL + (loFi ? '/forum/lofiversion/index.php' : '/forum/index.php') + (params ? '?' + params : '');
    }

}