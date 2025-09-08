## Invoke and test a graph (API quick reference)

1) Create a thread
```bash
curl -sS -X POST http://localhost:2024/threads \
  -H 'Content-Type: application/json' \
  -d '{"metadata":{"project_id":"<PROJECT_ID>","workflow_type":"<graph_name>"}}'
```

2) Start a run on that thread
- Pass `assistant_id` equal to the graph name registered in `langgraph.json` (the server resolves it to the UUID).
```bash
curl -sS -X POST http://localhost:2024/threads/<THREAD_ID>/runs \
  -H 'Content-Type: application/json' \
  -d '{"assistant_id":"<graph_name>","input":{"project_id":"<PROJECT_ID>"}}'
```

3) Stream progress (SSE)
```bash
curl -N -H 'Accept: text/event-stream' \
  http://localhost:2024/threads/<THREAD_ID>/runs/<RUN_ID>/stream
```

4) Inspect checkpointed state (with subgraphs)
```bash
curl -sS http://localhost:2024/threads/<THREAD_ID>/state?subgraphs=true
```

To include subgraph states in the response:
```bash
curl -sS "http://localhost:2024/threads/<THREAD_ID>/state?subgraphs=true"
```

Notes
- Graph names come from `services/langgraphv10/langgraph.json` under the `graphs` section.
- Subgraphs should be compiled with `checkpointer=True` to inherit the parent graph’s checkpointer and persist subgraph state across runs.

### Example using sample IDs (orchestrator)

Project ID: `c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f`

Document ID: `136737b4-f86a-4445-920e-34bf30a36cb8`

1) Create a thread
```bash
curl -sS -X POST http://localhost:2024/threads \
  -H 'Content-Type: application/json' \
  -d '{"metadata":{"project_id":"c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f","workflow_type":"orchestrator"}}'
```

2) Start a run on that thread
```bash
curl -sS -X POST http://localhost:2024/threads/<THREAD_ID>/runs \
  -H 'Content-Type: application/json' \
  -d '{"assistant_id":"orchestrator","input":{"project_id":"c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f","document_ids":["136737b4-f86a-4445-920e-34bf30a36cb8"]}}'
```

3) Stream progress
```bash
curl -N -H 'Accept: text/event-stream' \
  http://localhost:2024/threads/<THREAD_ID>/runs/<RUN_ID>/stream
```