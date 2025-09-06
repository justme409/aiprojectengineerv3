from typing import Dict, List, Any, Optional
from pydantic import BaseModel

class AzureStorageState(BaseModel):
    operations: List[Dict[str, Any]]
    results: Optional[List[Dict[str, Any]]] = None

def azure_storage_step(state: AzureStorageState) -> Dict[str, Any]:
    """Interact with Azure Blob Storage for document operations"""
    # Mock implementation - in real implementation this would interact with Azure Blob Storage
    results = []
    for operation in state.operations:
        if operation.get("type") == "upload":
            results.append({
                "operation": "upload",
                "file_name": operation.get("file_name"),
                "blob_url": f"https://mockstorage.blob.core.windows.net/{operation.get('file_name')}",
                "status": "success"
            })
        elif operation.get("type") == "download":
            results.append({
                "operation": "download",
                "file_name": operation.get("file_name"),
                "content": "mock file content",
                "status": "success"
            })

    return {"results": results}
