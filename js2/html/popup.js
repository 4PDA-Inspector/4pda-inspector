new class {

    bg
    elements = {
        username_label: null,
    }

    constructor() {
        this.bg = chrome.extension.getBackgroundPage().inspector

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
        this.elements.qmsBox = document.getElementById('panelQMS');
        this.elements.favoritesBox = document.getElementById('panelFavorites');
        this.elements.mentionsBox = document.getElementById('panelMentions');

        this.elements.themesList = document.getElementById('themesList');

        this.elements.massThemesActionsBox = document.getElementById('massThemesActions');
        this.elements.openAllLabel = document.getElementById('panelOpenAll');
        this.elements.openAllPinLabel = document.getElementById('panelOpenAllPin');
        this.elements.readAllLabel = document.getElementById('panelReadAll');
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

        let vars_data = this.bg.vars.data
        if (vars_data.toolbar_simple_list) {
            this.elements.themesList.className = 'simpleList';
        }

        if (!vars_data.toolbar_openAllFavs_button) {
            this.elements.openAllLabel.classList.add('hidden');
        }
        if (!vars_data.toolbar_openAllFavs_button || vars_data.toolbar_only_pin || !this.bg.favorites.pin_count) {
            this.elements.openAllPinLabel.classList.add('hidden');
        }
        if (!vars_data.toolbar_markAllAsRead_button) {
            this.elements.readAllLabel.classList.add('hidden');
        }
        if (this.elements.massThemesActionsBox.querySelectorAll(':not(.hidden)').length === 0) {
            this.elements.massThemesActionsBox.classList.add('hidden');
        }

    }
}
