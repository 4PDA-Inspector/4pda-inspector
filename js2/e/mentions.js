class Mentions {
    count = 0

    get rURL() {
        return inspector.vars.doForumURL('act=inspector&CODE=mentions')
    }
    get vURL() {
        return inspector.vars.doForumURL('act=mentions')
    }

    update_count() {
        return new Promise((resolve, reject) => {
            new XHR(this.rURL).send().then(resp => {
                try {
                    let new_count = parseInt(resp.responseText)
                    if (new_count > this.count) {
                        inspector.notifications.add('mentions_inc')
                    }
                    this.count = new_count
                } catch (e) {
                    this.count = 0
                }
                return resolve()
            }).catch(resp => {
                console.log('no resp')
                console.log(resp)
                return reject()
            })
        })
    }

    open_page() {
        inspector.browser.open_url(this.vURL, true).then();
    }
}