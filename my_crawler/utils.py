import datetime

def get_unix_timestamp_seconds() -> int:
    return int(datetime.datetime.now().timestamp())

current_run_id = get_unix_timestamp_seconds()
