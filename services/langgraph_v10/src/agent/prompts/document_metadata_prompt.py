"""Document Metadata Extraction Prompts (Document Management Only)
These prompts are consumed by the metadata graph to extract only the
fields required for a document register. Do NOT extract domain content
such as standards, materials, equipment, hazards, requirements, etc.
"""

CLASSIFY_DOCUMENT_PROMPT = """
You are classifying a source file for a construction project document register.

Task: Decide whether this file is a drawing or a non-drawing document, and
return a best-effort subtype and discipline if and only if it is a drawing.

Rules:
- Use only signals present in the content and visible title block (if any).
- Do not guess fields that are not justified by the content.
- doc_kind must be either "drawing" or "document".
- subtype should be null unless the evidence clearly supports one of:
  [general_arrangement, section, elevation, detail, plan, schedule, diagram, layout]
- discipline should be null unless obvious (e.g., Civil, Structural, Electrical, Mechanical, Architectural).

Return a concise reason string explaining your decision.

FILENAME: {file_name}
CONTENT: {content}
"""

DOCUMENT_METADATA_DRAWING_PROMPT = """
You are extracting drawing register metadata for a construction project.
Extract only document-management fields. Do not extract standards, requirements,
risks, equipment, metrics, or any non-register content.

Definitions:
- document_number: The official drawing number from the title block (e.g., C-101, GA-2001).
- revision_code: The exact revision identifier (e.g., A, B, C, 0, 1, 2). Do not invent values.
- title: The drawing title from the title block or clear header text.
- subtype: One of [general_arrangement, section, elevation, detail, plan, schedule, diagram, layout] if supported by evidence.
- discipline: The engineering discipline if present (e.g., Civil, Structural, Electrical, Mechanical, Architectural).
- sheet_number: The sheet number if present (e.g., 3).
- total_sheets: The total number of sheets in the set if present (e.g., 10).
- scale: Scale string if present (e.g., 1:100 @A1).
- classification_level: Security classification if present, else default to internal.
- subdocuments: If the file contains multiple distinct drawings, list each as a subdocument with
  document_number, revision_code, title, page_range, subtype, and discipline when present.
- additional_fields: Any extra register-relevant fields discovered (key/value pairs). Do not include domain content.

FILENAME: {file_name}
CONTENT: {content}

Extract the fields faithfully as described above and leave missing values null rather than guessing.
"""

DOCUMENT_METADATA_DOCUMENT_PROMPT = """
You are extracting document register metadata for a construction project.
Extract only document-management fields. Do not extract standards, requirements,
risks, equipment, metrics, or any non-register content.

Definitions:
- document_number: The official document number or reference (e.g., SPEC-001, REP-2024-05).
- revision_code: The exact revision identifier (e.g., A, B, C, 0, 1, 2). Do not invent values.
- title: The document title; if no official name exists, use the main title text.
- category: One of [specification, report, contract, correspondence, schedule, manual, procedure, other] if discernible.
- discipline: Discipline if stated or strongly implied (e.g., Civil, Structural, Electrical, Mechanical, Architectural).
- classification_level: Security classification if present, else default to internal.
- subdocuments: If the file encloses separate documents (e.g., appendices), list each subdocument with
  doc_kind (document/drawing), title, document_number, revision_code, page_range, subtype, and discipline when present.
- additional_fields: Any extra register-relevant fields discovered (key/value pairs). Do not include domain content.

FILENAME: {file_name}
CONTENT: {content}

Extract the fields faithfully as described above and leave missing values null rather than guessing.
"""
