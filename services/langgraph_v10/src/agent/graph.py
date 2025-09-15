"""
Default agent graph for LangGraph server.

This serves as the default graph when no specific graph is requested.
"""

from agent.graphs.orchestrator import create_orchestrator_graph

# Create and export the default graph
graph = create_orchestrator_graph()
