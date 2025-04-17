max_jobs := "20"
max_days := "5"

scrape-and-save:
    uv run --directory crawler -m my_crawler --max_jobs {{max_jobs}} --max_days {{max_days}}
    bun run scripts/remote3-co.ts --max_jobs {{max_jobs}} --max_days {{max_days}}
    bun run scripts/beincrypto.ts --max_jobs {{max_jobs}} --max_days {{max_days}}
    bun run scripts/add-jobs.ts
    
analyze-ai:
    bun run scripts/job-analysis.ts

rebuild-api:
    bun run build:api

run-api: rebuild-api
    bun run --hot dist/api/index.js