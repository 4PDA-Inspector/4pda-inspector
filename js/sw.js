// import * as constants from  './o/defaults.js'
// import * as utils from './o/utils.js'
// console.log(constants.CURRENT_BUILD)
// console.log(utils.now())

console.debug('Init SW', new Date())

chrome.storage.onChanged.addListener((changes, namespace) => {
    console.debug('chrome.storage.onChanged')
    // for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    //     console.log(
    //         `Storage key "${key}" in namespace "${namespace}" changed.`,
    //         `Old value was "${oldValue}", new value is "${newValue}".`
    //     );
    // }
});

// chrome.cookies.onChanged.addListener(changeInfo => {
//     console.debug('chrome.cookies.onChanged', changeInfo)
// })

class Data {
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

class User {
    id
    name

    request() {
        return new Promise((resolve, reject) => {
            fetch('https://4pda.to/forum/index.php?act=inspector&CODE=id').then(response => {
                if (response.ok) {
                    response.text().then(text => {
                        let res = text.match(USER_ID_REGEX)
                        if (res) {
                            this.id = parseInt(res[1])
                            this.name = res[2]
                            console.debug('User: ', this.id, this.name)
                            resolve()
                        } else {
                            reject('Bad response')
                        }
                    })
                } else {
                    reject('Cant request to 4pda')
                }
            }).catch(reason => {
                console.error(reason)
                reject('Cant request to 4pda')
            })
        });
    }

}

// fetch('https://4pda.to').then(response => {
//     console.log(response)
// })

function logout() {
    console.warn('Logout!')
}

function notification(text) {
    console.warn(text)
}

const USER_ID_REGEX = /^(\d+) "([^"]+)"$/


class SW {
     constructor() {
         this.data = new Data()
         this.user = new User()
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
     }

     update_all() {
         console.debug('New update:', new Date())
         return new Promise((resolve, reject) => {
             this.user.request().then(() => {

             }).catch(reason => {
                 reject(reason)
             })
         })
     }
}

new SW().run()
