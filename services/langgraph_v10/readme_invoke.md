## Invoke and test a graph (API quick reference)

### Server lifecycle

- Start the server (from repo root):
```bash
bash start-langgraph.sh
```

- Stop/close the server:
  - Press Ctrl+C in the terminal running the server
  - Or free the port if needed:
```bash
fuser -k 2024/tcp || lsof -i :2024 | awk 'NR>1 {print $2}' | xargs -r kill -9
```

### How errors are propagated to the API

- Subgraphs set `error` (and subgraph-specific error details) in their state instead of raising.
- Subgraphs are compiled with `checkpointer=True` so their state is persisted and visible via the thread state API.
- The orchestrator collects/propagates errors; the top-level `values.error` contains the rolled-up error message.
- When calling the thread state with `?subgraphs=true`, each subgraph appears in `tasks[]` and may include its own `error` and `state.values`.

Example (pretty-printed excerpt):
```json
{
  "values": {
    "error": "Project Details extraction requires extracted document content; none available",
    "done": true
  },
  "tasks": [
    {
      "name": "document_extraction",
      "state": {
        "values": {
          "failed_documents": [
            { "file_name": "sample_document.pdf", "error": "... InvalidContent ..." }
          ]
        }
      }
    }
  ]
}
```

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

Optional: quickly view only errors
```bash
curl -sS "http://localhost:2024/threads/<THREAD_ID>/state?subgraphs=true" | \
  jq '{top_error: .values.error, subgraph_errors: [.tasks[]? | {name, error}]}'
```

### View subgraph state

To inspect the state of individual subgraphs within a thread:

1. **Get current thread state with all subgraphs**:
```bash
curl -sS "http://localhost:2024/threads/<THREAD_ID>/state?subgraphs=true"
```

2. **Get specific subgraph state by checkpoint namespace**:
```bash
curl -sS "http://localhost:2024/threads/<THREAD_ID>/state/checkpoint" \
  -H 'Content-Type: application/json' \
  -d '{"checkpoint": {"thread_id": "<THREAD_ID>", "checkpoint_ns": "<subgraph_name>:<subgraph_id>"}}'
```

3. **View thread history to find subgraph executions**:
```bash
curl -sS "http://localhost:2024/threads/<THREAD_ID>/history"
```

4. **Find all subgraph names that have run in a thread**:
```bash
curl -sS "http://localhost:2024/threads/<THREAD_ID>/history?limit=20" | \
  jq '.[].tasks[]?.name' | sort | uniq
```

5. **Filter history for specific subgraph states**:
```bash
curl -sS "http://localhost:2024/threads/<THREAD_ID>/history?limit=20" | \
  jq '.[] | select(.tasks[]?.name == "<subgraph_name>") | {created_at, tasks: [.tasks[]? | select(.name == "<subgraph_name>")]}'
```

**Note**: Subgraph state can only be viewed when the subgraph is interrupted. Once you resume the graph, you won't be able to access the subgraph state.

Notes
- Graph names come from `services/langgraphv10/langgraph.json` under the `graphs` section.
- Subgraphs should be compiled with `checkpointer=True` to inherit the parent graph’s checkpointer and persist subgraph state across runs.

### API docs
- Local OpenAPI docs: `http://localhost:2024/docs`

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