class Favorites {

    list = {}

    get rURL() {
        return inspector.vars.doForumURL('act=inspector&CODE=fav')
    }

    get count() {
        return Object.keys(this.list).length
    }

    get pin_count() {
        let count = 0
        for (let theme_id in this.list) {
            if (this.list[theme_id].pin) {
                count++
            }
        }
        return count
    }

    get_sorted_list(sort_by_acs) {
        return Object.values(this.list).sort(function (a, b) {
            if (inspector.vars.data.toolbar_pin_up) {
                let pinDef = b.pin - a.pin;
                if (pinDef !== 0) {
                    return pinDef;
                }
            }
            return (b.last_post_ts - a.last_post_ts) * (sort_by_acs ? -1 : 1);
        })
    }

    async update_list() {
        return new Promise((resolve, reject) => {
            new XHR(this.rURL).send().then(resp => {
                let new_list = {}
                if (resp.responseText) {
                    let lines = resp.responseText.split(/\r\n|\n/)
                    lines.forEach(line => {
                        if (line) {
                            try {
                                let theme = new FavoriteTheme(line)
                                new_list[theme.id] = theme
                                if (!(theme.id in this.list)) {
                                    //console.debug('new theme', theme)
                                    // todo notification
                                } else if (this.list[theme.id].last_post_ts < theme.last_post_ts) {
                                    //console.debug('new comment in theme', theme)
                                }
                            } catch (e) {

                            }
                        }
                    })
                }
                this.list = new_list
                return resolve()
            }).catch(resp => {
                console.log('no resp')
                console.log(resp)
                return reject()
            })
        })
    }

    delete_element(id) {
        delete this.list[id]
        inspector.browser.action_button.print_count()
    }

}


class FavoriteTheme {
    id = 0
    title = ''
    posts_num = ''
    last_user_id = ''
    last_user_name = ''
    last_post_ts = ''
    last_read_ts = ''
    pin = false
    // read = false

    get URL_last_post() {
        // return inspector.vars.doForumURL('showtopic='+this.id)
        return inspector.vars.doForumURL('showtopic='+this.id+'&view=getlastpost')
    }

    get last_post_dt() {
        return new Date(this.last_post_ts*1000).toLocaleString()
    }

    constructor(text_line) {
        let obj = Utils.parse(text_line)

        this.id = obj[0]
        this.title = obj[1]
        this.posts_num = obj[2]
        this.last_user_id = parseInt(obj[3])
        this.last_user_name = Utils.decode_special_chars(obj[4])
        this.last_post_ts = parseInt(obj[5])
        this.last_read_ts = parseInt(obj[6])
        this.pin = parseInt(obj[7])
    }

    async read() {
        return new Promise((resolve, reject) => {
            new XHR(this.URL_last_post).send().then(resp => {
                this.destroy()
                return resolve()
            }).catch(resp => {
                console.error('no resp', resp)
                return reject()
            })
        })
    }

    destroy() {
        delete inspector.favorites.delete_element(this.id)
    }

}