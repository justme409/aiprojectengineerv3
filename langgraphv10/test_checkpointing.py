#!/usr/bin/env python3
"""
Test script to verify SqliteSaver checkpointing is working correctly.
"""

import os
from src.agent.graphs.orchestrator import create_orchestrator_graph

def test_checkpointing():
    print("🧪 Testing SqliteSaver Checkpointing...")
    print("=" * 50)

    # Check if database exists before
    db_path = "checkpoints_v10.db"
    print(f"Database file exists before test: {os.path.exists(db_path)}")

    # Create the orchestrator graph
    print("Creating orchestrator graph...")
    graph = create_orchestrator_graph()
    print(f"✅ Graph created with checkpointer: {type(graph.checkpointer).__name__}")

    # Test basic state operations
    config = {"configurable": {"thread_id": "test_thread_1"}}

    # Get initial state (should create database)
    print("\nGetting initial state...")
    initial_state = graph.get_state(config)
    print(f"✅ Initial state retrieved: {initial_state}")

    # Check if database was created
    print(f"Database file exists after state access: {os.path.exists(db_path)}")

    if os.path.exists(db_path):
        db_size = os.path.getsize(db_path)
        print(f"✅ Database created successfully! Size: {db_size} bytes")

        # Test storing some state
        print("\nTesting state storage...")
        test_input = {
            "project_id": "test_project",
            "document_ids": None,
            "txt_project_documents": [],
            "document_metadata": [],
            "standards_from_project_documents": [],
            "wbs_structure": None,
            "mapping_content": None,
            "generated_plans": [],
            "generated_itps": [],
            "project_details": None,
            "asset_specs": [],
            "edge_specs": [],
            "error": None,
            "done": False
        }

        # This should create a checkpoint
        result = graph.invoke(test_input, config)
        print("✅ Graph invoked successfully with checkpointing")

        # Get state history
        state_history = list(graph.get_state_history(config))
        print(f"✅ State history retrieved: {len(state_history)} checkpoints")

        for i, state in enumerate(state_history):
            print(f"  Checkpoint {i}: {state.metadata.get('source', 'unknown')}")

        print("\n🎉 All checkpointing tests passed!")
        print("Your SqliteSaver is working correctly!")

    else:
        print("❌ Database file was not created")

if __name__ == "__main__":
    test_checkpointing()
