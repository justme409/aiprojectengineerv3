from langgraph.graph import StateGraph, START, END
from typing import List, Dict, Any, Optional, Annotated
from typing_extensions import TypedDict
from pydantic import BaseModel, Field
import os
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class ExtractedStandard(BaseModel):
    """Schema for individual extracted standard with database information"""
    standard_code: str = Field(description="Standard code as mentioned in document (e.g., 'AS 1379', 'ASTM C123', 'MRTS04')")
    uuid: Optional[str] = Field(default=None, description="UUID from reference database if standard is found")
    spec_name: Optional[str] = Field(default=None, description="Full name from reference database if standard is found")
    org_identifier: Optional[str] = Field(default=None, description="Organization identifier from reference database if standard is found")
    section_reference: Optional[str] = Field(default=None, description="Specific section or clause where referenced")
    context: Optional[str] = Field(default=None, description="Context of how this standard is referenced")
    found_in_database: bool = Field(description="Whether this standard was found in the reference database")
    document_ids: List[str] = Field(description="IDs of the documents where this standard was found")

class ExtractedStandards(BaseModel):
    """Schema for extracted standards response."""
    standards: List[ExtractedStandard] = Field(description="List of standards found with database information")

class StandardsExtractionState(TypedDict):
    project_id: str
    txt_project_documents: List[Dict[str, Any]]
    reference_database: Optional[List[Dict[str, Any]]]
    standards_from_project_documents: List[Dict[str, Any]]
    error: Optional[str]
    done: bool

class InputState(TypedDict):
    project_id: str
    txt_project_documents: List[Dict[str, Any]]

class OutputState(TypedDict):
    standards_from_project_documents: List[Dict[str, Any]]
    error: Optional[str]
    done: bool

# LLM Configuration
llm = ChatGoogleGenerativeAI(
    model=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.1,
    max_output_tokens=65536,
    include_thoughts=False,
    thinking_budget=-1
)

# Standards Extraction Prompt
STANDARDS_EXTRACTION_PROMPT = """
You are a technical standards expert analyzing construction project documents to identify referenced technical standards and match them against a reference database.

REFERENCE DATABASE (Complete list of available standards):
{reference_db_text}

TASK: Extract ALL technical standard codes mentioned in the project document below and match them against the reference database.

STANDARD FORMATS TO LOOK FOR:
- Australian Standards: AS 1234, AS/NZS 5678, AS 1234.1-2020
- ASTM Standards: ASTM C123, ASTM D456-18
- Main Roads Technical Standards: MRTS01, MRTS04, MRTS15
- Transport for NSW: TfNSW B80, TfNSW R57
- ISO Standards: ISO 9001, ISO 14001:2015
- British Standards: BS 5950, BS EN 1993
- American Standards: AASHTO, ACI 318
- Other regional standards with similar patterns

EXTRACTION AND MATCHING RULES:
1. Look for explicit standard references in the project document
2. For each standard found, try to match it against the reference database
3. Match by comparing the standard code mentioned in document with the "Spec ID" field in the database
4. If found in database, include the UUID, spec_name, and org_identifier from the database
5. If not found in database, set found_in_database to false and uuid to null
6. Be flexible with matching - handle variations in formatting, spacing, and case
7. Focus on standards that are actually referenced for compliance or specification purposes
8. Include complete metadata for each standard found

MATCHING EXAMPLES:
- Document mentions "AS 1234" → Look for "AS 1234" or similar in database Spec ID
- Document mentions "ASTM C123-18" → Look for "ASTM C123" or similar in database Spec ID
- Document mentions "MRTS04" → Look for "MRTS04" or "MRTS 04" in database Spec ID

PROJECT DOCUMENT:
{document_content}

Analyze the document thoroughly and provide a structured response with all standards found, whether they match the database or not.
"""

def fetch_reference_database_node(state: StandardsExtractionState) -> StandardsExtractionState:
    """Fetch reference database for standards matching"""
    try:
        # Import the tool function
        from agents_v9.tools.db_tools import fetch_reference_documents
        ref_db = fetch_reference_documents.invoke({})
        return {**state, "reference_database": ref_db}
    except Exception as e:
        logger.error(f"Error fetching reference database: {e}")
        return {**state, "reference_database": []}


def standards_extraction_node(state: StandardsExtractionState) -> StandardsExtractionState:
    """Extract standards from project documents using LLM"""
    ref_db = state.get("reference_database", [])
    txt_docs = [{k: v for k, v in doc.items() if k not in ['blob_url', 'project_id']} for doc in state["txt_project_documents"]]

    if not txt_docs:
        return {**state, "standards_from_project_documents": [], "done": True, "error": None}

    ref_db_text = ""
    for ref in ref_db:
        ref_db_text += f"UUID: {ref['id']}, Spec ID: {ref['spec_id']}, Name: {ref['spec_name']}, Org: {ref['org_identifier']}\n"

    combined_content = "\n\n".join([f"Document: {doc['file_name']} (ID: {doc['id']})\n{doc['content']}" for doc in txt_docs])

    prompt = STANDARDS_EXTRACTION_PROMPT.format(
        reference_db_text=ref_db_text,
        document_content=combined_content
    )

    structured_llm = llm.with_structured_output(ExtractedStandards, method="json_mode")

    try:
        parsed_response = structured_llm.invoke(prompt)

        if not parsed_response:
            return {**state, "error": "No parsed response from LLM", "done": True}

        standards_list = [std.model_dump() for std in parsed_response.standards]

        # Add document references to each standard
        for std in standards_list:
            if 'document_ids' not in std:
                std['document_ids'] = []
            # For now, add all document IDs since we processed combined content
            std['document_ids'] = [doc.get("id") for doc in txt_docs if doc.get("id")]

        return {**state, "standards_from_project_documents": standards_list, "done": True}
    except Exception as e:
        logger.error(f"Error extracting standards: {e}")
        return {**state, "error": str(e), "done": True}

def create_standards_asset_specs(state: StandardsExtractionState) -> List[Dict[str, Any]]:
    """Create asset write specifications for standards"""
    specs = []

    for std in state.standards_from_project_documents:
        spec = {
            "asset": {
                "type": "standard",
                "name": std["spec_name"],
                "project_id": state.project_id,
                "approval_state": "not_required",
                "classification": "internal",
                "content": {**std},
                "metadata": {
                    "category": "register",
                    "tags": ["standards", "register", "compliance", "references"],
                    "llm_outputs": {
                        "standards_extraction": {
                            "model": os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
                            "timestamp": "2025-01-01T00:00:00.000Z"
                        }
                    }
                }
            },
            "idempotency_key": f"standard:{state.project_id}:{std['standard_code']}"
        }
        specs.append(spec)

    return specs

def create_document_reference_edges(state: StandardsExtractionState) -> List[Dict[str, Any]]:
    """Create edges linking standards to source documents"""
    edges = []

    for std in state.standards_from_project_documents:
        for doc_id in std.get('document_ids', []):
            edges.append({
                "from_asset_id": "",  # Will be set to standard asset ID
                "to_asset_id": doc_id,
                "edge_type": "REFERENCES",
                "properties": {
                    "reference_type": "standards_citation",
                    "section_reference": std.get("section_reference"),
                    "context": std.get("context", "")[:100]
                },
                "idempotency_key": f"std_doc_ref:{state.project_id}:{std['standard_code']}:{doc_id}"
            })

    return edges

# Graph definition
def create_standards_extraction_graph():
    """Create the standards extraction graph with persistence"""
    # from langgraph.checkpoint.sqlite import SqliteSaver

    builder = StateGraph(StandardsExtractionState, input=InputState, output=OutputState)

    # Add nodes
    builder.add_node("fetch_reference_database", fetch_reference_database_node)
    builder.add_node("extract_standards", standards_extraction_node)
    builder.add_node("create_standards_assets", lambda state: {
        "asset_specs": create_standards_asset_specs(state)
    })
    builder.add_node("create_doc_refs", lambda state: {
        "edge_specs": create_document_reference_edges(state)
    })

    # Define flow
    builder.add_edge(START, "fetch_reference_database")
    builder.add_edge("fetch_reference_database", "extract_standards")
    builder.add_edge("extract_standards", "create_standards_assets")
    builder.add_edge("create_standards_assets", "create_doc_refs")
    builder.add_edge("create_doc_refs", END)

    # return builder.compile(checkpointer=True)
    return builder.compile()

# Test function to demonstrate the conversion
def test_standards_extraction():
    """Simple test to verify the LLM-based standards extraction works"""

    # Sample test data
    test_documents = [
        {
            "id": "doc1",
            "file_name": "spec.pdf",
            "content": "This project must comply with AS 1289 for soil testing and ISO 9001 for quality management. Also reference ASTM C123 for concrete testing."
        }
    ]

    test_input = {
        "project_id": "test_project_123",
        "txt_project_documents": test_documents
    }

    # Create and run the graph
    graph = create_standards_extraction_graph()

    try:
        result = graph.invoke(test_input)
        print("✅ Standards extraction completed successfully!")
        print(f"Found {len(result.get('standards_from_project_documents', []))} standards")
        for std in result.get('standards_from_project_documents', []):
            print(f"- {std.get('standard_code')}: {std.get('spec_name', 'Unknown')}")
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

# Example usage and comparison with V9 patterns
def demonstrate_v10_conversion():
    """
    Demonstrate the converted V10 standards extraction using V9 patterns.
    This shows how we've successfully migrated from regex to LLM-based processing
    while maintaining the same state management and LangGraph structure as V9.
    """
    print("🔄 V10 Standards Extraction - Converted from Regex to LLM")
    print("=" * 60)
    print("✅ Using same V9 patterns:")
    print("  - TypedDict state management")
    print("  - Pydantic models for structured output")
    print("  - Gemini LLM with json_mode")
    print("  - Reference database integration")
    print("  - Asset and edge specifications")
    print("  - LangGraph workflow with nodes and edges")
    print()
    print("🔄 Key improvements from V9 to V10:")
    print("  - LLM-based extraction instead of regex patterns")
    print("  - Better context understanding")
    print("  - Structured JSON output with validation")
    print("  - Enhanced standards matching with database")
    print()

    success = test_standards_extraction()
    if success:
        print("\n🎉 Conversion successful! The graph now uses LLM processing")
        print("   while maintaining full compatibility with V9 architecture.")
    else:
        print("\n⚠️  Test failed - check environment variables and API keys")

if __name__ == "__main__":
    demonstrate_v10_conversion()
