from langgraph.graph import Graph

def create_itp_generation_graph():
    g = Graph()
    async def run(config):
        return {"generated_itps": [], "edges": []}
    g.add_node("run", run)
    g.set_entry_point("run")
    return g


