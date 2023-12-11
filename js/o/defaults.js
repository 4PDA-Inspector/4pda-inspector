console.log('Defaults init..')

const CURRENT_BUILD = 20210701

const NOTIFICATION_ICONS = {
    default: "/icons/icon_80.png",
    qms: "/icons/icon_80_message.png",
    favorite: "/icons/icon_80_favorite.png",
    mention: "/icons/icon_80_mention.png",
    out: "/icons/icon_80_out.png",
}

const NOTIFICATION_SOUND = '/sound/sound3.ogg'

const ACTION_BUTTON_ICONS = {
    default: '/icons/icon_19.png',
    has_qms: '/icons/icon_19_qms.png',
    logout: '/icons/icon_19_out.png'
}

const ACTION_BUTTON_COLORS = {
    default: [63, 81, 181, 255],
    has_qms: [76, 175, 80, 255],
    logout: [158, 158, 158, 255],
}

const USER_LINKS_URL_REGEXP = /^(https?:\/\/)4pda\.to([\/\w.-?=&#]*)*\/?$/
const MEMBER_COOKIE_NAME = 'member_id'

const DEFAULT_SETTINGS = {
    interval: 30,
    open_themes_limit: 0,

    notification_sound_volume: 0.5,

    notification_themes_sound: true,
    notification_themes_popup: true,
    notification_themes_all_comments: false,

    notification_qms_sound: true,
    notification_qms_popup: true,
    notification_qms_all_messages: false,

    notification_mentions_sound: true,
    notification_mentions_popup: true,

    toolbar_pin_color: true,
    toolbar_pin_up: false,
    toolbar_only_pin: false,
    toolbar_open_theme_hide: true,
    toolbar_simple_list: false,

    toolbar_button_open_all: true,
    toolbar_button_read_all: true,

    toolbar_width_fixed: false,
    toolbar_width: 400,
    toolbar_theme: 'auto',

    open_in_current_tab: false,
    user_links: [],

    build: 0
}