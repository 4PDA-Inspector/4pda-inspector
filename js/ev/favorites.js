import {AbstractEvents} from "./abstract.js";
import {request_and_parse, escape_html} from "../utils.js";

const FAVORITES_REGEX = /^(\d+) "([^"]+)" (\d+) (\d+) "([^"]+)" (\d+) (\d+) (\d+)$/gm

export class Favorites extends AbstractEvents {

    get count() {
        return this.list_filtered.length
    }

    get pin_count() {
        return this.list_filtered.reduce((count, current) => {
            return count + current.pin
        }, 0)
    }

    get list_filtered() {
        return Object.values(this.list).filter(theme => !theme.viewed)
    }

    // get_sorted_list(sort_by_acs) {
    //     return this.list_filtered.sort(function (a, b) {
    //         if (inspector.vars.data.toolbar_pin_up) {
    //             let pinDef = b.pin - a.pin;
    //             if (pinDef !== 0) {
    //                 return pinDef;
    //             }
    //         }
    //         return (b.last_post_ts - a.last_post_ts) * (sort_by_acs ? -1 : 1);
    //     })
    // }

    request() {
        console.debug('update favorites..')
        let new_list = {}
        return new Promise((resolve, reject) => {
            request_and_parse('fav').then(res => {
                let m
                while ((m = FAVORITES_REGEX.exec(res)) !== null) {
                    let theme = new FavoriteTheme(m)
                    new_list[theme.id] = theme
                    if (!(theme.id in this.list)) {
                        this.notifications.add_event('new_theme', theme)
                    }
                }
                this.list = new_list
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
        this.title = escape_html(obj[2])
        // this.posts_num = obj[3]
        // this.last_user_id = parseInt(obj[4])
        this.last_user_name = escape_html(obj[5])
        this.last_post_ts = parseInt(obj[6])
        // this.last_read_ts = parseInt(obj[7])
        this.pin = (obj[8] == "1")
        this.viewed = false
    }
}
