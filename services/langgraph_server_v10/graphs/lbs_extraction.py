from langgraph.graph import Graph

def create_lbs_extraction_graph():
    g = Graph()
    async def run(config):
        return {"mapping_content": {"lot_cards": []}, "edges": []}
    g.add_node("run", run)
    g.set_entry_point("run")
    return g


