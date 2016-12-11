inspector4pda.mentions = {
    count: 0,
    rUrl: 'http://4pda.ru/forum/index.php?act=inspector&CODE=mentions',
    vUrl: 'http://4pda.ru/forum/index.php?act=mentions',

    request: function(callback) {
        var xmr = new inspector4pda.XHR();
        xmr.callback.success = function(resp) {
            inspector4pda.mentions.parse(resp.responseText);
            if (callback) {
                callback();
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
    }
};