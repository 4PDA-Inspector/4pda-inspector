import {request_and_parse} from "./utils.js";

export class Mentions {
    list = {}

    request() {
        console.debug('update mentions..')
        this.list = {}
        return new Promise((resolve, reject) => {
            request_and_parse('mentions-list').then(res => {
                console.log(res)
                // todo
                resolve()
            }).catch(r => {
                reject(r)
            })
        })
    }
}