from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, START, END
from langchain_google_genai import ChatGoogleGenerativeAI
import os
import logging
from agent.tools.action_graph_repo import upsertAssetsAndEdges, IdempotentAssetWriteSpec

logger = logging.getLogger(__name__)

# LLM Configuration following V9 patterns
llm = ChatGoogleGenerativeAI(
    model=os.getenv("GEMINI_MODEL_2", "gemini-2.5-pro"),
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.1,
    max_output_tokens=32768,
    include_thoughts=False,
    thinking_budget=-1,
)

class JurisdictionInfo(BaseModel):
    """Pydantic model for jurisdiction analysis"""
    jurisdiction: str = Field(description="Primary jurisdiction (e.g., NSW, QLD, VIC, SA)")
    jurisdiction_code: str = Field(description="Jurisdiction code/abbreviation")
    regulatory_framework: str = Field(description="Regulatory framework (e.g., Work Health and Safety Act)")
    applicable_standards: List[str] = Field(description="List of applicable standards/codes")
    local_council: Optional[str] = Field(default=None, description="Local council authority")
    environmental_considerations: List[str] = Field(description="Environmental regulations to consider")
    compliance_requirements: List[str] = Field(description="Key compliance requirements")
    risk_level: str = Field(description="Risk level assessment (Low/Medium/High)")
    confidence_score: float = Field(description="Confidence in jurisdiction determination (0-1)")

class JurisdictionResolutionState(BaseModel):
    """State for jurisdiction resolution following V9 patterns"""
    project_id: str
    txt_project_documents: List[Dict[str, Any]] = []
    project_details: Optional[Dict[str, Any]] = None
    jurisdiction_analysis: Optional[Dict[str, Any]] = None
    asset_specs: List[Dict[str, Any]] = []
    error: Optional[str] = None

class InputState(BaseModel):
    """Input state for jurisdiction resolution"""
    project_id: str
    txt_project_documents: List[Dict[str, Any]] = []
    project_details: Optional[Dict[str, Any]] = None

class OutputState(BaseModel):
    """Output state for jurisdiction resolution"""
    jurisdiction_analysis: Optional[Dict[str, Any]] = None
    asset_specs: List[Dict[str, Any]] = []
    error: Optional[str] = None

def resolve_jurisdiction_node(state: JurisdictionResolutionState) -> JurisdictionResolutionState:
    """Resolve project jurisdiction using LLM analysis - NO REGEX, NO MOCK DATA"""

    try:
        docs = state.txt_project_documents or []
        project_details = state.project_details or {}

        combined_content = "\n\n".join([
            f"Document: {d.get('file_name','Unknown')} (ID: {d.get('id','')})\n{d.get('content','')}"
            for d in docs
        ])

        # LLM prompt for jurisdiction analysis
        jurisdiction_prompt = f"""
        Analyze the following project documents and determine the applicable jurisdiction and regulatory requirements.

        PROJECT DETAILS:
        {project_details.get('html', 'Not provided')}

        DOCUMENT CONTENT:
        {combined_content}

        Based on the Australian construction/project context, determine:

        1. PRIMARY JURISDICTION: Which state/territory is this project located in?
        2. REGULATORY FRAMEWORK: What are the key regulatory frameworks that apply?
        3. APPLICABLE STANDARDS: Which standards and codes apply to this work?
        4. LOCAL AUTHORITY: Which local council or authority has jurisdiction?
        5. ENVIRONMENTAL CONSIDERATIONS: Any environmental regulations to consider?
        6. COMPLIANCE REQUIREMENTS: Key compliance obligations
        7. RISK LEVEL: Overall risk level assessment

        Provide a structured analysis with confidence scoring.
        """

        # Create structured LLM with Pydantic output
        structured_llm = llm.with_structured_output(JurisdictionInfo)
        jurisdiction_result = structured_llm.invoke(jurisdiction_prompt)

        # Store LLM outputs for knowledge graph
        llm_outputs = {
            "jurisdiction": {
                "analysis": jurisdiction_result.model_dump(),
                "input_documents": [d.get('id') for d in docs if d.get('id')],
                "confidence_score": jurisdiction_result.confidence_score,
                "timestamp": "2024-01-01T00:00:00Z"
            }
        }

        # Create asset spec for jurisdiction analysis
        asset_spec = IdempotentAssetWriteSpec(
            asset_type="analysis",
            asset_subtype="jurisdiction_resolution",
            name=f"Jurisdiction Analysis - {jurisdiction_result.jurisdiction}",
            description=f"Jurisdiction analysis for project {state.project_id}",
            project_id=state.project_id,
            metadata={
                "analysis_type": "jurisdiction_resolution",
                "jurisdiction": jurisdiction_result.jurisdiction,
                "jurisdiction_code": jurisdiction_result.jurisdiction_code,
                "regulatory_framework": jurisdiction_result.regulatory_framework,
                "applicable_standards": jurisdiction_result.applicable_standards,
                "local_council": jurisdiction_result.local_council,
                "environmental_considerations": jurisdiction_result.environmental_considerations,
                "compliance_requirements": jurisdiction_result.compliance_requirements,
                "risk_level": jurisdiction_result.risk_level,
                "confidence_score": jurisdiction_result.confidence_score,
                "llm_outputs": llm_outputs
            },
            content={
                "jurisdiction_analysis": jurisdiction_result.model_dump(),
                "source_documents": [d.get('id') for d in docs if d.get('id')]
            },
            idempotency_key=f"jurisdiction_analysis:{state.project_id}"
        )

        # Upsert to knowledge graph
        upsert_result = upsertAssetsAndEdges([asset_spec])

        return JurisdictionResolutionState(
            project_id=state.project_id,
            txt_project_documents=state.txt_project_documents,
            project_details=state.project_details,
            jurisdiction_analysis=jurisdiction_result.model_dump(),
            asset_specs=[asset_spec.model_dump()],
            error=None
        )

    except Exception as e:
        logger.error(f"Jurisdiction resolution failed: {str(e)}")
        return JurisdictionResolutionState(
            project_id=state.project_id,
            txt_project_documents=state.txt_project_documents,
            project_details=state.project_details,
            jurisdiction_analysis=None,
            asset_specs=[],
            error=f"Jurisdiction resolution failed: {str(e)}"
        )

def create_jurisdiction_resolver_graph():
    """Create the jurisdiction resolver graph with persistence"""
    workflow = StateGraph(JurisdictionResolutionState, input=InputState, output=OutputState)

    workflow.add_node("resolve_jurisdiction", resolve_jurisdiction_node)

    workflow.add_edge(START, "resolve_jurisdiction")
    workflow.add_edge("resolve_jurisdiction", END)

    return workflow.compile(checkpointer=True)
