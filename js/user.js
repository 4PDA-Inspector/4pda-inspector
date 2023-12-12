import {request_and_parse} from "./utils.js";

const USER_ID_REGEX = /^(\d+) "([^"]+)"$/

export class User {
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
