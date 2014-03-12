var user = {
    rUrl: 'http://4pda.ru/forum/index.php?act=inspector&CODE=id',
    auth: false,
    id: 0,
    name: '',

    rAuth: function(callback) {
        var xmr = Object.create(iXMR);
        xmr.callback.success = function(resp) {

            if (resp.responseText) {
                var res = utils.parse(resp.responseText);
                if (res.length == 2) {
                    user.auth = true;
                    user.id = res[0];
                    user.name = res[1];
                    callback();
                };
            };
        }
        xmr.send(this.rUrl);
    }
}