"""
Real database fetcher module for document extraction.
Provides actual database connectivity using SQLAlchemy.
"""

import os
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class Query(BaseModel):
    table: str
    columns: List[str]
    where: Dict[str, Any]


class DbFetcherState(BaseModel):
    queries: List[Query]


def get_database_url() -> str:
    """Get database URL from environment or provide defaults"""
    # Try environment variables first
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return db_url

    # Fallback to docker-compose defaults
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5555")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "password")
    database = os.getenv("DB_NAME", "projectpro")

    return f"postgresql://{user}:{password}@{host}:{port}/{database}"


def db_fetcher_step(state: DbFetcherState) -> Dict[str, Any]:
    """
    Real database fetcher function using SQLAlchemy.
    Queries the actual database - NO MOCK DATA ALLOWED.
    """
    from sqlalchemy import create_engine, text

    database_url = get_database_url()
    logger.info(f"Connecting to database: {database_url.replace('password', '***') if 'password' in database_url else database_url}")

    engine = create_engine(database_url, echo=False)

    results = []
    total_records = 0

    with engine.connect() as connection:
        for query in state.queries:
            # Build SQL query dynamically
            columns_str = ", ".join(query.columns) if query.columns else "*"
            table_name = query.table

            # Build WHERE clause
            where_conditions = []
            where_params = {}

            for key, value in query.where.items():
                if isinstance(value, dict):
                    # Handle MongoDB-style operators
                    for op, val in value.items():
                        if op == "$in":
                            placeholders = [f":{key}_{i}" for i in range(len(val))]
                            where_conditions.append(f"{key} IN ({', '.join(placeholders)})")
                            where_params.update({f"{key}_{i}": v for i, v in enumerate(val)})
                        else:
                            logger.warning(f"Unsupported operator: {op}")
                else:
                    where_conditions.append(f"{key} = :{key}")
                    where_params[key] = value

            where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"

            sql = f"SELECT {columns_str} FROM {table_name} WHERE {where_clause}"

            logger.info(f"Executing query: {sql} with params: {where_params}")

            result = connection.execute(text(sql), where_params)
            rows = result.fetchall()

            # Convert to dict format
            records = []
            if rows:
                column_names = result.keys()
                for row in rows:
                    record = dict(zip(column_names, row))
                    records.append(record)
                    total_records += 1

            results.extend(records)

    logger.info(f"Query completed successfully. Retrieved {total_records} records from {len(state.queries)} queries.")

    return {
        "records": results,
        "query_count": len(state.queries),
        "record_count": total_records,
        "status": "success"
    }


