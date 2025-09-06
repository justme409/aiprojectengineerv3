from typing import Dict, List, Any, Optional
from pydantic import BaseModel
import uuid

class SamplingPlannerState(BaseModel):
    project_id: str
    lot_geometry: Dict[str, Any]
    itp_document: Dict[str, Any]
    sampling_plan: Optional[Dict[str, Any]] = None
    sample_assets: Optional[List[str]] = None

def sampling_planner_step(state: SamplingPlannerState) -> Dict[str, Any]:
    """Generate Annex L sampling plans and sample assets for NSW Q6"""
    # Mock implementation - in real implementation this would calculate sampling points
    plan = {
        "method": "annex_l",
        "jurisdiction": "NSW",
        "total_area": state.lot_geometry.get("area", 1000),
        "sampling_points": 12,
        "grid_spacing": "50m x 50m",
        "sample_locations": [
            {"id": "S001", "coordinates": {"lat": -33.8688, "lon": 151.2093}, "depth": "0-300mm"},
            {"id": "S002", "coordinates": {"lat": -33.8689, "lon": 151.2094}, "depth": "300-600mm"}
        ],
        "testing_matrix": {
            "gradation": "AS1289.3.6.1",
            "plasticity": "AS1289.3.2.1",
            "compaction": "AS1289.5.1.1"
        }
    }

    # Create sample assets
    sample_ids = []
    for i in range(plan["sampling_points"]):
        sample_id = str(uuid.uuid4())
        sample_ids.append(sample_id)

    return {
        "sampling_plan": plan,
        "sample_assets": sample_ids
    }
