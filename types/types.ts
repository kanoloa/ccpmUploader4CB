export interface ENV {
    server_url: string,
    username: string,
    password: string,
    proxy_url: string,
    ccpmProjectId: number,
    ccpmTaskTrackerId: number,
    method: 'url' | 'file',
    source_url?: string,
    source_file?: string,
    debug: boolean,
    method_interval: number
}