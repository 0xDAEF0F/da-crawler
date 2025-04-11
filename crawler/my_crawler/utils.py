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
