class Favorites {

    list = {}

    get rURL() {
        return inspector.vars.doForumURL('act=inspector&CODE=fav')
    }

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

    get_sorted_list(sort_by_acs) {
        return this.list_filtered.sort(function (a, b) {
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
                                if (inspector.vars.data.toolbar_only_pin && !theme.pin) {
                                    return
                                }
                                new_list[theme.id] = theme
                                if (!(theme.id in this.list)) {
                                    console.debug('new_theme:', theme.title)
                                    inspector.notifications.add('new_theme', theme)
                                } else if (this.list[theme.id].last_post_ts < theme.last_post_ts) {
                                    // todo if viewed - new_theme
                                    console.debug('new_comment_in_theme:', theme.title)
                                    inspector.notifications.add('new_comment_in_theme', theme)
                                }
                            } catch (e) {

                            }
                        }
                    })
                }
                this.list = new_list
                return resolve()
            }).catch(() => {
                return reject()
            })
        })
    }

    open_page() {
        inspector.browser.open_url(inspector.vars.doForumURL('act=fav'), true).then();
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
    viewed = false


    get URL_first_post() {
        return inspector.vars.doForumURL('showtopic='+this.id)
    }
    get URL_last_post() {
        return inspector.vars.doForumURL('showtopic='+this.id+'&view=getlastpost')
    }
    get URL_new_post() {
        return inspector.vars.doForumURL('showtopic='+this.id+'&view=getnewpost')
    }
    URL_comment(comment_id) {
        return inspector.vars.doForumURL('showtopic='+this.id+'&view=findpost&p='+comment_id)
    }
    /*get API_URL() {
        return inspector.vars.doForumURL(`act=inspector&CODE=fav&t=${this.id}`)
    }*/

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
        this.pin = (obj[7] == "1")
    }

    async read() {
        return new Promise((resolve, reject) => {
            new XHR(this.URL_last_post).send().then(() => {
                this.view()
                return resolve()
            }).catch(resp => {
                console.error('no resp', resp)
                return reject()
            })
        })
    }

    async open_new_post(set_active) {
        return this._open_post(this.URL_new_post, set_active)
    }
    async open_last_post(set_active) {
        return this._open_post(this.URL_last_post, set_active)
    }
    async _open_post(url, set_active) {
        return new Promise((resolve, reject) => {
            inspector.browser.open_url(url, set_active).then(() => {
                this.view()
                return resolve()
            })
        })
    }

    view() {
        this.viewed = true
        inspector.browser.action_button.print_count()
    }

}