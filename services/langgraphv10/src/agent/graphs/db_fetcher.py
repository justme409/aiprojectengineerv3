from typing import Dict, List, Any, Optional
from pydantic import BaseModel

class DbFetcherState(BaseModel):
    queries: List[Dict[str, Any]]
    records: Optional[List[Dict[str, Any]]] = None

def db_fetcher_step(state: DbFetcherState) -> Dict[str, Any]:
    """Fetch data needed by other graphs"""
    # Mock implementation - in real implementation this would execute database queries
    records = []
    for query in state.queries:
        # Simulate fetching records
        if query.get("table") == "assets":
            records.extend([
                {"id": "asset-1", "type": "document", "name": "Test Document"},
                {"id": "asset-2", "type": "lot", "name": "Lot 001"}
            ])
        elif query.get("table") == "projects":
            records.append({"id": "project-1", "name": "Test Project"})

    return {"records": records}
