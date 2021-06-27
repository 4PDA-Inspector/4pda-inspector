class User {

    id = 0
    name
    COOKIE_NAME = 'member_id'

    get rURL() {
        return inspector.vars.doForumURL('act=inspector&CODE=id')
    }

    async init() {
        let self = this
        return new Promise((resolve, reject) => {
            self.check_cookie_member_id().then(uid => {
                console.log(uid)
                self.request().then(() => {
                    return resolve()
                }).catch(() => {
                    return reject()
                })
            }).catch(() => {
                console.log('no logged')
                return reject()
            })
        })
    }

    async check_cookie_member_id() {
        // fast way to check is logged
        let self = this
        return new Promise((resolve, reject) => {
            chrome.cookies.get({
                url: inspector.vars.BASE_URL,
                name: self.COOKIE_NAME
            }, cookie => {
                if (cookie) {
                    return resolve(cookie.value);
                } else {
                    return reject()
                }
            });
        })
    }

    async request() {
        let self = this
        return new Promise((resolve, reject) => {
            new XHR(this.rURL).send().then(resp => {
                let res = Utils.parse(resp.responseText)
                if (res && res.length == 2) {
                    console.log(res)
                    self.id = parseInt(res[0])
                    self.name = res[1]
                    return resolve()
                }
                return reject()
            }).catch(resp => {
                console.log('no resp')
                console.log(resp)
                return reject()
            })
        })
    }
}