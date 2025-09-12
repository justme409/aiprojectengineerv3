from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, START, END
from langchain_google_genai import ChatGoogleGenerativeAI
import os
import logging
import uuid
from datetime import datetime
from agent.tools.action_graph_repo import upsertAssetsAndEdges, IdempotentAssetWriteSpec
from agent.tools.db_fetcher import db_fetcher_step
from agent.prompts.document_metadata_prompt import (
    CLASSIFY_DOCUMENT_PROMPT,
    DOCUMENT_METADATA_DRAWING_PROMPT,
    DOCUMENT_METADATA_DOCUMENT_PROMPT,
)

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

class DocumentExtractionMeta(BaseModel):
    """Metadata about the extraction process"""
    schema_version: str = Field(description="Schema version used")
    quality_checks: List[str] = Field(description="Quality checks performed")
    warnings: List[str] = Field(description="Warnings during extraction")

class RegisterSubDocument(BaseModel):
    """Subdocument enclosed within a file (document or drawing)."""
    doc_kind: str = Field(description="'document' or 'drawing'")
    title: Optional[str] = Field(description="Subdocument title")
    document_number: Optional[str] = Field(description="Subdocument number if present")
    revision_code: Optional[str] = Field(description="Subdocument revision code if present")
    page_range: Optional[str] = Field(description="Page range where it appears, e.g., 3-8")
    subtype: Optional[str] = Field(description="Subtype if drawing (e.g., general_arrangement, section)")
    discipline: Optional[str] = Field(description="Discipline if present")
    additional_fields: Optional[Dict[str, Any]] = Field(default=None, description="Extra register-relevant fields")

class RegisterDocumentMetadata(BaseModel):
    """Register-focused metadata for a non-drawing document."""
    document_id: str = Field(description="Unique source document identifier")
    document_type: str = Field(description="Always 'document'")
    document_number: Optional[str] = Field(description="Official document number/reference")
    revision_code: Optional[str] = Field(description="Revision identifier")
    title: str = Field(description="Document title")
    category: Optional[str] = Field(description="Document category (specification, report, contract, etc.)")
    discipline: Optional[str] = Field(description="Discipline if present")
    classification_level: str = Field(description="Security classification", default="internal")
    subdocuments: List[RegisterSubDocument] = Field(default_factory=list, description="Enclosed subdocuments")
    additional_fields: Optional[Dict[str, Any]] = Field(default=None, description="Extra register-relevant fields")
    extraction_meta: DocumentExtractionMeta = Field(description="Extraction metadata")

class RegisterDrawingMetadata(BaseModel):
    """Register-focused metadata for a drawing document."""
    document_id: str = Field(description="Unique source document identifier")
    document_type: str = Field(description="Always 'drawing'")
    subtype: Optional[str] = Field(description="Drawing subtype (general_arrangement, section, elevation, detail, plan, schedule, diagram, layout)")
    document_number: Optional[str] = Field(description="Drawing number")
    revision_code: Optional[str] = Field(description="Revision identifier")
    title: str = Field(description="Drawing title")
    scale: Optional[str] = Field(description="Drawing scale")
    sheet_number: Optional[str] = Field(description="Sheet number")
    total_sheets: Optional[int] = Field(description="Total number of sheets")
    discipline: Optional[str] = Field(description="Discipline if present")
    classification_level: str = Field(description="Security classification", default="internal")
    subdocuments: List[RegisterSubDocument] = Field(default_factory=list, description="Enclosed subdocuments")
    additional_fields: Optional[Dict[str, Any]] = Field(default=None, description="Extra register-relevant fields")
    extraction_meta: DocumentExtractionMeta = Field(description="Extraction metadata")

class DocumentMetadataExtraction(BaseModel):
    """Complete extraction result for documents and drawings"""
    documents: List[RegisterDocumentMetadata] = Field(description="Extracted document metadata")
    drawings: List[RegisterDrawingMetadata] = Field(description="Extracted drawing metadata")
    processing_summary: Dict[str, Any] = Field(description="Processing summary")

# State models

class DocumentMetadataState(BaseModel):
    """State for document metadata extraction"""
    project_id: str
    document_ids: List[str] = []
    drawing_ids: List[str] = []
    txt_project_documents: List[Dict[str, Any]] = []
    # Keyed by f"{asset_type}:{document_number}" -> { id, asset_uid, revision_code, current_version, is_current, type }
    existing_revisions: Dict[str, Dict[str, Any]] = {}
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

## Determination is LLM-only per user rules; no deterministic methods used.

async def check_existing_revisions(state: DocumentMetadataState) -> Dict[str, Any]:
    """Check for existing current revisions by document_number and type after extraction.

    This runs AFTER extraction so we know the document_numbers to query.
    Builds a mapping keyed by f"{type}:{document_number}".
    """
    if not state.extracted_metadata:
        return {"existing_revisions": {}}

    from agent.tools.db_fetcher import DbFetcherState

    extracted = state.extracted_metadata
    doc_numbers = list({d.get("document_number") for d in extracted.get("documents", []) if d.get("document_number")})
    drw_numbers = list({d.get("document_number") for d in extracted.get("drawings", []) if d.get("document_number")})

    if not doc_numbers and not drw_numbers:
        return {"existing_revisions": {}}

    queries = []
    if doc_numbers:
        queries.append({
            "table": "assets",
            "columns": [
                "id",
                "asset_uid",
                "type",
                "document_number",
                "revision_code",
                "version",
                "is_current"
            ],
            "where": {
                "project_id": state.project_id,
                "type": "document",
                "document_number": {"$in": doc_numbers},
                "is_current": True,
                "is_deleted": False
            }
        })
    if drw_numbers:
        queries.append({
        "table": "assets",
        "columns": [
            "id",
            "asset_uid",
            "type",
            "document_number",
            "revision_code",
            "version",
                "is_current"
        ],
        "where": {
                "project_id": state.project_id,
                "type": "drawing",
                "document_number": {"$in": drw_numbers},
            "is_current": True,
            "is_deleted": False
        }
        })

    if not queries:
        return {"existing_revisions": {}}

    fetch_state = DbFetcherState(queries=queries)
    result = db_fetcher_step(fetch_state)

    existing_revisions: Dict[str, Dict[str, Any]] = {}
    for record in result.get("records", []):
        key = f"{record['type']}:{record['document_number']}"
        existing_revisions[key] = {
            "current_asset_id": str(record["id"]),
            "asset_uid": str(record["asset_uid"]),
            "document_number": record["document_number"],
            "revision_code": record["revision_code"],
            "current_version": record["version"],
            "is_current": bool(record["is_current"]),
            "type": record["type"],
        }

    return {"existing_revisions": existing_revisions}

# Graph nodes

async def extract_document_metadata_node(state: DocumentMetadataState) -> DocumentMetadataState:
    """Extract metadata from documents and drawings using LLM with structured output"""
    try:
        documents: List[RegisterDocumentMetadata] = []
        drawings: List[RegisterDrawingMetadata] = []

        # Process each document
        for doc in state.txt_project_documents:
            doc_id = doc.get("id", "")
            file_name = doc.get("file_name", "")
            content = doc.get("content", "")

            if not content:
                logger.warning(f"Skipping document {file_name} - no content")
                continue

            # Classify doc kind using LLM
            class ClassificationResponse(BaseModel):
                doc_kind: str
                subtype: Optional[str] = None
                discipline: Optional[str] = None
                reason: str

            classify_prompt = CLASSIFY_DOCUMENT_PROMPT.format(
                file_name=file_name,
                content=content[:5000]
            )
            classification_llm = llm.with_structured_output(ClassificationResponse)
            classification = classification_llm.invoke(classify_prompt)
            doc_kind = (classification.doc_kind or 'document').lower()

            # Extract metadata based on kind
            if doc_kind == 'drawing':
                # Extract drawing metadata
                drawing_prompt = DOCUMENT_METADATA_DRAWING_PROMPT.format(
                    file_name=file_name,
                    content=content[:10000]  # Limit content for LLM
                )
                class DrawingExtractionResponse(BaseModel):
                    document_number: Optional[str] = None
                    revision_code: Optional[str] = None
                    title: Optional[str] = None
                    scale: Optional[str] = None
                    sheet_number: Optional[str] = None
                    total_sheets: Optional[int] = None
                    discipline: Optional[str] = None
                    subtype: Optional[str] = None
                    classification_level: Optional[str] = None
                    subdocuments: List[RegisterSubDocument] = []
                    additional_fields: Optional[Dict[str, Any]] = None

                structured_llm = llm.with_structured_output(DrawingExtractionResponse)
                drawing_result = structured_llm.invoke(drawing_prompt)

                # Create drawing metadata
                drawing_metadata = RegisterDrawingMetadata(
                    document_id=doc_id,
                    document_type='drawing',
                    subtype=drawing_result.subtype or classification.subtype,
                    document_number=drawing_result.document_number,
                    revision_code=drawing_result.revision_code,
                    title=(drawing_result.title or file_name),
                    scale=drawing_result.scale,
                    sheet_number=drawing_result.sheet_number,
                    total_sheets=drawing_result.total_sheets,
                    discipline=drawing_result.discipline or classification.discipline,
                    classification_level=drawing_result.classification_level or 'internal',
                    subdocuments=drawing_result.subdocuments or [],
                    additional_fields=drawing_result.additional_fields,
                    extraction_meta=DocumentExtractionMeta(
                        schema_version="v2.2",
                        quality_checks=["drawing_register_validation", "metadata_extraction"],
                        warnings=[]
                    ),
                )
                # Attach source download info if available
                try:
                    if doc.get("blob_url") or doc.get("storage_path"):
                        extra = drawing_metadata.additional_fields or {}
                        extra.update({
                            "source_blob_url": doc.get("blob_url"),
                            "source_storage_path": doc.get("storage_path"),
                            "source_file_name": file_name,
                        })
                        drawing_metadata.additional_fields = extra
                except Exception:
                    pass
                drawings.append(drawing_metadata)

            else:
                # Extract document metadata
                document_prompt = DOCUMENT_METADATA_DOCUMENT_PROMPT.format(
                    file_name=file_name,
                    content=content[:15000]  # Limit content for LLM
                )
                class DocumentExtractionResponse(BaseModel):
                    document_number: Optional[str] = None
                    revision_code: Optional[str] = None
                    title: Optional[str] = None
                    category: Optional[str] = None
                    discipline: Optional[str] = None
                    classification_level: Optional[str] = None
                    subdocuments: List[RegisterSubDocument] = []
                    additional_fields: Optional[Dict[str, Any]] = None

                structured_llm = llm.with_structured_output(DocumentExtractionResponse)
                doc_result = structured_llm.invoke(document_prompt)

                # Create document metadata
                document_metadata = RegisterDocumentMetadata(
                    document_id=doc_id,
                    document_type='document',
                    document_number=doc_result.document_number,
                    revision_code=doc_result.revision_code,
                    title=(doc_result.title or file_name),
                    category=doc_result.category,
                    discipline=doc_result.discipline or classification.discipline,
                    classification_level=doc_result.classification_level or 'internal',
                    subdocuments=doc_result.subdocuments or [],
                    additional_fields=doc_result.additional_fields,
                    extraction_meta=DocumentExtractionMeta(
                        schema_version="v2.2",
                        quality_checks=["document_register_validation", "metadata_extraction"],
                        warnings=[]
                    ),
                )
                # Attach source download info if available
                try:
                    if doc.get("blob_url") or doc.get("storage_path"):
                        extra = document_metadata.additional_fields or {}
                        extra.update({
                            "source_blob_url": doc.get("blob_url"),
                            "source_storage_path": doc.get("storage_path"),
                            "source_file_name": file_name,
                        })
                        document_metadata.additional_fields = extra
                except Exception:
                    pass
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
        doc_number = doc_metadata.get("document_number")
        key = f"document:{doc_number}" if doc_number else None
        existing_revision = state.existing_revisions.get(key, {}) if key else {}

        # Handle revision logic
        current_version = existing_revision.get("current_version", 0)
        new_version = current_version + 1

        # If this is a new revision, create supersedes relationship
        supersedes_asset_id = None
        if existing_revision and existing_revision.get("is_current"):
            supersedes_asset_id = existing_revision.get("current_asset_id")

        # Create asset spec for document
        asset_spec = {
            "asset": {
                "type": "document",
                "subtype": "document",
                "name": f"{doc_metadata.get('document_number', 'Unknown')} - {doc_metadata.get('title', 'Document')}",
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
                    "llm_outputs": {"document_register": doc_metadata}
                }
            },
            "edges": []
        }

        # Add version information if this is a revision
        if supersedes_asset_id:
            asset_spec["asset"]["supersedes_asset_id"] = supersedes_asset_id
            asset_spec["asset"]["version"] = new_version
            asset_spec["edges"].append({
                "from_asset_id": "",
                "to_asset_id": supersedes_asset_id,
                "edge_type": "SUPERSEDES",
                "properties": {"superseded_at": datetime.now().isoformat()},
                "idempotency_key": f"supersedes:{state.project_id}:{doc_number or doc_id}:v{new_version}"
            })

        asset_specs.append(asset_spec)

    # Process drawings
    for drawing_metadata in extraction_data.get("drawings", []):
        drawing_id = drawing_metadata["document_id"]
        drw_number = drawing_metadata.get("document_number")
        key = f"drawing:{drw_number}" if drw_number else None
        existing_revision = state.existing_revisions.get(key, {}) if key else {}

        # Handle revision logic (same as documents)
        current_version = existing_revision.get("current_version", 0)
        new_version = current_version + 1

        supersedes_asset_id = None
        if existing_revision and existing_revision.get("is_current"):
            supersedes_asset_id = existing_revision.get("current_asset_id")

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
                    "llm_outputs": {"drawing_register": drawing_metadata}
                }
            },
            "edges": []
        }

        # Add version information if this is a revision
        if supersedes_asset_id:
            asset_spec["asset"]["supersedes_asset_id"] = supersedes_asset_id
            asset_spec["asset"]["version"] = new_version
            asset_spec["edges"].append({
                "from_asset_id": "",
                "to_asset_id": supersedes_asset_id,
                "edge_type": "SUPERSEDES",
                "properties": {"superseded_at": datetime.now().isoformat()},
                "idempotency_key": f"supersedes:{state.project_id}:{drw_number or drawing_id}:v{new_version}"
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
    workflow.add_node("extract_metadata", extract_document_metadata_node)
    workflow.add_node("check_revisions", check_existing_revisions)
    workflow.add_node("create_asset_specs", create_asset_specifications_node)
    workflow.add_node("persist_assets", persist_assets_node)

    # Define flow
    workflow.add_edge(START, "extract_metadata")
    workflow.add_edge("extract_metadata", "check_revisions")
    workflow.add_edge("check_revisions", "create_asset_specs")
    workflow.add_edge("create_asset_specs", "persist_assets")
    workflow.add_edge("persist_assets", END)

    return workflow.compile(checkpointer=True)
