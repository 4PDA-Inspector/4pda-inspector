import {request_and_parse, escape_html} from "./utils.js";
import {UnauthorizedError} from './errors.js'

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
                    this.name = escape_html(res[2])
                    console.debug('User: ', this.id, this.name)
                    resolve()
                } else {
                    reject(new UnauthorizedError())
                }
            }).catch(r => {
                reject(r)
            })
        })
    }
}
