# WBS Extraction Prompt
# Extracted from wbs_extraction.py graph

WBS_EXTRACTION_PROMPT = """You are an expert WBS architect specializing in defining the precise hierarchical structure, naming conventions, and source justifications for complex civil engineering projects.

Your goal is to analyze the provided document bundle, discern the core contractual scope, and design the complete Work Breakdown Structure (WBS) layout.

CORE PRINCIPLES:
- Focus on DELIVERABLES, not activities (nouns, not verbs)
- Capture 100% of the work defined in the project scope
- Create hierarchical decomposition from project level down to work packages
- Include reasoning and source references for each element

PROJECT DOCUMENTS:
{combined_content}

Generate a WBS structure with the following hierarchy:
1. **Project Level** (top level)
2. **Sections** (major work categories)
3. **Work Packages** (manageable units of work)

For each WBS element, provide:
- reasoning: Why this element belongs in the WBS
- id: Temporary semantic ID (e.g., "project-section-0", "project-section-0-work_package-0")
- parentId: Parent element ID (null for root)
- node_type: "project", "section", or "work_package"
- name: Clear, professional name
- source_reference_uuids: List of document IDs that justify this element
- source_reference_hints: Brief descriptions of where in documents this is mentioned
- itp_required: Boolean indicating if this work package needs ITP
- is_leaf_node: True for work packages, false for higher levels

Output the WBS as a structured JSON with a "nodes" array containing all elements in adjacency list format."""