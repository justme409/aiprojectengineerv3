import psycopg2
import psycopg2.extras
from langchain_core.tools import tool
import json
import logging

def get_db_connection():
    return psycopg2.connect(
        host="127.0.0.1",
        port="5555",
        database="projectpro",
        user="postgres",
        password="password"
    )

logger = logging.getLogger(__name__)

@tool
def fetch_document_ids_by_project(project_id: str) -> list[str]:
    """Fetch all document IDs for a given project_id from DB."""
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM documents WHERE project_id = %s", (project_id,))
        results = cursor.fetchall()
    conn.close()
    return [r[0] for r in results]

@tool
def fetch_uploaded_document_info(document_ids: list[str]) -> list[dict]:
    """Fetch uploaded document metadata from DB."""
    if not document_ids:
        return []
    conn = get_db_connection()
    with conn.cursor() as cursor:
        placeholders = ','.join(['%s'] * len(document_ids))
        cursor.execute(f"SELECT id, file_name, blob_url, project_id FROM documents WHERE id IN ({placeholders})", document_ids)
        results = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "file_name": r[1], "blob_url": r[2], "project_id": r[3]} for r in results]

@tool
def save_extracted_document_content(document_id: str, content: str) -> bool:
    """Save extracted content to DB."""
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("UPDATE documents SET raw_content = %s, status = 'content_extracted', updated_at = NOW() WHERE id = %s", (content, document_id))
        conn.commit()
        success = cursor.rowcount > 0
    conn.close()
    return success

@tool
def save_wbs_to_project(project_id: str, wbs_json: str) -> bool:
    """Save extracted WBS JSON to projects table."""
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("UPDATE projects SET wbs = %s, wbs_extracted_at = NOW() WHERE id = %s", (wbs_json, project_id))
        conn.commit()
        success = cursor.rowcount > 0
    conn.close()
    return success

ALLOWED_PLAN_COLUMNS = {
    "pqp_plan_json",
    "emp_plan_json",
    "ohsmp_plan_json",
    "tmp_plan_json",
    "construction_program_json",
}

@tool
def fetch_project_documents_with_content(project_id: str) -> list[dict]:
    """Fetch project documents that have extracted raw_content."""
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, file_name, COALESCE(raw_content, '') AS raw_content
            FROM documents
            WHERE project_id = %s
              AND (processing_status IS NULL OR processing_status <> 'deleted')
              AND raw_content IS NOT NULL
            ORDER BY updated_at DESC
            """,
            (project_id,),
        )
        results = cursor.fetchall()
    conn.close()
    return [{"id": str(r[0]), "file_name": r[1], "content": r[2]} for r in results]

@tool
def fetch_all_project_documents(project_id: str) -> list[dict]:
    """Fetch all project documents (including those without extracted content), excluding deleted."""
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, file_name, COALESCE(raw_content, '') AS raw_content
            FROM documents
            WHERE project_id = %s
              AND (processing_status IS NULL OR processing_status <> 'deleted')
            ORDER BY updated_at DESC
            """,
            (project_id,),
        )
        results = cursor.fetchall()
    conn.close()
    return [{"id": str(r[0]), "file_name": r[1], "content": r[2]} for r in results]

@tool
def save_management_plan_to_project(project_id: str, column_name: str, plan_json: str) -> bool:
    """Save management plan JSON to the projects table for a whitelisted column."""
    if column_name not in ALLOWED_PLAN_COLUMNS:
        raise ValueError("Invalid plan column name")
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            f"UPDATE projects SET {column_name} = %s, updated_at = NOW() WHERE id = %s",
            (plan_json, project_id),
        )
        conn.commit()
        success = cursor.rowcount > 0
    conn.close()
    return success


def _normalize_doc_numbers(doc_numbers: list[str]) -> list[str]:
    return [dn.strip().upper() for dn in doc_numbers if isinstance(dn, str) and dn.strip()]


def fetch_organization_id_for_project(project_id: str) -> str | None:
    """Return the organisation_id that owns the given project (or None)."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT organization_id FROM public.projects WHERE id = %s LIMIT 1",
                (project_id,),
            )
            row = cursor.fetchone()
            if not row:
                return None
            organization_id = row[0]
            return str(organization_id) if organization_id else None
    finally:
        conn.close()


def fetch_qse_assets_for_org(organization_id: str, doc_numbers: list[str]) -> list[dict]:
    """Fetch the latest QSE assets for the given organisation filtered by document numbers."""
    normalized = _normalize_doc_numbers(doc_numbers)
    if not normalized:
        return []

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    asset_uid,
                    version,
                    name,
                    document_number,
                    metadata,
                    content,
                    type,
                    subtype,
                    updated_at
                FROM public.asset_heads
                WHERE organization_id = %s
                  AND (
                    document_number = ANY(%s)
                    OR metadata->>'document_number' = ANY(%s)
                    OR metadata->'qse_doc'->>'code' = ANY(%s)
                    OR UPPER(name) = ANY(%s)
                  )
                ORDER BY updated_at DESC
                """,
                (organization_id, normalized, normalized, normalized, normalized),
            )
            rows = cursor.fetchall()

        assets: list[dict] = []
        for row in rows:
            data = dict(row)
            asset_id = data.get("id")
            if asset_id is not None:
                data["id"] = str(asset_id)
            asset_uid = data.get("asset_uid")
            if asset_uid is not None:
                data["asset_uid"] = str(asset_uid)
            metadata = data.get("metadata") or {}
            if isinstance(metadata, str):
                try:
                    metadata = json.loads(metadata)
                except json.JSONDecodeError:
                    metadata = {}
            data["metadata"] = metadata
            content = data.get("content") or {}
            if isinstance(content, str):
                try:
                    content = json.loads(content)
                except json.JSONDecodeError:
                    content = {}
            data["content"] = content
            assets.append(data)

        return assets
    finally:
        conn.close()

# =========================
# Assets table integrations
# =========================

@tool
def upsert_asset(
    project_id: str,
    asset_type: str,
    name: str,
    content: dict,
    document_number: str | None = None,
    metadata: dict | None = None,
) -> str:
    """Create or update an asset. If document_number is provided, uses unique constraint to upsert; otherwise matches on (project_id, asset_type, name). Returns asset_id."""
    conn = get_db_connection()
    with conn.cursor() as cursor:
        if document_number:
            # Upsert using unique docnum per project/type constraint
            # Prefer key-based upsert to avoid dependency on a named constraint
            cursor.execute(
                """
                INSERT INTO public.assets (project_id, asset_type, name, document_number, content, metadata)
                VALUES (%s, %s, %s, %s, %s::jsonb, %s::jsonb)
                ON CONFLICT ON CONSTRAINT assets_unique_docnum_per_project_type
                DO UPDATE SET
                  name = EXCLUDED.name,
                  content = EXCLUDED.content,
                  metadata = EXCLUDED.metadata,
                  updated_at = NOW()
                RETURNING id
                """,
                (project_id, asset_type, name, document_number, json.dumps(content), json.dumps(metadata) if metadata is not None else None),
            )
            asset_id = cursor.fetchone()[0]
            conn.commit()
            conn.close()
            return str(asset_id)
        else:
            # Attempt to find existing by name
            cursor.execute(
                """
                SELECT id FROM public.assets
                WHERE project_id = %s AND asset_type = %s AND name = %s
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (project_id, asset_type, name),
            )
            row = cursor.fetchone()
            if row:
                asset_id = row[0]
                cursor.execute(
                    """
                    UPDATE public.assets
                    SET content = %s::jsonb,
                        metadata = COALESCE(%s::jsonb, metadata),
                        updated_at = NOW()
                    WHERE id = %s
                    RETURNING id
                    """,
                    (json.dumps(content), json.dumps(metadata) if metadata is not None else None, asset_id),
                )
                _ = cursor.fetchone()[0]
                conn.commit()
                conn.close()
                return str(asset_id)
            else:
                cursor.execute(
                    """
                    INSERT INTO public.assets (project_id, asset_type, name, content, metadata)
                    VALUES (%s, %s, %s, %s::jsonb, %s::jsonb)
                    RETURNING id
                    """,
                    (project_id, asset_type, name, json.dumps(content), json.dumps(metadata) if metadata is not None else None),
                )
                asset_id = cursor.fetchone()[0]
                conn.commit()
                conn.close()
                return str(asset_id)

@tool
def fetch_assets_by_type(project_id: str, asset_type: str) -> list[dict]:
    """Fetch assets for a project filtered by type."""
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, name, document_number, status, content, metadata, created_at, updated_at
            FROM public.assets
            WHERE project_id = %s AND asset_type = %s
            ORDER BY created_at DESC
            """,
            (project_id, asset_type),
        )
        rows = cursor.fetchall()
    conn.close()
    result: list[dict] = []
    for r in rows:
        result.append(
            {
                "id": str(r[0]),
                "name": r[1],
                "document_number": r[2],
                "status": r[3],
                "content": r[4],
                "metadata": r[5],
                "created_at": r[6].isoformat() if r[6] else None,
                "updated_at": r[7].isoformat() if r[7] else None,
            }
        )
    return result

@tool
def upsert_qse_asset(
    project_id: str,
    asset_type: str,
    name: str,
    content: dict,
    document_number: str | None = None,
    metadata: dict | None = None,
) -> str:
    """QSE-specific upsert that avoids reliance on DB ON CONFLICT constraints.

    Behavior:
    - If document_number provided, select by (project_id, asset_type, document_number) and update/insert
    - Else, select by (project_id, asset_type, name) and update/insert
    Returns asset_id.
    """
    # Always insert new asset; no uniqueness or upsert behavior
    conn = get_db_connection()
    with conn.cursor() as cursor:
        if document_number:
            cursor.execute(
                """
                INSERT INTO public.assets (project_id, asset_type, name, document_number, content, metadata)
                VALUES (%s, %s, %s, %s, %s::jsonb, %s::jsonb)
                RETURNING id
                """,
                (
                    project_id,
                    asset_type,
                    name,
                    document_number,
                    json.dumps(content),
                    json.dumps(metadata) if metadata is not None else None,
                ),
            )
        else:
            cursor.execute(
                """
                INSERT INTO public.assets (project_id, asset_type, name, content, metadata)
                VALUES (%s, %s, %s, %s::jsonb, %s::jsonb)
                RETURNING id
                """,
                (project_id, asset_type, name, json.dumps(content), json.dumps(metadata) if metadata is not None else None),
            )
        asset_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        return str(asset_id)

@tool
def save_document_metadata(document_id: str, document_metadata: dict) -> bool:
    """Create a new 'document' asset from extracted metadata and link it to the document via documents.asset_id.

    Behavior (simple):
    - Reads project_id and file_name from public.documents
    - Inserts a new row in public.assets with:
        - asset_type='document'
        - name = metadata.name if provided else file_name
        - document_number = metadata.document_number (can be null)
        - content = { document_id, file_name, type? }
        - metadata = { category: metadata.category || 'Other', revision: metadata.revision }
    - Updates public.documents.asset_id with the new asset id
    - Returns True on success, False otherwise
    """
    logger.info(
        "save_document_metadata called",
        extra={
            "document_id": document_id,
            "document_metadata": document_metadata,
        },
    )
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # 1) Get project_id and file_name from documents
            cursor.execute(
                """
                SELECT project_id, file_name
                FROM public.documents
                WHERE id = %s
                """,
                (document_id,),
            )
            row = cursor.fetchone()
            if not row:
                logger.error("save_document_metadata: document not found", extra={"document_id": document_id})
                return False
            project_id, file_name = row[0], row[1]

            name = (document_metadata or {}).get("name") or file_name
            extracted_doc_number = (document_metadata or {}).get("document_number")
            revision = (document_metadata or {}).get("revision")
            doc_type = (document_metadata or {}).get("type")
            category = (document_metadata or {}).get("category") or "Other"

            logger.info(
                "save_document_metadata: prepared fields",
                extra={
                    "project_id": str(project_id) if project_id else None,
                    "file_name": file_name,
                    "doc_name": name,
                    "extracted_document_number": extracted_doc_number,
                    "revision": revision,
                    "type": doc_type,
                    "category": category,
                },
            )

            content_payload = {
                "document_id": document_id,
                "file_name": file_name,
            }
            if doc_type is not None:
                content_payload["type"] = doc_type
            metadata_payload = {
                "category": category,
                "revision": revision,
                "document_number": extracted_doc_number,
            }

            # 2) Insert new asset row
            logger.debug("save_document_metadata: inserting asset row (no duplicate check)")
            cursor.execute(
                """
                INSERT INTO public.assets (
                    project_id, asset_type, name, document_number, content, metadata
                )
                VALUES (%s, 'document', %s, %s, %s::jsonb, %s::jsonb)
                RETURNING id
                """,
                (
                    project_id,
                    name,
                    str(document_id),
                    json.dumps(content_payload),
                    json.dumps(metadata_payload),
                ),
            )
            asset_id = cursor.fetchone()[0]
            logger.info("save_document_metadata: asset inserted", extra={"asset_id": str(asset_id)})

            # 3) Link asset to document (strict, no fallback)
            logger.debug("save_document_metadata: linking asset to document")
            cursor.execute(
                """
                UPDATE public.documents
                SET asset_id = %s,
                    updated_at = NOW()
                WHERE id = %s
                """,
                (asset_id, document_id),
            )
            if cursor.rowcount == 0:
                logger.error(
                    "save_document_metadata: linking update affected 0 rows",
                    extra={"document_id": document_id, "asset_id": str(asset_id)},
                )
                conn.rollback()
                return False

            conn.commit()
            logger.info("save_document_metadata: success", extra={"document_id": document_id, "asset_id": str(asset_id)})
            return True
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        logger.exception("save_document_metadata: exception raised", extra={"document_id": document_id})
        return False
    finally:
        conn.close()

@tool
def fetch_reference_documents() -> list[dict]:
    """Fetch all reference documents metadata from DB (unfiltered)."""
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id, spec_id, spec_name, jurisdiction, org_identifier FROM reference_documents ORDER BY spec_id")
        results = cursor.fetchall()
    conn.close()
    return [{"id": str(r[0]), "spec_id": r[1], "spec_name": r[2], "jurisdiction": r[3], "org_identifier": r[4]} for r in results]

@tool
def fetch_reference_documents_by_jurisdiction(project_jurisdiction: str) -> list[dict]:
    """Fetch reference documents filtered by jurisdiction plus Australia-wide.

    - project_jurisdiction: normalized AU code (QLD, NSW, TAS, SA, VIC, WA, NT, ACT)
    """
    if not project_jurisdiction:
        return []
    code = (project_jurisdiction or '').upper()
    name_map = {
        'QLD': 'Queensland',
        'NSW': 'New South Wales',
        'TAS': 'Tasmania',
        'SA': 'South Australia',
        'VIC': 'Victoria',
        'WA': 'Western Australia',
        'NT': 'Northern Territory',
        'ACT': 'Australian Capital Territory',
    }
    full_name = name_map.get(code, code)

    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, spec_id, spec_name, jurisdiction, org_identifier
            FROM reference_documents
            WHERE (
                jurisdiction ILIKE %s OR jurisdiction ILIKE %s
            )
            OR (
                jurisdiction ILIKE 'Australia%%' OR jurisdiction ILIKE 'Australia /%%' OR jurisdiction ILIKE 'Australia,%%' OR jurisdiction ILIKE 'Australia;%%' OR jurisdiction ILIKE 'Australia%%New Zealand' OR jurisdiction IS NULL
            )
            ORDER BY spec_id
            """,
            (f"%{code}%", f"%{full_name}%"),
        )
        results = cursor.fetchall()
    conn.close()
    return [{"id": str(r[0]), "spec_id": r[1], "spec_name": r[2], "jurisdiction": r[3], "org_identifier": r[4]} for r in results]

@tool
def fetch_standard_document_content(spec_ids: list[str]) -> list[dict]:
    """Fetch actual standard document content by spec_id list."""
    if not spec_ids:
        return []

    conn = get_db_connection()
    with conn.cursor() as cursor:
        placeholders = ','.join(['%s'] * len(spec_ids))
        cursor.execute(
            f"""
            SELECT rd.id, rd.spec_id, rd.spec_name, rd.org_identifier, rd.jurisdiction,
                   COALESCE(rd.content_raw, '') AS content
            FROM reference_documents rd
            WHERE rd.spec_id = ANY(%s)
            ORDER BY rd.spec_id
            """,
            (spec_ids,)
        )
        results = cursor.fetchall()
    conn.close()
    return [
        {
            "id": str(r[0]),
            "spec_id": r[1],
            "spec_name": r[2],
            "org_identifier": r[3],
            "jurisdiction": r[4],
            "content": r[5]
        }
        for r in results
    ]

# Description: DB tools for fetching/saving document info.
# Source: Ported from agents_v7 document_content_extraction.py. Note: Easy to swap to Supabase URL—replace connect() with URL string.

@tool
def save_lbs_and_mapping_to_project(project_id: str, lbs_json: str, mapping_json: str | None = None) -> bool:
    """Save LBS adjacency list and optional WBS-LBS mapping JSON to the projects table.

    - lbs_json: JSON string representing an adjacency list (array of nodes)
    - mapping_json: JSON string for wbs_lbs_mapping object (can be null)
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                UPDATE public.projects
                SET lbs = %s::jsonb,
                    wbs_lbs_mapping = COALESCE(%s::jsonb, wbs_lbs_mapping),
                    updated_at = NOW()
                WHERE id = %s
                """,
                (lbs_json, mapping_json, project_id),
            )
            conn.commit()
            return cursor.rowcount > 0
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass
        return False
    finally:
        conn.close()
