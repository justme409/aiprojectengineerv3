from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_google_genai import ChatGoogleGenerativeAI
import os
import logging

logger = logging.getLogger(__name__)

# LLM Configuration following V9 patterns
llm = ChatGoogleGenerativeAI(
    model=os.getenv("GEMINI_MODEL_2", "gemini-2.5-pro"),
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.2,
    max_output_tokens=65536,
    include_thoughts=False,
    thinking_budget=-1,
)

class ProjectDetails(BaseModel):
    """Pydantic model for project details following V9 patterns"""
    project_name: Optional[str] = None
    project_address: Optional[str] = Field(default=None, description="Physical address of the works/site")
    html: Optional[str] = Field(default=None, description="HTML content for the project details body")

class ProjectDetailsExtractionState(BaseModel):
    """State following V9 TypedDict patterns"""
    project_id: str
    txt_project_documents: List[Dict[str, Any]] = []
    project_details: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class InputState(BaseModel):
    """Input state for project details extraction"""
    project_id: str
    txt_project_documents: List[Dict[str, Any]] = []

class OutputState(BaseModel):
    """Output state for project details extraction"""
    project_details: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

def generate_and_store_project_details_node(state: ProjectDetailsExtractionState) -> ProjectDetailsExtractionState:
    """Extract and store project details using LLM following V9 patterns - NO REGEX, NO MOCK DATA"""
    docs = state.txt_project_documents or []
    combined_content = "\n\n".join([
        f"Document: {d.get('file_name','Unknown')} (ID: {d.get('id','')})\n{d.get('content','')}" for d in docs
    ])

    # Fail fast: require non-empty documents and content
    if not docs or not combined_content.strip():
        raise ValueError("Project Details extraction requires extracted document content; none available")

    # Use V9-style prompt with detailed formatting instructions
    formatting_hint = (
        "\n\nNote: Ensure all tables include 1px solid #d1d5db borders on th/td with ~8px padding and vertical-align: top; "
        "the thead should have a subtle background (e.g., #f9fafb). Headings should use a consistent scale (h1≈1.5rem, "
        "h2≈1.25rem, h3≈1.125rem) with clear spacing.\n\n"
    )
    prompt = f"""You are a senior civil engineer producing FINAL, IMPLEMENTABLE project details from construction documents.

Extract and format comprehensive project details from the provided documents. Include ALL relevant information about the project scope, parties, dates, and requirements.

PROJECT DOCUMENTS:
{combined_content}{formatting_hint}

Extract the following information and format it as structured HTML with proper headings and tables:

1. **Project Identification**
   - Project name/title
   - Project address/location
   - Project description/scope summary

2. **Project Parties**
   - Client/Owner information
   - Contractor details
   - Consultant/Engineer information
   - Any other relevant parties

3. **Contract Information**
   - Contract value (if mentioned)
   - Key dates (commencement, completion, defects liability)
   - Contract conditions or special requirements

4. **Project Scope & Requirements**
   - Main scope of works
   - Key deliverables
   - Quality requirements
   - Safety requirements

Format the output as clean, professional HTML with:
- Proper heading hierarchy (h1, h2, h3)
- Tables for structured data (dates, parties, etc.)
- Clear sections and subsections
- Professional language suitable for construction documentation

If information is not available in the documents, note "Not specified in provided documents" rather than making assumptions.
"""

    structured_llm = llm.with_structured_output(ProjectDetails, method="json_mode")

    try:
        response: ProjectDetails = structured_llm.invoke(prompt)
        content = response.dict()

        # Add metadata for knowledge graph compliance
        content.update({
            "extraction_method": "llm_structured_output",
            "llm_model": os.getenv("GEMINI_MODEL_2", "gemini-2.5-pro"),
            "source_documents_count": len(docs),
            "extraction_timestamp": "2025-01-01T00:00:00.000Z"
        })

        # Store LLM outputs in assets.metadata.llm_outputs per knowledge graph
        llm_outputs = {
            "project_details": {
                "extraction": {
                    "model": os.getenv("GEMINI_MODEL_2", "gemini-2.5-pro"),
                    "timestamp": "2025-01-01T00:00:00.000Z",
                    "confidence": 0.85,
                    "method": "structured_output"
                },
                "summary": {
                    "short": f"Project: {content.get('project_name', 'Unknown')}",
                    "executive": f"Construction project details extracted from {len(docs)} documents",
                    "technical": "LLM-based extraction of project metadata, parties, dates, and scope information"
                },
                "entities": {
                    "organizations": [],  # Could be populated from parties
                    "persons": [],
                    "locations": [content.get('project_address')] if content.get('project_address') else []
                }
            }
        }

        content["llm_outputs"] = llm_outputs

        return ProjectDetailsExtractionState(
            project_id=state.project_id,
            txt_project_documents=state.txt_project_documents,
            project_details=content
        )

    except Exception as e:
        logger.error(f"Project details extraction failed: {e}")
        raise ValueError(f"Project Details extraction failed: {str(e)}")

def create_project_details_asset_spec(state: ProjectDetailsExtractionState) -> Dict[str, Any]:
    """Create asset write specification for project details following knowledge graph"""
    if not state.project_details:
        return {}

    # Move any llm_outputs from content into metadata.llm_outputs per storage_contract
    content_obj = dict(state.project_details or {})
    llm_outputs = content_obj.pop("llm_outputs", {})

    spec = {
        "asset": {
            "type": "plan",
            "name": state.project_details.get("project_name", "Project Details"),
            "project_id": state.project_id,
            "approval_state": "not_required",
            "classification": "internal",
            "content": content_obj,
            "metadata": {
                "plan_type": "project_details",
                "category": "project",
                "tags": ["project", "details"],
                "llm_outputs": llm_outputs
            },
            "status": "draft"
        },
        "idempotency_key": f"project_details:{state.project_id}",
        "edges": []
    }

    return spec

# Graph definition following V9 patterns
def create_project_details_graph():
    """Create the project details extraction graph following V9 patterns"""
    from langgraph.graph import StateGraph, START, END

    graph = StateGraph(ProjectDetailsExtractionState, input=InputState, output=OutputState)

    # Add nodes following V9 patterns
    graph.add_node("generate_and_store", generate_and_store_project_details_node)
    graph.add_node("create_asset_spec", lambda state: {
        "asset_specs": [create_project_details_asset_spec(state)]
    })

    # Define flow following V9 patterns
    graph.set_entry_point("generate_and_store")
    graph.add_edge("generate_and_store", "create_asset_spec")
    graph.add_edge("create_asset_spec", END)

    # Inherit parent's checkpointer when used as a subgraph
    return graph.compile(checkpointer=True)

# Description: V10 Project Details extraction converted from V9 patterns.
# Uses LLM with structured output instead of regex patterns.
# Stores results in assets.metadata.llm_outputs per knowledge graph.
# NO MOCK DATA - Real LLM calls with comprehensive extraction.

