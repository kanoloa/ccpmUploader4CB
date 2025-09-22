export interface ENV {
    server_url: string,
    username: string,
    password: string,
    proxy_url: string,
    project_id: number,
    tracker_id: number,
    method: 'url' | 'file',
    source_url?: string,
    source_file?: string,
    debug: boolean,
    method_interval: number
}


export interface DATA {
    type: 'Group' | 'Task' | 'Milestone',
    level: number,
    code: number,
    id: number,
    name: string,
    status: string,
    description: string,
    predecessor_id: number[] | undefined,
    successor_id: number[] | undefined,
    started: boolean,

    /* Codebeamer item id */
    itemId: number | undefined,
}


