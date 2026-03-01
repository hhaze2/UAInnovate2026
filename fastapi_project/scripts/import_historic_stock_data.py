from __future__ import annotations


import argparse
import csv
import os
from datetime import datetime, timezone
from typing import Iterable, Dict, Any, List


from sqlmodel import Session
from sqlalchemy.engine.url import make_url
from sqlalchemy.dialects.postgresql import insert as pg_insert


from app.services.database.session import engine
from app.services.database.models import HistoricStockLevels


# ---------- Helpers ----------
# may not need this
def parse_bool(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, bool):
        return value
    s = str(value).strip().lower()
    return s in {"1", "true", "t", "yes", "y", "on"}

# may not need this 
def parse_float(value: Any) -> float:
    if value is None or str(value).strip() == "":
        return 0.0
    return float(value)


def parse_timestamp(value: str) -> datetime:
    """
    Expect ISO 8601 ideally, e.g. '2025-01-31T13:00:00Z' or '2025-01-31 13:00:00'
    If no timezone info is present, treat as UTC to keep things consistent.
    """
    v = value.strip()
    # Support 'Z'
    if v.endswith("Z"):
        v = v[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(v)

    except ValueError:
            # Fallback parsing if format is not strict ISO (very basic)
            # You can add your custom formats here:
            # dt = datetime.strptime(v, "%Y-%m-%d %H:%M:%S")
            raise
        # Ensure timezone aware (default to UTC if naive)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt



def normalize_row(row: Dict[str, Any]) -> Dict[str, Any]:
    """
    Map/convert CSV row text values to the model's field types.
    Expected CSV headers:
      timestamp, location, resource_type, stock_level, usage_rate_hourly, snap_event
    """

    return {
            "timestamp": parse_timestamp(row["timestamp"]),
            "location": row["location"].strip(),
            "resource_type": row["resource_type"].strip(),
            "stock_level": parse_float(row["stock_level"]),
            "usage_rate_hourly": 0.00,
            "snap_event": parse_bool(row.get("snap_event", "false")),
        }


def read_csv_rows(csv_path: str) -> Iterable[Dict[str, Any]]:
    with open(csv_path, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        required = {"timestamp", "location", "resource_type", "stock_level", "snap_event"}
        missing = required - set(h.strip() for h in (reader.fieldnames or []))
        if missing:
            raise ValueError(f"CSV is missing required columns: {', '.join(sorted(missing))}")

        for row in reader:
                    if not row or all((v is None or str(v).strip() == "") for v in row.values()):
                        continue  # skip empty lines
                    yield normalize_row(row)
    
def batched(iterable: Iterable[Dict[str, Any]], batch_size: int) -> Iterable[List[Dict[str, Any]]]:
    batch: List[Dict[str, Any]] = []
    for item in iterable:
        batch.append(item)
        if len(batch) >= batch_size:
            yield batch
            batch = []
    if batch:
        yield batch


# ---------- Insert strategies ----------
def insert_batch(session: Session, rows: List[Dict[str, Any]]) -> None:
    """
    Portable approach: add objects and flush/commit.
    Works with SQLite and Postgres. Slower than COPY but fine for moderate sizes.
    """
    objs = [HistoricStockLevels(**r) for r in rows]
    session.add_all(objs)
    session.commit()



# ---------- Main CLI ----------
def main():
    parser = argparse.ArgumentParser(description="Import HistoricStockLevel data from a CSV file.")
    parser.add_argument("--file", "-f", required=True, help="Path to CSV file")
    parser.add_argument("--batch-size", "-b", type=int, default=1000, help="Insert batch size")
    # parser.add_argument("--upsert", action="store_true", help="Use UPSERT (PostgreSQL only)")
    args = parser.parse_args()

    # Detect if we're on Postgres
    from app.services.database.session import DATABASE_URL  # reuse your config
    # backend = make_url(DATABASE_URL).get_backend_name()

    # if args.upsert and backend != "postgresql":
    #     raise SystemExit("UPSERT requested but database is not PostgreSQL.")

    total = 0
    with Session(engine) as session:
        for batch in batched(read_csv_rows(args.file), args.batch_size):
            # if args.upsert and backend == "postgresql":
            #     upsert_batch_postgres(session, batch)

            # else:
            insert_batch(session, batch)
            total += len(batch)
    print(f"Imported {total} rows from {args.file}.")


if __name__ == "__main__":
    main()





