# Document Metadata Extraction Prompts
# Extracted from document_metadata.py graph

DOCUMENT_METADATA_DRAWING_PROMPT = """
Extract comprehensive metadata from this drawing document:

FILENAME: {file_name}
CONTENT: {content}  # Limit content for LLM

Extract the following information:
1. Drawing number/title
2. Revision code
3. Scale information
4. Sheet number and total sheets
5. Engineering discipline
6. Key entities shown (organizations, locations, equipment)
7. WBS and LBS references
8. Classification level

Be precise and extract only information that is clearly present in the document.
"""

DOCUMENT_METADATA_DOCUMENT_PROMPT = """
Extract comprehensive metadata from this document following the knowledge graph schema:

FILENAME: {file_name}
CONTENT: {content}  # Limit content for LLM

Extract ALL of the following structured information:
1. Document type and classification
2. Document number and revision
3. Summary information (short, executive, technical, audience, tone)
4. Document outline/structure
5. Key entities mentioned
6. Requirements and specifications
7. Control measures
8. Hazards and risks identified
9. Tasks and procedures
10. Metrics and measurements
11. Decisions and required actions
12. Citations and references
13. Any anomalies or issues found
14. Compliance references

Be thorough but only extract information that is clearly present in the document.
If a field is not applicable or not present, use appropriate defaults.
"""
