import { assertEquals } from "@std/assert";
import * as util from "../utils/setConfig.ts"

Deno.test("setConfig", () => {
    const env = util.setConfig();
    if (env.proxy_url != null) {
        Deno.env.set('https_proxy', env.proxy_url);
        Deno.env.set('http_proxy', env.proxy_url);
    }
    console.log("env = ", env);
    assertEquals(('server_url' in env && env.server_url != null), true);
})