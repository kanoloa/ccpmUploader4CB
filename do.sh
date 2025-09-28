#!/bin/bash

export PATH=${PATH}:${HOME}/.deno/bin/deno

deno run --allow-env --env-file --allow-net --allow-import --allow-read=. main.ts \
        --server_url='https://server.com/cb/' \
        --username='username' \
        --password='password' \
        --method='file' \
        --source_file='./data/data.xlsx' \
        --project_id='111111' \
        --tracker_id='999999' \
        --method_interval='0.05' \
        --debug=false

