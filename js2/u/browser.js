class Browser {

    constructor() {
        this.action_button = new ActionButton()
    }

    async focus_window(window) {
        return new Promise((resolve, reject) => {
            let upd = {
                focused: true
            }
            if (window.state === "minimized") {
                upd.state = "normal"
            }
            chrome.windows.update(window.id, upd, () => {
                return resolve()
            })
        })
    }

    async open_url(url, set_active, set_window_focus) {
        if (!/\w+:\/\/.+/.test(url)) {
            url = chrome.runtime.getURL(url)
        }
        set_active = set_active || inspector.vars.data.toolbar_open_theme_hide

        return new Promise((resolve, reject) => {
            chrome.tabs.query({
                url: url
            }, (tabs) => {
                if (tabs && tabs.length) {
                    let current_tab = tabs[0]
                    chrome.tabs.highlight({
                        tabs: current_tab.index,
                        windowId: current_tab.windowId
                    }, (window) => {
                        if (!window.focused) {
                            this.focus_window(window)
                        }
                        return resolve(current_tab)
                    })
                } else {
                    if (inspector.vars.data.open_in_current_tab) {
                        chrome.tabs.query({
                            active: true,
                            //currentWindow: true
                        }, (tabs) => {
                            chrome.tabs.update(
                                tabs[0].id, {
                                    url: url
                                }, (tab) => {
                                    if (set_window_focus) {
                                        chrome.windows.get(tab.windowId, (window => {
                                            if (!window.focused) {
                                                this.focus_window(window)
                                            }
                                        }))
                                    }
                                    return resolve(tab)
                                }
                            )
                        })
                    } else {
                        chrome.tabs.create({
                            url: url,
                            active: set_active
                        }, (tab) => {
                            if (set_window_focus) {
                                chrome.windows.get(tab.windowId, (window => {
                                    if (!window.focused) {
                                        this.focus_window(window)
                                    }
                                }))
                            }
                            return resolve(tab)
                        })
                    }
                }
            })
        })
    }

    async get_cookie(cookie_name) {
        return new Promise((resolve, reject) => {
            chrome.cookies.get({
                url: inspector.vars.BASE_URL,
                name: cookie_name
            }, cookie => {
                if (cookie) {
                    return resolve(cookie.value)
                } else {
                    return reject()
                }
            })
        })
    }
}

class ActionButton {

    set icon(path) {
        chrome.browserAction.setIcon({path: path});
    }
    set badge_text(text) {
        chrome.browserAction.setBadgeText({'text': String(text)}, () => {});
    }
    set title(text) {
        chrome.browserAction.setTitle({'title': text.toString()}, () => {});
    }
    set badge_bg_color(color) {
        chrome.browserAction.setBadgeBackgroundColor({'color': color }, () => {});
    }

    print_default() {
        this.badge_text = ''
        this.badge_bg_color = ACTION_BUTTON_COLORS.default
        this.icon = ACTION_BUTTON_ICONS.default
        this.title = '4PDA - В сети'
    }
    print_logout() {
        this.badge_text = 'login'
        this.badge_bg_color = ACTION_BUTTON_COLORS.logout
        this.icon = ACTION_BUTTON_ICONS.logout
        this.title = '4PDA - Не в сети'
    }
    print_unavailable() {
        this.badge_text = 'N/A'
        this.badge_bg_color = ACTION_BUTTON_COLORS.logout
        this.icon = ACTION_BUTTON_ICONS.logout
        this.title = '4PDA - Сайт недоступен'
    }

    print_count() {

        if (inspector.user.id) {
            let q_count = inspector.qms.count,
                f_count = inspector.favorites.count

            if (q_count) {
                this.icon = ACTION_BUTTON_ICONS.has_qms
                this.badge_bg_color = ACTION_BUTTON_COLORS.has_qms
            } else {
                this.icon = ACTION_BUTTON_ICONS.default
                this.badge_bg_color = ACTION_BUTTON_COLORS.default
            }

            this.badge_text = f_count || ''
            this.title = `4PDA - В сети\nНепрочитанных тем: ${f_count}\nНепрочитанных диалогов: ${q_count}`

        } else {
            this.print_logout()
        }

    }
}