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

        // let vars = this.bg.vars.data
        this.init_elements()
        this.refresh()
    }

    init_elements() {
        this.elements.username_label = document.getElementById('panelUsername')
        this.elements.qmsBox = document.getElementById('panelQMS');
        this.elements.favoritesBox = document.getElementById('panelFavorites');
    }

    refresh() {
        this.elements.username_label.textContent = this.bg.user.name
    }
}
