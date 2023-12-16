import {Notifications} from "./notifications.js";
import {Data} from "./data.js";
import {MyError} from './errors.js'
import {User} from './user.js'
import {Favorites} from './ev/favorites.js'
import {QMS} from './ev/qms.js'
import {Mentions} from './ev/mentions.js'
import {open_url, action_print_count, action_print_unavailable, request_new_event} from "./utils.js";


console.debug('Init SW', new Date())

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse){
    console.log('MESSAGE!!!!', message)
    // return new Promise((resolve, reject) => {
    // })
    switch (message.action) {
        case 'popup': {
            sendResponse({
                user: {
                    id: sw.user.id,
                    name: sw.user.name
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
        default:
            throw 'Unknown action'
    }
})

/*chrome.notifications.onClicked.addListener(nid => {
    console.log(nid)
})*/

chrome.action.onClicked.addListener((tab) => {
    open_url('https://4pda.to/forum/index.php?act=login', true, true).then()
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

let sw
const notifications = new Notifications()
const data = new Data()

data.read_storage().then(() => {
    sw = new SW()
    sw.start().then(() => {
        sw.new_timer()
    }).catch(reason => {
        if (reason instanceof MyError) {
            console.error(reason.message)
            reason.action()
        } else {
            console.error(reason)
        }
    })
}).catch(reason => {
    console.error(reason)
    action_print_unavailable('Can\'t read storage')
    notifications.show_error('FATAL: Can\'t read storage')
    chrome.action.disable().then()
})


class SW {

    constructor() {
        this.user = new User()
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

    start() {
        if (this.timeout) {
            throw 'already started'
        }
        return new Promise((resolve, reject) => {
            this.user.request().then(() => {
                set_popup()
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
            request_new_event(this.user.id, this.last_event).then(last_event => {
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
            this.user.request().then(() => {
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
            }).catch(reason => {
                reject(reason)
            })
        })
    }
}
