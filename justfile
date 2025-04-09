scrape-and-save:
    uv run -m my_crawler
    bun run api/scripts/remote3-co.ts
    bun run api/scripts/add-jobs.ts
    
analyze-ai:
    bun run api/scripts/job-analysis.ts

