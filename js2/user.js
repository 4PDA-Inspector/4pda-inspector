class rUser {

    id = 0
    COOKIE_NAME = 'member_id'

    get rURL() {
        return inspector.vars.doForumURL('act=inspector&CODE=id')
    }

    async init() {
        let self = this
        self.check_cookie_member_id().then(uid => {
            console.log(uid)
            self.request()
        }).catch(() => {
            console.log('no uid')
        })
    }

    async check_cookie_member_id() {
        let self = this
        return new Promise((resolve, reject) => {
            chrome.cookies.get({
                url: inspector.vars.BASE_URL,
                name: self.COOKIE_NAME
            }, function(cookie) {
                if (cookie) {
                    return resolve(cookie.value);
                } else {
                    return reject()
                }
            });
        })
    }

    async request() {
        new XHR(this.rURL).send().then(resp => {
            console.log(resp.responseText)
        }).catch(resp => {
            console.log('no resp')
            console.log(resp)
        })
    }
}