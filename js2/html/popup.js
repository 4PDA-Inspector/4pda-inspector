new class {

    bg
    elements = {
        username_label: null,
        themesList: null,
    }
    vars_data

    constructor() {
        this.bg = chrome.extension.getBackgroundPage().inspector
        this.vars_data = this.bg.vars.data

        if (!this.bg.user.id) {
            console.error('not auth')
            //todo go to login
            return
        }

        this.init_elements()
        this.refresh()
    }

    init_elements() {
        this.elements.username_label = document.getElementById('panelUsername')
        this.elements.username_label.addEventListener("click", () => {
            this.bg.user.open_page()
        });

        this.elements.qmsBox = document.getElementById('panelQMS');
        this.elements.qmsBox.addEventListener("click", () => {
            this.bg.qms.open_page()
        });

        this.elements.favoritesBox = document.getElementById('panelFavorites');
        this.elements.favoritesBox.addEventListener("click", () => {
            this.bg.favorites.open_page()
        });

        this.elements.mentionsBox = document.getElementById('panelMentions');
        this.elements.mentionsBox.addEventListener("click", () => {
            this.bg.mentions.open_page()
        });

        this.elements.themesList = document.getElementById('themesList');
        this.elements.templates_block = document.getElementById('templates');

        this.elements.massThemesActionsBox = document.getElementById('massThemesActions');
        this.elements.openAllLabel = document.getElementById('panelOpenAll');
        this.elements.openAllPinLabel = document.getElementById('panelOpenAllPin');
        this.elements.readAllLabel = document.getElementById('panelReadAll');

        document.getElementById('panelSettings').addEventListener("click", () => {
            this.bg.browser.open_url('/html/options.html', true)
        })
    }

    refresh() {
        this.elements.username_label.textContent = this.bg.user.name

        const class_has_unread = 'hasUnread';
        let countBlocks = [
            [
                this.elements.qmsBox,
                this.bg.qms.count
            ], [
                this.elements.favoritesBox,
                this.bg.favorites.count
            ], [
                this.elements.mentionsBox,
                this.bg.mentions.count
            ]
        ]

        for (let c_block of countBlocks) {
            let block = c_block[0],
                count = c_block[1];
            block.textContent = count;
            if (count) {
                block.classList.add(class_has_unread);
            } else {
                block.classList.remove(class_has_unread);
            }
        }

        if (this.vars_data.toolbar_simple_list) {
            this.elements.themesList.className = 'simpleList';
        }

        if (!this.vars_data.toolbar_openAllFavs_button) {
            this.elements.openAllLabel.classList.add('hidden');
        }
        if (!this.vars_data.toolbar_openAllFavs_button || this.vars_data.toolbar_only_pin || !this.bg.favorites.pin_count) {
            this.elements.openAllPinLabel.classList.add('hidden');
        }
        if (!this.vars_data.toolbar_markAllAsRead_button) {
            this.elements.readAllLabel.classList.add('hidden');
        }
        if (this.elements.massThemesActionsBox.querySelectorAll(':not(.hidden)').length === 0) {
            this.elements.massThemesActionsBox.classList.add('hidden');
        }

        this.print_themes()

        // todo self.printUserLinks();
    }

    update_themes_count() {
        let count = this.elements.themesList.querySelectorAll('.oneTheme:not(.used)').length
        this.elements.favoritesBox.textContent = String(count)
    }

    print_themes() {
        this.elements.themesList.textContent = "";

        if (this.bg.favorites.count) {
            let themes = this.bg.favorites.get_sorted_list()
            for (let theme of themes) {
                this.add_theme_row(theme)
            }
        } else {
            // todo tpl
            let noThemesLabel = document.createElement('div');
            noThemesLabel.textContent = 'Непрочитанных тем нет';
            noThemesLabel.className = 'oneTheme';
            this.elements.themesList.appendChild(noThemesLabel);
        }
    }

    add_theme_row(theme) {
        //todo if toolbar_simple_list
        let tpl = document.getElementById(this.vars_data.toolbar_simple_list ? 'tpl_one_theme_simple' : 'tpl_one_theme').cloneNode(true),
            tpl_caption = tpl.querySelector('.oneTheme_caption'),
            tpl_last_user = tpl.querySelector('.oneTheme_user'),
            tpl_last_dt = tpl.querySelector('.oneTheme_lastPost'),
            read_button = tpl.querySelector('.oneTheme_markAsRead')
        tpl.removeAttribute('id')

        tpl_caption.textContent = theme.title
        if (theme.pin) {
            tpl_caption.classList.add('oneTheme_pin')
        }

        read_button.addEventListener("click", (el) => {
            let current = el.target;
            current.classList.add('loading');
            theme.read().then(() => {
                current.closest('.oneTheme').classList.add('used');
                this.update_themes_count()
            }).catch(() => {
                console.error('no response')
            }).finally(() => {
                current.classList.remove('loading');
            })
        })

        if (tpl_last_user) {
            tpl_last_user.textContent = theme.last_user_name
        }

        if (tpl_last_dt) {
            tpl_last_dt.textContent = theme.last_post_dt
        }

        this.elements.themesList.appendChild(tpl)
    }
}