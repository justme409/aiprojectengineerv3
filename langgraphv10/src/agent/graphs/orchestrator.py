from typing import List, Dict, Any, Optional, Annotated
from typing_extensions import TypedDict
from operator import add
# import sqlite3
from langgraph.graph import StateGraph, START, END
# from langgraph.checkpoint.sqlite import SqliteSaver

# Import v10 subgraph factories
from agent.graphs.document_extraction import create_document_extraction_graph
from agent.graphs.project_details import create_project_details_graph
from agent.graphs.plan_generation import create_plan_generation_graph
from agent.graphs.wbs_extraction import create_wbs_extraction_graph
from agent.graphs.lbs_extraction import create_lbs_extraction_graph
from agent.graphs.itp_generation import create_itp_generation_graph
from agent.graphs.standards_extraction import create_standards_extraction_graph


class OrchestratorState(TypedDict):
    """
    Unified state carried across subgraphs in v10.

    Aligns with knowledge graph storage contract by accumulating IdempotentAssetWriteSpec-like
    payloads in asset_specs and edge_specs for later persistence by the action_graph_repo.
    """
    project_id: str
    document_ids: Optional[List[str]]

    # Subgraph payloads carried forward
    txt_project_documents: Annotated[List[Dict[str, Any]], add]
    document_metadata: Annotated[List[Dict[str, Any]], add]
    standards_from_project_documents: Annotated[List[Dict[str, Any]], add]
    wbs_structure: Optional[Dict[str, Any]]
    mapping_content: Optional[Dict[str, Any]]
    generated_plans: Annotated[List[Dict[str, Any]], add]
    generated_itps: Annotated[List[Dict[str, Any]], add]
    project_details: Optional[Dict[str, Any]]

    # Aggregated write specifications per knowledge graph contract
    asset_specs: Annotated[List[Dict[str, Any]], add]
    edge_specs: Annotated[List[Dict[str, Any]], add]

    # Control
    error: Optional[str]
    done: bool


class MainInputState(TypedDict):
    """Inputs to the orchestrator (v10)."""
    project_id: str
    document_ids: Optional[List[str]]


class MainOutputState(TypedDict):
    """
    Outputs aligned to knowledge graph storage contract.
    - asset_specs: list of IdempotentAssetWriteSpec-like dicts { asset, edges?, idempotency_key }
    - edge_specs: additional edges that may be produced independently
    - summary: minimal run summary for UI/debug
    """
    asset_specs: List[Dict[str, Any]]
    edge_specs: List[Dict[str, Any]]
    summary: Dict[str, Any]
    error: Optional[str]
    done: bool


"""
v10 subgraph integration wired like v9: each subgraph is added as a node and
sequenced via edges in the top-level StateGraph. This keeps v10's richer state
and contract while restoring explicit graph topology.
"""

# Build the orchestrator graph (v10) in v9 style
builder = StateGraph(OrchestratorState, input=MainInputState, output=MainOutputState)

# Compile subgraphs and add as nodes
builder.add_node("document_extraction", create_document_extraction_graph())
builder.add_node("project_details", create_project_details_graph())
builder.add_node("standards_extraction", create_standards_extraction_graph())
builder.add_node("plan_generation", create_plan_generation_graph())
builder.add_node("wbs_extraction", create_wbs_extraction_graph())
builder.add_node("lbs_extraction", create_lbs_extraction_graph())
builder.add_node("itp_generation", create_itp_generation_graph())

# Define edges for sequential flow (mirrors v9 order)
builder.add_edge(START, "document_extraction")
builder.add_edge("document_extraction", "project_details")
builder.add_edge("project_details", "standards_extraction")
builder.add_edge("standards_extraction", "plan_generation")
builder.add_edge("plan_generation", "wbs_extraction")
builder.add_edge("wbs_extraction", "lbs_extraction")
builder.add_edge("lbs_extraction", "itp_generation")
builder.add_edge("itp_generation", END)

# Shared v10 checkpoints database using native SqliteSaver
# Create SqliteSaver directly with sqlite3 connection
# conn = sqlite3.connect("checkpoints_v10.db")
# memory = SqliteSaver(conn)
# app = builder.compile(checkpointer=memory)
app = builder.compile()

def create_orchestrator_graph():
    """Factory exported for LangGraph server registry (see langgraph.json)."""
    # Use the same checkpointer instance for consistency
    # return builder.compile(checkpointer=memory)
    return builder.compile()


