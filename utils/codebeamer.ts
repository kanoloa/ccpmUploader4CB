import * as cbtype from 'https://github.com/kanoloa/cbclient/raw/main/types/index.ts';
import * as cb from 'https://github.com/kanoloa/cbclient/raw/main/mod.ts';
import * as POS from "../config/map.ts";
import { DATA, ENV } from "../types/types.ts";
import { delay } from "https://deno.land/std/async/mod.ts";

function getItemEntry(env: ENV, data: DATA) {

    const itemName = (data.name != null ? data.name : '(NO NAME)');

    // construct CCPM_TYPE object.
    const type = {};
    if (data.type != null) {
        switch (data.type) {
            case 'Milestone':
                type.id = POS.CB_TASK_TYPE_MILESTONE_ID;
                break;
            case 'Group':
                type.id = POS.CB_TASK_TYPE_GROUP_ID;
                break;
            case 'Task':
                type.id = POS.CB_TASK_TYPE_TASK_ID;
                break;
            case 'Goal':
                type.id = POS.CB_TASK_TYPE_GOAL_ID;
                break;
        }
        type.name = data.type;
        type.type = POS.CB_TASK_TYPE_VALUE_TYPE_STRING;
    } else {
        console.error(`getItemEntry(): unknown type: ${data.type}`);
        return undefined;
    }

    const item: cbtype.TrackerItem =  {
        name: itemName,
        description: "--",
        status: {
            name: data.status,
            type: POS.CB_TASK_STATUS_STRING,
            id: POS.CB_TASK_STATUS[data.status]
        },

        customFields: [
            {
                "fieldId": POS.CB_TASK_TYPE_FID,
                "name": "CCPM Task Type",
                "values": [type],
                "type": POS.CB_TASK_TYPE_STRING
            },
            {
                "fieldId": POS.CB_TASK_LEVEL_FID,
                "name": "CCPM Task Level",
                "value": data.level,
                "type": POS.CB_TASK_LEVEL_STRING
            },
            {
                "fieldId": POS.CB_TASK_ID_FID,
                "name": "CCPM Task Id",
                "value": data.id,
                "type": POS.CB_TASK_ID_STRING
            },
            {
                "fieldId": POS.CB_TASK_CODE_FID,
                "name": "CCPM Task Code",
                "value": data.code,
                "type": POS.CB_TASK_CODE_STRING
            },
            {
                "fieldId": POS.CB_TASK_STARTED_FID,
                "name": "CCPM Started",
                "value": data.started,
                "type": POS.CB_TASK_STARTED_STRING
            },
            {
                "fieldId": POS.CB_TASK_PREDECESSOR_FID,
                "name": "CCPM Predecessor Id",
                "value": data.predecessor_id,
                "type": POS.CB_TASK_PREDECESSOR_STRING
            },
            {
                "fieldId": POS.CB_TASK_SUCCESSOR_FID,
                "name": "CCPM Successor Id",
                "value": data.successor_id,
                "type": POS.CB_TASK_SUCCESSOR_STRING
            }
        ]
    };

    // if (DEBUG) console.log(`getItemEntry(): returning item = ${JSON.stringify(item, null, 2)}`);
    return item;
}

export async function createItem(env: ENV, data: DATA): Promise<cbtype.TrackerItem> {
    const DEBUG = (env.debug == true);
    const cbinit: cbtype.cbinit = {
        username: env.username,
        password: env.password,
        serverUrl: env.server_url
    }
   if (DEBUG) console.log(`createItem(): item = ${JSON.stringify(data)}`);

    const tracker = env.tracker_id;

    // flow control: wait for a specified duration before calling Codebeamer api.
    const interval = env.method_interval ? env.method_interval * 1000 : 1000;
    await delay(interval);

    const item = getItemEntry(env, data);
    if (DEBUG) console.log(`createItem(): returned item = ${JSON.stringify(item)}`);

    if (item == null) {
        console.error(`createItem(): error: item is null.`);
        return undefined;
    }

    const res = await cb.createItem(cbinit, tracker, item);
    if (cb.isTrackerItem(res)) {
        // if (DEBUG) console.log(`createItem(): item created => ${JSON.stringify(res,null,2)}`);
        return res;
    } else {
        console.error(`createItem(): error response retuned from Codebeamer: ${JSON.stringify(res)}`);
        return undefined;
    }
}

export async function addNewChildItem(env: ENV, parent: number, child: number) {
    const cbinit: cbtype.cbinit = {
        username: env.username,
        password: env.password,
        serverUrl: env.server_url
    }

    // flow control: wait for a specified duration before calling Codebeamer api.
    const interval = env.method_interval ? env.method_interval * 1000 : 1000;
    await delay(interval);

    const res = await cb.addNewChildItem(cbinit, parent, child);
    if (! cb.isTrackerItemChildReference(res)) {
        console.error(`addNewChildItem(): error response retuned from Codebeamer: ${JSON.stringify(res)}`);
        return null;
    }
    return res;
}

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

    if (DEBUG) console.log(`deleteItem(): item ${itemId} deleted.`);
    return true;

}

export async function load (env: ENV) {

    const query = `project.id in (${env.project_id}) AND tracker.id in (${env.tracker_id})`;
    // const query = 'project.id in (363) and tracker.id in (6545508)';

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
                            case 'CCPM Task Type':
                                entry.type = field.values[0].name;
                                break;
                            case 'CCPM Task Level':
                                entry.level = Number(field.value);
                                break;
                            case 'CCPM Task Code':
                                entry.code = Number(field.value);
                                break;
                            case 'CCPM Task ID':
                                entry.id = Number(field.value);
                                break;
                            case 'CCPM Started':
                                entry.started = Boolean(field.value);
                                break;
                            case 'CCPM Predecessor Id':
                                entry.predecessor_id = field.value;
                                break;
                            case 'CCPM Successor Id':
                                entry.successor_id = field.value;
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