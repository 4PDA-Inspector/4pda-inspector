inspector4pda.user = {
    rUrl: 'http://4pda.ru/forum/index.php?act=inspector&CODE=id',
    id: 0,
    name: '',

    request: function(callback) {
        var xmr = new inspector4pda.XHR();
        xmr.callback.success = function(resp) {

            if (resp.responseText) {
                var res = inspector4pda.utils.parse(resp.responseText);
                if (res.length == 2) {
                    inspector4pda.user.id = res[0];
                    inspector4pda.user.name = res[1];
                    callback();
                };
            };
        }
        xmr.send(this.rUrl);
    },

    open: function(id) {
        inspector4pda.utils.openPage('http://4pda.ru/forum/index.php?showuser=' + id);
    }
}