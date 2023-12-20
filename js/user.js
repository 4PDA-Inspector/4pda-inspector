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
                    let old_id = this.id
                    this.id = parseInt(res[1])
                    this.name = escape_html(res[2])
                    let is_new_user = (this.id != old_id)
                    if (is_new_user) {
                        console.debug('New user: ', this.id, this.name, old_id)
                    }
                    resolve(is_new_user, old_id)
                } else {
                    this.id = null
                    this.name = null
                    reject(new UnauthorizedError())
                }
            }).catch(r => {
                reject(r)
            })
        })
    }
}
