import {ACTION_BUTTON_COLORS, ACTION_BUTTON_ICONS} from "./data.js";
import {UnavailableError} from './errors.js'


const win1251decoder = new TextDecoder("windows-1251")
const ERR_REGEX = /u\d+:\d+:(\d+):\d+/


export function request_and_parse(code) {
    return new Promise((resolve, reject) => {
        fetch('https://4pda.to/forum/index.php?act=inspector&CODE=' + code).then(response => {
            // console.log(response.headers.get("content-type"))  // text/plain;charset=windows-1251
            if (response.ok) {
                response.arrayBuffer().then(blb => {
                    resolve(win1251decoder.decode(blb))
                }).catch(reason => {
                    console.error(reason)
                    reject(new UnavailableError(reason))
                })
            } else {
                reject(new UnavailableError('Can\'t request to 4pda'))
            }
        }).catch(reason => {
            console.error(reason)
            reject(new UnavailableError(reason))
        })
    });
}

export function request_new_event(user_id, last_event) {
    return new Promise((resolve, reject) => {
        fetch(`https://appbk.4pda.to/er/u${user_id}/s${last_event}`).then(response => {
            if (response.ok) {
                response.text().then(txt => {
                    if (txt) {
                        let res = txt.match(ERR_REGEX)
                        if (res) {
                            resolve(res[1])
                        }
                    }
                    resolve()
                })
            } else {
                reject(new UnavailableError())
            }
        }).catch(reason => {
            console.error(reason)
            reject(new UnavailableError(reason))
        })
    })
}

// export function now() {
//     return new Date().getTime();
// }

function focus_window(window) {
    let upd = {
        focused: true
    }
    if (window.state === "minimized") {
        upd.state = "normal"
    }
    chrome.windows.update(window.id, upd).then()
}

export function open_url(url, set_active, set_window_focus = false, open_in_current_tab = false) {
    if (!/\w+:\/\/.+/.test(url)) {
        url = chrome.runtime.getURL(url)
    }
    // set_active = set_active || inspector.vars.data.toolbar_open_theme_hide

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
                        focus_window(window)
                    }
                    return resolve(current_tab)
                })
            } else {
                // if (inspector.vars.data.open_in_current_tab) {
                if (open_in_current_tab) {
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
                                            focus_window(window)
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
                                    focus_window(window)
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


/* ******************** */

function set_icon(path) {
    chrome.action.setIcon({path: path}).then()
}
function set_badge_text(text) {
    chrome.action.setBadgeText({'text': String(text)}).then()
}
function set_title(text) {
    chrome.action.setTitle({'title': '4PDA - ' + text.toString()}).then()
}
function set_badge_bg_color(color) {
    chrome.action.setBadgeBackgroundColor({'color': color }).then()
}


export function action_print_count(q_count, f_count) {
    if (q_count) {
        set_icon(ACTION_BUTTON_ICONS.has_qms)
        set_badge_bg_color(ACTION_BUTTON_COLORS.has_qms)
    } else {
        set_icon(ACTION_BUTTON_ICONS.default)
        set_badge_bg_color(ACTION_BUTTON_COLORS.default)
    }

    set_badge_text(f_count || '')
    set_title(`В сети\nНепрочитанных тем: ${f_count}\nНепрочитанных диалогов: ${q_count}`)
}

export function action_print_logout(error = 'Не в сети') {
    set_badge_text('login')
    set_badge_bg_color(ACTION_BUTTON_COLORS.logout)
    set_icon(ACTION_BUTTON_ICONS.logout)
    set_title(error)
}

export function action_print_unavailable(error = 'Сайт недоступен') {
    set_badge_text('N/A')
    set_badge_bg_color(ACTION_BUTTON_COLORS.logout)
    set_icon(ACTION_BUTTON_ICONS.logout)
    set_title(error)
}
