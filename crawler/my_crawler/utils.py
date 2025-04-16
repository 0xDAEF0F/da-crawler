import argparse
import datetime
from urllib.parse import urlunparse
from pydantic_core import Url


def get_unix_timestamp_seconds() -> int:
    return int(datetime.datetime.now().timestamp())


current_run_id = get_unix_timestamp_seconds()


def parse_job_url(url: str) -> str:
    """
    Parses the job url and removes the last path segment if it contains 'apply'
    or 'application' and the query params as well
    """
    parsed = Url(url)
    # Remove trailing slashes from the path and split into segments
    path_segments = [segment for segment in parsed.path.split("/") if segment]

    # If the last segment contains 'apply' or 'application', remove it
    if path_segments and path_segments[-1] in ["apply", "application"]:
        path_segments.pop()

    # Reconstruct the URL
    return urlunparse(
        (
            parsed.scheme,
            parsed.host,
            "/".join(path_segments),
            None,
            None,
            None,
        )
    )


def parse_args() -> tuple[int, int]:
    """
    Parses the command line arguments and returns the maximum number of jobs and the maximum age of job postings in days.
    """
    parser = argparse.ArgumentParser(description="Crawl job boards.")
    parser.add_argument(
        "--max_jobs", type=int, default=20, help="Maximum number of jobs to process."
    )
    parser.add_argument(
        "--max_days", type=int, default=5, help="Maximum age of job postings in days."
    )
    args = parser.parse_args()

    return args.max_jobs, args.max_days
