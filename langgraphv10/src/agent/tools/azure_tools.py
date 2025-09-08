import os
from azure.storage.blob import generate_blob_sas, BlobSasPermissions
from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.core.credentials import AzureKeyCredential
from datetime import datetime, timedelta
from dotenv import load_dotenv
from typing import Dict, Any, Optional
import logging
import asyncio

load_dotenv()

AZURE_STORAGE_ACCOUNT_NAME = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
AZURE_STORAGE_ACCOUNT_KEY = os.getenv("AZURE_STORAGE_ACCOUNT_KEY")
AZURE_STORAGE_CONTAINER_DOCUMENTS = os.getenv("AZURE_STORAGE_CONTAINER_DOCUMENTS", "documents")
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")
AZURE_DOCUMENT_INTELLIGENCE_API_KEY = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_API_KEY")

logger = logging.getLogger(__name__)

def generate_sas_token(blob_path: str) -> str:
    """Generate SAS token for Azure blob access (read)."""
    if not AZURE_STORAGE_ACCOUNT_NAME or not AZURE_STORAGE_ACCOUNT_KEY:
        raise ValueError("Missing Azure Storage credentials")

    sas_token = generate_blob_sas(
        account_name=AZURE_STORAGE_ACCOUNT_NAME,
        container_name=AZURE_STORAGE_CONTAINER_DOCUMENTS,
        blob_name=blob_path,
        account_key=AZURE_STORAGE_ACCOUNT_KEY,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(hours=2)
    )
    return f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{AZURE_STORAGE_CONTAINER_DOCUMENTS}/{blob_path}?{sas_token}"

def extract_document_content(blob_url: str, file_name: str) -> Dict[str, Any]:
    """Extract content from document using Azure Document Intelligence v4.0 (supports PDF, images, DOCX, XLSX, PPTX, HTML)."""
    try:
        endpoint = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")
        key = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_API_KEY")
        if not endpoint or not key:
            raise ValueError("Missing Azure Document Intelligence credentials")

        # Use v4.0 API with 2024-11-30 API version that supports DOCX, XLSX, PPTX, HTML
        client = DocumentIntelligenceClient(
            endpoint=endpoint,
            credential=AzureKeyCredential(key),
            api_version="2024-11-30"
        )

        # Use prebuilt-read model which supports all file formats in v4.0
        poller = client.begin_analyze_document("prebuilt-read", {"urlSource": blob_url})
        result = poller.result()

        content = result.content if hasattr(result, 'content') else ''
        if not content:
            raise ValueError("No content extracted from document")

        return {"status": "success", "content": content}

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to extract content from {file_name}: {error_msg}")
        return {"status": "error", "error": error_msg}

async def extract_document_content_async(blob_url: str, file_name: str) -> Dict[str, Any]:
    """Async version of document content extraction"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, extract_document_content, blob_url, file_name)

def build_asset_attachment_blob_path(asset_id: str, filename: str, asset_row_id: Optional[str] = None) -> str:
    """Return standardized blob path for asset attachments: attachments/{asset_id}/[asset_row_id/]{filename}."""
    if asset_row_id:
        return f"attachments/{asset_id}/{asset_row_id}/{filename}"
    return f"attachments/{asset_id}/{filename}"

# Description: Azure tools for V10 LangGraph system with real Document Intelligence processing.
# NO MOCK DATA - All calls use actual Azure services.
# Supports PDF, images (JPEG/JPG, PNG, BMP, TIFF, HEIF), and Microsoft Office files (DOCX, XLSX, PPTX) + HTML.
# Adapted from V9 for asset-centric architecture.

