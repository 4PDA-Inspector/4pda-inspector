import { open_url } from '../browser.js';
import { AbstractEntity } from "./abstract.js";
import { SETTINGS } from '../cs.js'


export class Mentions extends AbstractEntity {
    ACT_CODE_API = 'mentions-list';
    ACT_CODE_FORUM = 'mentions';

    process_line(line) {
        let mention = new Mention(line),
            n_level = 100;
        if (mention.from !== 0) return;

        if (!this.exists(mention.id)) {
            // console.debug('new_mention:', mention.title, mention.poster_name);
            n_level = 20;
        }
        if (this.notify && n_level <= SETTINGS.notification_mentions_level) {
            mention.notification();
        }
        return mention;
    }
}

class Mention {

    constructor(obj) {
        this.from = obj[0] // 0 = forum, 1 = site
        this.topic_id = obj[1]; //or post_id
        this.post_id = obj[2]; //or comment_id
        this.title = obj[3]
        this.timestamp = obj[4]
        //this.poster_id = obj[5]
        this.poster_name = obj[6]
    }

    get id() {
        return `${this.topic_id}_${this.post_id}`;
    }

    // deprecated
    get key() { return this.id; }

    notification() {
        return chrome.notifications.create(
            `${this.timestamp}/mention/${this.id}`
        , {
            'contextMessage': 'Новое упоминание',
            'title': this.title,
            'message': this.poster_name,
            'eventTime': this.timestamp*1000,
            'iconUrl': 'img/icons/icon_80_mention.png',
            'type': 'basic'
        });
    }

    open() {
        return open_url(`https://4pda.to/forum/index.php?showtopic=${this.topic_id}&view=findpost&p=${this.post_id}`);
    }

}