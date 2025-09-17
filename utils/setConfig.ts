import {ENV} from "../types/types.ts";

export const setConfig = () => {
    return {
        server_url: Deno.env.get('SERVER_URL'),
        username: Deno.env.get('USERNAME'),
        password: Deno.env.get('PASSWORD'),
        proxy_url: Deno.env.get('PROXY_URL'),
        ccpmProjectId: Number(Deno.env.get('CCPM_PROJECT_ID')),
        ccpmTaskTrackerId: Number(Deno.env.get('CCPM_TASK_TRACKER_ID')),
        method: Deno.env.get('READ_FROM')! as ENV['method'],
        source_url: Deno.env.get('SOURCE_URL'),
        source_file: Deno.env.get('SOURCE_FILE'),
        method_interval: (Number(Deno.env.get('METHOD_INTERVAL')) > 0 ? Number(Deno.env.get('METHOD_INTERVAL')) : 0.2),
        debug: Boolean(Deno.env.get('DEBUG'))
    }
}

const DEBUG = (Deno.env.get('DEBUG') == 'true');

if (import.meta.main) {
    if (DEBUG) console.log(setConfig());
}
