import {ENV} from "../types/types.ts";
import {parseArgs} from "jsr:@std/cli/parse-args";

function setArgs () {
    return parseArgs(Deno.args, {
        boolean: ['baseline','debug'],
        number: ['method_interval', 'project_id', 'tracker_id'],
        string: ['server_url', 'username', 'password', 'proxy_url', 'method', 'source_url', 'source_file'],
        alias: {
            s: 'server_url',
            u: 'username',
            p: 'password',
            b: 'baseline',
            d: 'debug',
            m: 'method',
            i: 'method_interval',
            f: 'source_file',
            h: 'source_url',
            T: 'tracker_id',
            P: 'project_id',
            x: 'proxy_url'
        }
    });
}


export const setConfig = () => {
    const args = setArgs();
    const env: ENV = {};
    env.server_url = (args.server_url ? args.server_url : Deno.env.get('SERVER_URL'));
    env.username = (args.username ? args.username : Deno.env.get('USERNAME'));
    env.password = (args.password ? args.password : Deno.env.get('PASSWORD'));
    env.proxy_url = (args.proxy_url ? args.proxy_url : Deno.env.get('PROXY_URL'));
    env.project_id = (args.project_id ? args.project_id : Number(Deno.env.get('CCPM_PROJECT_ID')));
    env.tracker_id = (args.tracker_id ? args.tracker_id : Number(Deno.env.get('CCPM_TASK_TRACKER_ID')));
    env.method = (args.method ? args.method : Deno.env.get('READ_FROM'));
    env.source_url = (args.source_url ? args.source_url : Deno.env.get('SOURCE_URL'));
    env.source_file = (args.source_file ? args.source_file : Deno.env.get('SOURCE_FILE'));
    env.method_interval = (args.method_interval ? args.method_interval : Number(Deno.env.get('METHOD_INTERVAL_FACTOR')));
    env.debug = (args.debug ? true : Deno.env.get('DEBUG') == 'true');
    env.baseline = (args.baseline ? true : Deno.env.get('BASELINE') == 'true');

    /* sanity checks */
    if (env.server_url == null) {
        console.error("setConfig(): Missing server_url.");
        print_usage();
        Deno.exit(1);
    }
    if (env.username == null) {
        console.error("setConfig(): Missing username.");
        print_usage();
        Deno.exit(1);
    }
    if (env.password == null) {
        console.error("setConfig(): Missing password.");
        print_usage();
        Deno.exit(1);
    }
    if (env.method == null) {
        console.error("setConfig(): Missing method. Specify one of: url, file.");
        print_usage();
        Deno.exit(1);
    }
    if (env.method == 'url' && env.source_url == null) {
        console.error("setConfig(): Method is set to url, but source_url is missing");
        print_usage();
        Deno.exit(1);
    }

    if (env.method == 'file' && env.source_file == null) {
        console.error("setConfig(): Method is set to file, but source_file is missing");
        print_usage();
        Deno.exit(1);
    }

    if (env.project_id == null) {
        console.error("setConfig(): Missing ccpmProjectId.");
        print_usage();
        Deno.exit(1);
    }

    if (env.tracker_id == null) {
        console.error("setConfig(): Missing ccpmTaskTrackerId.");
        print_usage();
        Deno.exit(1);
    }

    if (args.method_interval == null) args.method_interval = 0.2;

    return env;
}

function print_usage() {
    const USAGE = `
Usage:
  Mandatory arguments:
    --server_url <server_url>           Codebeamer endpoint url
    --username <username>               Codebeamer login name
    --password <>                       Codebeamer login password
    --method [url|file]                 Method to read CCPM exported xlsx file
    --source_url <source_url>           Source file FQDN: required if method is 'url'
    --source_file <source_file>         Source file location: required if method is 'file'
    --project_id <project_id>           CCPM project id in Codebeamer
    --tracker_id <tracker_id>           CCPM Task tracker id in Codebeamer
    --method_interval <method_interval> flow control factor

  Optional arguments:
    --baseline                          Create baseline before modifying the tracker
    --proxy_url <proxy_url>             Proxy url
    --debug`;

    console.error(`Usage: ${USAGE}`);
}

if (import.meta.main) {
    print_usage();
}
