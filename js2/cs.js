class CS {

    bg
    vars
    user

    constructor() {
        let self = this
        console.log(new Date(), 'init CS')
        this.vars = new Vars()
        this.vars.read_storage().then(() => {
            console.log('this.vars.data', this.vars.data.interval)

            //chrome.notifications.onClicked.addListener(this.bgClass.cScript.notificationClick);
            self.user = new rUser()
            self.user.init()
        })
    }

    request() {

    }
}

var inspector = new CS()
