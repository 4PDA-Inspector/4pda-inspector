if (typeof inspector4pda == "undefined") {
    var inspector4pda = {}
}

inspector4pda.browser = {

    showNotification: function(params) {

        var defaultParams = {
            id: '4pdainspector_test_' + (new Date().getTime()),
            title: '4PDA Инспектор',
            message: 'Оповещения успешно включены',
            iconUrl: '/icons/icon_80.png',
            isClickable: false
        };

        params = Object.assign(defaultParams, params);

        chrome.notifications.create(params.id, {
            type: "basic",
            title: params.title,
            message: params.message,
            iconUrl: 'chrome-extension://' + chrome.i18n.getMessage("@@extension_id") + params.iconUrl,
            isClickable: params.isClickable
        });
    }

};