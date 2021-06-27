class Favorites {

    list = {}

    get rURL() {
        return inspector.vars.doForumURL('act=inspector&CODE=fav')
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
                                    console.debug('new theme', theme)
                                } else if (this.list[theme.id]['last_post_ts'] < theme.last_post_ts) {
                                    console.debug('new comment in theme', theme)
                                }
                            } catch (e) {

                            }
                        }
                    })
                }
                this.list = new_list
                //console.debug(this.list)
                return resolve()
            }).catch(resp => {
                console.log('no resp')
                console.log(resp)
                return reject()
            })
        })
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

    constructor(text_line) {
        let obj = Utils.parse(text_line)

        this.id = obj[0]
        this.title = obj[1]
        this.posts_num = obj[2]
        this.last_user_id = parseInt(obj[3])
        this.last_user_name = obj[4]
        this.last_post_ts = parseInt(obj[5])
        this.last_read_ts = parseInt(obj[6])
        this.pin = parseInt(obj[7])
    }

}