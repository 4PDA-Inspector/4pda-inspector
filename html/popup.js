const CLASS_THEME_USED = 'used'
const CLASS_HAS_UNREAD = 'hasUnread'
const CLASS_LOADING = 'loading'
const CLASS_HIDDEN = 'hidden'

chrome.runtime.sendMessage({action: 'popup'}, response => {
    console.debug(response)
    if (response) {
        if (response.user.id) {
            new Popup(response)
        } else {
            console.error('not auth')
            open_page('act=auth').finally(() => {
                window.close()
            })
        }
    } else {
        window.close()
    }
})


function open_url(url, set_active = true) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            action: 'open_url',
            url: url,
            set_active: set_active,
        }, (response) => {
            console.log(response)
        })
    })
}

function open_page(query) {
    return open_url('https://4pda.to/forum/index.php?' + query, true)
}


class Popup {

    constructor(init_data) {
        this.user = init_data.user
        this.vars_data = init_data.vars
        this.stats = init_data.stats

        this.elements = {}

        // window.onload = () => {
        //     setTimeout(() => {
        //         // странный но нужный фикс
        //         this.init_elements()
        //         this.refresh()
        //     }, 5)
        // }
        this.init_elements()
        this.refresh()
    }
    
    #open_page(query) {
        open_page(query).then(() => {
            this.check_auto_hide()
        })
    }

    init_elements() {
        if (this.vars_data.toolbar_width_fixed) {
            document.body.style.width = this.vars_data.toolbar_width + 'px'
            document.body.classList.add('widthFixed')
        }
        document.getElementsByTagName('html')[0].classList.add('theme_' + this.vars_data.toolbar_theme)

        this.elements.username_label = document.getElementById('panelUsername')
        this.elements.username_label.addEventListener("click", () => {
            this.#open_page('showuser=' + this.user.id)
        });

        this.elements.qmsBox = document.getElementById('panelQMS');
        this.elements.qmsBox.addEventListener("click", () => {
            this.#open_page('act=qms')
        });

        this.elements.favoritesBox = document.getElementById('panelFavorites');
        this.elements.favoritesBox.addEventListener("click", () => {
            this.#open_page('act=fav')
        });

        this.elements.mentionsBox = document.getElementById('panelMentions');
        this.elements.mentionsBox.addEventListener("click", () => {
            this.#open_page('act=mentions')
        });

        this.elements.themesList = document.getElementById('themesList');
        this.elements.templates_block = document.getElementById('templates');

        this.elements.massThemesActionsBox = document.getElementById('massThemesActions');
        this.elements.openAllLabel = document.getElementById('panelOpenAll');
        this.elements.openAllLabel.addEventListener("click", () => {
            this.open_themes(false)
        })
        this.elements.openAllPinLabel = document.getElementById('panelOpenAllPin');
        this.elements.openAllPinLabel.addEventListener("click", () => {
            this.open_themes(true)
        })
        this.elements.readAllLabel = document.getElementById('panelReadAll');
        this.elements.readAllLabel.addEventListener("click", () => {
            for (let theme of this.stats.favorites.list) {
                let row = document.getElementById('theme_' + theme.id)
                // todo
                // theme.read().then(() => {
                //     row.classList.add(CLASS_THEME_USED)
                //     this.update_themes_count()
                // })
            }
        })

        document.getElementById('panelSettings').addEventListener("click", () => {
            open_url('/html/options.html', true).then(() => {
                this.check_auto_hide()
            })
        })

        document.getElementById('panelRefresh').addEventListener('click', (event) => {
            let element = event.target
            element.classList.add(CLASS_LOADING)
            // this.bg.update_all_data().then(() => {
            //     this.refresh()
            // }).finally(() => {
            //     element.classList.remove(CLASS_LOADING)
            // })
        })

        this.print_user_links()
    }

    refresh() {
        this.elements.username_label.textContent = this.user.name

        let countBlocks = [
            [
                this.elements.qmsBox,
                this.stats.qms.count
            ], [
                this.elements.favoritesBox,
                this.stats.favorites.count
            ], [
                this.elements.mentionsBox,
                this.stats.mentions.count
            ]
        ]

        for (let c_block of countBlocks) {
            let block = c_block[0],
                count = c_block[1];
            block.textContent = count;
            if (count) {
                block.classList.add(CLASS_HAS_UNREAD);
            } else {
                block.classList.remove(CLASS_HAS_UNREAD);
            }
        }

        if (this.vars_data.toolbar_simple_list) {
            this.elements.themesList.className = 'simpleList';
        }

        if (!this.vars_data.toolbar_button_open_all) {
            this.elements.openAllLabel.classList.add(CLASS_HIDDEN);
        }
        if (!this.vars_data.toolbar_button_open_all || this.vars_data.toolbar_only_pin || !this.stats.favorites.pin_count) {
            this.elements.openAllPinLabel.classList.add(CLASS_HIDDEN);
        }
        if (!this.vars_data.toolbar_button_read_all) {
            this.elements.readAllLabel.classList.add(CLASS_HIDDEN);
        }
        if (this.elements.massThemesActionsBox.querySelectorAll(':not(.hidden)').length === 0) {
            this.elements.massThemesActionsBox.classList.add(CLASS_HIDDEN);
        }

        this.print_themes()
    }

    update_themes_count() {
        let count = this.elements.themesList.querySelectorAll('.oneTheme:not(.used)').length
        this.elements.favoritesBox.textContent = String(count)
        if (count === 0) {
            this.elements.favoritesBox.classList.remove(CLASS_HAS_UNREAD);
        }
    }

    print_user_links() {
        let block = document.getElementById('userLinks')
        block.textContent = ''
        if (this.vars_data.user_links) {
            for (let item of this.vars_data.user_links) {
                let link = document.createElement('span')
                link.innerText = item.title
                link.addEventListener("click", () => {
                    open_url(item.url, true).then(() => {
                        this.check_auto_hide()
                    })
                })
                block.appendChild(link)
            }
        }
    }

    open_themes(only_pin) {
        let limit = this.vars_data.open_themes_limit,
            themes = this.stats.favorites.list, // get_sorted_list(true),
            opened = 0

        // todo
        // for (let theme of themes) {
        //     if (only_pin && !theme.pin) {
        //         continue
        //     }
        //     let row = document.getElementById('theme_' + theme.id)
        //     theme.open_new_post().then(() => {
        //         row.classList.add(CLASS_THEME_USED)
        //         this.update_themes_count()
        //     })
        //     if (limit && ++opened >= limit) {
        //         break
        //     }
        // }
        this.check_auto_hide()
    }

    print_themes() {
        this.elements.themesList.textContent = "";

        if (this.stats.favorites.count) {
            // for (let theme of this.stats.favorites.get_sorted_list(false)) {
            for (let theme of this.stats.favorites.list) {
                this.add_theme_row(theme)
            }
        } else {
            let tpl = document.getElementById('tpl_no_themes').cloneNode(true)
            this.elements.themesList.appendChild(tpl);
        }
    }

    add_theme_row(theme) {
        let tpl = document.getElementById(this.vars_data.toolbar_simple_list ? 'tpl_one_theme_simple' : 'tpl_one_theme').cloneNode(true),
            tpl_caption = tpl.querySelector('.oneTheme_caption'),
            tpl_last_user = tpl.querySelector('.oneTheme_user'),
            tpl_last_dt = tpl.querySelector('.oneTheme_lastPost')
        tpl.id = 'theme_' + theme.id

        // todo
        // tpl.addEventListener("click", (el) => {
        //     let current = el.target;
        //     if (current.classList.contains('oneTheme_markAsRead')) {
        //         current.classList.add(CLASS_LOADING);
        //         theme.read().then(() => {
        //             tpl.classList.add(CLASS_THEME_USED);
        //             this.update_themes_count()
        //         }).finally(() => {
        //             current.classList.remove(CLASS_LOADING);
        //         })
        //     } else if (current.classList.contains('lastPost')) {
        //         theme.open_last_post().then(() => {
        //             tpl.classList.add(CLASS_THEME_USED)
        //             this.update_themes_count()
        //             this.check_auto_hide()
        //         })
        //     } else {
        //         theme.open_new_post().then(() => {
        //             tpl.classList.add(CLASS_THEME_USED)
        //             this.update_themes_count()
        //             this.check_auto_hide()
        //         })
        //     }
        // })

        tpl_caption.textContent = theme.title
        if (theme.pin && this.vars_data.toolbar_pin_color) {
            tpl_caption.classList.add('oneTheme_pin')
        }

        if (tpl_last_user) {
            tpl_last_user.textContent = theme.last_user_name
        }

        if (tpl_last_dt) {
            // tpl_last_dt.textContent = theme.last_post_dt
            tpl_last_dt.textContent = new Date(theme.last_post_ts*1000).toLocaleString()
        }

        this.elements.themesList.appendChild(tpl)
    }

    check_auto_hide() {
        if (this.vars_data.toolbar_open_theme_hide) {
            window.close();
        }
    }
}
