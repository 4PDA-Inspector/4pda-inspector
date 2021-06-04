inspector4pda.QMS = {
    unreadCount: 0,
    count: {
        messages: 0,
        dialogs: 0
    },
    rUrl: inspector4pda.vars.BASE_URL + '/forum/index.php?act=inspector&CODE=qms',
    vUrl: inspector4pda.vars.BASE_URL + '/forum/index.php?act=qms',
    list: {},

    request: function(callback) {
        var xmr = new inspector4pda.XHR();
        xmr.callback.success = function(resp) {
            inspector4pda.QMS.parse(resp.responseText);
            if (callback) {
                callback();
            }
        };
        xmr.send(inspector4pda.QMS.rUrl);
    },

    requestDialog: function(id, callback) {
        var xmr = new inspector4pda.XHR();
        xmr.callback.success = function(resp) {
            if (callback) {
                callback(resp.responseText, id);
            }
        };
        xmr.send(inspector4pda.QMS.rUrl + '&t=' + id);
    },

    parse: function(text) {
        inspector4pda.QMS.count.messages = 0;
        inspector4pda.QMS.count.dialogs = 0;
        inspector4pda.QMS.unreadCount = 0;
        inspector4pda.QMS.list = {};
        var tText = text
            ? text.replace('\r','').split('\n')
            : [];
        for (let i = 0; i < tText.length; i++) {
            if (tText[i]) {
                let dialog = new qDialog();
                if (dialog.parse(tText[i])) {
                    inspector4pda.QMS.list[dialog.id] = dialog;
                    inspector4pda.QMS.count.messages += dialog.unread_msgs;
                    inspector4pda.QMS.count.dialogs++;
                }
            }
        }
        inspector4pda.QMS.unreadCount = inspector4pda.QMS.count.dialogs;
    },

    openChat: function(dialogID, themeID, setActive) {
        inspector4pda.utils.openPage(
            inspector4pda.vars.BASE_URL + '/forum/index.php?act=qms&mid=' + dialogID + (themeID ? '&t=' + themeID : ''),
            setActive,
            function() {
                if (themeID) {
                    delete inspector4pda.QMS.list[themeID];
                    inspector4pda.cScript.printCount();
                }
            }
        );
    },

    getCount: function() {
        this.unreadCount = Object.keys(inspector4pda.QMS.list).length;
        return this.unreadCount;
    },

    openPage: function () {
        inspector4pda.utils.openPage(inspector4pda.QMS.vUrl, true);
    }
};

var qDialog = function () {
    this.id = 0;
    this.title = '';
    this.opponent_id = '';
    this.opponent_name = '';
    this.last_msg_ts = '';
    this.unread_msgs = 0;
    this.last_msg_id = '';
    this.read = false;

    this.parse = function(text) {
        try {
            var obj = inspector4pda.utils.parse(text);
            this.id = obj[0];
            this.title = obj[1];
            this.opponent_id = obj[2];
            this.opponent_name = obj[3];
            this.last_msg_ts = obj[4];
            this.unread_msgs = parseInt(obj[5]);
            this.last_msg_id = obj[6];
        } catch(e) {
            return false;
        }
        return this;
    };

    this.isRead = function() {
        return (this.read == true);
    };

    this.setRead = function() {
        this.read = true;
    };
};