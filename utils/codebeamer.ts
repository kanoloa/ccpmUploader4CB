import * as cbtype from 'https://github.com/kanoloa/cbclient/raw/main/types/index.ts';
import * as cb from 'https://github.com/kanoloa/cbclient/raw/main/mod.ts';
import * as POS from "../config/map.ts";
import {DATA, ENV} from "../types/types.ts";
import {delay} from "https://deno.land/std/async/mod.ts";

function getItemEntry(env: ENV, data: DATA) {

    // const DEBUG = (env.debug == true);
    // if (DEBUG) console.log(`codebeamer.getItemEntry(): data = ${JSON.stringify(data, null, 2)}`);
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
        startDate: data.start_date,
        endDate: data.end_date,

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

export async function createItem(env: ENV, data: DATA) {
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

    if (data.parent_id == null) {
        const res = await cb.createItem(cbinit, tracker, item);
        if (cb.isTrackerItem(res)) {
            // if (DEBUG) console.log(`createItem(): item created => ${JSON.stringify(res,null,2)}`);
            return res;
        } else {
            console.error(`createItem(): error response retuned from Codebeamer: ${JSON.stringify(res, null, 2)}`);
            return undefined;
        }
    } else {
        const res = await cb.createChildItem(cbinit, tracker, item, data.parent_id);
        if (cb.isTrackerItem(res)) {
            return res;
        } else {
            console.error(`createItem(): error response retuned from Codebeamer: ${JSON.stringify(res, null, 2)}`);

            return undefined;
        }
    }
}

/*
export async function addNewChildItem(env: ENV, parent: number, child: number) {
    const cbinit: cbtype.cbinit = {
        username: env.username,
        password: env.password,
        serverUrl: env.server_url
    }

    // flow control: wait for a specified duration before calling Codebeamer api.
    const interval = env.method_interval ? env.method_interval by 1000:1000;
    await delay(interval);

    const res = await cb.addNewChildItem(cbinit, parent, child);
    if (! cb.isTrackerItemChildReference(res)) {
        console.error(`addNewChildItem(): error response retuned from Codebeamer: ${JSON.stringify(res)}`);
        return null;
    }
    return res;
}

 */


/**
 *
 * @param env
 * @param itemArray
 * @returns number, number of items updated.
 */
export async function updateItems(env: ENV, itemArray) {

    const cbinit: cbtype.cbinit = {
        username: env.username,
        password: env.password,
        serverUrl: env.server_url
    }

    const DEBUG = (env.debug == true);
    let updateCount = 0;

    if (itemArray.length == 0) {
        console.error("codebeamer.updateItems(): itemArray is empty.");
        return updateCount;
    }

    const updateArray: cbtype.UpdateTrackerItemFieldWithItemId = [];

    itemArray.forEach((value) => {

        const item = getItemEntry(env, value);
        if (item == null) {
            console.error(`codebeamer.updateItems(): error: item is null.`);
            return updateCount;
        }

        const fields: Array<cbtype.AbstractFieldValue> = item.customFields.concat();

        /* set the start date field */
        fields.unshift({
            "fieldId": POS.CB_START_DATE_FID,
            "name": "startDate",
            "value": item.startDate,
            "type": POS.CB_DATE_STRING
        })

        fields.unshift({
            "fieldId": POS.CB_END_DATE_FID,
            "name": "endDate",
            "value": item.endDate,
            "type": POS.CB_DATE_STRING
        })

        /* set the Status field */
        fields.unshift({
            "fieldId": POS.CB_STATUS_FID,
            "name": "Status",
            "values": [{
                name: value.status,
                type: POS.CB_TASK_STATUS_STRING,
                id: POS.CB_TASK_STATUS[value.status]
            }],
            "type": POS.CB_STATUS_STRING
        });

        /* set the Summary (name) field */
        fields.unshift({
            "fieldId": POS.CB_SUMMARY_FID,
            "name": "Summary",
            "value": item.name,
            "type": POS.CB_SUMMARY_STRING
        });

        const updates = {
            itemId: value.itemId,
            fieldValues: fields
        };

        updateArray.push(updates);
    });


    return await cb.bulkUpdateItems(cbinit, updateArray).then(res => {

        if (cb.isBulkOperationResponse(res)) {
            if (DEBUG) console.log(`codebeamer.updateItems(): ${res.successfulOperationsCount} items updated.`);
            if (res.failedOperations != null) {
                console.error(`codebeamer.updateItems(): ERROR: ${JSON.stringify(res.failedOperations, null, 2)}`);
            }
            return res.successfulOperationsCount;
        } else {
            console.error(`codebeamer.updateItems(): error response retuned from Codebeamer: ${JSON.stringify(res, null, 2)}`);
            return 0;
        }
    });
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
                entry.start_date = item.startDate;
                entry.end_date = item.endDate;

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

                if (entry.code == null) {
                    // if the item does not have a 'CCPM Task Code', then ignore it.
                    console.error(`codebeamer.load(): item ${item.id}: "${item.name}" does not have a CCPM Task Code. Ignoring.`);
                } else {
                    map.set(entry.code, entry);
                }
            })
        }
    }

    if (DEBUG) console.log(`codebeamer.load(): ${map.size} entries constructed.`);
    return map;
}
