import {AbstractEvents} from "./abstract.js";
import {request_and_parse} from "../utils.js";

export class QMS extends AbstractEvents {

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
