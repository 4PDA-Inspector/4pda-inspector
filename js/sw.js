import {Data} from "./data.js";
import {User} from './user.js'
import {Favorites} from './favorites.js'
import {QMS} from './qms.js'
import {Mentions} from './mentions.js'


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

new SW().run()
