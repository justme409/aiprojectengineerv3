"""
QSE System hierarchy and document catalogue.

This module provides a comprehensive, flat JSON-like node list describing the
QSE (Quality, Safety, Environment) management system hierarchy and all controlled
documents defined under the Next.js app routes at /qse.

Each node is a dictionary with the following common keys:
  - id: unique node id (page path-like for sections/pages; stable keys for docs)
  - parent_id: id of the parent node (None for the root)
  - type: one of {section, page, manual, statement, policy, procedure, register,
           form, plan, template}
  - title: human-readable title
  - path: in-app route for the page presenting this node (for pages); for docs,
          the path to the page where the document is surfaced
  - description: short description suitable for LLM grounding

Document nodes also include:
  - document_number: the controlled document identifier (e.g., "QSE-9.1-FORM-01")

Notes:
  - This is intentionally a flat adjacency list (parent_id links define the tree).
  - Descriptions are distilled from the TSX page content where available, or
    provided as succinct, standards-aligned summaries when the TSX did not include
    an explicit blurb for that document.

Source of truth pages referenced:
  /app/projectpro_qa_v2/src/app/(app)/qse/**

Last generated: automated by assistant
"""

# Root node
QSE_SYSTEM_NODES = [
    {
        "id": "qse",
        "parent_id": None,
        "type": "section",
        "title": "QSE Management System",
        "path": "/qse",
        "description": (
            "Integrated Quality, Safety, and Environment (QSE) management system aligned "
            "with ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018."
        ),
    },

    # Tier 1 (Corporate, foundational)
    {
        "id": "qse/corporate-tier-1",
        "parent_id": "qse",
        "type": "section",
        "title": "Corporate Tier 1 - Foundational",
        "path": "/qse/corporate-tier-1",
        "description": "Core corporate policies, standards, and governance frameworks.",
    },
    {
        "id": "qse/corporate-tier-1/quality-manual",
        "parent_id": "qse/corporate-tier-1",
        "type": "manual",
        "title": "Quality Manual",
        "path": "/qse/corporate-tier-1/quality-manual",
        "description": "Comprehensive quality management system manual aligned with ISO 9001:2015.",
        "document_number": "QSE-1.1-MAN-01",
    },
    {
        "id": "qse/corporate-tier-1/safety-manual",
        "parent_id": "qse/corporate-tier-1",
        "type": "manual",
        "title": "Safety Manual",
        "path": "/qse/corporate-tier-1/safety-manual",
        "description": "Occupational health and safety management system aligned with ISO 45001:2018.",
        "document_number": "QSE-1.2-MAN-01",
    },
    {
        "id": "qse/corporate-tier-1/environment-manual",
        "parent_id": "qse/corporate-tier-1",
        "type": "manual",
        "title": "Environment Manual",
        "path": "/qse/corporate-tier-1/environment-manual",
        "description": "Environmental management system aligned with ISO 14001:2015.",
        "document_number": "QSE-1.3-MAN-01",
    },
    {
        "id": "qse/corporate-tier-1/integrated-policy",
        "parent_id": "qse/corporate-tier-1",
        "type": "statement",
        "title": "Integrated QSE Policy Statement",
        "path": "/qse/corporate-tier-1/integrated-policy",
        "description": "Corporate commitment to quality, safety, and environmental excellence.",
        "document_number": "QSE-1.4-POL-01",
    },

    # Tier 2 (Management Systems)
    {
        "id": "qse/management-systems",
        "parent_id": "qse",
        "type": "section",
        "title": "Management Systems",
        "path": "/qse/management-systems",
        "description": "Core management system procedures and processes.",
    },
    {
        "id": "qse/management-systems/document-control",
        "parent_id": "qse/management-systems",
        "type": "procedure",
        "title": "Control of Documented Information",
        "path": "/qse/management-systems/document-control",
        "description": "Procedures for creating, approving, distributing, and controlling documented information.",
        "document_number": "QSE-2.1-PROC-01",
    },
    {
        "id": "qse/management-systems/record-control",
        "parent_id": "qse/management-systems",
        "type": "procedure",
        "title": "Control of Records",
        "path": "/qse/management-systems/record-control",
        "description": "Procedures for identification, storage, protection, retrieval, and disposal of records.",
        "document_number": "QSE-2.2-PROC-01",
    },
    {
        "id": "qse/management-systems/audit-program",
        "parent_id": "qse/management-systems",
        "type": "procedure",
        "title": "Internal Audit Program",
        "path": "/qse/management-systems/audit-program",
        "description": "Planning, conducting, and reporting of internal audits.",
        "document_number": "QSE-2.3-PROC-01",
    },
    {
        "id": "qse/management-systems/corrective-actions",
        "parent_id": "qse/management-systems",
        "type": "procedure",
        "title": "Corrective and Preventive Actions",
        "path": "/qse/management-systems/corrective-actions",
        "description": "Procedures for identifying, analyzing, and implementing corrective and preventive actions.",
        "document_number": "QSE-2.4-PROC-01",
    },

    # Tier 3 (Project Delivery)
    {
        "id": "qse/project-delivery",
        "parent_id": "qse",
        "type": "section",
        "title": "Project Delivery",
        "path": "/qse/project-delivery",
        "description": "Project-specific QSE planning, execution, and control procedures.",
    },
    {
        "id": "qse/project-delivery/quality-planning",
        "parent_id": "qse/project-delivery",
        "type": "procedure",
        "title": "Project Quality Planning",
        "path": "/qse/project-delivery/quality-planning",
        "description": "Development and implementation of project quality plans and inspection test plans.",
        "document_number": "QSE-3.1-PROC-01",
    },
    {
        "id": "qse/project-delivery/safety-planning",
        "parent_id": "qse/project-delivery",
        "type": "procedure",
        "title": "Project Safety Planning",
        "path": "/qse/project-delivery/safety-planning",
        "description": "Development and implementation of project safety management plans.",
        "document_number": "QSE-3.2-PROC-01",
    },
    {
        "id": "qse/project-delivery/environmental-planning",
        "parent_id": "qse/project-delivery",
        "type": "procedure",
        "title": "Project Environmental Planning",
        "path": "/qse/project-delivery/environmental-planning",
        "description": "Development and implementation of environmental management plans.",
        "document_number": "QSE-3.3-PROC-01",
    },

    # Tier 4 (Technical Standards and Registers)
    {
        "id": "qse/technical-standards",
        "parent_id": "qse",
        "type": "section",
        "title": "Technical Standards and Registers",
        "path": "/qse/technical-standards",
        "description": "Technical specifications, standards registers, and compliance matrices.",
    },
    {
        "id": "qse/technical-standards/standards-register",
        "parent_id": "qse/technical-standards",
        "type": "register",
        "title": "Technical Standards Register",
        "path": "/qse/technical-standards/standards-register",
        "description": "Register of applicable technical standards and specifications.",
        "document_number": "QSE-4.1-REG-01",
    },
    {
        "id": "qse/technical-standards/compliance-matrix",
        "parent_id": "qse/technical-standards",
        "type": "register",
        "title": "Standards Compliance Matrix",
        "path": "/qse/technical-standards/compliance-matrix",
        "description": "Matrix mapping project requirements to applicable standards.",
        "document_number": "QSE-4.2-REG-01",
    },

    # Tier 5 (Forms and Templates)
    {
        "id": "qse/forms-templates",
        "parent_id": "qse",
        "type": "section",
        "title": "Forms and Templates",
        "path": "/qse/forms-templates",
        "description": "Standardized forms and templates for QSE documentation.",
    },
    {
        "id": "qse/forms-templates/inspection-forms",
        "parent_id": "qse/forms-templates",
        "type": "form",
        "title": "Inspection and Test Record Forms",
        "path": "/qse/forms-templates/inspection-forms",
        "description": "Standard forms for recording inspection and test results.",
        "document_number": "QSE-5.1-FORM-01",
    },
    {
        "id": "qse/forms-templates/ncr-forms",
        "parent_id": "qse/forms-templates",
        "type": "form",
        "title": "Non-Conformance Report Forms",
        "path": "/qse/forms-templates/ncr-forms",
        "description": "Standard forms for reporting and tracking non-conformances.",
        "document_number": "QSE-5.2-FORM-01",
    },
    {
        "id": "qse/forms-templates/plan-templates",
        "parent_id": "qse/forms-templates",
        "type": "template",
        "title": "Management Plan Templates",
        "path": "/qse/forms-templates/plan-templates",
        "description": "Templates for developing project management plans.",
        "document_number": "QSE-5.3-TEMP-01",
    },

    # Tier 6 (Training and Competency)
    {
        "id": "qse/training-competency",
        "parent_id": "qse",
        "type": "section",
        "title": "Training and Competency",
        "path": "/qse/training-competency",
        "description": "Training programs and competency assessment procedures.",
    },
    {
        "id": "qse/training-competency/training-matrix",
        "parent_id": "qse/training-competency",
        "type": "register",
        "title": "Training Matrix",
        "path": "/qse/training-competency/training-matrix",
        "description": "Matrix of required training by role and competency level.",
        "document_number": "QSE-6.1-REG-01",
    },
    {
        "id": "qse/training-competency/competency-assessment",
        "parent_id": "qse/training-competency",
        "type": "procedure",
        "title": "Competency Assessment Procedure",
        "path": "/qse/training-competency/competency-assessment",
        "description": "Procedures for assessing and verifying personnel competency.",
        "document_number": "QSE-6.2-PROC-01",
    },

    # Tier 7 (Monitoring and Measurement)
    {
        "id": "qse/monitoring-measurement",
        "parent_id": "qse",
        "type": "section",
        "title": "Monitoring and Measurement",
        "path": "/qse/monitoring-measurement",
        "description": "Procedures for monitoring, measurement, analysis, and evaluation.",
    },
    {
        "id": "qse/monitoring-measurement/kpi-dashboard",
        "parent_id": "qse/monitoring-measurement",
        "type": "register",
        "title": "KPI Dashboard",
        "path": "/qse/monitoring-measurement/kpi-dashboard",
        "description": "Key performance indicators and monitoring dashboard.",
        "document_number": "QSE-7.1-REG-01",
    },
    {
        "id": "qse/monitoring-measurement/trend-analysis",
        "parent_id": "qse/monitoring-measurement",
        "type": "procedure",
        "title": "Trend Analysis Procedure",
        "path": "/qse/monitoring-measurement/trend-analysis",
        "description": "Procedures for analyzing performance trends and implementing improvements.",
        "document_number": "QSE-7.2-PROC-01",
    },
]

# Export for use in other modules
QSE_SYSTEM_REFERENCE = QSE_SYSTEM_NODES

