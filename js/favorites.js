import {request_and_parse} from "./utils.js";

const FAVORITES_REGEX = /^(\d+) "([^"]+)" (\d+) (\d+) "([^"]+)" (\d+) (\d+) (\d+)$/gm

export class Favorites {
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
