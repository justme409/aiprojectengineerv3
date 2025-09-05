from typing import Dict, List, Any, Annotated
from pydantic import BaseModel
import asyncio
import re
import json

class Document(BaseModel):
    id: str
    file_name: str
    content: str
    project_id: str
    metadata: Dict[str, Any] = {}

class ExtractionState(BaseModel):
    project_id: str
    document_ids: List[str] = []
    document_metadata: List[Dict[str, Any]] = []
    txt_project_documents: Annotated[List[Document], "add"] = []
    failed_documents: Annotated[List[Dict[str, str]], "add"] = []
    error: str = ""
    done: bool = False

def extract_document_metadata(content: str, filename: str) -> Dict[str, Any]:
    """Extract metadata from document content and filename"""
    metadata = {
        "document_number": None,
        "revision": "1",
        "document_type": "document",
        "category": "technical",
        "page_count": 1,
        "word_count": len(content.split()),
        "language": "en"
    }

    # Extract document number from filename
    doc_num_match = re.search(r'([A-Z]{2,}[\-_]?[\d]{3,})', filename.upper())
    if doc_num_match:
        metadata["document_number"] = doc_num_match.group(1)

    # Extract revision from filename
    rev_match = re.search(r'[\-_]R([\d]+)', filename.upper())
    if rev_match:
        metadata["revision"] = rev_match.group(1)

    # Determine document type from content
    if re.search(r'specification|spec', content.lower()):
        metadata["document_type"] = "spec"
        metadata["category"] = "technical"
    elif re.search(r'inspection.*test.*plan|itp', content.lower()):
        metadata["document_type"] = "itp_template"
        metadata["category"] = "quality"
    elif re.search(r'contract|agreement', content.lower()):
        metadata["document_type"] = "document"
        metadata["category"] = "contractual"

    return metadata

def extract_structured_content(content: str) -> Dict[str, Any]:
    """Extract structured information from document content"""
    structured = {
        "sections": [],
        "entities": {
            "organizations": [],
            "persons": [],
            "standards": [],
            "clauses": []
        },
        "requirements": [],
        "hazards": []
    }

    # Extract section headers (simplified)
    section_matches = re.findall(r'^#+\s*(.+)$', content, re.MULTILINE)
    structured["sections"] = section_matches[:10]  # Limit to first 10

    # Extract standards references
    standards = re.findall(r'(AS\s*\d+|ISO\s*\d+|BS\s*\d+|EN\s*\d+)', content)
    structured["entities"]["standards"] = list(set(standards))

    # Extract clause references
    clauses = re.findall(r'clause\s*(\d+(?:\.\d+)*)', content, re.IGNORECASE)
    structured["entities"]["clauses"] = list(set(clauses))

    # Extract requirements (simplified)
    req_matches = re.findall(r'(?:shall|must|should|required|requirement).*?([^\n\.]{20,100})', content, re.IGNORECASE)
    structured["requirements"] = req_matches[:5]  # Limit to first 5

    # Extract hazards (simplified)
    hazard_matches = re.findall(r'(?:hazard|risk|danger).*?([^\n\.]{20,100})', content, re.IGNORECASE)
    structured["hazards"] = hazard_matches[:5]

    return structured

def document_extraction_node(state: ExtractionState) -> Dict[str, Any]:
    """Extract text content from documents with enhanced processing"""
    documents = []
    metadata_list = []

    for doc_id in state.document_ids:
        try:
            # In real implementation, this would:
            # 1. Download from Azure Blob Storage
            # 2. Use PyPDF2/pypdf or similar for PDF text extraction
            # 3. Use Tesseract for OCR if needed
            # 4. Apply NLP for entity extraction

            # Simulate content extraction
            simulated_content = f"""
# Project Specification Document

This document outlines the requirements for the construction project.

## Scope of Works
The contractor shall provide all materials, labor, and equipment necessary to complete the project in accordance with the specifications.

## Quality Requirements
All work shall comply with AS 1289 Methods of testing soils for engineering purposes.
The contractor must adhere to ISO 9001 Quality Management Systems requirements.

## Safety Requirements
All hazardous materials must be handled according to MSDS guidelines.
Personal protective equipment (PPE) shall be worn at all times in construction areas.

## Inspection and Testing
Clause 4.2 requires that all concrete work be tested in accordance with AS 3600.
"""

            # Extract metadata
            filename = f"document_{doc_id}.pdf"
            metadata = extract_document_metadata(simulated_content, filename)
            structured_content = extract_structured_content(simulated_content)

            doc = Document(
                id=doc_id,
                file_name=filename,
                content=simulated_content,
                project_id=state.project_id,
                metadata={
                    **metadata,
                    "structured": structured_content
                }
            )

            documents.append(doc)
            metadata_list.append({
                "document_id": doc_id,
                **metadata
            })

        except Exception as e:
            state.failed_documents.append({
                "uuid": doc_id,
                "file_name": f"document_{doc_id}.pdf",
                "error": str(e)
            })

    return {
        "txt_project_documents": documents,
        "document_metadata": metadata_list,
        "failed_documents": state.failed_documents,
        "done": True
    }

def create_asset_write_specs(state: ExtractionState) -> List[Dict[str, Any]]:
    """Create asset write specifications for processed documents"""
    specs = []

    for doc in state.txt_project_documents:
        spec = {
            "asset": {
                "type": doc.metadata.get("document_type", "document"),
                "name": doc.file_name,
                "project_id": state.project_id,
                "content": {
                    "source_document_id": doc.id,
                    "extracted_content": doc.content,
                    "metadata": doc.metadata
                }
            },
            "idempotency_key": f"doc_extract:{state.project_id}:{doc.id}"
        }
        specs.append(spec)

    return specs

# Graph definition
def create_document_extraction_graph():
    """Create the document extraction graph"""
    from langgraph.graph import StateGraph

    graph = StateGraph(ExtractionState)

    # Add nodes
    graph.add_node("extract", document_extraction_node)
    graph.add_node("create_assets", lambda state: {
        "asset_specs": create_asset_write_specs(state)
    })

    # Define flow
    graph.set_entry_point("extract")
    graph.add_edge("extract", "create_assets")

    return graph.compile()
