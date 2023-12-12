// import * as constants from  './o/defaults.js'
// import * as utils from './o/utils.js'
// console.log(constants.CURRENT_BUILD)
// console.log(utils.now())

console.debug('Init SW', new Date())

chrome.storage.onChanged.addListener((changes, namespace) => {
    console.debug('chrome.storage.onChanged', changes, namespace)
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

const USER_ID_REGEX = /^(\d+) "([^"]+)"$/
const FAVORITES_REGEX = /^(\d+) "([^"]+)" (\d+) (\d+) "([^"]+)" (\d+) (\d+) (\d+)$/gm

function logout() {
    console.warn('Logout!')
}

function notification(text) {
    console.warn(text)
}

function request_and_parse(code) {
    return new Promise((resolve, reject) => {
        fetch('https://4pda.to/forum/index.php?act=inspector&CODE=' + code).then(response => {
            if (response.ok) {
                response.text().then(text => {
                    resolve(text)
                }).catch(r => {
                    console.error(r)
                    reject('Cant read')
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
        console.debug('update user..')
        return new Promise((resolve, reject) => {
            request_and_parse('id').then(res => {
                // console.debug(res)
                res = res.match(USER_ID_REGEX)
                if (res) {
                    this.id = parseInt(res[1])
                    this.name = res[2]
                    console.debug('User: ', this.id, this.name)
                    resolve()
                } else {
                    reject('Unauthorized')
                }
            }).catch(r => {
                reject(r)
            })
        })
    }

}

class Favorites {
    list = {}

    request() {
        console.debug('update favorites..')
        this.list = {}
        return new Promise((resolve, reject) => {
            request_and_parse('fav').then(res => {
                let m
                while ((m = FAVORITES_REGEX.exec(res)) !== null) {
                    let theme = new FavoriteTheme(m)
                    // console.log(theme)
                    this.list[theme.id] = theme
                }
                resolve()
            }).catch(r => {
                reject(r)
            })
        })
    }
}

class FavoriteTheme {
    constructor(obj) {
        // console.log(obj)
        this.id = obj[1]
        this.title = obj[2]// Utils.decode_special_chars(obj[2])
        this.posts_num = obj[3]
        this.last_user_id = parseInt(obj[4])
        this.last_user_name = obj[5] //Utils.decode_special_chars(obj[5])
        this.last_post_ts = parseInt(obj[6])
        this.last_read_ts = parseInt(obj[7])
        this.pin = (obj[8] == "1")
        this.viewed = false
    }
}

class QMS {
    list = {}

    request() {
        console.debug('update qms..')
        this.list = {}
        return new Promise((resolve, reject) => {
            request_and_parse('qms').then(res => {
                console.log(res)
                // todo
                resolve()
            }).catch(r => {
                reject(r)
            })
        })
    }
}

class SW {
     constructor() {
         this.data = new Data()
         this.user = new User()
         this.favorites = new Favorites()
         this.qms = new QMS()
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
                 this.favorites.request().then(() => {
                     this.qms.request().then(() => {

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

new SW().run()
