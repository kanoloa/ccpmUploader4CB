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
if (import.meta.main) {

    console.log(`main(): started at ${new Date().toString()}`);

    const env = config.setConfig()
    const DEBUG = (env.debug == true);
    if (DEBUG) console.log("env = ", env);

    /*
    const cb: cbTypes.cbinit = {
        serverUrl: env.server_url,
        username: env.username,
        password: env.password,
    } as cbTypes.cbinit;

     */

    /* use proxy if the proxy url is set in arguments or the .env file */
    if (env.proxy_url != null) {
        Deno.env.set('https_proxy', env.proxy_url);
        Deno.env.set('http_proxy', env.proxy_url);
    }

    /* load Codebeamer Tracker items */
    const targetMap = await codebeamer.load(env);
    if (targetMap.size == null) {
        console.error("main(): No data found in the codebeamer server.");
        exit(-1);
    }

    /* load CCPM data */
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
    targetMap.forEach((value, key) => {
        if (! ccpmMap.has(key)) {
            if (DEBUG) console.log(`main(): code ${key} does not have a CCPM entry. Item ${value.itemId} will be deleted from Codebeamer.`);
            const res = codebeamer.deleteItem(env, value.itemId);

            if (! res) {
                console.error(`main(): error ignored: response retuned from Codebeamer: ${JSON.stringify(res)}`);
            } else {
                if (DEBUG) console.log(`main(): item ${value.itemId} deleted from Codebeamer. `)
            }
        }
    })

    /* compare the two maps

    const diffMap = new Map<number, string>();
    targetMap.forEach((value, key) => {
        if (! ccpmMap.has(key)) {
            diffMap.set(key, "Codebeamer");
        }
    })
    ccpmMap.forEach((value, key) => {
        if (! targetMap.has(key)) {
            diffMap.set(key, "CCPM");
        }
    })

    if (DEBUG) {
        console.log("main(): diffMap = ", diffMap);
        console.log("main(): diffMap.size = ", diffMap.size);
    }

     */
}

/*  SAMPLE CODE

if (DEBUG) console.log(`main(): retrieving data from ${cb.serverUrl}`);
const projects = await cbClient.getProjects(cb);
if (! cbClient.isProjectReference(projects)) {
    console.error("main(): No projects found in the specified server.");
    exit();
}
if (DEBUG) console.log(`main(): The server has returned ${projects.length} projects.`);

 */



