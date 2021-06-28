class CS {

    browser
    vars

    user
    favorites
    qms
    mentions

    timeout_updater = 0
    last_event = 0
    was_first_request = false

    constructor() {
        console.debug('init CS', new Date())
        this.vars = new Vars()
        this.browser = new Browser()
        this.vars.read_storage().then(() => {
            this.user = new User()
            this.favorites = new Favorites()
            this.qms = new QMS()
            this.mentions = new Mentions()

            this.update_all_data()
        }).catch(() => {
            console.error('Can\'t init inspector')
        })
    }

    get rURL() {
        return this.vars.APP_URL + '/er/u' + this.user.id + '/s' + this.last_event;
    }

    update_all_data() {
        console.debug('request', new Date())
        this.user.check_user().then(() => {
            console.debug('user update - OK')
            this.favorites.update_list().then(() => {
                console.debug('favorites update - OK')
                this.qms.update_dialogs().then(() => {
                    console.debug('qms update - OK')
                    this.mentions.update_count().then(() => {
                        console.debug('mentions update - OK')
                        console.debug('all updated')
                        this.was_first_request = true
                        this.browser.action_button.print_count()
                        this.start_new_request_timeout()
                    }).catch(() => {
                        console.error('mentions update - bad')
                    })
                }).catch(() => {
                    console.error('qms update - bad')
                })
            }).catch(() => {
                console.error('favorites update - bad')
            })
        }).catch(() => {
            // inspector4pda.cScript.clearData();
            // inspector4pda.cScript.printLogout(true);
            console.error('user update - bad')
        })
    }

    start_new_request_timeout() {
        this.timeout_updater = setTimeout(() => {
            this.check_need_update()
        }, this.vars.interval_ms)
    }

    check_need_update() {
        this.user.check_cookie_member_id().then(uid => {
            if (uid) {
                if (uid === this.user.id) {
                    // check update
                    this.request_last_event().then(() => {
                        //this.start_new_request_timeout()
                    }).catch(() => {
                        console.debug('bad request - N/A?')
                    })
                } else {
                    console.debug('new user:' + uid)
                    this.was_first_request = false
                    this.update_all_data()
                }
            } else {
                console.debug('logout')
            }
        }).catch(() => {
            console.debug('logout?')
        })
    }

    async request_last_event() {
        console.debug('request_last_event', new Date())
        return new Promise((resolve, reject) => {
            new XHR(this.rURL).send().then(resp => {
                let last_event = Utils.app_parse_last_event(resp.responseText)
                if (last_event) {
                    console.debug('has new events')
                    this.last_event = last_event
                    this.update_all_data()
                } else {
                    console.debug('no new events')
                    this.start_new_request_timeout()
                }
                return resolve()
            }).catch(resp => {
                console.log('app - no resp')
                console.log(resp)
                return reject()
            })
        })
    }
}

var inspector = new CS()
