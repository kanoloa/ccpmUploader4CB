import * as config from "./utils/setConfig.ts"
import * as ccpm  from "./utils/CCPM.ts";
import * as codebeamer from "./utils/codebeamer.ts";
import { DATA } from "./types/types.ts";

//
// D E F I N I T I O N S
//

let createCount = 0;
let updateCount = 0;
let deleteCount = 0;
let ccpmCount = 0;
let codebeamerCount = 0;

//
// F U N C T I O N S
//

function compareDataObjects(a: DATA, b: DATA) {
    // a -> ccpm, b -> codebeamer, usually.
    const diff: DATA = {};
    for (const [key, value] of Object.entries(a)) {
        switch (key) {
            case 'itemId':
                continue;
            case 'name':
                if (value == null) continue;
                if (value != b[key]) {
                    diff[key] = value;
                }
                break;
            case 'start_date':
            case 'end_date':
                    if (value != null) {
                        const dateA = new Date(value);
                        const dateB = new Date(b[key]);
                        const ccpm_date: Date = dateA.setHours(dateA.getHours());
                        /* This seems a bit tricky but required.  Codebeamer does not hold the timezone information. */
                        const codebeamer_date: Date = dateB.setHours(dateB.getHours() + 9);
                        if (ccpm_date !== codebeamer_date) {
                            diff[key] = value;
                        }
                    }
                    break;
            default:
                if (value != b[key]) {
                    diff[key] = value;
                }
        }

        /*
        if (value != b[key]) {
            diff[key] = value;
        }

         */
    }
    return diff;
}

//
// M A I N  B L O C K
//

async function main(): void {

    const start = new Date();

    console.log(`main(): started at ${new Date().toString()}`);

    const env = config.setConfig()
    const DEBUG = (env.debug == true);
    if (DEBUG) console.log("env = ", env);

    /* use proxy if the proxy url is set in arguments or the .env file */
    if (env.proxy_url != null) {
        Deno.env.set('https_proxy', env.proxy_url);
        Deno.env.set('http_proxy', env.proxy_url);
    }

    /*
     * PREPARE 1: load items from Codebeamer.
     *
     */

    const codebeamerMap = await codebeamer.load(env);
    if (codebeamerMap.size == null) {
        console.error("main(): No data found in the codebeamer server.");
        exit(-1);
    }
    codebeamerCount = codebeamerMap.size;

    /*
     * PREPARE 2: load CCPM data from Excel file.
     *
     */

    const ccpmMap = await ccpm.load(env);
    if (ccpmMap.size == null) {
        console.error("main():No data found in the specified source.");
        exit(-1);
    }
    ccpmCount = ccpmMap.size;

    const updateItemArray = []

    if (DEBUG) {
        console.log("main(): Excel: " + ccpmMap.size + ", Codebeamer: " + codebeamerMap.size);
    }

    /*
     * STEP 1: When an item deleted from ccpm, then delete it from Codebeamer as well.
     *
     */
    for (const [key, value] of codebeamerMap) {

        if (! ccpmMap.has(key)) {
            if (DEBUG) console.log(`main(): code ${key} does not have a CCPM entry. Item ${value.itemId} will be deleted from Codebeamer.`);
            await codebeamer.deleteItem(env, value.itemId).then(res => {
                if (!res) {
                    console.error(`main(): error ignored: response retuned from Codebeamer: ${JSON.stringify(res)}`);
                } else {
                    if (DEBUG) console.log(`main(): item ${value.itemId} deleted from Codebeamer. `)
                    deleteCount++;
                }
            })
        }
    }

    /*
     * STEP 2: Synchronize CCPM entries with Codebeamer.
     *
     */

    /*  levelMap keeps the latest CCPM Task Code for each level. */
    const levelMap = new Map<number, number>();

    for (const [key, value] of ccpmMap.entries()) {

        /* update CCPM Task Code and level of the current line. */
        levelMap.set(value.level, value.code);

        if (! codebeamerMap.has(key)) {
            //
            // CASE [1]: the entry is new in CCPM, add it to Codebeamer.
            //
            if (DEBUG) console.log(`main(): code ${key} seems to be a new entry. Item ${(JSON.stringify(value))} will be added in Codebeamer.`);

            value.parent_id = (value.level > 1) ? codebeamerMap.get(levelMap.get(value.level - 1)).itemId : null;

            /* call Codebeamer API to add the new item. */
            await codebeamer.createItem(env, value).then(async res => {
                if (res != null) {
                    console.log(`main(): item ${res.id} added. `)

                    /* update codebeamerMap with the new entry. */
                     codebeamerMap.set(key, {
                        type: value.type,
                        level: value.level,
                        code: value.code,
                        id: value.id,
                        itemId: res.id,
                        started: value.started,
                        name: res.name,
                    });
                    createCount++;
                    if (DEBUG) console.log(`main(): new entry added to targetMap: ${JSON.stringify(codebeamerMap.get(key))}`);
                } else {
                    console.error(`main(): createItem() error, ignored: response: ${JSON.stringify(res)}`);
                }
            })

        } else {
            /* An entry in CCPM also exists in Codebeamer.  check if the entry is updated. */
            const match = compareDataObjects(value, codebeamerMap.get(key));
            if (Object.keys(match).length !== 0) {
                //
                // CASE[2]: the entry is updated on CCPM.  update it in Codebeamer.
                //
                if (DEBUG) console.log(`main(): code ${key} is different. diff = ${JSON.stringify(match)}.`);

                value.itemId = codebeamerMap.get(key).itemId;

                updateItemArray.push(value);
                updateCount++;
                // if (DEBUG) console.log(`main(): Task code ${value.code} will be updated: ${JSON.stringify(value)}`);
            }
        }
        // if (DEBUG) console.log(`main(): level => ${value.level}, levelMap => 1: ${levelMap.get(1)}, 2: ${levelMap.get(2)}, 3: ${levelMap.get(3)}, 4: ${levelMap.get(4)}, 5: ${levelMap.get(5)}`);
    }

    if (updateItemArray.length > 0) {
        await codebeamer.updateItems(env, updateItemArray).then(res => {
                if (DEBUG) console.log(`main(): ${res} items updated. `)
        });
    }

    const end = new Date();
    console.log(`===`);
    console.log(`=== P R O C E S S   C O M P L E T E D. `);
    console.log(`===`);
    console.log(`SUMMARY: started at  ${start.toString()}`);
    console.log(`       : finished at ${new Date().toString()}`);
    console.log(`       : ${(end.getTime() - start.getTime()) / 1000} seconds elapsed.`);
    console.log(`       : ${ccpmCount} CCPM entries loaded.`);
    console.log(`       : ${codebeamerCount} Codebeamer entries loaded.`);
    console.log(`       : ${createCount} items created, ${updateCount} items updated, ${deleteCount} items deleted.`);

}

if (import.meta.main) {
    main();
}

