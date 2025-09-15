import os
import json
from typing_extensions import TypedDict
from typing import List, Dict, Any, Optional, Literal
from langgraph.graph import StateGraph, START, END
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from agent.prompts.pqp_prompt import PROMPT as PQP_PROMPT
from agent.prompts.emp_prompt import PROMPT as EMP_PROMPT
from agent.prompts.ohsmp_prompt import PROMPT as OHSMP_PROMPT
from agent.prompts.tmp_prompt import PROMPT as TMP_PROMPT
from agent.prompts.construction_program_prompt import PROMPT as CONSTR_PROMPT
from agent.tools.db_tools import (
    fetch_all_project_documents,
    save_management_plan_to_project,
    upsert_asset,
)
from agent.prompts.qse_system import QSE_SYSTEM_NODES, QSE_SYSTEM_SUMMARY
from agent.tools.action_graph_repo import (
    upsertAssetsAndEdges,
    IdempotentAssetWriteSpec,
)

llm = ChatGoogleGenerativeAI(
    model=os.getenv("GEMINI_MODEL_2"),
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.2,
    max_output_tokens=65536,
    include_thoughts=False,
    thinking_budget=-1,
)

VERBOSITY_DIRECTIVE = (
    "\n\nCRITICAL VERBOSITY & DETAIL REQUIREMENTS:"  # make outputs significantly longer and richer
    "\n- Be exhaustive and highly detailed across ALL sections. Target 2–4x the content of a concise plan."
    "\n- Expand every major section into multiple rich 'block' entries (paragraphs, lists, tables) wherever helpful."
    "\n- Prefer specificity grounded in PROJECT DOCUMENTS. Where absent, provide best-practice defaults and explicitly mark them as 'Assumption'."
    "\n- For each relevant topic include: purpose, scope, definitions, roles & responsibilities, step-by-step procedures, required resources, tools, competency requirements, references/standards/codes, acceptance criteria, inspections & test checkpoints, records & evidence to retain."
    "\n- Provide matrices/tables where suitable: RACI, risk register, environmental aspects & impacts, OHS hazard → control mapping (use hierarchy of controls), KPIs with targets and measurement methods, communication/escalation pathways, training/induction requirements."
    "\n- Provide explicit checklists (as list items) for field execution and verification."
    "\n- For traffic management (TMP), include delineation, staging, detours, signage schedules, hold points, emergency procedures."
    "\n- For construction program, include milestone breakdowns, dependencies, critical path notes, calendar/constraints, resource loading commentary (histograms described in text), contingency buffers, and reporting cadence."
    "\n- Use tables via headers/rows for registers and matrices; use items for enumerations; use paragraphs for narrative guidance."
    "\n- Structure deeply: create multiple levels of 'section' nodes with clear titles and populate each with several detailed 'block' nodes."
    "\n- Maintain the strict adjacency list schema; do NOT include children arrays; only use parentId relationships."
)

ENGINEERING_IMPLEMENTATION_DIRECTIVE = (
    "\n\nENGINEERING IMPLEMENTATION DIRECTIVE (Authoritative, Practitioner Grade):"
    "\n- You are acting as a senior civil engineer producing FINAL, IMPLEMENTABLE management plans for immediate use on the project."
    "\n- The plans must be tailored to the PROJECT DOCUMENTS (drawings, specifications, schedules, contract conditions). Use them as primary sources; use QSE context only to fill gaps."
    "\n- Where exact values or project-specific rules exist in documents, APPLY them. If absent, state 'Assumption' and provide best-practice value."
    "\n- Include fully workable method statements: detailed sequence, responsibilities, resources, plant & equipment, production rates, hold/witness points, acceptance criteria, inspection & test checkpoints, records to be captured, and close-out requirements."
    "\n- Provide explicit, field-usable checklists and registers (tables) for: risks (with controls following hierarchy), environmental aspects/impacts with mitigations and monitoring, OHS hazards with controls, training/competency, permits/approvals, calibration & equipment checks, materials conformance, NCR/CAR escalation, and communication/escalation pathways."
    "\n- For Quality (PQP): align each activity with ITP references and acceptance criteria; include document control, revisioning, and evidence capture requirements."
    "\n- For Environmental (EMP): include monitoring methods, frequencies, locations, limits/thresholds, reporting lines, and contingency actions when thresholds are exceeded."
    "\n- For OHSMP: include SWMS/JSA linkage, isolation/LOTO, access/egress, emergency response, inductions, toolbox talk content prompts, and PPE matrices."
    "\n- For TMP: include staging, delineation, detours, signage schedules, VMS messages, traffic counts assumptions, speed management, access management, emergency/incident procedures, and hold points for switchovers."
    "\n- For Construction Program: include milestones, dependencies, critical path commentary, calendars/constraints, weather allowances, resource loading commentary, buffers, reporting cadence, and progress measurement."
    "\n- Reference sources in the 'label' field within blocks when possible (e.g., 'Ref: SPEC 03300 §3.2; Drawing C-101; Contract Cl.14'). Use 'url' if a precise link exists; otherwise leave null."
    "\n- IDs must be unique strings. Titles must be clear and professional."
    "\n- Output must be sufficiently detailed that a competent engineer/site team could execute without further drafting."
)

QSE_REFERENCING_DIRECTIVE = (
    "\n\nQSE REFERENCING RULES (Corporate System Citations):"
    "\n- When you rely on corporate QSE documents (policy, procedure, register, form, template), cite their exact 'document_number' from QSE_SYSTEM_NODES."
    "\n- Provide inline citations near relevant paragraphs like (Ref: QSE-7.5-PROC-01) or (Ref: QSE-8.1-TEMP-ITP)."
    "\n- Include a final <h2 id=\"sec-references\">References</h2> section listing all cited QSE items as a bulleted list:"
    "\n  • Format: <li><b>QSE-7.5-PROC-01</b> — Procedure for Control of Documented Information (path: /qse/corp-documentation)</li>"
    "\n- Do NOT invent document numbers. Only use values that exist in QSE_SYSTEM_NODES."
)

NUMBERING_AND_ARTIFACTS_DIRECTIVE = (
    "\n\nPRESENTATION & OUTPUT RULES (Numbered Sections + Contents):"
    "\n- INCLUDE a 'Contents' section at the very top that lists all major sections with anchor links."
    "\n  • Render as an unordered list under an <h2>Contents</h2> heading."
    "\n  • Each list item must link to the corresponding section via #anchors (e.g., <a href=\"#sec-1\">1. General</a>)."
    "\n- USE DECIMAL SECTION NUMBERING for headings:"
    "\n  • <h1> for the document title (unnumbered)."
    "\n  • <h2> for top-level sections numbered 1, 2, 3, ... (e.g., '1. General')."
    "\n  • <h3> for subsections numbered 1.1, 1.2, 2.1, ... according to their parent section."
    "\n- Add stable id attributes to each numbered heading to support anchor links (e.g., <h2 id=\"sec-1\">1. General</h2>, <h3 id=\"sec-1-1\">1.1 Purpose</h3>)."
    "\n- Strip any numbering found in source documents BEFORE applying the new consistent numbering scheme."
    "\n- Do NOT include page numbers or pagination artifacts."
    "\n- Only include actual plan content. Exclude redundant layout metadata from source documents."
)

PLAN_TO_COLUMN = {
    "pqp": "pqp_plan_json",
    "emp": "emp_plan_json",
    "ohsmp": "ohsmp_plan_json",
    "tmp": "tmp_plan_json",
    # "construction_program": "construction_program_json",  # temporarily disabled
}

PLAN_TO_PROMPT = {
    "pqp": PQP_PROMPT,
    "emp": EMP_PROMPT,
    "ohsmp": OHSMP_PROMPT,
    "tmp": TMP_PROMPT,
    # "construction_program": CONSTR_PROMPT,  # temporarily disabled
}

def _default_category_and_tags_for_plan_type(plan_type: str) -> Dict[str, Any]:
    mapping: Dict[str, Dict[str, Any]] = {
        "pqp": {"category": "management_plan", "tags": ["plan", "pqp", "quality"]},
        "emp": {"category": "management_plan", "tags": ["plan", "emp", "environment"]},
        "ohsmp": {"category": "management_plan", "tags": ["plan", "ohs", "safety"]},
        "tmp": {"category": "management_plan", "tags": ["plan", "tmp", "traffic"]},
        "construction_program": {"category": "program", "tags": ["plan", "program", "schedule"]},
    }
    return mapping.get(plan_type, {"category": "plan", "tags": ["plan", plan_type]})

class PlanHtml(BaseModel):
    """Simple model for HTML plan body content.

    We store the HTML body only (no <html>, <head>, or <body> tags) to render directly in the app editor/viewer.
    """
    html: str

class PlanGenerationState(TypedDict):
    project_id: str
    plan_type: str
    txt_project_documents: List[Dict[str, Any]]
    plan_html: Optional[str]
    error: Optional[str]

class InputState(TypedDict):
    project_id: str
    # plan_type is optional for the single-plan graph; if omitted, default to 'pqp'
    plan_type: Optional[str]

class OutputState(TypedDict):
    plan_html: Optional[str]

def fetch_docs_node(state: PlanGenerationState) -> PlanGenerationState:
    # Fetch ALL project documents (not only those with extracted content)
    docs = fetch_all_project_documents.invoke(state["project_id"])
    return {**state, "txt_project_documents": docs}

def generate_plan_node(state: PlanGenerationState) -> PlanGenerationState:
    docs_text = "\n\n".join([f"Document: {d['file_name']} (ID: {d['id']})\n{d['content']}" for d in state["txt_project_documents"]])
    plan_type = state.get("plan_type") or "pqp"
    system_prompt = PLAN_TO_PROMPT[plan_type]
    qse_context = json.dumps(QSE_SYSTEM_NODES)
    qse_summary = QSE_SYSTEM_SUMMARY
    output_instructions = (
        "\n\nOUTPUT FORMAT (STRICT): Return JSON with a single field 'html' that contains the FINAL HTML BODY ONLY. "
        "Do NOT include <html>, <head>, or <body> tags. Use semantic HTML elements (h1-h3, p, ul/ol, table, a). "
        "Render a complete, professional management plan suitable for direct display and TinyMCE editing."
    )
    prompt = (
        f"{system_prompt}\n\n"
        f"QSE SYSTEM SUMMARY:\n{qse_summary}\n\n"
        f"QSE SYSTEM REFERENCE (adjacency list):\n{qse_context}\n\n"
        f"PROJECT DOCUMENTS:\n{docs_text}"
        f"{VERBOSITY_DIRECTIVE}"
        f"{ENGINEERING_IMPLEMENTATION_DIRECTIVE}"
        f"{QSE_REFERENCING_DIRECTIVE}"
        f"{NUMBERING_AND_ARTIFACTS_DIRECTIVE}"
        f"{output_instructions}"
    )
    structured_llm = llm.with_structured_output(PlanHtml, method="json_mode")
    response = structured_llm.invoke(prompt)
    html = response.html or ""
    return {**state, "plan_html": html, "plan_type": plan_type}

def save_plan_node(state: PlanGenerationState) -> PlanGenerationState:
    # Save to legacy projects column for backward compatibility (store as JSON object with html)
    column = PLAN_TO_COLUMN[state["plan_type"]]
    save_ok = save_management_plan_to_project.invoke({
        "project_id": state["project_id"],
        "column_name": column,
        "plan_json": json.dumps({"html": state.get("plan_html") or ""}),
    })
    if not save_ok:
        raise RuntimeError("Failed to persist plan JSON to projects table")
    # Upsert to assets as a plan asset with HTML payload
    plan_type = state.get("plan_type") or "plan"
    title = f"{plan_type.upper()} Plan"
    source_document_ids = [d.get("id") for d in state.get("txt_project_documents", []) if d.get("id")]
    defaults = _default_category_and_tags_for_plan_type(plan_type)
    metadata: Dict[str, Any] = {
        "plan_type": plan_type,
        "category": defaults.get("category"),
        "tags": defaults.get("tags"),
        "source_document_ids": source_document_ids,
    }
    # Persist to knowledge graph via action_graph_repo (idempotent, versioned)
    asset_spec = IdempotentAssetWriteSpec(
        asset_type="plan",
        asset_subtype=plan_type,
        name=title,
        description=f"{title} generated from project documents",
        project_id=state["project_id"],
        metadata=metadata,
        content={"html": state.get("plan_html") or ""},
        idempotency_key=f"plan:{state['project_id']}:{plan_type}",
        edges=[],
    )
    upsertAssetsAndEdges([asset_spec])
    return state

builder = StateGraph(PlanGenerationState, input=InputState, output=OutputState)
builder.add_node("fetch_docs", fetch_docs_node)
builder.add_node("generate_plan", generate_plan_node)
builder.add_node("save_plan", save_plan_node)

builder.add_edge(START, "fetch_docs")
builder.add_edge("fetch_docs", "generate_plan")
builder.add_edge("generate_plan", "save_plan")
builder.add_edge("save_plan", END)

plan_generation_graph = builder.compile(checkpointer=True)

# Description: Subgraph that generates a project management plan JSON using Gemini structured output and saves it to projects table.

# --------------------
# Sequencer: generate ALL plans in sequence (separate LLM call per plan)
# --------------------

class SeqState(TypedDict):
    project_id: str
    txt_project_documents: List[Dict[str, Any]]
    # results: append minimal summaries per plan
    results: List[Dict[str, Any]]

class SeqInput(TypedDict):
    project_id: str

class SeqOutput(TypedDict):
    results: List[Dict[str, Any]]

def seq_fetch_docs_node(state: SeqState) -> SeqState:
    # Fetch ALL project documents for sequencing
    docs = fetch_all_project_documents.invoke(state["project_id"])
    return {**state, "txt_project_documents": docs, "results": []}

def _gen_and_save(plan_type: str, state: SeqState) -> Dict[str, Any]:
    docs_text = "\n\n".join([f"Document: {d['file_name']} (ID: {d['id']})\n{d['content']}" for d in state["txt_project_documents"]])
    system_prompt = PLAN_TO_PROMPT[plan_type]
    qse_context = json.dumps(QSE_SYSTEM_NODES)
    output_instructions = (
        "\n\nOUTPUT FORMAT (STRICT): Return JSON with a single field 'html' that contains the FINAL HTML BODY ONLY. "
        "Do NOT include <html>, <head>, or <body> tags. Use semantic HTML elements (h1-h3, p, ul/ol, table, a)."
    )
    prompt = (
        f"{system_prompt}\n\n"
        f"QSE SYSTEM REFERENCE (adjacency list):\n{qse_context}\n\n"
        f"PROJECT DOCUMENTS:\n{docs_text}"
        f"{VERBOSITY_DIRECTIVE}"
        f"{ENGINEERING_IMPLEMENTATION_DIRECTIVE}"
        f"{NUMBERING_AND_ARTIFACTS_DIRECTIVE}"
        f"{output_instructions}"
    )
    structured_llm = llm.with_structured_output(PlanHtml, method="json_mode")
    response = structured_llm.invoke(prompt)
    html = response.html
    # Save to legacy column as JSON object containing html (fail-fast)
    save_ok = save_management_plan_to_project.invoke({
        "project_id": state["project_id"],
        "column_name": PLAN_TO_COLUMN[plan_type],
        "plan_json": json.dumps({"html": html}),
    })
    if not save_ok:
        raise RuntimeError("Failed to persist plan JSON to projects table (sequencer)")
    # Persist to knowledge graph via action_graph_repo
    defaults = _default_category_and_tags_for_plan_type(plan_type)
    source_document_ids = [d.get("id") for d in state.get("txt_project_documents", []) if d.get("id")]
    metadata = {
        "plan_type": plan_type,
        "category": defaults.get("category"),
        "tags": defaults.get("tags"),
        "source_document_ids": source_document_ids,
    }
    spec = IdempotentAssetWriteSpec(
        asset_type="plan",
        asset_subtype=plan_type,
        name=f"{plan_type.upper()} Plan",
        description=f"{plan_type.upper()} Plan generated from project documents",
        project_id=state["project_id"],
        metadata=metadata,
        content={"html": html},
        idempotency_key=f"plan:{state['project_id']}:{plan_type}",
        edges=[],
    )
    upsertAssetsAndEdges([spec])
    return {"plan_type": plan_type, "title": f"{plan_type.upper()} Plan"}

def seq_generate_pqp_node(state: SeqState) -> SeqState:
    summary = _gen_and_save("pqp", state)
    return {**state, "results": [*state["results"], summary]}

def seq_generate_emp_node(state: SeqState) -> SeqState:
    summary = _gen_and_save("emp", state)
    return {**state, "results": [*state["results"], summary]}

def seq_generate_ohsmp_node(state: SeqState) -> SeqState:
    summary = _gen_and_save("ohsmp", state)
    return {**state, "results": [*state["results"], summary]}

def seq_generate_tmp_node(state: SeqState) -> SeqState:
    summary = _gen_and_save("tmp", state)
    return {**state, "results": [*state["results"], summary]}

def seq_generate_constr_node(state: SeqState) -> SeqState:
    # Temporarily skip construction program generation
    return state

seq_builder = StateGraph(SeqState, input=SeqInput, output=SeqOutput)
seq_builder.add_node("fetch_docs", seq_fetch_docs_node)
seq_builder.add_node("gen_pqp", seq_generate_pqp_node)
seq_builder.add_node("gen_emp", seq_generate_emp_node)
seq_builder.add_node("gen_ohsmp", seq_generate_ohsmp_node)
seq_builder.add_node("gen_tmp", seq_generate_tmp_node)
seq_builder.add_node("gen_constr", seq_generate_constr_node)

seq_builder.add_edge(START, "fetch_docs")
seq_builder.add_edge("fetch_docs", "gen_pqp")
seq_builder.add_edge("gen_pqp", "gen_emp")
seq_builder.add_edge("gen_emp", "gen_ohsmp")
seq_builder.add_edge("gen_ohsmp", "gen_tmp")
seq_builder.add_edge("gen_tmp", END)

plan_generation_sequencer_graph = seq_builder.compile(checkpointer=True)

# Convenience wrappers to run with only project_id
def run_single_plan(project_id: str, plan_type: Optional[str] = None) -> Dict[str, Any]:
    """Run the single-plan graph using only a project_id (plan_type optional, defaults to 'pqp')."""
    inputs: InputState = {"project_id": project_id, "plan_type": plan_type}
    return plan_generation_graph.invoke(inputs)

def run_all_plans(project_id: str) -> Dict[str, Any]:
    """Run the sequencer to generate all plans using only a project_id."""
    seq_inputs: SeqInput = {"project_id": project_id}
    return plan_generation_sequencer_graph.invoke(seq_inputs)





def create_plan_generation_graph():
    """Factory exported for orchestrator integration (v10)."""
    return builder.compile(checkpointer=True)