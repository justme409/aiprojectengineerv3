"""
Example usage of the Document Metadata Graph

This demonstrates how to use the document metadata extraction graph
to extract structured metadata from documents and drawings.
"""

from typing import Dict, List, Any
from agent.graphs.document_metadata import (
    create_document_metadata_graph,
    DocumentMetadataState,
    InputState
)

def example_document_metadata_extraction():
    """
    Example of how to use the document metadata graph
    """

    # Create the graph
    graph = create_document_metadata_graph()

    # Example input documents (normally these would come from document extraction)
    example_documents = [
        {
            "id": "doc-001",
            "file_name": "Project Specification.pdf",
            "content": """
            PROJECT SPECIFICATION
            Document Number: PS-001
            Revision: A

            This specification outlines the requirements for the construction project.

            SUMMARY:
            This document specifies the technical requirements for the bridge construction project.

            REQUIREMENTS:
            1. All materials must meet AS 1288 standards
            2. Concrete strength must be 40MPa minimum
            3. Steel reinforcement must comply with AS 3600

            HAZARDS:
            - Working at heights
            - Heavy machinery operation
            - Confined spaces

            ENTITIES:
            - Organization: ACME Construction
            - Location: Sydney Harbour Bridge site
            - Equipment: Concrete mixer, cranes
            """
        },
        {
            "id": "drawing-001",
            "file_name": "General Arrangement Drawing.pdf",
            "content": """
            GENERAL ARRANGEMENT DRAWING
            Drawing Number: GA-001
            Revision: 2
            Scale: 1:100
            Sheet 1 of 3

            This drawing shows the general arrangement of the bridge structure.

            KEY ELEMENTS:
            - Piers at locations A, B, C
            - Deck spanning 100m
            - Access roads on both sides

            REFERENCES:
            - WBS: 1.1.1 Bridge Construction
            - LBS: Chainage 0+000 to 1+000
            """
        }
    ]

    # Create initial state
    initial_state = DocumentMetadataState(
        project_id="project-123",
        document_ids=["doc-001"],
        txt_project_documents=example_documents
    )

    # Run the graph
    try:
        result = graph.invoke(initial_state)

        print("Document Metadata Extraction Complete!")
        print("=" * 50)

        if result.extracted_metadata:
            metadata = result.extracted_metadata

            print(f"Assets extracted: {len(metadata.get('assets', []))}")

            # Show unified assets
            for asset in metadata.get("assets", []):
                kind = (asset.get('asset_type') or asset.get('doc_kind') or 'document').lower()
                print(f"\n{kind.capitalize()}: {asset['document_number']} (Rev: {asset.get('revision_code')})")
                print(f"Subtype: {asset.get('subtype')}")
                print(f"Title: {asset.get('title')}")
                print(f"Discipline: {asset.get('discipline')}")

        if result.asset_specs:
            print(f"\nAssets created: {len(result.asset_specs)}")

        if result.error:
            print(f"Error: {result.error}")

    except Exception as e:
        print(f"Graph execution failed: {e}")

if __name__ == "__main__":
    example_document_metadata_extraction()
