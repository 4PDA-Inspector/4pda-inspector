inspector4pda.mentions = {
    count: 0,
    rUrl: 'https://4pda.ru/forum/index.php?act=inspector&CODE=mentions',
    vUrl: 'https://4pda.ru/forum/index.php?act=mentions',
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
        inspector4pda.mentions.count = parseInt(text);
    },

    getCount: function() {
        return this.count;
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