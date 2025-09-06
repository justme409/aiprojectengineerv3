from typing import Dict, List, Any, Optional, Annotated
from pydantic import BaseModel
import re
import json

class WbsNode(BaseModel):
    id: str
    parentId: Optional[str] = None
    node_type: str  # discipline, work_package, activity
    name: str
    description: str = ""
    source_reference_uuids: List[str] = []
    source_reference_hints: List[str] = []
    applicable_specifications: List[str] = []
    itp_required: bool = False
    is_leaf_node: bool = False

class WbsExtractionState(BaseModel):
    project_id: str
    txt_project_documents: List[Dict[str, Any]] = []
    wbs_structure: Optional[Dict[str, Any]] = None
    error: str = ""
    done: bool = False

def analyze_project_scope(documents: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze project documents to understand scope and deliverables"""
    scope_info = {
        "disciplines": [],
        "work_packages": [],
        "activities": [],
        "specifications": [],
        "complexity_score": 1.0
    }

    combined_content = " ".join([doc.get("content", "") for doc in documents])

    # Identify disciplines
    discipline_patterns = {
        "Civil": r'\b(civil|earthworks|concrete|pavement|drainage)\b',
        "Structural": r'\b(structural|steel|concrete|reinforcement)\b',
        "Electrical": r'\b(electrical|power|cabling|lighting)\b',
        "Mechanical": r'\b(mechanical|hvac|plumbing|ventilation)\b'
    }

    for discipline, pattern in discipline_patterns.items():
        if re.search(pattern, combined_content, re.IGNORECASE):
            scope_info["disciplines"].append(discipline)

    # Identify specifications
    spec_patterns = [
        r'(AS\s*\d+(?:\.\d+)*)',
        r'(ISO\s*\d+(?:\.\d+)*)',
        r'(BS\s*\d+(?:\.\d+)*)'
    ]

    for pattern in spec_patterns:
        specs = re.findall(pattern, combined_content)
        scope_info["specifications"].extend(specs)

    scope_info["specifications"] = list(set(scope_info["specifications"]))

    return scope_info

def generate_wbs_hierarchy(scope_info: Dict[str, Any], project_id: str) -> Dict[str, Any]:
    """Generate hierarchical WBS structure"""
    nodes = []
    node_counter = 1

    # Create discipline nodes
    for discipline in scope_info["disciplines"]:
        discipline_id = f"{node_counter}"
        nodes.append(WbsNode(
            id=discipline_id,
            node_type="discipline",
            name=discipline,
            description=f"{discipline} works and associated activities",
            itp_required=True,
            is_leaf_node=False
        ))

        # Create work packages under each discipline
        work_packages = [
            f"{discipline} Design",
            f"{discipline} Construction",
            f"{discipline} Testing",
            f"{discipline} Commissioning"
        ]

        for wp in work_packages:
            node_counter += 1
            wp_id = f"{node_counter}"
            nodes.append(WbsNode(
                id=wp_id,
                parentId=discipline_id,
                node_type="work_package",
                name=wp,
                description=f"{wp} activities and deliverables",
                applicable_specifications=scope_info["specifications"][:3],  # Limit specs
                itp_required=wp == f"{discipline} Construction",
                is_leaf_node=False
            ))

            # Create activities under work packages
            activities = [
                f"Planning and Preparation for {wp}",
                f"Execution of {wp}",
                f"Quality Control for {wp}",
                f"Documentation for {wp}"
            ]

            for activity in activities:
                node_counter += 1
                activity_id = f"{node_counter}"
                nodes.append(WbsNode(
                    id=activity_id,
                    parentId=wp_id,
                    node_type="activity",
                    name=activity,
                    description=f"Individual tasks and deliverables for {activity}",
                    itp_required=False,
                    is_leaf_node=True
                ))

        node_counter += 1

    return {
        "nodes": [node.dict() for node in nodes],
        "metadata": {
            "total_nodes": len(nodes),
            "disciplines_count": len(scope_info["disciplines"]),
            "specifications_referenced": scope_info["specifications"],
            "complexity_score": scope_info["complexity_score"]
        }
    }

def wbs_extraction_node(state: WbsExtractionState) -> Dict[str, Any]:
    """Extract Work Breakdown Structure from project documents"""
    try:
        if not state.txt_project_documents:
            return {"wbs_structure": None, "error": "No documents provided"}

        # Analyze project scope
        scope_info = analyze_project_scope(state.txt_project_documents)

        # Generate WBS hierarchy
        wbs_structure = generate_wbs_hierarchy(scope_info, state.project_id)

        return {
            "wbs_structure": wbs_structure,
            "done": True
        }

    except Exception as e:
        return {
            "error": f"WBS extraction failed: {str(e)}",
            "wbs_structure": None,
            "done": True
        }

def create_wbs_asset_specs(state: WbsExtractionState) -> List[Dict[str, Any]]:
    """Create asset write specifications for WBS nodes"""
    if not state.wbs_structure or not state.wbs_structure.get("nodes"):
        return []

    specs = []

    for node in state.wbs_structure["nodes"]:
        spec = {
            "asset": {
                "type": "wbs_node",
                "subtype": node["node_type"],
                "name": node["name"],
                "project_id": state.project_id,
                "content": {
                    "wbs_id": node["id"],
                    "parent_wbs_id": node.get("parentId"),
                    "node_type": node["node_type"],
                    "description": node["description"],
                    "source_reference_uuids": node["source_reference_uuids"],
                    "source_reference_hints": node["source_reference_hints"],
                    "applicable_specifications": node["applicable_specifications"],
                    "itp_required": node["itp_required"],
                    "is_leaf_node": node["is_leaf_node"]
                }
            },
            "idempotency_key": f"wbs_node:{state.project_id}:{node['id']}"
        }
        specs.append(spec)

    return specs

def create_wbs_edge_specs(state: WbsExtractionState) -> List[Dict[str, Any]]:
    """Create edge specifications for WBS hierarchy"""
    if not state.wbs_structure or not state.wbs_structure.get("nodes"):
        return []

    edges = []

    for node in state.wbs_structure["nodes"]:
        if node.get("parentId"):
            edges.append({
                "from_asset_id": "",  # Will be set to child asset ID
                "to_asset_id": "",    # Will be set to parent asset ID
                "edge_type": "PARENT_OF",
                "properties": {
                    "hierarchy_level": node["node_type"],
                    "child_wbs_id": node["id"],
                    "parent_wbs_id": node["parentId"]
                },
                "idempotency_key": f"wbs_edge:{state.project_id}:{node['id']}:{node['parentId']}"
            })

    return edges

def create_document_reference_edges(state: WbsExtractionState) -> List[Dict[str, Any]]:
    """Create edges linking WBS nodes to source documents"""
    edges = []

    for doc in state.txt_project_documents:
        # Link key WBS nodes to source documents
        if state.wbs_structure and state.wbs_structure.get("nodes"):
            # Link discipline nodes to all documents
            discipline_nodes = [n for n in state.wbs_structure["nodes"] if n["node_type"] == "discipline"]

            for node in discipline_nodes[:2]:  # Link to first 2 disciplines
                edges.append({
                    "from_asset_id": "",  # Will be set to WBS asset ID
                    "to_asset_id": doc["id"],
                    "edge_type": "GENERATED_FROM",
                    "properties": {
                        "reference_type": "source_document",
                        "extraction_method": "wbs_analysis"
                    },
                    "idempotency_key": f"wbs_doc_ref:{state.project_id}:{node['id']}:{doc['id']}"
                })

    return edges

# Graph definition
def create_wbs_extraction_graph():
    """Create the WBS extraction graph"""
    from langgraph.graph import StateGraph

    graph = StateGraph(WbsExtractionState)

    # Add nodes
    graph.add_node("extract_wbs", wbs_extraction_node)
    graph.add_node("create_wbs_assets", lambda state: {
        "wbs_asset_specs": create_wbs_asset_specs(state)
    })
    graph.add_node("create_wbs_edges", lambda state: {
        "wbs_edge_specs": create_wbs_edge_specs(state)
    })
    graph.add_node("create_doc_refs", lambda state: {
        "doc_ref_edges": create_document_reference_edges(state)
    })

    # Define flow
    graph.set_entry_point("extract_wbs")
    graph.add_edge("extract_wbs", "create_wbs_assets")
    graph.add_edge("create_wbs_assets", "create_wbs_edges")
    graph.add_edge("create_wbs_edges", "create_doc_refs")

    return graph.compile()
