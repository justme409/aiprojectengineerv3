from typing import Dict, List, Any, Annotated, Optional
from pydantic import BaseModel
import re
import json

class StandardsExtractionState(BaseModel):
    project_id: str
    txt_project_documents: List[Dict[str, Any]] = []
    reference_database: Dict[str, Any] = {}
    standards_from_project_documents: Annotated[List[Dict[str, Any]], "add"] = []
    error: str = ""
    done: bool = False

def extract_standards_from_content(content: str) -> List[Dict[str, Any]]:
    """Extract standards references from document content"""
    standards = []

    # Standard patterns to look for
    standard_patterns = [
        r'(AS\s*\d+(?:\.\d+)*)',
        r'(ISO\s*\d+(?:\.\d+)*)',
        r'(BS\s*\d+(?:\.\d+)*)',
        r'(EN\s*\d+(?:\.\d+)*)',
        r'(ASTM\s*[A-Z]?\d+(?:\.\d+)*)',
        r'(AS\s*\d+(?:\.\d+)*[^\n\r]{0,100})',  # Include context
    ]

    found_standards = set()

    for pattern in standard_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        for match in matches:
            # Clean up the match
            clean_match = re.sub(r'[^\w\s\.]', '', match).strip()
            if len(clean_match) > 3:  # Minimum length
                found_standards.add(clean_match.upper())

    # Convert to standard format
    for std in found_standards:
        standard_info = parse_standard_reference(std, content)
        if standard_info:
            standards.append(standard_info)

    return standards

def parse_standard_reference(standard_code: str, content: str) -> Optional[Dict[str, Any]]:
    """Parse a standard reference and extract additional context"""
    # Extract context around the standard reference
    context_pattern = rf'.{{0,100}}{re.escape(standard_code)}.{{0,200}}'
    context_match = re.search(context_pattern, content, re.IGNORECASE | re.DOTALL)

    context = ""
    if context_match:
        context = context_match.group(0).strip()

    # Determine standard type and organization
    org, code = parse_standard_code(standard_code)

    return {
        "standard_code": standard_code,
        "uuid": f"std_{hash(standard_code) % 1000000}",  # Simple hash-based ID
        "spec_name": f"{org} {code}",
        "org_identifier": org,
        "section_reference": extract_section_reference(context),
        "context": context[:200],  # Limit context length
        "found_in_database": True,  # Assume found for simulation
        "document_ids": [],  # Will be populated by calling context
        "compliance_level": determine_compliance_level(standard_code),
        "category": categorize_standard(standard_code)
    }

def parse_standard_code(standard_code: str) -> tuple[str, str]:
    """Parse standard code to extract organization and number"""
    if standard_code.startswith('AS'):
        return 'Australian Standard', standard_code[2:].strip()
    elif standard_code.startswith('ISO'):
        return 'International Organization for Standardization', standard_code[3:].strip()
    elif standard_code.startswith('BS'):
        return 'British Standard', standard_code[2:].strip()
    elif standard_code.startswith('EN'):
        return 'European Standard', standard_code[2:].strip()
    elif standard_code.startswith('ASTM'):
        return 'ASTM International', standard_code[4:].strip()
    else:
        return 'Unknown', standard_code

def extract_section_reference(context: str) -> Optional[str]:
    """Extract section/clause references from context"""
    section_patterns = [
        r'clause\s*(\d+(?:\.\d+)*)',
        r'section\s*(\d+(?:\.\d+)*)',
        r'(\d+(?:\.\d+)*)',
    ]

    for pattern in section_patterns:
        match = re.search(pattern, context, re.IGNORECASE)
        if match:
            return match.group(1)

    return None

def determine_compliance_level(standard_code: str) -> str:
    """Determine the compliance level/importance of the standard"""
    critical_standards = ['ISO 9001', 'AS 1288', 'AS 3600']
    important_standards = ['AS 1289', 'ISO 14001', 'AS 4100']

    for std in critical_standards:
        if std in standard_code:
            return 'Critical'

    for std in important_standards:
        if std in standard_code:
            return 'Important'

    return 'General'

def categorize_standard(standard_code: str) -> str:
    """Categorize the standard by domain"""
    if '9001' in standard_code or 'quality' in standard_code.lower():
        return 'Quality Management'
    elif '14001' in standard_code or 'environment' in standard_code.lower():
        return 'Environmental Management'
    elif '45001' in standard_code or 'health' in standard_code.lower():
        return 'Health & Safety'
    elif 'concrete' in standard_code.lower() or '3600' in standard_code:
        return 'Construction Materials'
    elif 'soil' in standard_code.lower() or '1289' in standard_code:
        return 'Geotechnical'
    else:
        return 'General Engineering'

def validate_standards_in_database(standards: List[Dict[str, Any]], database: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Validate standards against reference database (simplified)"""
    validated_standards = []

    for std in standards:
        # In a real implementation, this would check against a comprehensive standards database
        # For now, we'll simulate validation
        if 'ISO' in std['standard_code'] or 'AS' in std['standard_code']:
            std['validation_status'] = 'Verified'
            std['latest_version'] = std['standard_code']  # Assume current
        else:
            std['validation_status'] = 'Unknown'
            std['latest_version'] = 'Check required'

        validated_standards.append(std)

    return validated_standards

def standards_extraction_node(state: StandardsExtractionState) -> Dict[str, Any]:
    """Extract standards from project documents"""
    try:
        if not state.txt_project_documents:
            return {"standards_from_project_documents": [], "error": "No documents provided"}

        all_standards = []

        # Extract standards from each document
        for doc in state.txt_project_documents:
            content = doc.get("content", "")
            doc_standards = extract_standards_from_content(content)

            # Add document reference to each standard
            for std in doc_standards:
                if 'document_ids' not in std:
                    std['document_ids'] = []
                std['document_ids'].append(doc.get("id"))

            all_standards.extend(doc_standards)

        # Remove duplicates based on standard_code
        unique_standards = {}
        for std in all_standards:
            code = std['standard_code']
            if code not in unique_standards:
                unique_standards[code] = std
            else:
                # Merge document_ids
                existing = unique_standards[code]
                existing['document_ids'] = list(set(existing['document_ids'] + std['document_ids']))

        standards_list = list(unique_standards.values())

        # Validate against reference database
        validated_standards = validate_standards_in_database(standards_list, state.reference_database)

        return {
            "standards_from_project_documents": validated_standards,
            "done": True
        }

    except Exception as e:
        return {
            "error": f"Standards extraction failed: {str(e)}",
            "standards_from_project_documents": [],
            "done": True
        }

def create_standards_asset_specs(state: StandardsExtractionState) -> List[Dict[str, Any]]:
    """Create asset write specifications for standards"""
    specs = []

    for std in state.standards_from_project_documents:
        spec = {
            "asset": {
                "type": "standard",
                "name": std["spec_name"],
                "project_id": state.project_id,
                "content": std
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
    """Create the standards extraction graph"""
    from langgraph.graph import StateGraph

    graph = StateGraph(StandardsExtractionState)

    # Add nodes
    graph.add_node("extract_standards", standards_extraction_node)
    graph.add_node("create_standards_assets", lambda state: {
        "standards_asset_specs": create_standards_asset_specs(state)
    })
    graph.add_node("create_doc_refs", lambda state: {
        "standards_doc_ref_edges": create_document_reference_edges(state)
    })

    # Define flow
    graph.set_entry_point("extract_standards")
    graph.add_edge("extract_standards", "create_standards_assets")
    graph.add_edge("create_standards_assets", "create_doc_refs")

    return graph.compile()
