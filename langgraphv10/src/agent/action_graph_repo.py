"""
Mock action_graph_repo module for LangGraph v10 development.
This provides the necessary functions and classes for graph operations.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from datetime import datetime


class IdempotentAssetWriteSpec(BaseModel):
    """Specification for writing assets with idempotency."""

    asset_type: str
    asset_subtype: str
    name: str
    description: str
    project_id: str
    metadata: Dict[str, Any]
    content: Dict[str, Any]
    idempotency_key: str
    edges: Optional[List[Dict[str, Any]]] = None


def upsertAssetsAndEdges(asset_specs: List[IdempotentAssetWriteSpec]) -> Dict[str, Any]:
    """
    Mock function to upsert assets and edges to the knowledge graph.
    In a real implementation, this would write to a database.
    """
    results = []

    for spec in asset_specs:
        # Mock successful upsert result
        result = {
            "asset_id": f"{spec.asset_type}_{spec.asset_subtype}_{spec.project_id}_{hash(spec.idempotency_key)}",
            "status": "created",
            "timestamp": datetime.now().isoformat(),
            "spec": spec.model_dump()
        }
        results.append(result)
        print(f"Mock upsert: Created asset {result['asset_id']} for {spec.name}")

    return {
        "success": True,
        "assets_created": len(results),
        "results": results
    }
