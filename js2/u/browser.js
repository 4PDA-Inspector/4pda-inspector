class Browser {

    notification_sound

    action_icons = {
        default: '/icons/icon_19.png',
        has_qms: '/icons/icon_19_qms.png',
        logout: '/icons/icon_19_out.png'
    }
    notification_icons = {
        default: "/icons/icon_80.png",
        qms: "/icons/icon_80_message.png",
        theme: "/icons/icon_80_favorite.png",
        mention: "/icons/icon_80_mention.png",
        out: "/icons/icon_80_out.png",
    }
    colors = {
        default: [63, 81, 181, 255],
        has_qms: [76, 175, 80, 255],
        logout: [158, 158, 158, 255],
    }

    constructor() {
        //chrome.notifications.onClicked.addListener(this.bgClass.cScript.notificationClick);
        this.notification_sound = new Audio('/sound/sound3.ogg')
    }

    play_notification_sound() {
        this.notification_sound.play()
    }

    show_notification(params) {
        let defaultParams = {
            id: '4pda_inspector_test_' + (Utils.now()),
            title: "4PDA Инспектор",
            message: 'Оповещения успешно включены',
            iconUrl: this.notification_icons.default
        };
        params = {...defaultParams, ...params}

        chrome.notifications.create(params.id, {
            type: "basic",
            title: params.title,
            message: params.message,
            iconUrl: params.iconUrl,

            //eventTime: Utils.now() - 3600,
            //contextMessage: 'context',
            /*buttons: [
                {title: 'test1'},
                {title: 'test2'},
            ]*/
        });
    }
}