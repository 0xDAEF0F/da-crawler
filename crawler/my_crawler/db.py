import sqlite3

conn = sqlite3.connect("../prisma/dev.db")


def is_real_job_url_in_db(url: str) -> bool:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Job WHERE job_url = ?", (url,))
    return cursor.fetchone() is not None


def is_job_title_and_company_in_db(job_title: str, company: str) -> bool:
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT *
        FROM Job
        JOIN Company ON Job.company_id = Company.id
        WHERE lower(Job.title) = ? AND lower(Company.name) = ?
        """,
        (job_title.strip().lower(), company.strip().lower()),
    )
    return cursor.fetchone() is not None
