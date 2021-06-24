inspector4pda.mentions = {
    count: 0,
    get rUrl() {
        return inspector4pda.vars.doForumURL('act=inspector&CODE=mentions')
    },
    get vUrl() {
        return inspector4pda.vars.doForumURL('act=mentions')
    },
    list: {},

    request: function(callback) {
        var xmr = new inspector4pda.XHR();
        xmr.callback.success = function(resp) {
            inspector4pda.mentions.parse(resp.responseText);
            if (callback) {
				callback(inspector4pda.mentions.count);
            }
        };
        xmr.send(inspector4pda.mentions.rUrl);
    },

    parse: function(text) {
        console.debug('parse_mentions')
        let new_count = parseInt(text);
        if (new_count != this.count) {
            inspector4pda.cScript.addNotification(
                'mentions_notification',
                inspector4pda.cScript.eventMention,
                'Новые упоминания',
                ''
            );
        }
        inspector4pda.mentions.count = new_count;
    },

    openPage: function () {
        inspector4pda.utils.openPage(inspector4pda.mentions.vUrl, true);
    },

    add: function(themeId, commentId) {
        if (typeof this.list[themeId] == 'undefined' || this.list[themeId] < commentId) {
            this.list[themeId] = commentId;
            return true;
        } else {
            return false;
        }
    }
};