class Mentions {
    count = 0

    get rURL() {
        return inspector.vars.doForumURL('act=inspector&CODE=mentions')
    }

    update_count() {
        return new Promise((resolve, reject) => {
            new XHR(this.rURL).send().then(resp => {
                try {
                    this.count = parseInt(resp.responseText)
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
        inspector.browser.open_url(inspector.vars.doForumURL('act=mentions'), true);
    }
}