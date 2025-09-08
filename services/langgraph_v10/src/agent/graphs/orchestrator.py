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
    failed: bool  # Fail-fast flag to stop processing on errors


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
    failed: bool


"""
v10 subgraph integration wired like v9: each subgraph is added as a node and
sequenced via edges in the top-level StateGraph. This keeps v10's richer state
and contract while restoring explicit graph topology.
"""

# Build the orchestrator graph (v10) in v9 style
builder = StateGraph(OrchestratorState, input=MainInputState, output=MainOutputState)

# Helper function to aggregate subgraph errors
def aggregate_subgraph_errors(state: OrchestratorState) -> str:
    """Aggregate errors from all subgraphs into a single error message"""
    errors = []

    # Check each subgraph for errors in their state
    # Note: Since subgraphs modify the state in-place, we need to check the current state
    # This function should be called after all subgraphs have completed

    # For now, we'll check common error patterns in the logs/state
    # In a more robust implementation, we'd modify subgraphs to return error info
    if not state.txt_project_documents and hasattr(state, 'error'):
        errors.append("Document extraction failed")
    if not state.project_details and hasattr(state, 'error'):
        errors.append("Project details extraction failed")
    if not state.generated_plans and hasattr(state, 'error'):
        errors.append("Plan generation failed")

    if errors:
        return "; ".join(errors)
    return ""

# Compile subgraphs and add as nodes
builder.add_node("document_extraction", create_document_extraction_graph())
builder.add_node("project_details", create_project_details_graph())
builder.add_node("standards_extraction", create_standards_extraction_graph())
builder.add_node("plan_generation", create_plan_generation_graph())
builder.add_node("wbs_extraction", create_wbs_extraction_graph())
builder.add_node("lbs_extraction", create_lbs_extraction_graph())
builder.add_node("itp_generation", create_itp_generation_graph())

# Error aggregation helper
def aggregate_errors(current_error: Optional[str], new_error: Optional[str]) -> Optional[str]:
    """Aggregate multiple errors into a single error message"""
    if not current_error and not new_error:
        return None
    if not current_error:
        return new_error
    if not new_error:
        return current_error
    return f"{current_error}; {new_error}"

# Error capture nodes for subgraphs
def capture_document_extraction_error(state: OrchestratorState) -> Dict[str, Any]:
    """Capture any error from document extraction subgraph and implement fail-fast"""
    # Check if document extraction failed (no documents extracted or error present)
    if (not state.get("txt_project_documents") or
        state.get("error") or
        (hasattr(state, 'failed_documents') and state.get("failed_documents"))):
        error_msg = "Document extraction failed: " + (state.get("error") or "no documents were extracted")
        return {
            "error": aggregate_errors(state.get("error"), error_msg),
            "failed": True,
            "done": True
        }
    return {}

def capture_project_details_error(state: OrchestratorState) -> Dict[str, Any]:
    """Capture any error from project details subgraph and implement fail-fast"""
    # Since subgraphs modify state in-place, we check if project_details is empty
    # and if so, it indicates an error occurred
    if not state.get("project_details") and state.get("txt_project_documents"):
        error_msg = "Project details extraction failed: no project details were generated despite having documents"
        return {
            "error": aggregate_errors(state.get("error"), error_msg),
            "failed": True,
            "done": True
        }
    return {}

def capture_standards_extraction_error(state: OrchestratorState) -> Dict[str, Any]:
    """Capture any error from standards extraction subgraph and implement fail-fast"""
    if (state.get("error") and "standards" in state.get("error", "").lower()) or \
       not state.get("standards_from_project_documents"):
        error_msg = "Standards extraction failed"
        return {
            "error": aggregate_errors(state.get("error"), error_msg),
            "failed": True,
            "done": True
        }
    return {}

def capture_plan_generation_error(state: OrchestratorState) -> Dict[str, Any]:
    """Capture any error from plan generation subgraph and implement fail-fast"""
    if not state.get("generated_plans") and state.get("txt_project_documents"):
        error_msg = "Plan generation failed: no plans were generated despite having documents"
        return {
            "error": aggregate_errors(state.get("error"), error_msg),
            "failed": True,
            "done": True
        }
    return {}

# Node to aggregate subgraph errors and finalize state
def finalize_orchestrator_state(state: OrchestratorState) -> OrchestratorState:
    """Finalize the orchestrator state by aggregating subgraph errors and setting final status"""
    # Aggregate any subgraph errors that may have been set
    aggregated_error = state.error or ""

    # The subgraphs may have set errors in the state during their execution
    # Since LangGraph subgraphs modify state in-place, check for any error indicators

    # Create final output state with aggregated errors
    final_state = OrchestratorState(
        project_id=state.project_id,
        document_ids=state.document_ids,
        txt_project_documents=state.txt_project_documents,
        document_metadata=state.document_metadata,
        standards_from_project_documents=state.standards_from_project_documents,
        wbs_structure=state.wbs_structure,
        mapping_content=state.mapping_content,
        generated_plans=state.generated_plans,
        generated_itps=state.generated_itps,
        project_details=state.project_details,
        asset_specs=state.asset_specs,
        edge_specs=state.edge_specs,
        error=aggregated_error if aggregated_error else None,
        done=True,
        failed=state.get("failed", False)
    )

    return final_state

# Failure finalization node
def finalize_failure_state(state: OrchestratorState) -> OrchestratorState:
    """Finalize the orchestrator state when a failure occurred (fail-fast)"""
    aggregated_error = state.error or "Unknown error occurred during processing"

    # Create final output state with failure status
    final_state = OrchestratorState(
        project_id=state.project_id,
        document_ids=state.document_ids,
        txt_project_documents=state.txt_project_documents,
        document_metadata=state.document_metadata,
        standards_from_project_documents=state.standards_from_project_documents,
        wbs_structure=state.wbs_structure,
        mapping_content=state.mapping_content,
        generated_plans=state.generated_plans,
        generated_itps=state.generated_itps,
        project_details=state.project_details,
        asset_specs=state.asset_specs,
        edge_specs=state.edge_specs,
        error=aggregated_error,
        done=True,
        failed=True
    )

    return final_state

# Add error capture and finalization nodes
builder.add_node("capture_document_extraction_error", capture_document_extraction_error)
builder.add_node("capture_project_details_error", capture_project_details_error)
builder.add_node("capture_standards_extraction_error", capture_standards_extraction_error)
builder.add_node("capture_plan_generation_error", capture_plan_generation_error)
builder.add_node("finalize", finalize_orchestrator_state)
builder.add_node("finalize_failure", finalize_failure_state)

# Routing functions for conditional edges
def route_after_document_extraction(state: OrchestratorState) -> str:
    """Route after document extraction based on failure status"""
    return "capture_document_extraction_error"

def route_after_error_capture(state: OrchestratorState) -> str:
    """Route after error capture based on failed flag"""
    if state.get("failed", False):
        return "finalize_failure"
    return "project_details"

def route_after_project_details(state: OrchestratorState) -> str:
    """Route after project details based on failure status"""
    return "capture_project_details_error"

def route_after_project_details_error(state: OrchestratorState) -> str:
    """Route after project details error capture"""
    if state.get("failed", False):
        return "finalize_failure"
    return "standards_extraction"

def route_after_standards_extraction(state: OrchestratorState) -> str:
    """Route after standards extraction"""
    return "capture_standards_extraction_error"

def route_after_standards_error(state: OrchestratorState) -> str:
    """Route after standards extraction error capture"""
    if state.get("failed", False):
        return "finalize_failure"
    return "plan_generation"

def route_after_plan_generation(state: OrchestratorState) -> str:
    """Route after plan generation"""
    return "capture_plan_generation_error"

def route_after_plan_error(state: OrchestratorState) -> str:
    """Route after plan generation error capture"""
    if state.get("failed", False):
        return "finalize_failure"
    return "wbs_extraction"

# Define edges for sequential flow with fail-fast behavior
builder.add_edge(START, "document_extraction")
builder.add_edge("document_extraction", "capture_document_extraction_error")
builder.add_conditional_edge("capture_document_extraction_error", route_after_error_capture)
builder.add_edge("project_details", "capture_project_details_error")
builder.add_conditional_edge("capture_project_details_error", route_after_project_details_error)
builder.add_edge("standards_extraction", "capture_standards_extraction_error")
builder.add_conditional_edge("capture_standards_extraction_error", route_after_standards_error)
builder.add_edge("plan_generation", "capture_plan_generation_error")
builder.add_conditional_edge("capture_plan_generation_error", route_after_plan_error)
builder.add_edge("wbs_extraction", "lbs_extraction")
builder.add_edge("lbs_extraction", "itp_generation")
builder.add_edge("itp_generation", "finalize")
builder.add_edge("finalize", END)
builder.add_edge("finalize_failure", END)

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


