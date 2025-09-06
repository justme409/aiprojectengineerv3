from langgraph.graph import Graph

def create_plan_generation_graph():
    g = Graph()
    async def run(config):
        return {"plan_html": "<div>Plan TBD</div>", "edges": []}
    g.add_node("run", run)
    g.set_entry_point("run")
    return g


