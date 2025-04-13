scrape-and-save:
    uv run --directory crawler -m my_crawler
    bun run scripts/remote3-co.ts
    bun run scripts/beincrypto.ts
    bun run scripts/add-jobs.ts
    
analyze-ai:
    bun run scripts/job-analysis.ts

run-api:
    pkill -f "bun run dist/api/index.js" || true
    bun run build:api
    tmux new-window -n api-server "bun run dist/api/index.js"