from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
import asyncio
import uuid
from graphs.orchestrator import create_orchestrator_graph
from graphs.document_extraction import create_document_extraction_graph
from graphs.project_details import create_project_details_extraction_graph
from graphs.standards_extraction import create_standards_extraction_graph
from graphs.wbs_extraction import create_wbs_extraction_graph
from graphs.plan_generation import create_plan_generation_graph
from graphs.lbs_extraction import create_lbs_extraction_graph
from graphs.itp_generation import create_itp_generation_graph

app = FastAPI()

class Thread(BaseModel):
	id: str

threads: dict[str, dict] = {}
runs: dict[str, dict] = {}
graphs = {
	"orchestrator": create_orchestrator_graph(),
	"document_extraction": create_document_extraction_graph(),
	"project_details": create_project_details_extraction_graph(),
	"standards_extraction": create_standards_extraction_graph(),
	"wbs_extraction": create_wbs_extraction_graph(),
	"plan_generation": create_plan_generation_graph(),
	"lbs_extraction": create_lbs_extraction_graph(),
	"itp_generation": create_itp_generation_graph(),
}

@app.post("/v10/threads")
async def create_thread():
	thread_id = str(uuid.uuid4())
	threads[thread_id] = {"id": thread_id}
	return {"id": thread_id}

@app.get("/v10/threads/{thread_id}")
async def get_thread(thread_id: str):
	th = threads.get(thread_id)
	if not th:
		raise HTTPException(404, "Not found")
	return th

@app.get("/v10/graphs")
async def list_graphs():
	return {"graphs": list(graphs.keys()) + ["document_extraction","project_details","standards_extraction","plan_generation","wbs_extraction","lbs_extraction","itp_generation","conformance_checker","email_ingest","approvals_engine"]}

@app.post("/v10/graphs/{graph_id}/runs")
async def start_run(graph_id: str, body: dict = None):
	run_id = str(uuid.uuid4())
	runs[run_id] = {"id": run_id, "graph_id": graph_id, "status": "running"}

	if graph_id in graphs:
		# Run actual graph
		asyncio.create_task(_run_graph(run_id, graph_id, body or {}))
	else:
		# Simulate for other graphs
		asyncio.create_task(_simulate_events(run_id, graph_id))

	return {"id": run_id, "status": "running"}

async def _run_graph(run_id: str, graph_id: str, config: dict):
	try:
		graph = graphs[graph_id]
		result = await graph.ainvoke(config)
		runs[run_id]["result"] = result
		runs[run_id]["status"] = "completed"
		runs[run_id]["last_event"] = "completed"
	except Exception as e:
		runs[run_id]["status"] = "failed"
		runs[run_id]["error"] = str(e)

async def _simulate_events(run_id: str, graph_id: str):
	stages = ["start","stage1","stage2","completed"]
	for s in stages:
		await asyncio.sleep(0.5)
		runs[run_id]["last_event"] = s
	if stages[-1] == "completed":
		runs[run_id]["status"] = "completed"

@app.get("/v10/runs/{run_id}")
async def get_run(run_id: str):
	r = runs.get(run_id)
	if not r:
		raise HTTPException(404, "Not found")
	return r

@app.get("/v10/runs/{run_id}/events")
async def stream_events(run_id: str):
	if run_id not in runs:
		raise HTTPException(404, "Not found")
	async def event_generator():
		previous = None
		while True:
			await asyncio.sleep(0.3)
			r = runs.get(run_id)
			if not r:
				break
			le = r.get("last_event")
			if le and le != previous:
				data = {
					"run_id": run_id,
					"stage": le,
					"graph_id": r.get("graph_id"),
					"status": r.get("status")
				}
				if r.get("result"):
					data["result"] = r["result"]
				if r.get("error"):
					data["error"] = r["error"]
				yield f"event: message\ndata: {data}\n\n"
				previous = le
			if r.get("status") == "completed" and le == "completed":
				yield f"event: end\ndata: {{\"run_id\": \"{run_id}\", \"status\": \"completed\"}}\n\n"
				break
			if r.get("status") == "failed":
				yield f"event: error\ndata: {{\"run_id\": \"{run_id}\", \"error\": \"{r.get('error', 'Unknown error')}\"}}\n\n"
				break
	return StreamingResponse(event_generator(), media_type="text/event-stream")
