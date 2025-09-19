// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.3/package/types/index.d.ts"
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs';
import * as cptable from 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/cpexcel.full.mjs';
import * as cbClient from 'https://github.com/kanoloa/cbclient/raw/main/mod.ts';
import * as cbTypes from 'https://github.com/kanoloa/cbclient/raw/main/types/index.ts';
import * as config from "./utils/setConfig.ts"
import {CCPM_DATA} from "./types/types.ts";
import * as POS from "./config/map.ts";

XLSX.set_cptable(cptable);

//
// D E F I N I T I O N S
//



//
// F U N C T I O N S
//

/**
 * Load CCPM exported data from remote url or file.
 * @returns map: Map<number, CCPM_DATA>
 */
async function loadCcpmData() {

    if (DEBUG) console.log(`loadCcpmData(): using method: ${env.method}`);

    let bytes;
    switch (env.method) {
        case 'file': {
            const filename = env.source_file;
            if (filename == null) {
                console.error("loadCcpmData(): loadCcpmData(): source_file is not set. Aborting.");
                return null;
            }
            if (DEBUG) console.log(`loadCcpmData(): loadCcpmData(): loading from file: ${filename}`);
            bytes = await Deno.readFile(filename);
            break;
        }
        case "url": {
            const headers = new Headers();
            headers.append('Authorization', 'Basic ' + btoa(env.username + ":" + env.password));
            headers.append('Content-Type', 'application/json');
            headers.append('Accept', 'application/json');

            if (DEBUG) console.log("loadCcpmData(): headers = ", headers);

            const filename = env.source_url;
            if (filename == null) {
                console.error("loadCcpmData(): source_url is not set. Aborting.");
                return null;
            }
            if (DEBUG) console.log(`loadCcpmData(): loading from url: ${filename}`);

            bytes = await (await fetch(filename, {headers: headers})).arrayBuffer();

            break;
        }
    }

    const wb = XLSX.read(bytes, {});
    const ws = wb.Sheets[wb.SheetNames[1]];
    const json =  XLSX.utils.sheet_to_json(ws, {header: 1});

    if (DEBUG) console.log(`loadCcpmData(): load ${json.length} rows from ${env.method}.`);

    const map = new Map<number, CCPM_DATA>();

    json.forEach(row => {
        const entry: CCPM_DATA = {
            type: row[POS.CCPM_TYPE],
            level: row[POS.CCPM_LEVEL],
            id: row[POS.CCPM_ID],
            code: row[POS.CCPM_CODE],
            name: row[POS.CCPM_NAME],
            status: row[POS.CCPM_STATUS]
        };
        map.set(row[POS.CCPM_CODE], entry)
    })

    return map;
}

//
// M A I N  B L O C K
//

const env = config.setConfig()
const DEBUG = (env.debug == true);
if (DEBUG) console.log("env = ", env);

const cb: cbTypes.cbinit = {
    serverUrl: env.server_url,
    username: env.username,
    password: env.password,
} as cbTypes.cbinit;

/* check if mandatory parameters are set */
// move this part to config/config.ts
if (cb.username == null || cb.password == null || cb.serverUrl == null) {
    console.error("main(): Missing username, password or server_url. Aborting.");
    exit();
}

/* use proxy if the proxy url is set in arguments or the .env file */
if (env.proxy_url != null) {
    Deno.env.set('https_proxy', env.proxy_url);
    Deno.env.set('http_proxy', env.proxy_url);
}

/* load Codebeamer Tracker items */
const targetMap = new Map<number, CCPM_DATA>;

/* load CCPM data */
const sourceMap = await loadCcpmData();
if (sourceMap.size == null) {
    console.error("main():No data found in the specified source.");
    exit(-1);
}
if (DEBUG) console.log("main(): Source map build: entry = " + sourceMap.size);

/*  SAMPLE CODE

if (DEBUG) console.log(`main(): retrieving data from ${cb.serverUrl}`);
const projects = await cbClient.getProjects(cb);
if (! cbClient.isProjectReference(projects)) {
    console.error("main(): No projects found in the specified server.");
    exit();
}
if (DEBUG) console.log(`main(): The server has returned ${projects.length} projects.`);

 */



