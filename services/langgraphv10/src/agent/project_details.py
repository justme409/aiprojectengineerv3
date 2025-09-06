from typing import Dict, List, Any, Optional
from pydantic import BaseModel
import re
import json

class ProjectDetailsExtractionState(BaseModel):
    project_id: str
    txt_project_documents: List[Dict[str, Any]] = []
    project_details: Optional[Dict[str, Any]] = None
    error: str = ""
    done: bool = False

def extract_project_name(content: str) -> Optional[str]:
    """Extract project name from document content"""
    # Look for project name patterns
    patterns = [
        r'Project\s*[:\-]?\s*([^\n\r]{3,50})',
        r'Project\s+Name\s*[:\-]?\s*([^\n\r]{3,50})',
        r'([A-Z][^.\n\r]{10,50}(?:Project|Works|Construction))',
    ]

    for pattern in patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            # Clean up the name
            name = re.sub(r'[^\w\s\-]', '', name)
            if len(name) > 5:  # Minimum reasonable length
                return name

    return None

def extract_project_address(content: str) -> Optional[str]:
    """Extract project address/location from document content"""
    # Look for address patterns
    patterns = [
        r'(?:Location|Address|Site)\s*[:\-]?\s*([^\n\r]{10,100})',
        r'located\s+(?:at|in)\s+([^\n\r,]{10,100})',
        r'([A-Z][^,\n\r]{10,50},\s*[A-Z]{2,3}\s*\d{4})',  # City, State pattern
    ]

    for pattern in patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            address = match.group(1).strip()
            return address

    return None

def extract_parties(content: str) -> Dict[str, List[str]]:
    """Extract project parties (client, contractor, consultant, etc.)"""
    parties = {
        "client": [],
        "contractor": [],
        "consultant": [],
        "engineer": []
    }

    # Client patterns
    client_matches = re.findall(r'(?:Client|Owner|Principal)\s*[:\-]?\s*([^\n\r,]{3,50})', content, re.IGNORECASE)
    parties["client"] = list(set(client_matches))

    # Contractor patterns
    contractor_matches = re.findall(r'Contractor\s*[:\-]?\s*([^\n\r,]{3,50})', content, re.IGNORECASE)
    parties["contractor"] = list(set(contractor_matches))

    # Consultant patterns
    consultant_matches = re.findall(r'(?:Consultant|Designer)\s*[:\-]?\s*([^\n\r,]{3,50})', content, re.IGNORECASE)
    parties["consultant"] = list(set(consultant_matches))

    # Engineer patterns
    engineer_matches = re.findall(r'Engineer\s*[:\-]?\s*([^\n\r,]{3,50})', content, re.IGNORECASE)
    parties["engineer"] = list(set(engineer_matches))

    return parties

def extract_contract_value(content: str) -> Optional[str]:
    """Extract contract value if mentioned"""
    # Look for monetary values
    value_patterns = [
        r'\$[\d,]+(?:\.\d{2})?',
        r'[\d,]+\s*(?:million|billion|thousand)?\s*(?:dollars?|USD|AUD)',
    ]

    for pattern in value_patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            return match.group(0)

    return None

def extract_key_dates(content: str) -> Dict[str, Optional[str]]:
    """Extract key project dates"""
    dates = {
        "commencement_date": None,
        "completion_date": None,
        "defects_liability_period": None
    }

    # Date patterns (simplified - would use proper date parsing in production)
    date_patterns = {
        "commencement_date": r'(?:Commencement|Start|Beginning)\s+(?:Date|Period)\s*[:\-]?\s*([^\n\r,]{5,30})',
        "completion_date": r'(?:Completion|Finish|End)\s+(?:Date|Period)\s*[:\-]?\s*([^\n\r,]{5,30})',
        "defects_liability_period": r'(?:Defects|Maintenance|Warranty)\s+(?:Period|Liability)\s*[:\-]?\s*([^\n\r,]{5,30})'
    }

    for date_type, pattern in date_patterns.items():
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            dates[date_type] = match.group(1).strip()

    return dates

def extract_scope_summary(content: str) -> Optional[str]:
    """Extract a brief scope summary"""
    # Look for scope section
    scope_match = re.search(r'Scope\s+(?:of\s+)?(?:Works?|Work)\s*[:\-]?\s*([^\n\r]{20,200})', content, re.IGNORECASE)
    if scope_match:
        return scope_match.group(1).strip()

    # Alternative: look for description after project name
    desc_match = re.search(r'Project\s+Description\s*[:\-]?\s*([^\n\r]{20,200})', content, re.IGNORECASE)
    if desc_match:
        return desc_match.group(1).strip()

    return None

def generate_project_html(project_details: Dict[str, Any]) -> str:
    """Generate HTML representation of project details"""
    html = f"""
    <div class="project-details">
        <h2>{project_details.get('project_name', 'Project Details')}</h2>

        {f"<p><strong>Location:</strong> {project_details.get('project_address')}</p>" if project_details.get('project_address') else ""}

        {f"<p><strong>Client:</strong> {', '.join(project_details.get('parties', {}).get('client', []))}</p>" if project_details.get('parties', {}).get('client') else ""}

        {f"<p><strong>Contractor:</strong> {', '.join(project_details.get('parties', {}).get('contractor', []))}</p>" if project_details.get('parties', {}).get('contractor') else ""}

        {f"<p><strong>Contract Value:</strong> {project_details.get('contract_value')}</p>" if project_details.get('contract_value') else ""}

        <h3>Key Dates</h3>
        <ul>
            {f"<li>Commencement: {project_details.get('key_dates', {}).get('commencement_date')}</li>" if project_details.get('key_dates', {}).get('commencement_date') else ""}
            {f"<li>Completion: {project_details.get('key_dates', {}).get('completion_date')}</li>" if project_details.get('key_dates', {}).get('completion_date') else ""}
            {f"<li>Defects Liability: {project_details.get('key_dates', {}).get('defects_liability_period')}</li>" if project_details.get('key_dates', {}).get('defects_liability_period') else ""}
        </ul>

        {f"<h3>Scope Summary</h3><p>{project_details.get('scope_summary')}</p>" if project_details.get('scope_summary') else ""}
    </div>
    """

    return html

def project_details_extraction_node(state: ProjectDetailsExtractionState) -> Dict[str, Any]:
    """Extract project details from documents"""
    try:
        if not state.txt_project_documents:
            return {"project_details": None, "error": "No documents provided"}

        # Combine all document content
        combined_content = " ".join([doc.get("content", "") for doc in state.txt_project_documents])

        # Extract various project details
        project_name = extract_project_name(combined_content)
        project_address = extract_project_address(combined_content)
        parties = extract_parties(combined_content)
        contract_value = extract_contract_value(combined_content)
        key_dates = extract_key_dates(combined_content)
        scope_summary = extract_scope_summary(combined_content)

        project_details = {
            "project_name": project_name,
            "project_address": project_address,
            "parties": parties,
            "contract_value": contract_value,
            "key_dates": key_dates,
            "scope_summary": scope_summary,
            "extraction_confidence": 0.8,  # Placeholder confidence score
            "source_documents_count": len(state.txt_project_documents)
        }

        # Generate HTML representation
        project_details["html"] = generate_project_html(project_details)

        return {
            "project_details": project_details,
            "done": True
        }

    except Exception as e:
        return {
            "error": f"Project details extraction failed: {str(e)}",
            "project_details": None,
            "done": True
        }

def create_project_details_asset_spec(state: ProjectDetailsExtractionState) -> Dict[str, Any]:
    """Create asset write specification for project details"""
    if not state.project_details:
        return {}

    spec = {
        "asset": {
            "type": "project",
            "name": state.project_details.get("project_name", "Project Details"),
            "project_id": state.project_id,
            "content": state.project_details
        },
        "idempotency_key": f"project_details:{state.project_id}"
    }

    return spec

# Graph definition
def create_project_details_extraction_graph():
    """Create the project details extraction graph"""
    from langgraph.graph import StateGraph

    graph = StateGraph(ProjectDetailsExtractionState)

    # Add nodes
    graph.add_node("extract_details", project_details_extraction_node)
    graph.add_node("create_asset", lambda state: {
        "project_details_asset_spec": create_project_details_asset_spec(state)
    })

    # Define flow
    graph.set_entry_point("extract_details")
    graph.add_edge("extract_details", "create_asset")

    return graph.compile()
