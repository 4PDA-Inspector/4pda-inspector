import { fetch4, parse_response } from "../utils.js";
import { open_url } from '../browser.js';


export class AbstractEntity {
    ACT_CODE_API = '';
    ACT_CODE_FORUM = '';
    
    constructor(cs) {
        this.cs = cs;
        this._list = {};
        this.notify = false;
    }

    get list() {
        return Object.values(this._list);
    }

    get count() {
        return Object.keys(this._list).length;
    }

    get(id) {
        return this._list[id];
    }

    exists(id) {
        return id in this._list;
    }

    reset() {
        this._list = {};
        this.notify = false;
    }

    async open(id, ...args) {
        if (id) {
            let entity = this._list[id];
            if (entity) {
                return entity.open(...args);
            } else {
                console.warn('Entity not found:', id);
            }
        } else {
            return open_url(`https://4pda.to/forum/index.php?act=${this.ACT_CODE_FORUM}`);
        }
    }

    async update() {
        return fetch4(`https://4pda.to/forum/index.php?act=inspector&CODE=${this.ACT_CODE_API}`)
            .then(data => {
                //console.debug(this.ACT_CODE_API, data);
                let lines = data.split(/\r\n|\n/),
                    new_list = {};
                lines.forEach(line => {
                    if (line == "") return;
                    // console.debug('AbstractEntity:', line);
                    const entity = this.process_line(parse_response(line));
                    if (entity) new_list[entity.id] = entity;
                });
                this._list = new_list;
            })
            .then(() => {
                this.notify = true;
            });
    }

    process_line(line) {
        console.debug(line);
        throw new Error('Not implemented');
    }
        
}

export class AbstractEntityElement {}
