"""
Mock db_fetcher module for document extraction.
This provides database query functionality.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel


class Query(BaseModel):
    table: str
    columns: List[str]
    where: Dict[str, Any]


class DbFetcherState(BaseModel):
    queries: List[Query]


def db_fetcher_step(state: DbFetcherState) -> Dict[str, Any]:
    """
    Mock database fetcher function.
    In a real implementation, this would query the database.
    """
    # Mock response for document queries
    mock_documents = [
        {
            "id": "doc1",
            "file_name": "sample_document.pdf",
            "blob_url": "https://storage.example.com/documents/sample.pdf",
            "storage_path": "documents/sample.pdf",
            "project_id": "project1"
        }
    ]

    return {
        "records": mock_documents,
        "query_count": len(state.queries),
        "status": "success"
    }
