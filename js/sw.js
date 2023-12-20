import {Notifications} from "./notifications.js";
import {Data} from "./data.js";
import {UnavailableError, UnauthorizedError} from './errors.js'
import {User} from './user.js'
import {Favorites} from './ev/favorites.js'
import {QMS} from './ev/qms.js'
import {Mentions} from './ev/mentions.js'
import {
    open_url,
    action_print_count,
    action_print_unavailable,
    request_new_event,
    action_print_logout
} from "./utils.js";


console.debug('Init SW', new Date())

const notifications = new Notifications(),
      data = new Data(),
      user = new User()

function clear_popup() {
    chrome.action.setPopup({
        popup: ''
    }).then()
}

function set_popup() {
    chrome.action.setPopup({
        popup: 'html/popup.html'
    }).then()
}

const check_exception = reason => {
    if (reason instanceof UnauthorizedError) {
        console.error(reason.message)
        sw.stop()
        action_print_logout(reason.message)
        clear_popup()
    } else if (reason instanceof UnavailableError) {
        console.error(reason.message)
        sw.stop()
        action_print_unavailable(reason.message)
        // start_interval_available()
        // wait user update
    } else {
        console.error(reason)
    }
}

const get_popup_data = () => {
    if (!user.id) {
        return null
    }
    return {
        user: {
            id: user.id,
            name: user.name
        },
        vars: data.data,
        stats: {
            qms: {
                count: sw.qms.count
            },
            favorites: {
                count: sw.favorites.count,
                pin_count: sw.favorites.pin_count,
                // list0: sw.favorites.list_filtered,
                list: sw.favorites.list_filtered.sort(function (a, b) {
                    if (data.data.toolbar_pin_up) {
                        let pinDef = b.pin - a.pin;
                        if (pinDef !== 0) {
                            return pinDef;
                        }
                    }
                    return (b.last_post_ts - a.last_post_ts);
                })
            },
            mentions: {
                count: sw.mentions.count
            }
        }
    }
}

/*chrome.runtime.onStartup.addListener( () => {
    console.log('onStartup()');
})
chrome.runtime.onInstalled.addListener((details) => {
    console.warn('onInstalled', details)
    // if (details.reason == 'update')
})*/

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.debug('new message', message)
    switch (message.action) {
        case 'popup': {
            sendResponse(get_popup_data())
            return true
        }
        case 'update_all':
            sw.stop()
            user.request().then(() => {
                sw.full_update().then(() => {
                    sendResponse(get_popup_data())
                })
            }).catch(reason => {
                check_exception(reason)
            })
            return true
        case 'open_url':
            sendResponse(
                open_url(
                    message.url,
                    message.set_active,
                    false,
                    data.data.open_in_current_tab
                )
            )
            break
        case 'check_user':
            user.request().then((is_new_user, old_id) => {
                if (is_new_user) {
                    if (!old_id) {
                        set_popup()
                    }
                    sw.full_update().then()
                } // else nothing
            }).catch(check_exception)
            break
        case 'theme_read':
            sw.favorites.read(message.id).then(() => {
                sw.action_print_count()
                sendResponse(true)
            }).catch(() => {
                sendResponse(false)
            })
            return true
        case 'theme_open_last':
            if (message.id in sw.favorites.list) {
                let theme = sw.favorites.list[message.id]
                open_url(
                    theme.URL_last_post,
                    true, //data.data.toolbar_open_theme_hide,
                    false,
                    data.data.open_in_current_tab
                ).then(() => {
                    theme.view()
                    sw.action_print_count()
                    sendResponse(true)
                })
            }
            return true
        case 'theme_open_new':
            if (message.id in sw.favorites.list) {
                let theme = sw.favorites.list[message.id]
                open_url(
                    theme.URL_new_post,
                    true, //data.data.toolbar_open_theme_hide,
                    false,
                    data.data.open_in_current_tab
                ).then(() => {
                    theme.view()
                    sw.action_print_count()
                    sendResponse(true)
                })
            }
            return true
        default:
            throw 'Unknown action'
    }
})

/*chrome.notifications.onClicked.addListener(nid => {
    console.log(nid)
})*/

/*chrome.storage.onChanged.addListener((changes, namespace) => {
    console.debug('chrome.storage.onChanged', changes, namespace)
    // for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    //     console.log(
    //         `Storage key "${key}" in namespace "${namespace}" changed.`,
    //         `Old value was "${oldValue}", new value is "${newValue}".`
    //     );
    // }
});*/

chrome.action.onClicked.addListener((tab) => {
    if (user.id) {
        sw.full_update().then(() => {
            set_popup()
        })
    } else {
        user.request().then(() => {
            sw.full_update().then(() => {
                set_popup()
            })
        }).catch(reason => {
            console.error(reason)
            clear_popup()
            open_url('https://4pda.to/forum/index.php?act=auth', true, true).then()
        })
    }
})

chrome.offscreen.createDocument({
    url: './html/offscreen.html',
    reasons: ['WORKERS'],
    justification: 'keep service worker running',
}).then(() => {
    data.read_storage().then(() => {
        user.request().then((is_new_user, old_id) => {
            if (old_id) {
                console.warn('Not a new user?!')
            }
            set_popup()
            sw.start().then(() => {
                sw.new_timer()
            })
        }).catch(check_exception)
    }).catch(reason => {
        console.error(reason)
        clear_popup()
        action_print_unavailable('Can\'t read storage')
        notifications.show_error('FATAL: Can\'t read storage')
        chrome.action.disable().then()
    })
}).catch(reason => {
    console.error(reason)
    clear_popup()
    action_print_unavailable('Can\'t set offscreen')
    notifications.show_error('FATAL: Can\'t set offscreen')
    chrome.action.disable().then()
})


class SW {

    constructor() {
        this.favorites = new Favorites(notifications)
        this.qms = new QMS(notifications)
        this.mentions = new Mentions(notifications)

        this.timeout = 0
        this.last_event = 0
    }

    new_timer() {
        this.timeout = setTimeout(() => {
            this.#interval_update()
        }, data.interval_ms)
    }

    full_update() {
        clearTimeout(this.timeout)
        return new Promise((resolve, reject) => {
            this.#update_all().then(() => {
                this.new_timer()
                resolve()
            })
        })
    }

    stop() {
        clearTimeout(this.timeout)
    }

    start() {
        if (this.timeout) {
            clearTimeout(this.timeout)
            // throw 'already started'
        }
        return new Promise((resolve, reject) => {
            this.#interval_action().then(upd => {
                if (upd) {
                    // ok, just timer
                    resolve()
                } else {
                    // full update & timer
                    this.#update_all().then(() => {
                        resolve()
                    }).catch(reason => {
                        reject(reason)
                    })
                }
            }).catch(reason => {
                reject(reason)
            })
        })
    }

    action_print_count() {
        action_print_count(
            this.qms.count,
            this.favorites.count
        )
    }

    #interval_update() {
        console.debug('Interval update:', new Date(), this.timeout)
        clearTimeout(this.timeout)
        this.#interval_action().then(() => {
            this.new_timer()
        }).catch(reason => {
            console.error(reason)
            // todo
        })
    }

    #interval_action() {
        return new Promise((resolve, reject) => {
            request_new_event(user.id, this.last_event).then(last_event => {
                if (last_event) {
                    console.debug('has new events')
                    this.last_event = last_event
                    this.#update_all().then(() => {
                        resolve(true)
                    }).catch(reason => {
                        reject(reason)
                    })
                } else {
                    console.debug('No new events')
                    resolve(false)
                }
            }).catch(reason => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    #update_all() {
        console.debug('Full update:', new Date())
        return new Promise((resolve, reject) => {
            Promise.all([
                this.favorites.request(),
                this.qms.request(),
                this.mentions.request(),
            ]).then(() => {
                this.action_print_count()
                resolve()
            }).catch(err => {
                reject(err)
            })
        })
    }
}
let sw = new SW()