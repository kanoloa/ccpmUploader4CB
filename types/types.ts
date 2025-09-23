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
    type: 'Goal' | 'Group' | 'Task' | 'Milestone',
    level: number,
    code: number,
    id: number,
    name: string,
    status: string,
    description: string,
    predecessor_id: string | undefined,
    successor_id: string | undefined,
    started: boolean,
    parent_id: number | undefined,
    parent_name: string | undefined,

    /* Codebeamer item id */
    itemId: number | undefined,
}


