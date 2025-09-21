import * as cbtype from 'https://github.com/kanoloa/cbclient/raw/main/types/index.ts';
import * as cb from 'https://github.com/kanoloa/cbclient/raw/main/mod.ts';
import * as POS from "../config/map.ts";
import {DATA, ENV} from "../types/types.ts";

export async function deleteItem(env: ENV, itemId: number) {
    const DEBUG = (env.debug == true);
    const cbinit: cbtype.cbinit = {
        username: env.username,
        password: env.password,
        serverUrl: env.server_url
    }

    const res = await cb.deleteItem(cbinit, Number(itemId));
    if (! cb.isTrackerItem(res)) {
        console.error(`deleteItem(): error response retuned from Codebeamer: ${JSON.stringify(res)}`);
        return false;
    }

    return true;

}

export async function load (env: ENV) {

    // const query = `project.id in (${env.project_id}) AND tracker.id in (${env.tracker_id})`;
    const query = 'project.id in (363) and tracker.id in (6545508)';

    const DEBUG = (env.debug == true);
    if (DEBUG) {
        console.log(`codebeamer.load(): url:       ${env.server_url}`);
        console.log(`codebeamer.load(): project:   ${env.project_id}`);
        console.log(`codebeamer.load(): tracker:   ${env.tracker_id}`);
        console.log(`codebeamer.load(): query:     ${query}`);
        console.log(`codebeamer.load(): username:  ${env.username}`);
        console.log(`codebeamer.load(): password:  ${env.password}`);
        console.log(`codebeamer.load(): proxy_url: ${env.proxy_url}`);
    }

    const cbinit: cbtype.cbinit = {
        username: env.username,
        password: env.password,
        serverUrl: env.server_url
    }

    const map = new Map<number, DATA>();

    const res = await cb.queryItems(cbinit, query, 1, 200);
    if(cb.isTrackerItemSearchResult(res)) {
        if (res.items != null) {
            console.log(`codebeamer.load(): ${res.total} items retrieved from Codebeamer.`);
            res.items.forEach(item => {
                const entry: DATA = {};
                entry.itemId = item.id;
                entry.name = item.name;
                entry.status = item.status.name;

                if (item.customFields != null && item.customFields.length > 0) {
                    item.customFields.forEach(field => {
                        switch (field.name) {
                            case 'CCPM Task Level':
                                entry.level = Number(field.value);
                                break;
                            case 'CCPM Task Code':
                                entry.code = Number(field.value);
                                break;
                            default:
                                // do nothing
                        }
                    })
                }

                // if (DEBUG) console.log(`codebeamer.load(): ${entry.code} = ${JSON.stringify(entry)}`);


                if (entry.code == null) {
                    // if the item does not have a 'CCPM Task Code', then ignore it.
                    console.error(`codebeamer.load(): item ${item.id}: "${item.name}" does not have a CCPM Task Code. Ignoring.`);
                } else {
                    map.set(entry.code, entry);
                }
            })


            /*
            if (DEBUG) {
                map.forEach((value, key) => {
                    console.log(`codebeamer.load(): ${key} = ${JSON.stringify(value)}`);
                })
            }

             */

        }
    }

    if (DEBUG) console.log(`codebeamer.load(): ${map.size} entries constructed.`);
    return map;
}