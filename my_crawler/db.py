import sqlite3

conn = sqlite3.connect("prisma/dev.db")


def is_real_job_url_in_db(url: str) -> bool:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Job WHERE job_url = ?", (url,))
    return cursor.fetchone() is not None


def is_job_description_url_in_db(url: str) -> bool:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Job WHERE job_description_url = ?", (url,))
    return cursor.fetchone() is not None
