max_jobs := "100"
max_days := "7"

scrape-and-save:
    uv run --directory crawler -m my_crawler --max_jobs {{max_jobs}} --max_days {{max_days}}
    bun run scripts/remote3-co/remote3-co.ts --max_jobs {{max_jobs}} --max_days {{max_days}}
    bun run scripts/beincrypto/beincrypto.ts --max_jobs {{max_jobs}} --max_days {{max_days}}
    bun run scripts/add-scraped-jobs/add-jobs.ts
    
ai-analysis:
    bun run scripts/ai-analysis/ai-analysis.ts

rebuild-api:
    bun run build:api

run-api: rebuild-api
    bun run --hot dist/api/index.js