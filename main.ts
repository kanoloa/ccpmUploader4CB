// import * as cbTypes from 'https://github.com/kanoloa/cbclient/raw/main/types/index.ts';
// import * as cb from 'https://github.com/kanoloa/cbclient/blob/main/mod.ts';
import * as config from "./utils/setConfig.ts"
import * as ccpm  from "./utils/CCPM.ts";
import * as codebeamer from "./utils/codebeamer.ts";

//
// D E F I N I T I O N S
//



//
// F U N C T I O N S
//


//
// M A I N  B L O C K
//
//if (import.meta.main) {
async function main(): void {

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

    const targetMap = await codebeamer.load(env);
    if (targetMap.size == null) {
        console.error("main(): No data found in the codebeamer server.");
        exit(-1);
    }

    /*
     * PREPARE 2: load CCPM data from Excel file.
     *
     */

    const ccpmMap = await ccpm.load(env);
    if (ccpmMap.size == null) {
        console.error("main():No data found in the specified source.");
        exit(-1);
    }

    if (DEBUG) {
        console.log("main(): Excel: " + ccpmMap.size + ", Codebeamer: " + targetMap.size);
        // console.log("main(): 1st row: ", ccpmMap.values().next().value);
    }

    /*
     * STEP 1: Delete items from Codebeamer that do not have a CCPM entry.
     *
     */
    for (const [key, value] of targetMap) {

        if (! ccpmMap.has(key)) {
            if (DEBUG) console.log(`main(): code ${key} does not have a CCPM entry. Item ${value.itemId} will be deleted from Codebeamer.`);
            const res = await codebeamer.deleteItem(env, value.itemId);
            if (! res) {
                console.error(`main(): error ignored: response retuned from Codebeamer: ${JSON.stringify(res)}`);
            } else {
                if (DEBUG) console.log(`main(): item ${value.itemId} deleted from Codebeamer. `)
            }
        }
    }

    /*
     * STEP 2: Update items in Codebeamer that have a CCPM entry.
     *
     */

    const levelMap = new Map<number, number>();

    for (const [key, value] of ccpmMap.entries()) {

        // update CCPM Task Code of the current line.
        levelMap.set(value.level, value.code);

        if (! targetMap.has(key)) {
            /* if the entry is new in CCPM, add it to Codebeamer.*/
            if (DEBUG) console.log(`main(): code ${key} seems to be a new entry. Item ${(JSON.stringify(value))} will be added in Codebeamer.`);

            /* call Codebeamer API to add the new item. */
            const res = await codebeamer.createItem(env, value);
            if (res != null) {

                console.log(`main(): item ${res.id} added. `)

                /* when the item should have a parent, add it as a child. */
                if (value.level > 1) {

                    /* get the parent itemId from the targetMap. */
                    const parent = targetMap.get(levelMap.get(value.level - 1)).itemId;
                    /* get the child itemId from REST response. */
                    const child = res.id;
                    /* call Codebeamer API to add the new child item. */
                    const res2 = await codebeamer.addNewChildItem(env, parent, child);
                    if (res2 != null) {
                        if (DEBUG) console.log(`main(): ${child} added as a child of ${parent}`);
                    } else {
                        console.error(`main(): error ignored: response retuned from Codebeamer: ${JSON.stringify(res2)}`);
                    }
                }

                /* update targetMap with the new entry. */
                const newEntry: DATA = {
                    type:  value.type,
                    level: value.level,
                    code: value.code,
                    id: value.id,
                    itemId: res.id,
                    started: value.started,
                    name: res.name,
                }
                targetMap.set(key, newEntry);
                if (DEBUG) console.log(`main(): new entry added to targetMap: ${JSON.stringify(newEntry)}`);
            }


        }
        // if (DEBUG) console.log(`main(): level => ${value.level}, levelMap => 1: ${levelMap.get(1)}, 2: ${levelMap.get(2)}, 3: ${levelMap.get(3)}, 4: ${levelMap.get(4)}, 5: ${levelMap.get(5)}`);
    }
}


if (import.meta.main) {
    main();
}

