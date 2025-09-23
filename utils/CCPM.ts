import * as POS from "../config/map.ts";
import {DATA} from "../types/types.ts";
// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.3/package/types/index.d.ts"
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs';
import * as cptable from 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/cpexcel.full.mjs';
XLSX.set_cptable(cptable);

//
// I N T E R F A C E S
//

//
// F U N C T I O N S
//

export async function load(env) {

    const DEBUG = (env.debug == true);
    if (DEBUG) console.log(`CCPM.load(): using method: ${env.method}`);

    let bytes;
    switch (env.method) {
        case 'file': {
            if (env.source_file == null) {
                console.error("CCPM.load(): source_file is not set. Aborting.");
                return null;
            }
            if (DEBUG) console.log(`CCPM.load(): loading from file: ${env.source_file}`);
            bytes = await Deno.readFile(env.source_file);

            break;
        }
        case "url": {
            if (env.source_url == null) {
                console.error("CCPM.load(): source_url is not set. Aborting.");
                return null;
            }

            const headers = new Headers();
            headers.append('Authorization', 'Basic ' + btoa(env.username + ":" + env.password));
            headers.append('Content-Type', 'application/json');
            headers.append('Accept', 'application/json');

            if (DEBUG) console.log("CCPM.load(): headers = ", headers);

            if (DEBUG) console.log(`CCPM.load(): loading from url: ${env.source_url}`);

            bytes = await (await fetch(env.source_url, {headers: headers})).arrayBuffer();

            break;
        }
        default:  {
            console.error("CCPM.load(): method is not set.");
            return null;
        }
    }

    const wb = XLSX.read(bytes, {});
    const ws = wb.Sheets[wb.SheetNames[POS.CCPM_SHEET_NUMBER]];
    const arrays =  XLSX.utils.sheet_to_json(ws, {header: 1});

    if (POS.CCPM_SKIP_HEADER) arrays.shift();

    if (DEBUG) console.log(`CCPM.load(): ${arrays.length} rows loaded from ${env.method}.`);

    const map = new Map<number, DATA>();

    arrays.forEach(row => {
        const entry: DATA = {
            type: row[POS.CCPM_TYPE],
            level: row[POS.CCPM_LEVEL],
            id: row[POS.CCPM_ID],
            code: row[POS.CCPM_CODE],
            name: row[POS.CCPM_NAME],
            started: row[POS.CCPM_STARTED],
            status: row[POS.CCPM_STATUS],
            predecessor_id: row[POS.CCPM_PREDECESSOR_ID],
            successor_id: row[POS.CCPM_SUCCESSOR_ID]
            // successor_id: row[POS.CCPM_SUCCESSOR_ID]
        };
        /*
        if (row[POS.CCPM_PREDECESSOR_ID] != null) {
            entry.predecessor_id = row[POS.CCPM_PREDECESSOR_ID].split(',').map(id => parseInt(id, 10));
        }
        if (row[POS.CCPM_SUCCESSOR_ID] != null) {
            entry.successor_id = row[POS.CCPM_SUCCESSOR_ID].split(',').map(id => parseInt(id, 10));
        }
        */
        // console.log(`code = ${row[POS.CCPM_CODE]}, predecessor = ${entry.predecessor_id}, successor = ${entry.successor_id}`);
        map.set(row[POS.CCPM_CODE], entry)
    })

    if (DEBUG) console.log(`CCPM.load(): ${map.size} entries constructed.`);

    return map;
}