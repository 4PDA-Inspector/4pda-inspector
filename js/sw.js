import {Data} from "./data.js";
import {User} from './user.js'
import {Favorites} from './favorites.js'
import {QMS} from './qms.js'
import {Mentions} from './mentions.js'
import {open_url} from "./utils.js";


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
                vars: sw.data.data,
                stats: {
                    qms: {
                        count: sw.qms.count
                    },
                    favorites: {
                        count: sw.favorites.count,
                        pin_count: sw.favorites.pin_count,
                        // list0: sw.favorites.list_filtered,
                        list: sw.favorites.list_filtered.sort(function (a, b) {
                            if (sw.data.data.toolbar_pin_up) {
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
                },
                // sw: sw
            })
            break
        }
        case 'open_url':
            sendResponse(
                open_url(
                    message.url,
                    true,
                    false,
                    sw.data.data.open_in_current_tab
                )
            )
            break
        default:
            throw 'Unknown action'
    }
})

/*chrome.action.onClicked.addListener((tab) => {
    // chrome.scripting.executeScript({
    //     target: {tabId: tab.id},
    //     files: ['content.js']
    // });
    console.debug('ACTION!')
    console.debug(tab)
});*/

chrome.storage.onChanged.addListener((changes, namespace) => {
    console.debug('chrome.storage.onChanged', changes, namespace)
    // for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    //     console.log(
    //         `Storage key "${key}" in namespace "${namespace}" changed.`,
    //         `Old value was "${oldValue}", new value is "${newValue}".`
    //     );
    // }
});

function logout() {
    console.warn('Logout!')
}

function notification(text) {
    console.warn(text)
}


class SW {
     constructor() {
         this.data = new Data()
         this.user = new User()
         this.favorites = new Favorites()
         this.qms = new QMS()
         this.mentions = new Mentions()
     }

     run() {
         this.data.read_storage().then(() => {
             this.update_all().then().catch(reason => {
                 notification(reason)
                 logout()
             })
         }).catch(reason => {
             console.error(reason)
             notification('FATAL: Cant read storage')
         })
         return this
     }

     update_all() {
         console.debug('New update:', new Date())
         return new Promise((resolve, reject) => {
             this.user.request().then(() => {
                 this.favorites.request().then(() => {
                     this.qms.request().then(() => {
                         this.mentions.request().then(() => {
                             // todo
                         }).catch(reason => {
                             reject(reason)
                         })
                     }).catch(reason => {
                         reject(reason)
                     })
                 }).catch(reason => {
                     reject(reason)
                 })
             }).catch(reason => {
                 reject(reason)
             })
         })
     }
}

const sw = new SW().run()
