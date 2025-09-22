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

    for (const [key, value] of ccpmMap.entries()) {

        // in case of a new entry
        if (! targetMap.has(key)) {

            if (DEBUG) console.log(`main(): code ${key} seems to be a new entry. Item ${(JSON.stringify(value))} will be added in Codebeamer.`);

            const res = await codebeamer.createItem(env, value);
            if (res != null) {
                if (DEBUG) console.log(`main(): item ${(JSON.stringify(res, null, 2))} added. `)
            }
        }
        //TODO: update targetMap with itemID.
    }



}


if (import.meta.main) {
    main();
}

