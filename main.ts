// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.3/package/types/index.d.ts"
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs';
import * as cptable from 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/cpexcel.full.mjs';
import * as util from "./utils/setConfig.ts"


const env = util.setConfig()
XLSX.set_cptable(cptable);
const DEBUG = ( env.debug == true);
if (DEBUG) console.log("env = ", env);

async function loadCcpmData() {

    if (DEBUG) {
        console.log(`using method: ${env.method}`);
    }

    let bytes;
    switch (env.method) {
        case 'file': {
            const filename = env.source_file;
            if (filename == null) {
                console.error("loadCcpmData(): source_file is not set. Aborting.");
                return null;
            }
            bytes = await Deno.readFile(filename);
            break;
        }
        case "url": {
            const headers = new Headers();
            headers.append('Authorization', 'Basic ' + btoa(env.username + ":" + env.password));
            headers.append('Content-Type', 'application/json');
            headers.append('Accept', 'application/json');

            if (DEBUG) console.log("headers = ", headers);

            const filename = env.source_url;
            if (filename == null) {
                console.error("loadCcpmData(): source_url is not set. Aborting.");
                return null;
            }
            if (DEBUG) console.log("loadCcpmData(): loading from url: " + filename);

            bytes = await (await fetch(filename, {headers: headers})).arrayBuffer();

            break;
        }
    }

    const wb = XLSX.read(bytes, {});
    const ws = wb.Sheets[wb.SheetNames[1]];
    const json =  XLSX.utils.sheet_to_json(ws, {header: 1});

    if (DEBUG) {
        //json.forEach(row => {
          //  console.log("Type: ", row[0] + ", Level: " + row[1] + ", Code: " + row[3] + ", Name: " + row[4]);
        // })
        console.log("load " + json.length + " rows from " + env.source_url);
    }

    return json;
}

//
// M A I N  B L O C K
//

if (env.proxy_url != null) {
    Deno.env.set('https_proxy', env.proxy_url);
    Deno.env.set('http_proxy', env.proxy_url);
}

/* load CCPM exported data */
const array = await loadCcpmData();
if (DEBUG) {
    if (array != null && DEBUG) {
        console.log(`Read ${array.length} rows from ${env.source_url}`);
    } else {
        console.log("No data found in remote excel.");
    }
}


