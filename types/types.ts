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

export interface CCPM_DATA {
    type: 'Group' | 'Task' | 'Milestone',
    level: number,
    code: number,
    id: number,
    name: string,
    status: string,
    predecessor: number[] | string[] | undefined,
    successor: number[] | string[] | undefined,

    /* Codebeamer item id */
    itemId: number | undefined,
}

