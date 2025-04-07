import sqlite3

conn = sqlite3.connect("prisma/dev.db")


def is_job_already_scraped(url: str) -> bool:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Job WHERE job_url = ?", (url,))
    return cursor.fetchone() is not None
