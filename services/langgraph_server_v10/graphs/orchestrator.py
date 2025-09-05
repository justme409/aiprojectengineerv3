from typing import Dict, List, Any, Optional, Annotated
from pydantic import BaseModel
import asyncio

class OrchestratorState(BaseModel):
    project_id: str
    document_ids: Optional[List[str]] = []
    txt_project_documents: Annotated[List[Dict[str, Any]], "add"] = []
    standards_from_project_documents: Annotated[List[Dict[str, Any]], "add"] = []
    wbs_structure: Optional[Dict[str, Any]] = None
    edges: List[Dict[str, Any]] = []

def document_extraction_step(state: OrchestratorState) -> Dict[str, Any]:
    """Step 1: Extract content from documents"""
    if not state.document_ids:
        return {"txt_project_documents": []}

    # Simulate document extraction
    documents = []
    for doc_id in state.document_ids:
        documents.append({
            "id": doc_id,
            "file_name": f"document_{doc_id}.pdf",
            "content": f"Extracted content for {doc_id}",
            "project_id": state.project_id
        })

    return {"txt_project_documents": documents}

def standards_extraction_step(state: OrchestratorState) -> Dict[str, Any]:
    """Step 2: Extract applicable standards"""
    if not state.txt_project_documents:
        return {"standards_from_project_documents": []}

    # Simulate standards extraction
    standards = [{
        "standard_code": "AS1289",
        "uuid": "as1289-uuid",
        "spec_name": "Methods of testing soils",
        "org_identifier": "Standards Australia",
        "section_reference": "1.1",
        "context": "Soil testing methods",
        "found_in_database": True,
        "document_ids": [doc["id"] for doc in state.txt_project_documents]
    }]

    return {"standards_from_project_documents": standards}

def wbs_extraction_step(state: OrchestratorState) -> Dict[str, Any]:
    """Step 3: Generate Work Breakdown Structure"""
    if not state.txt_project_documents:
        return {"wbs_structure": None}

    # Simulate WBS generation
    wbs = {
        "nodes": [
            {
                "id": "1",
                "parentId": None,
                "node_type": "discipline",
                "name": "Civil Works",
                "source_reference_uuids": [doc["id"] for doc in state.txt_project_documents],
                "source_reference_hints": ["Civil engineering specifications"],
                "description": "All civil engineering works",
                "applicable_specifications": ["AS1289"],
                "itp_required": True,
                "is_leaf_node": False
            },
            {
                "id": "1.1",
                "parentId": "1",
                "node_type": "work_package",
                "name": "Earthworks",
                "source_reference_uuids": [doc["id"] for doc in state.txt_project_documents],
                "description": "Excavation and earthmoving",
                "applicable_specifications": ["AS1289"],
                "itp_required": True,
                "is_leaf_node": True
            }
        ]
    }

    # Generate edges for WBS hierarchy
    edges = []
    for node in wbs["nodes"]:
        if node["parentId"]:
            edges.append({
                "from_asset_id": f"wbs_{node['id']}",
                "to_asset_id": f"wbs_{node['parentId']}",
                "edge_type": "PARENT_OF",
                "properties": {},
                "idempotency_key": f"parent_of:{node['id']}:{node['parentId']}"
            })

    return {"wbs_structure": wbs, "edges": edges}

def plan_generation_step(state: OrchestratorState) -> Dict[str, Any]:
    """Step 4: Generate project plans"""
    # Simulate plan generation
    return {"plan_html": "<h1>Project Quality Plan</h1><p>Generated plan content...</p>"}

# Graph definition
def create_orchestrator_graph():
    """Create the main orchestrator graph"""
    from langgraph.graph import StateGraph

    graph = StateGraph(OrchestratorState)

    # Add nodes
    graph.add_node("document_extraction", document_extraction_step)
    graph.add_node("standards_extraction", standards_extraction_step)
    graph.add_node("wbs_extraction", wbs_extraction_step)
    graph.add_node("plan_generation", plan_generation_step)

    # Define flow
    graph.set_entry_point("document_extraction")
    graph.add_edge("document_extraction", "standards_extraction")
    graph.add_edge("standards_extraction", "wbs_extraction")
    graph.add_edge("wbs_extraction", "plan_generation")

    return graph.compile()
