import {Notifications} from "./notifications.js";
import {Data} from "./data.js";
import {MyError} from './errors.js'
import {User} from './user.js'
import {Favorites} from './ev/favorites.js'
import {QMS} from './ev/qms.js'
import {Mentions} from './ev/mentions.js'
import {open_url, action_print_count, action_print_unavailable, request_new_event} from "./utils.js";


console.debug('Init SW', new Date())

const notifications = new Notifications(),
      data = new Data(),
      user = new User()

let upd_interval


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
    if (reason instanceof MyError) {
        console.error(reason.message)
        reason.action()
        // todo intervals
    } else {
        console.error(reason)
    }
}

const interval_available = () => {
    clearInterval(upd_interval)
    upd_interval = setInterval(() => {
        // todo check site is available again
    }, 5e3)
}

/*setInterval(() => {
    // chrome.runtime.getPlatformInfo().then((info) => {
    //     console.log(info)
    // })
    fetch('https://4pda.to/forum/index.php?act=inspector&CODE=id').then(response => {
        console.log(response)
    })
    console.log('interval alive')
}, 5e3)*/

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
            if (!user.id) {
                sendResponse(null)
                return
            }
            sendResponse({
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
            })
            break
        }
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
            user.request().then(is_new_user => {
                if (is_new_user) {
                    sw.full_update().then()
                } // else nothing
            }).catch(check_exception)
            break
        default:
            throw 'Unknown action'
    }
})

/*chrome.notifications.onClicked.addListener(nid => {
    console.log(nid)
})*/

chrome.action.onClicked.addListener((tab) => {
    open_url('https://4pda.to/forum/index.php?act=auth', true, true).then()
})

chrome.offscreen.createDocument({
    url: './html/offscreen.html',
    reasons: ['WORKERS'],
    justification: 'keep service worker running',
}).then(() => {
    data.read_storage().then(() => {
        user.request().then(new_user => {
            if (!new_user) {
                throw 'Not a new user?!'
            }
            set_popup()
            sw.start().then(() => {
                sw.new_timer()
            })
        }).catch(check_exception)
    }).catch(reason => {
        console.error(reason)
        action_print_unavailable('Can\'t read storage')
        notifications.show_error('FATAL: Can\'t read storage')
        chrome.action.disable().then()
    })
}).catch(reason => {
    console.error(reason)
    action_print_unavailable('Can\'t set offscreen')
    notifications.show_error('FATAL: Can\'t set offscreen')
    chrome.action.disable().then()
})

/*chrome.storage.onChanged.addListener((changes, namespace) => {
    console.debug('chrome.storage.onChanged', changes, namespace)
    // for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    //     console.log(
    //         `Storage key "${key}" in namespace "${namespace}" changed.`,
    //         `Old value was "${oldValue}", new value is "${newValue}".`
    //     );
    // }
});*/


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

    start() {
        if (this.timeout) {
            throw 'already started'
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
                action_print_count(
                    this.qms.count,
                    this.favorites.count
                )
                resolve()
            }).catch(err => {
                reject(err)
            })
        })
    }
}
let sw = new SW()