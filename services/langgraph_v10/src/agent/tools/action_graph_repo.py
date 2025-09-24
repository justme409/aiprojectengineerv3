"""
Real action_graph_repo module for LangGraph v10 production.
Provides actual database persistence for assets and edges.
"""

from typing import Dict, List, Any, Optional, Union
from pydantic import BaseModel
from datetime import datetime
import uuid
import os
import logging
import psycopg2
from psycopg2.extras import Json

logger = logging.getLogger(__name__)


class IdempotentAssetWriteSpec(BaseModel):
    """Specification for writing assets with idempotency."""

    asset_type: str
    asset_subtype: str
    name: str
    description: str
    project_id: str
    document_number: Optional[str] = None
    revision_code: Optional[str] = None
    metadata: Dict[str, Any]
    content: Dict[str, Any]
    idempotency_key: str
    edges: Optional[List[Dict[str, Any]]] = None


def get_database_url() -> str:
    """Get database URL from environment or provide defaults"""
    # Try environment variables first
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return db_url

    # Fallback to docker-compose defaults
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5555")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "password")
    database = os.getenv("DB_NAME", "projectpro")

    return f"postgresql://{user}:{password}@{host}:{port}/{database}"


def upsertAssetsAndEdges(asset_specs: List[IdempotentAssetWriteSpec]) -> Dict[str, Any]:
    """
    Real database persistence for assets and edges to the knowledge graph.
    Implements the asset-centric architecture with versioning and idempotency.
    """

    results = []
    connection = None
    cursor = None

    try:
        # Get database connection
        database_url = get_database_url()
        logger.info(f"Connecting to database for asset persistence")

        connection = psycopg2.connect(database_url)
        cursor = connection.cursor()

        for spec in asset_specs:
            try:
                asset_id = _upsert_single_asset(cursor, spec)
                edge_results = _create_asset_edges(cursor, asset_id, spec.edges or [])

                result = {
                    "asset_id": asset_id,
                    "status": "created",
                    "timestamp": datetime.now().isoformat(),
                    "edges_created": len(edge_results),
                    "spec": spec.model_dump()
                }
                results.append(result)
                logger.info(f"Successfully persisted asset {asset_id} for {spec.name}")

            except Exception as e:
                logger.error(f"Failed to persist asset {spec.name}: {e}")
                results.append({
                    "asset_id": None,
                    "status": "error",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat(),
                    "spec": spec.model_dump()
                })

        # Commit all changes
        connection.commit()
        logger.info(f"Successfully committed {len(results)} asset operations")

        return {
            "success": True,
            "assets_processed": len(results),
            "results": results
        }

    except Exception as e:
        if connection:
            connection.rollback()
        logger.error(f"Database transaction failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "assets_processed": len(results),
            "results": results
        }

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def _upsert_single_asset(cursor, spec: IdempotentAssetWriteSpec) -> str:
    """Upsert a single asset with versioning and idempotency"""

    # First, resolve organization_id from project_id
    cursor.execute("""
        SELECT organization_id FROM public.projects WHERE id = %s
    """, (spec.project_id,))

    result = cursor.fetchone()
    if not result:
        raise ValueError(f"Project {spec.project_id} not found or has no organization")

    organization_id = result[0]

    # Check if asset already exists by idempotency key
    cursor.execute("""
        SELECT id, version, asset_uid, revision_code, subtype, name, organization_id, project_id,
               document_number, path_key, status, approval_state, classification, metadata, content
        FROM public.assets
        WHERE project_id = %s AND type = %s AND idempotency_key = %s
        ORDER BY version DESC LIMIT 1
    """, (spec.project_id, spec.asset_type, spec.idempotency_key))

    existing_asset = cursor.fetchone()

    if existing_asset:
        # Asset exists - create new version
        existing_id, current_version, asset_uid, existing_revision_code, existing_subtype, existing_name, existing_org_id, existing_project_id, existing_document_number, existing_path_key, existing_status, existing_approval_state, existing_classification, existing_metadata, existing_content = existing_asset
        new_version = current_version + 1

        # Mark current version as not current and release idempotency_key to avoid UNIQUE violation
        cursor.execute("""
            UPDATE public.assets
            SET is_current = false,
                idempotency_key = CONCAT(idempotency_key, ':v', %s)
            WHERE id = %s
        """, (current_version, existing_id))

        # Insert new version
        asset_id = str(uuid.uuid4())
        # Preserve revision_code on version bumps; do not change due to repeated idempotent upserts
        # For other fields, prefer the incoming spec values if provided, otherwise carry forward existing
        next_revision_code = existing_revision_code
        cursor.execute("""
            INSERT INTO public.assets (
                id, asset_uid, version, is_current, supersedes_asset_id,
                type, subtype, name, organization_id, project_id,
                document_number, revision_code,
                metadata, content, idempotency_key, status, approval_state, classification
            ) VALUES (
                %s, %s, %s, true, %s,
                %s, %s, %s, %s, %s,
                %s, %s,
                %s, %s, %s, %s, %s, %s
            )
        """, (
            asset_id, asset_uid, new_version, existing_id,
            spec.asset_type, (spec.asset_subtype or existing_subtype), (spec.name or existing_name),
            existing_org_id or organization_id, existing_project_id or spec.project_id,
            (spec.document_number or existing_document_number), next_revision_code,
            Json(spec.metadata or (existing_metadata or {})), Json(spec.content or (existing_content or {})), spec.idempotency_key,
            (existing_status or 'draft'), (existing_approval_state or 'not_required'), (existing_classification or 'internal')
        ))

        logger.info(f"Created new version {new_version} for existing asset {asset_uid}")

    else:
        # Asset doesn't exist - create new one
        asset_id = str(uuid.uuid4())
        asset_uid = str(uuid.uuid4())

        # Default initial revision_code for plans to 'A' (uppercase) if not provided
        initial_revision = spec.revision_code if spec.revision_code is not None else ('A' if spec.asset_type == 'plan' else None)
        cursor.execute("""
            INSERT INTO public.assets (
                id, asset_uid, version, is_current,
                type, subtype, name, organization_id, project_id,
                document_number, revision_code,
                metadata, content, idempotency_key, status, approval_state, classification
            ) VALUES (
                %s, %s, 1, true,
                %s, %s, %s, %s, %s,
                %s, %s,
                %s, %s, %s, 'draft', 'not_required', 'internal'
            )
        """, (
            asset_id, asset_uid,
            spec.asset_type, spec.asset_subtype or None, spec.name,
            organization_id, spec.project_id,
            spec.document_number, initial_revision,
            Json(spec.metadata), Json(spec.content), spec.idempotency_key
        ))

        logger.info(f"Created new asset {asset_uid} with ID {asset_id}")

    return asset_id


def _create_asset_edges(cursor, asset_id: str, edges: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Create asset edges with proper validation and idempotency"""

    edge_results = []

    for edge in edges:
        try:
            # Validate required fields
            if not all(k in edge for k in ['from_asset_id', 'to_asset_id', 'edge_type']):
                logger.warning(f"Edge missing required fields: {edge}")
                continue

            from_asset_id = edge['from_asset_id']
            to_asset_id = edge['to_asset_id']
            edge_type = edge['edge_type']
            properties = edge.get('properties', {})
            idempotency_key = edge.get('idempotency_key')

            # If from_asset_id is placeholder, use the actual asset_id we just created
            if from_asset_id == "" or from_asset_id is None:
                from_asset_id = asset_id

            # Validate that both assets exist
            cursor.execute("""
                SELECT COUNT(*) FROM public.assets
                WHERE id IN (%s, %s) AND is_current = true
            """, (from_asset_id, to_asset_id))

            if cursor.fetchone()[0] != 2:
                logger.warning(f"One or both assets don't exist: {from_asset_id}, {to_asset_id}")
                continue

            # Check for existing edge by idempotency key (if provided)
            if idempotency_key:
                cursor.execute("""
                    SELECT id FROM public.asset_edges
                    WHERE edge_type = %s AND idempotency_key = %s
                """, (edge_type, idempotency_key))

                if cursor.fetchone():
                    logger.info(f"Edge already exists for idempotency_key: {idempotency_key}")
                    continue

            # Create the edge
            edge_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO public.asset_edges (
                    id, from_asset_id, to_asset_id, edge_type, properties, idempotency_key
                ) VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                edge_id, from_asset_id, to_asset_id, edge_type,
                Json(properties), idempotency_key
            ))

            edge_results.append({
                "edge_id": edge_id,
                "from_asset_id": from_asset_id,
                "to_asset_id": to_asset_id,
                "edge_type": edge_type
            })

            logger.info(f"Created edge {edge_id}: {from_asset_id} -> {to_asset_id} ({edge_type})")

        except Exception as e:
            logger.error(f"Failed to create edge: {e}")
            continue

    return edge_results


def get_asset_by_idempotency_key(project_id: str, asset_type: str, idempotency_key: str) -> Optional[Dict[str, Any]]:
    """Retrieve an asset by its idempotency key"""
    from psycopg2.extras import RealDictCursor

    connection = None
    cursor = None

    try:
        database_url = get_database_url()
        connection = psycopg2.connect(database_url)
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            SELECT * FROM public.assets
            WHERE project_id = %s AND type = %s AND idempotency_key = %s AND is_current = true
        """, (project_id, asset_type, idempotency_key))

        result = cursor.fetchone()

        if result:
            return dict(result)

        return None

    except Exception as e:
        logger.error(f"Failed to retrieve asset: {e}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def get_assets_by_project(project_id: str, asset_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve all current assets for a project, optionally filtered by type"""
    from psycopg2.extras import RealDictCursor

    connection = None
    cursor = None

    try:
        database_url = get_database_url()
        connection = psycopg2.connect(database_url)
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        if asset_type:
            cursor.execute("""
                SELECT * FROM public.assets
                WHERE project_id = %s AND type = %s AND is_current = true
                ORDER BY created_at DESC
            """, (project_id, asset_type))
        else:
            cursor.execute("""
                SELECT * FROM public.assets
                WHERE project_id = %s AND is_current = true
                ORDER BY created_at DESC
            """, (project_id,))

        results = cursor.fetchall()
        return [dict(row) for row in results]

    except Exception as e:
        logger.error(f"Failed to retrieve assets: {e}")
        return []

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def test_database_connection() -> bool:
    """Test database connection and basic functionality"""
    import psycopg2

    try:
        database_url = get_database_url()
        connection = psycopg2.connect(database_url)
        cursor = connection.cursor()

        # Test basic query
        cursor.execute("SELECT 1 as test")
        result = cursor.fetchone()

        cursor.close()
        connection.close()

        if result and result[0] == 1:
            logger.info("Database connection test successful")
            return True
        else:
            logger.error("Database connection test failed - unexpected result")
            return False

    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False


if __name__ == "__main__":
    # Test the implementation when run directly
    print("Testing action_graph_repo implementation...")
    success = test_database_connection()
    if success:
        print("✅ Database connection test passed")
    else:
        print("❌ Database connection test failed")
