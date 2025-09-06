from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional
import asyncio

class ConformanceState(TypedDict):
    project_id: str
    asset_ids: list[str]
    rules: list[dict]
    violations: list[dict]
    notifications: list[dict]
    status: str

async def check_conformance_rules(state: ConformanceState) -> ConformanceState:
    """Check assets against compliance rules"""
    violations = []
    notifications = []

    # Placeholder implementation
    for asset_id in state['asset_ids']:
        # Simulate rule checking
        if len(state.get('rules', [])) > 0:
            violations.append({
                'asset_id': asset_id,
                'rule': 'sample_rule',
                'severity': 'warning',
                'message': 'Sample conformance violation'
            })

    return {
        **state,
        'violations': violations,
        'notifications': notifications,
        'status': 'checked'
    }

async def generate_notifications(state: ConformanceState) -> ConformanceState:
    """Generate notifications for violations"""
    notifications = state.get('notifications', [])

    for violation in state.get('violations', []):
        notifications.append({
            'type': 'conformance_violation',
            'asset_id': violation['asset_id'],
            'message': f"Conformance violation: {violation['message']}",
            'severity': violation['severity']
        })

    return {
        **state,
        'notifications': notifications,
        'status': 'notifications_generated'
    }

def create_conformance_checker_graph():
    workflow = StateGraph(ConformanceState)

    workflow.add_node("check_rules", check_conformance_rules)
    workflow.add_node("generate_notifications", generate_notifications)

    workflow.set_entry_point("check_rules")
    workflow.add_edge("check_rules", "generate_notifications")
    workflow.add_edge("generate_notifications", END)

    return workflow.compile()
