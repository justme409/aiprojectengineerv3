from typing import Dict, List, Any, Optional, Annotated
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, START, END
from langchain_google_genai import ChatGoogleGenerativeAI
import os
import logging
import uuid
from datetime import datetime
from agent.tools.action_graph_repo import upsertAssetsAndEdges, IdempotentAssetWriteSpec
from agent.tools.db_fetcher import db_fetcher_step
from agent.prompts.document_metadata_prompt import DOCUMENT_METADATA_DRAWING_PROMPT, DOCUMENT_METADATA_DOCUMENT_PROMPT

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

# Structured Output Models based on knowledge graph schema

class DocumentSummary(BaseModel):
    """Document summary information"""
    short: str = Field(description="Brief summary of the document")
    executive: str = Field(description="Executive-level summary")
    technical: str = Field(description="Technical summary")
    audience: str = Field(description="Target audience")
    tone: str = Field(description="Document tone/style")

class DocumentOutline(BaseModel):
    """Document outline structure"""
    level: int = Field(description="Outline level (1-6)")
    title: str = Field(description="Section title")
    page_range: Optional[str] = Field(description="Page range for this section")

class DocumentEntities(BaseModel):
    """Key entities mentioned in the document"""
    organizations: List[str] = Field(description="Organizations mentioned")
    persons: List[str] = Field(description="People mentioned")
    materials: List[str] = Field(description="Materials referenced")
    equipment: List[str] = Field(description="Equipment referenced")
    standards: List[str] = Field(description="Standards referenced")
    clauses: List[str] = Field(description="Clauses referenced")
    locations: List[str] = Field(description="Locations mentioned")
    wbs_refs: List[str] = Field(description="WBS references")
    lbs_refs: List[str] = Field(description="LBS references")

class DocumentRequirement(BaseModel):
    """Individual requirement extracted from document"""
    id: str = Field(description="Unique requirement identifier")
    text: str = Field(description="Requirement text")
    source_clause: str = Field(description="Source clause reference")
    mandatory: bool = Field(description="Whether requirement is mandatory")
    applicability_tags: List[str] = Field(description="Tags for requirement applicability")

class DocumentControl(BaseModel):
    """Control measure extracted from document"""
    id: str = Field(description="Unique control identifier")
    text: str = Field(description="Control description")
    type: str = Field(description="Control type (preventive, detective, corrective)")
    maps_to_requirements: List[str] = Field(description="Requirements this control maps to")

class DocumentHazardRisk(BaseModel):
    """Hazard and risk assessment"""
    hazard: str = Field(description="Hazard description")
    context: str = Field(description="Context where hazard occurs")
    severity: str = Field(description="Severity level")
    likelihood: str = Field(description="Likelihood of occurrence")
    risk_rating: str = Field(description="Overall risk rating")
    controls: List[str] = Field(description="Associated control measures")

class DocumentTask(BaseModel):
    """Task extracted from document"""
    step_no: int = Field(description="Step number")
    description: str = Field(description="Task description")
    prerequisites: List[str] = Field(description="Prerequisites for this task")
    acceptance_criteria: List[str] = Field(description="Acceptance criteria")

class DocumentMetric(BaseModel):
    """Metric extracted from document"""
    name: str = Field(description="Metric name")
    value: Any = Field(description="Metric value")
    unit: str = Field(description="Unit of measurement")
    method: str = Field(description="Measurement method")

class DocumentDecisionsActions(BaseModel):
    """Decisions and actions from document"""
    decisions: List[str] = Field(description="Decisions made")
    actions: List[str] = Field(description="Required actions")

class DocumentCitation(BaseModel):
    """Citation from document"""
    ref_id: str = Field(description="Reference identifier")
    title: str = Field(description="Citation title")
    location: str = Field(description="Location in document")

class DocumentAnomaly(BaseModel):
    """Anomaly or issue found in document"""
    type: str = Field(description="Type of anomaly")
    span: str = Field(description="Text span where anomaly occurs")
    note: str = Field(description="Note about the anomaly")

class DocumentExtractionMeta(BaseModel):
    """Metadata about the extraction process"""
    schema_version: str = Field(description="Schema version used")
    quality_checks: List[str] = Field(description="Quality checks performed")
    warnings: List[str] = Field(description="Warnings during extraction")

class DocumentMetadata(BaseModel):
    """Complete metadata for a document following knowledge graph schema"""
    document_id: str = Field(description="Unique document identifier")
    document_type: str = Field(description="Type of document")
    document_number: Optional[str] = Field(description="Document number")
    revision_code: Optional[str] = Field(description="Revision code")
    summary: DocumentSummary = Field(description="Document summaries")
    outline: List[DocumentOutline] = Field(description="Document outline")
    entities: DocumentEntities = Field(description="Key entities")
    requirements: List[DocumentRequirement] = Field(description="Requirements")
    controls: List[DocumentControl] = Field(description="Controls")
    hazards_risks: List[DocumentHazardRisk] = Field(description="Hazards and risks")
    tasks: List[DocumentTask] = Field(description="Tasks")
    metrics: List[DocumentMetric] = Field(description="Metrics")
    decisions_actions: DocumentDecisionsActions = Field(description="Decisions and actions")
    citations: List[DocumentCitation] = Field(description="Citations")
    anomalies: List[DocumentAnomaly] = Field(description="Anomalies")
    extraction_meta: DocumentExtractionMeta = Field(description="Extraction metadata")
    classification_level: str = Field(description="Security classification", default="internal")
    primary_subject: str = Field(description="Primary subject matter")
    compliance_references: List[str] = Field(description="Compliance references")
    temporal_relevance: str = Field(description="Time relevance", default="current")

class DrawingMetadata(BaseModel):
    """Metadata for drawing documents"""
    document_id: str = Field(description="Unique drawing identifier")
    document_type: str = Field(description="Always 'drawing'")
    subtype: str = Field(description="Drawing subtype (general_arrangement, section, elevation, detail)")
    document_number: Optional[str] = Field(description="Drawing number")
    revision_code: Optional[str] = Field(description="Revision code")
    title: str = Field(description="Drawing title")
    scale: Optional[str] = Field(description="Drawing scale")
    sheet_number: Optional[str] = Field(description="Sheet number")
    total_sheets: Optional[int] = Field(description="Total number of sheets")
    discipline: str = Field(description="Engineering discipline")
    entities: DocumentEntities = Field(description="Key entities shown")
    locations: List[str] = Field(description="Locations shown on drawing")
    wbs_refs: List[str] = Field(description="WBS references")
    lbs_refs: List[str] = Field(description="LBS references")
    extraction_meta: DocumentExtractionMeta = Field(description="Extraction metadata")
    classification_level: str = Field(description="Security classification", default="internal")

class DocumentMetadataExtraction(BaseModel):
    """Complete extraction result for documents and drawings"""
    documents: List[DocumentMetadata] = Field(description="Extracted document metadata")
    drawings: List[DrawingMetadata] = Field(description="Extracted drawing metadata")
    processing_summary: Dict[str, Any] = Field(description="Processing summary")

# State models

class DocumentMetadataState(BaseModel):
    """State for document metadata extraction"""
    project_id: str
    document_ids: List[str] = []
    drawing_ids: List[str] = []
    txt_project_documents: List[Dict[str, Any]] = []
    existing_revisions: Dict[str, Dict[str, Any]] = {}  # document_id -> revision_info
    extracted_metadata: Optional[Dict[str, Any]] = None
    asset_specs: List[Dict[str, Any]] = []
    error: Optional[str] = None
    processing_complete: bool = False

class InputState(BaseModel):
    """Input state for metadata extraction"""
    project_id: str
    document_ids: List[str] = []
    drawing_ids: List[str] = []

class OutputState(BaseModel):
    """Output state for metadata extraction"""
    extracted_metadata: Optional[Dict[str, Any]] = None
    asset_specs: List[Dict[str, Any]] = []
    error: Optional[str] = None
    processing_complete: bool = False

# Helper functions

async def check_existing_revisions(state: DocumentMetadataState) -> Dict[str, Dict[str, Any]]:
    """Check for existing revisions of documents and drawings"""
    all_ids = state.document_ids + state.drawing_ids
    if not all_ids:
        return {}

    # Query existing assets to check for revisions
    from agent.tools.db_fetcher import DbFetcherState
    fetch_state = DbFetcherState(queries=[{
        "table": "assets",
        "columns": [
            "id",
            "asset_uid",
            "type",
            "document_number",
            "revision_code",
            "version",
            "is_current",
            "content"
        ],
        "where": {
            "id": {"$in": all_ids},
            "is_current": True,
            "is_deleted": False
        }
    }])

    result = db_fetcher_step(fetch_state)
    existing_revisions = {}

    for record in result.get("records", []):
        doc_id = str(record["id"])
        existing_revisions[doc_id] = {
            "asset_uid": str(record["asset_uid"]),
            "document_number": record["document_number"],
            "revision_code": record["revision_code"],
            "current_version": record["version"],
            "type": record["type"]
        }

    return existing_revisions

def determine_document_type(file_name: str, content: str) -> str:
    """Determine if document is a drawing or regular document"""
    file_name_lower = file_name.lower()

    # Check file extension and name patterns for drawings
    drawing_indicators = [
        '.dwg', '.dxf', '.pdf',  # Common drawing file extensions
        'drawing', 'plan', 'section', 'elevation', 'detail',
        'arrangement', 'layout', 'diagram'
    ]

    if any(indicator in file_name_lower for indicator in drawing_indicators):
        return 'drawing'

    # Check content for drawing-related keywords
    content_lower = content.lower()[:1000]  # Check first 1000 chars
    drawing_content_indicators = [
        'drawing', 'scale', 'sheet', 'revision', 'detail',
        'elevation', 'section', 'plan view', 'north'
    ]

    if any(indicator in content_lower for indicator in drawing_content_indicators):
        return 'drawing'

    return 'document'

def determine_drawing_subtype(file_name: str, content: str) -> str:
    """Determine drawing subtype based on filename and content"""
    file_name_lower = file_name.lower()
    content_lower = content.lower()[:2000]

    # Check for specific drawing types
    if any(term in file_name_lower for term in ['ga', 'general arrangement']):
        return 'general_arrangement'
    elif any(term in file_name_lower for term in ['section', 'sect']):
        return 'section'
    elif any(term in file_name_lower for term in ['elevation', 'elev']):
        return 'elevation'
    elif any(term in file_name_lower for term in ['detail', 'det']):
        return 'detail'

    # Check content for clues
    if 'general arrangement' in content_lower:
        return 'general_arrangement'
    elif 'section' in content_lower:
        return 'section'
    elif 'elevation' in content_lower:
        return 'elevation'
    elif 'detail' in content_lower:
        return 'detail'

    return 'general_arrangement'  # Default

# Graph nodes

async def extract_document_metadata_node(state: DocumentMetadataState) -> DocumentMetadataState:
    """Extract metadata from documents and drawings using LLM with structured output"""
    try:
        documents = []
        drawings = []

        # Process each document
        for doc in state.txt_project_documents:
            doc_id = doc.get("id", "")
            file_name = doc.get("file_name", "")
            content = doc.get("content", "")

            if not content:
                logger.warning(f"Skipping document {file_name} - no content")
                continue

            # Determine document type
            doc_type = determine_document_type(file_name, content)

            # Extract metadata based on type
            if doc_type == 'drawing':
                # Extract drawing metadata
                drawing_prompt = DOCUMENT_METADATA_DRAWING_PROMPT.format(
                    file_name=file_name,
                    content=content[:10000]  # Limit content for LLM
                )

                class DrawingExtractionResponse(BaseModel):
                    document_number: Optional[str] = None
                    revision_code: Optional[str] = None
                    title: str = ""
                    scale: Optional[str] = None
                    sheet_number: Optional[str] = None
                    total_sheets: Optional[int] = None
                    discipline: str = ""
                    entities: DocumentEntities
                    locations: List[str] = []
                    wbs_refs: List[str] = []
                    lbs_refs: List[str] = []
                    classification_level: str = "internal"

                structured_llm = llm.with_structured_output(DrawingExtractionResponse)
                drawing_result = structured_llm.invoke(drawing_prompt)

                # Create drawing metadata
                drawing_metadata = DrawingMetadata(
                    document_id=doc_id,
                    document_type='drawing',
                    subtype=determine_drawing_subtype(file_name, content),
                    document_number=drawing_result.document_number,
                    revision_code=drawing_result.revision_code,
                    title=drawing_result.title or file_name,
                    scale=drawing_result.scale,
                    sheet_number=drawing_result.sheet_number,
                    total_sheets=drawing_result.total_sheets,
                    discipline=drawing_result.discipline,
                    entities=drawing_result.entities,
                    locations=drawing_result.locations,
                    wbs_refs=drawing_result.wbs_refs,
                    lbs_refs=drawing_result.lbs_refs,
                    extraction_meta=DocumentExtractionMeta(
                        schema_version="v2.2",
                        quality_checks=["drawing_format_validation", "metadata_extraction"],
                        warnings=[]
                    ),
                    classification_level=drawing_result.classification_level
                )
                drawings.append(drawing_metadata)

            else:
                # Extract document metadata
                document_prompt = DOCUMENT_METADATA_DOCUMENT_PROMPT.format(
                    file_name=file_name,
                    content=content[:15000]  # Limit content for LLM
                )

                class DocumentExtractionResponse(BaseModel):
                    document_type: str = "document"
                    document_number: Optional[str] = None
                    revision_code: Optional[str] = None
                    summary: DocumentSummary
                    outline: List[DocumentOutline] = []
                    entities: DocumentEntities
                    requirements: List[DocumentRequirement] = []
                    controls: List[DocumentControl] = []
                    hazards_risks: List[DocumentHazardRisk] = []
                    tasks: List[DocumentTask] = []
                    metrics: List[DocumentMetric] = []
                    decisions_actions: DocumentDecisionsActions
                    citations: List[DocumentCitation] = []
                    anomalies: List[DocumentAnomaly] = []
                    classification_level: str = "internal"
                    primary_subject: str = ""
                    compliance_references: List[str] = []
                    temporal_relevance: str = "current"

                structured_llm = llm.with_structured_output(DocumentExtractionResponse)
                doc_result = structured_llm.invoke(document_prompt)

                # Create document metadata
                document_metadata = DocumentMetadata(
                    document_id=doc_id,
                    document_type=doc_result.document_type,
                    document_number=doc_result.document_number,
                    revision_code=doc_result.revision_code,
                    summary=doc_result.summary,
                    outline=doc_result.outline,
                    entities=doc_result.entities,
                    requirements=doc_result.requirements,
                    controls=doc_result.controls,
                    hazards_risks=doc_result.hazards_risks,
                    tasks=doc_result.tasks,
                    metrics=doc_result.metrics,
                    decisions_actions=doc_result.decisions_actions,
                    citations=doc_result.citations,
                    anomalies=doc_result.anomalies,
                    extraction_meta=DocumentExtractionMeta(
                        schema_version="v2.2",
                        quality_checks=["document_structure_validation", "metadata_completeness"],
                        warnings=[]
                    ),
                    classification_level=doc_result.classification_level,
                    primary_subject=doc_result.primary_subject,
                    compliance_references=doc_result.compliance_references,
                    temporal_relevance=doc_result.temporal_relevance
                )
                documents.append(document_metadata)

        # Create complete extraction result
        extraction_result = DocumentMetadataExtraction(
            documents=documents,
            drawings=drawings,
            processing_summary={
                "total_documents_processed": len(documents) + len(drawings),
                "documents_extracted": len(documents),
                "drawings_extracted": len(drawings),
                "timestamp": datetime.now().isoformat(),
                "schema_version": "v2.2"
            }
        )

        return DocumentMetadataState(
            project_id=state.project_id,
            document_ids=state.document_ids,
            drawing_ids=state.drawing_ids,
            txt_project_documents=state.txt_project_documents,
            existing_revisions=state.existing_revisions,
            extracted_metadata=extraction_result.model_dump(),
            asset_specs=[],
            error=None,
            processing_complete=False
        )

    except Exception as e:
        logger.error(f"Document metadata extraction failed: {str(e)}")
        return DocumentMetadataState(
            project_id=state.project_id,
            document_ids=state.document_ids,
            drawing_ids=state.drawing_ids,
            txt_project_documents=state.txt_project_documents,
            existing_revisions=state.existing_revisions,
            extracted_metadata=None,
            asset_specs=[],
            error=f"Document metadata extraction failed: {str(e)}",
            processing_complete=False
        )

def create_asset_specifications_node(state: DocumentMetadataState) -> DocumentMetadataState:
    """Create asset specifications with proper revision management"""
    if not state.extracted_metadata:
        return state

    asset_specs = []
    extraction_data = state.extracted_metadata

    # Process documents
    for doc_metadata in extraction_data.get("documents", []):
        doc_id = doc_metadata["document_id"]
        existing_revision = state.existing_revisions.get(doc_id, {})

        # Handle revision logic
        current_version = existing_revision.get("current_version", 0)
        new_version = current_version + 1

        # If this is a new revision, create supersedes relationship
        supersedes_asset_id = None
        if existing_revision and existing_revision.get("is_current"):
            supersedes_asset_id = existing_revision.get("asset_uid")

        # Create asset spec for document
        asset_spec = {
            "asset": {
                "type": "document",
                "subtype": doc_metadata.get("document_type", "document"),
                "name": f"{doc_metadata.get('document_number', 'Unknown')} - {doc_metadata.get('primary_subject', 'Document')}",
                "project_id": state.project_id,
                "document_number": doc_metadata.get("document_number"),
                "revision_code": doc_metadata.get("revision_code"),
                "status": "draft",
                "approval_state": "not_required",
                "classification": doc_metadata.get("classification_level", "internal"),
                "content": doc_metadata,
                "metadata": {
                    "extraction_method": "llm_structured_output",
                    "extraction_timestamp": datetime.now().isoformat(),
                    "schema_version": "v2.2",
                    "llm_outputs": {
                        "document_metadata_extraction": doc_metadata
                    }
                }
            },
            "edges": []
        }

        # Add version information if this is a revision
        if supersedes_asset_id:
            asset_spec["asset"]["supersedes_asset_id"] = supersedes_asset_id
            asset_spec["asset"]["version"] = new_version
            asset_spec["edges"].append({
                "from_asset_id": f"{{new_asset_id}}",  # Placeholder for new asset ID
                "to_asset_id": supersedes_asset_id,
                "edge_type": "SUPERSEDES",
                "properties": {"superseded_at": datetime.now().isoformat()},
                "idempotency_key": f"supersedes:{state.project_id}:{doc_id}:v{new_version}"
            })

        asset_specs.append(asset_spec)

    # Process drawings
    for drawing_metadata in extraction_data.get("drawings", []):
        drawing_id = drawing_metadata["document_id"]
        existing_revision = state.existing_revisions.get(drawing_id, {})

        # Handle revision logic (same as documents)
        current_version = existing_revision.get("current_version", 0)
        new_version = current_version + 1

        supersedes_asset_id = None
        if existing_revision and existing_revision.get("is_current"):
            supersedes_asset_id = existing_revision.get("asset_uid")

        # Create asset spec for drawing
        asset_spec = {
            "asset": {
                "type": "drawing",
                "subtype": drawing_metadata.get("subtype", "general_arrangement"),
                "name": f"{drawing_metadata.get('document_number', 'Unknown')} - {drawing_metadata.get('title', 'Drawing')}",
                "project_id": state.project_id,
                "document_number": drawing_metadata.get("document_number"),
                "revision_code": drawing_metadata.get("revision_code"),
                "status": "draft",
                "approval_state": "not_required",
                "classification": drawing_metadata.get("classification_level", "internal"),
                "content": drawing_metadata,
                "metadata": {
                    "extraction_method": "llm_structured_output",
                    "extraction_timestamp": datetime.now().isoformat(),
                    "schema_version": "v2.2",
                    "llm_outputs": {
                        "drawing_metadata_extraction": drawing_metadata
                    }
                }
            },
            "edges": []
        }

        # Add version information if this is a revision
        if supersedes_asset_id:
            asset_spec["asset"]["supersedes_asset_id"] = supersedes_asset_id
            asset_spec["asset"]["version"] = new_version
            asset_spec["edges"].append({
                "from_asset_id": "{new_asset_id}",  # Placeholder for new asset ID
                "to_asset_id": supersedes_asset_id,
                "edge_type": "SUPERSEDES",
                "properties": {"superseded_at": datetime.now().isoformat()},
                "idempotency_key": f"supersedes:{state.project_id}:{drawing_id}:v{new_version}"
            })

        asset_specs.append(asset_spec)

    return DocumentMetadataState(
        project_id=state.project_id,
        document_ids=state.document_ids,
        drawing_ids=state.drawing_ids,
        txt_project_documents=state.txt_project_documents,
        existing_revisions=state.existing_revisions,
        extracted_metadata=state.extracted_metadata,
        asset_specs=asset_specs,
        error=state.error,
        processing_complete=False
    )

def persist_assets_node(state: DocumentMetadataState) -> DocumentMetadataState:
    """Persist asset specifications to the knowledge graph"""
    if not state.asset_specs:
        logger.warning("No asset specifications to persist")
        return DocumentMetadataState(
            project_id=state.project_id,
            document_ids=state.document_ids,
            drawing_ids=state.drawing_ids,
            txt_project_documents=state.txt_project_documents,
            existing_revisions=state.existing_revisions,
            extracted_metadata=state.extracted_metadata,
            asset_specs=state.asset_specs,
            error="No asset specifications to persist",
            processing_complete=True
        )

    try:
        # Convert to IdempotentAssetWriteSpec objects
        write_specs = []
        for spec in state.asset_specs:
            # Generate unique idempotency key
            doc_id = spec["asset"].get("document_number", spec["asset"].get("id", str(uuid.uuid4())))
            revision = spec["asset"].get("revision_code", "1")
            asset_type = spec["asset"]["type"]

            write_spec = IdempotentAssetWriteSpec(
                asset_type=asset_type,
                asset_subtype=spec["asset"].get("subtype", asset_type),
                name=spec["asset"]["name"],
                description=f"Extracted metadata for {asset_type}: {spec['asset']['name']}",
                project_id=state.project_id,
                metadata=spec["asset"]["metadata"],
                content=spec["asset"]["content"],
                idempotency_key=f"{asset_type}_metadata:{state.project_id}:{doc_id}:{revision}",
                edges=spec["edges"]
            )
            write_specs.append(write_spec)

        # Persist to database
        result = upsertAssetsAndEdges(write_specs)

        logger.info(f"Successfully persisted {len(write_specs)} document/drawing assets to database")

        return DocumentMetadataState(
            project_id=state.project_id,
            document_ids=state.document_ids,
            drawing_ids=state.drawing_ids,
            txt_project_documents=state.txt_project_documents,
            existing_revisions=state.existing_revisions,
            extracted_metadata=state.extracted_metadata,
            asset_specs=state.asset_specs,
            error=None,
            processing_complete=True
        )

    except Exception as e:
        logger.error(f"Failed to persist document/drawing assets: {e}")
        return DocumentMetadataState(
            project_id=state.project_id,
            document_ids=state.document_ids,
            drawing_ids=state.drawing_ids,
            txt_project_documents=state.txt_project_documents,
            existing_revisions=state.existing_revisions,
            extracted_metadata=state.extracted_metadata,
            asset_specs=state.asset_specs,
            error=f"Failed to persist assets: {str(e)}",
            processing_complete=True
        )

# Graph creation

def create_document_metadata_graph():
    """Create the document metadata extraction graph"""
    workflow = StateGraph(DocumentMetadataState, input=InputState, output=OutputState)

    # Add nodes
    workflow.add_node("check_revisions", check_existing_revisions)
    workflow.add_node("extract_metadata", extract_document_metadata_node)
    workflow.add_node("create_asset_specs", create_asset_specifications_node)
    workflow.add_node("persist_assets", persist_assets_node)

    # Define flow
    workflow.add_edge(START, "check_revisions")
    workflow.add_edge("check_revisions", "extract_metadata")
    workflow.add_edge("extract_metadata", "create_asset_specs")
    workflow.add_edge("create_asset_specs", "persist_assets")
    workflow.add_edge("persist_assets", END)

    return workflow.compile(checkpointer=True)
