class User {

    id = 0
    name
    COOKIE_NAME = 'member_id'

    get rURL() {
        return inspector.vars.doForumURL('act=inspector&CODE=id')
    }

    async check_user() {
        return new Promise((resolve, reject) => {
            this.check_cookie_member_id().then(uid => {
                console.log(uid)
                this.request().then(() => {
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
        return new Promise((resolve, reject) => {
            chrome.cookies.get({
                url: inspector.vars.BASE_URL,
                name: this.COOKIE_NAME
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
        return new Promise((resolve, reject) => {
            new XHR(this.rURL).send().then(resp => {
                let res = Utils.parse(resp.responseText)
                if (res && res.length == 2) {
                    this.id = parseInt(res[0])
                    this.name = res[1]
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