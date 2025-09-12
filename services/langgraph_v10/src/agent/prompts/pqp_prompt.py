PROMPT = r"""
You are generating a Project Quality Plan (PQP) as structured JSON.

Structured output requirements:
- Return ONLY valid JSON (no prose outside the JSON object).
- Conform exactly to the schema specified by the Output Schema instructions provided by the system. If there is any conflict with guidance below, follow the Output Schema.
- Use only these content blocks (if applicable to the chosen schema): text, bullets, numbered, table, note, link.
- Be exhaustive, implementable, and field-usable. Avoid redundancy but prefer complete, practitioner-level detail over brevity.
- Do NOT prefix any titles with numbers (e.g., no "1.", "1.0", "5.1"). Strip numbering embedded in source headings.
- Exclude table-of-contents or PDF artifacts (e.g., "Contents", "Print", page numbers) from titles and content.

QSE system usage (critical):
- The prompt context includes a QSE SYSTEM REFERENCE adjacency list of corporate procedures/templates/pages.
- Heavily leverage existing corporate procedures/templates when relevant by inserting link blocks to those items using their title and path (e.g., {"type":"link","label":"Procedure for Control of Documented Information","url":"/qse/corp-documentation"}).
- Do not fabricate links. Only link to items present in the QSE SYSTEM REFERENCE.
- When no relevant QSE item exists, derive content from PROJECT DOCUMENTS and best practice; you may add a short note block indicating that a project-specific procedure/template will be created.
- Prefer cross-referencing over duplicating corporate content.

Use the most relevant jurisdictional template below (QLD, SA, VIC, NSW). If none applies, use the Generic template. Populate and expand sections based on PROJECT DOCUMENTS. Do not include any instructional text in the output; return only the final plan object.

--- TEMPLATE: QLD (MRTS50 – Specific Quality System Requirements) ---
{
  "title": "Queensland Project Quality Plan (PQP) — Layout (MRTS50)",
  "revision": "March 2025",
  "metadata": {
    "jurisdiction": "QLD",
    "agency": "Department of Transport and Main Roads",
    "source_document": "MRTS50 Specific Quality System Requirements",
    "standards": "AS/NZS ISO 9001"
  },
  "sections": [
    { "id": "introduction", "title": "Introduction (read with MRTS01)" },
    { "id": "definitions", "title": "Definition of Terms" },
    { "id": "referenced-docs", "title": "Referenced Documents" },
    { "id": "quality-system", "title": "Quality System Requirements (ISO 9001 compliant)" },
    {
      "id": "quality-plan",
      "title": "Project Quality Plan",
      "children": [
        { "id": "objectives", "title": "Quality Objectives and Commitment" },
        { "id": "roles-responsibilities", "title": "Roles, Responsibilities and Authorities (incl. subcontractors)" },
        { "id": "procedures-itps", "title": "Construction Procedures and ITPs (register; schedule)" },
        { "id": "lot-control", "title": "Lot Numbering, Identification and Registration" },
        { "id": "materials-approval", "title": "Materials Approval and Control" },
        { "id": "sampling-testing", "title": "Sampling and Testing (frequencies; NATA; CMTSRS)" },
        { "id": "hold-witness", "title": "Hold Points, Witness Points, Milestones and Records" },
        { "id": "nonconformance", "title": "Nonconformance and Corrective Action Procedures" },
        { "id": "records", "title": "Records Retention and Access" }
      ]
    }
  ]
}

--- TEMPLATE: SA (DIT Master Specifications) ---
{
  "title": "South Australia Project Quality Plan (PQP) — Layout (DIT Master Specs)",
  "revision": "Current",
  "metadata": {
    "jurisdiction": "SA",
    "agency": "Department of Infrastructure and Transport",
    "source_document": "DIT Master Specifications",
    "standards": "AS/NZS ISO 9001"
  },
  "sections": [
    { "id": "introduction", "title": "Introduction" },
    { "id": "scope", "title": "Scope and Objectives" },
    { "id": "definitions", "title": "Definitions" },
    { "id": "references", "title": "References and Standards" },
    {
      "id": "management-system",
      "title": "Quality Management System",
      "children": [
        { "id": "policies-procedures", "title": "Policies and Procedures" },
        { "id": "roles-responsibilities", "title": "Roles and Responsibilities" },
        { "id": "training-competency", "title": "Training and Competency" },
        { "id": "communication", "title": "Communication" }
      ]
    },
    {
      "id": "project-controls",
      "title": "Project Quality Controls",
      "children": [
        { "id": "inspection-testing", "title": "Inspection and Testing Plans" },
        { "id": "nonconformance", "title": "Nonconformance Management" },
        { "id": "records", "title": "Quality Records" },
        { "id": "audits", "title": "Quality Audits" }
      ]
    }
  ]
}

--- TEMPLATE: VIC (Section 168 – Quality Management) ---
{
  "title": "Victoria Project Quality Plan (PQP) — Layout (Section 168)",
  "revision": "Current",
  "metadata": {
    "jurisdiction": "VIC",
    "agency": "Department of Transport",
    "source_document": "Section 168 Quality Management",
    "standards": "AS/NZS ISO 9001"
  },
  "sections": [
    { "id": "introduction", "title": "Introduction" },
    { "id": "scope", "title": "Scope" },
    { "id": "definitions", "title": "Definitions" },
    { "id": "references", "title": "References" },
    {
      "id": "quality-system",
      "title": "Quality System Requirements",
      "children": [
        { "id": "management-commitment", "title": "Management Commitment" },
        { "id": "quality-policy", "title": "Quality Policy" },
        { "id": "planning", "title": "Planning" },
        { "id": "responsibility-authority", "title": "Responsibility and Authority" }
      ]
    },
    {
      "id": "implementation",
      "title": "Implementation",
      "children": [
        { "id": "resources", "title": "Provision of Resources" },
        { "id": "personnel", "title": "Personnel" },
        { "id": "work-environment", "title": "Work Environment" },
        { "id": "contract-review", "title": "Contract Review" }
      ]
    },
    {
      "id": "control-verification",
      "title": "Control and Verification",
      "children": [
        { "id": "design-control", "title": "Design Control" },
        { "id": "procurement", "title": "Procurement" },
        { "id": "product-identification", "title": "Product Identification and Traceability" },
        { "id": "inspection-testing", "title": "Inspection and Testing" }
      ]
    }
  ]
}

--- TEMPLATE: NSW (RMS Quality Management) ---
{
  "title": "NSW Project Quality Plan (PQP) — Layout (RMS Quality Management)",
  "revision": "Current",
  "metadata": {
    "jurisdiction": "NSW",
    "agency": "Roads and Maritime Services",
    "source_document": "RMS Quality Management Guidelines",
    "standards": "AS/NZS ISO 9001"
  },
  "sections": [
    { "id": "introduction", "title": "Introduction" },
    { "id": "scope-objectives", "title": "Scope and Objectives" },
    { "id": "definitions", "title": "Definitions" },
    { "id": "references", "title": "References" },
    {
      "id": "quality-management-system",
      "title": "Quality Management System",
      "children": [
        { "id": "policy", "title": "Quality Policy" },
        { "id": "planning", "title": "Quality Planning" },
        { "id": "implementation", "title": "Implementation and Operation" },
        { "id": "measurement-analysis", "title": "Measurement, Analysis and Improvement" }
      ]
    },
    {
      "id": "project-quality-plan",
      "title": "Project Quality Plan",
      "children": [
        { "id": "organizational-structure", "title": "Organizational Structure and Responsibilities" },
        { "id": "procedures", "title": "Procedures and Work Instructions" },
        { "id": "inspection-test-plans", "title": "Inspection and Test Plans" },
        { "id": "quality-records", "title": "Quality Records" }
      ]
    }
  ]
}

--- TEMPLATE: Generic ---
{
  "title": "Project Quality Plan (PQP)",
  "revision": "1.0",
  "metadata": {
    "jurisdiction": "Generic",
    "standards": "AS/NZS ISO 9001:2016"
  },
  "sections": [
    { "id": "introduction", "title": "Introduction" },
    { "id": "scope", "title": "Scope and Objectives" },
    { "id": "definitions", "title": "Definitions" },
    { "id": "references", "title": "References and Standards" },
    {
      "id": "management-system",
      "title": "Quality Management System",
      "children": [
        { "id": "policies-procedures", "title": "Policies and Procedures" },
        { "id": "roles-responsibilities", "title": "Roles and Responsibilities" },
        { "id": "training-competency", "title": "Training and Competency" },
        { "id": "communication", "title": "Communication" }
      ]
    },
    {
      "id": "project-controls",
      "title": "Project Quality Controls",
      "children": [
        { "id": "inspection-testing", "title": "Inspection and Testing Plans" },
        { "id": "nonconformance", "title": "Nonconformance Management" },
        { "id": "records", "title": "Quality Records" },
        { "id": "audits", "title": "Quality Audits" }
      ]
    }
  ]
}
"""

