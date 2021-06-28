class QMS {
    list = {}

    get rURL() {
        return inspector.vars.doForumURL('act=inspector&CODE=qms')
    }

    get count() {
        return Object.keys(this.list).length
    }

    async update_dialogs() {
        return new Promise((resolve, reject) => {
            new XHR(this.rURL).send().then(resp => {
                let new_list = {}
                if (resp.responseText) {
                    let lines = resp.responseText.split(/\r\n|\n/)
                    lines.forEach(line => {
                        if (line) {
                            try {
                                let dialog = new Dialog(line)
                                new_list[dialog.id] = dialog
                                if (!(dialog.id in this.list)) {
                                    console.debug('new dialog', dialog)
                                } else if (this.list[dialog.id].last_msg_ts < dialog.last_msg_ts) {
                                    console.debug('new message in dialog', dialog)
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
}

class Dialog {

    id = 0
    title = ''
    opponent_id = ''
    opponent_name = ''
    last_msg_ts = ''
    unread_msgs = 0
    last_msg_id = ''
    // read = false

    constructor(text_line) {
        var obj = Utils.parse(text_line);

        this.id = obj[0];
        this.title = obj[1];
        this.opponent_id = obj[2];
        this.opponent_name = obj[3];
        this.last_msg_ts = obj[4];
        this.unread_msgs = parseInt(obj[5]);
        this.last_msg_id = obj[6];
    }
}