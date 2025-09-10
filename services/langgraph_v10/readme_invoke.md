## Invoke and test a graph (API quick reference)

### Quick server health check and restart

1) Test if the server is up:
```bash
curl -v http://localhost:2024/ok
```

2) If NOT up, stop any hung process on port 2024 and start the server:
```bash
fuser -k 2024/tcp || lsof -i :2024 | awk 'NR>1 {print $2}' | xargs -r kill -9
/app/aiprojectengineerv3/start-langgraph.sh
```

3) Verify server is ready:
```bash
curl -v http://localhost:2024/ok
```

### Server lifecycle

- Start the server (from repo root):
```bash
/app/aiprojectengineerv3/start-langgraph.sh
```

- Stop/close the server:
  - Press Ctrl+C in the terminal running the server
  - Or free the port if needed:
```bash
fuser -k 2024/tcp || lsof -i :2024 | awk 'NR>1 {print $2}' | xargs -r kill -9
```

### Subgraph checkpoints and error inspection

- Subgraphs are compiled with `checkpointer=True` so their state is persisted and visible via the thread state API.
- Document Extraction interrupts at the END of the subgraph (after creating assets), so its final state is checkpointed and viewable.
- We do not propagate Document Extraction errors to the orchestrator; inspect them via the subgraph checkpoint state instead.
- When calling the thread state with `?subgraphs=true`, each subgraph appears in `tasks[]` and includes `state.values` for inspection while interrupted.

Example (pretty-printed excerpt):
```json
{
  "values": {
    "error": null,
    "done": true,
    "extraction_summary": { "successful_api_calls": 1, "successful_with_content": 1, "successful_with_no_content": 0, "failed_api_calls": 0 }
  },
  "tasks": [
    {
      "name": "document_extraction",
      "state": {
        "values": {
          "failed_documents": [],
          "extraction_meta": [
            { "document_id": "...", "file_name": "sample.pdf", "status": "success", "content_length": 15342, "azure_meta": { "api_version": "2024-11-30", "pages_count": 3 } }
          ]
        }
      }
    }
  ]
}
```

### MANDATORY: Log check gate before any resume

Before running any resume command while a run is interrupted (including built-in subgraph pauses), you must verify the server logs are clean. Do not resume until these checks pass.

1) Quick error scan (mandatory)
```bash
grep -E "ERROR|Exception|Traceback" /app/aiprojectengineerv3/langgraph_server.last10k.log | tail -n 50
```

2) Read recent log lines around the interrupt (recommended)
```bash
tail -n 200 /app/aiprojectengineerv3/langgraph_server.last10k.log
```

Hard gate (must be true before resuming):
- No errors found in the scan above (no lines matching ERROR, Exception, or Traceback)
- Top-level `.values.error` is null/empty
- Interrupted subgraph task shows `error == null` and expected `state.values` outputs

If any condition fails, STOP and fix first (adjust inputs/config, update state via `POST /threads/<THREAD_ID>/state`, or rerun upstream steps). Only then proceed to resume.

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

#### Stream-level errors (SSE)
Errors can surface immediately in the stream as SSE error events (useful for real-time validation/runtime failures). Example:
```text
event: error
data: {"error":"ValidationError","message":"1 validation error for ExtractionState ..."}
```
Tip: use the stream for immediate errors; use the state endpoints below to inspect persisted (checkpointed) errors and interrupts.

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

### View Document Extraction subgraph state (interrupted)

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

6. **Resume the interrupted subgraph** (to continue from the pause and proceed to `project_details`):
- Do not run this until the MANDATORY log check gate above has fully passed.
```bash
curl -sS -X POST "http://localhost:2024/threads/<THREAD_ID>/runs" \
  -H 'Content-Type: application/json' \
  -d '{
        "assistant_id": "orchestrator",
        "command": { "resume": "continue" }
      }'
```

Notes:
- While interrupted, `GET /threads/<THREAD_ID>/state?subgraphs=true` will include a task with `name: "document_extraction"` and its `state.values`.
- To fetch a specific subgraph checkpoint state by namespace, use the POST variant shown above and set `checkpoint_ns` to the subgraph namespace from history. The namespace is typically `<parent_node_name>:<subgraph_internal_id>`.

Notes
- Graph names come from `services/langgraph_v10/langgraph.json` under the `graphs` section.
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

2) Start a run on that thread (it will pause after Document Extraction):
```bash
curl -sS -X POST http://localhost:2024/threads/<THREAD_ID>/runs \
  -H 'Content-Type: application/json' \
  -d '{"assistant_id":"orchestrator","input":{"project_id":"c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f","document_ids":["136737b4-f86a-4445-920e-34bf30a36cb8"]}}'
```

3) Stream progress (you will see an interrupt after document extraction):
4) While interrupted, view the Document Extraction subgraph state quickly:
```bash
curl -sS "http://localhost:2024/threads/<THREAD_ID>/state?subgraphs=true" | \
  jq '{
        top_error: .values.error,
        doc_extract: (.tasks[]? | select(.name=="document_extraction") | {checkpoint: .checkpoint, values: .state.values, extraction_summary: .state.values.extraction_summary})
      }'
```

5) Resume to continue the flow to Project Details:
```bash
curl -sS -X POST http://localhost:2024/threads/<THREAD_ID>/runs \
  -H 'Content-Type: application/json' \
  -d '{"assistant_id":"orchestrator","command": {"resume": "continue"}}'
```
```bash
curl -N -H 'Accept: text/event-stream' \
  http://localhost:2024/threads/<THREAD_ID>/runs/<RUN_ID>/stream
```

### Universal workflow: create, inspect orchestrator and subgraph checkpoints, resume

1) Create a thread (orchestrator)
```bash
curl -sS -X POST http://localhost:2024/threads \
  -H 'Content-Type: application/json' \
  -d '{"metadata":{"project_id":"<PROJECT_ID>","workflow_type":"orchestrator"}}'
```

2) Start a run (this will pause after Document Extraction due to an interrupt)
```bash
curl -sS -X POST http://localhost:2024/threads/<THREAD_ID>/runs \
  -H 'Content-Type: application/json' \
  -d '{"assistant_id":"orchestrator","input":{"project_id":"<PROJECT_ID>","document_ids":["<DOC_ID>"]}}'
```

3) View the latest orchestrator state (top-level, without subgraphs)
```bash
curl -sS http://localhost:2024/threads/<THREAD_ID>/state
```

4) While interrupted, view all subgraph states currently available
```bash
curl -sS "http://localhost:2024/threads/<THREAD_ID>/state?subgraphs=true"
```

5) Quickly extract only the specified subgraph’s checkpoint and values (replace <SUBGRAPH_NAME>)
```bash
curl -sS "http://localhost:2024/threads/<THREAD_ID>/state?subgraphs=true" | \
  jq '{
        top_error: .values.error,
        subgraph: (.tasks[]? | select(.name=="<SUBGRAPH_NAME>") | {checkpoint: .checkpoint, values: .state.values})
      }'
```

6) List all subgraph executions and their checkpoint namespaces from recent history
```bash
curl -sS "http://localhost:2024/threads/<THREAD_ID>/history?limit=50" | \
  jq '.[] | .tasks[]? | {name, checkpoint: .checkpoint}'
```

7) Get the subgraph checkpoint namespace from history (unique list)
```bash
curl -sS "http://localhost:2024/threads/<THREAD_ID>/history?limit=50" | \
  jq '.[].tasks[]? | .checkpoint.checkpoint_ns' | sort | uniq
```

8) Fetch state for a specific subgraph checkpoint namespace
```bash
curl -sS "http://localhost:2024/threads/<THREAD_ID>/state/checkpoint?subgraphs=true" \
  -H 'Content-Type: application/json' \
  -d '{
        "checkpoint": {"thread_id": "<THREAD_ID>", "checkpoint_ns": "<SUBGRAPH_NAMESPACE>"}
      }'
```

9) Resume after inspection (continues to Project Details)
```bash
curl -sS -X POST "http://localhost:2024/threads/<THREAD_ID>/runs" \
  -H 'Content-Type: application/json' \
  -d '{"assistant_id":"orchestrator","command": {"resume": "continue"}}'
```

Notes
- Subgraph state is only visible while that subgraph is interrupted. For non-interrupted subgraphs, `tasks[]` may not include their nested `state`.
- The top-level orchestrator state is always available via `GET /threads/<THREAD_ID>/state`.

Knowledge graph reference
- The contract and required fields for assets/edges live at `/app/aiprojectengineerv3/.cursor/rules/knowledge-graph.mdc`. Consult it when validating outputs.

End-to-end QA cadence (with interrupts)
1) Run the thread (sample IDs below)
2) Poll `GET /threads/<THREAD_ID>/state?subgraphs=true` until you see a subgraph task with `interrupts`.
3) At every interrupt, check the server log for backend errors before proceeding. The log file is trimmed to the last 10,000 characters.
```bash
# Full current log (trimmed to last 10,000 characters by start-langgraph.sh)
cat /app/aiprojectengineerv3/langgraph_server.last10k.log
you must check these at every interupt

ATTENTION THE ABOVE LOGS '/app/aiprojectengineerv3/langgraph_server.last10k.log' ARE THE SINGLE MOST IMPORTANT BIT OF INFORMATION FOR DEBUGGIG THEY ARE ALWAYS UP TO DATE WITH THE LATEST SSE EVENTS AND THEY SIMPLY MUST BE CONSULED REGULARLY. IT SHOULD BE IMEDIATE, REALLY IT SHOULD BE AFTER EVERY SINGLE CALL IT SHOULD CHECK THE LOGS BECAUSE IT THERE IS AN ERROR IT WILL SHOW UP THERE. THEY ARE CRITICAL INFORMATION AND YOU MUST CHECK THE REPENATEDLY. WHEN YOU CHECK YOU MUST NOT FILTER, OF REDUCE THE SIZE, CHECK THE FULL THING IT IS ALREADY CUT TO SIZE DO NOT USE GREP


# Quickly scan for errors/exceptions
grep -E "ERROR|Exception|Traceback" /app/aiprojectengineerv3/langgraph_server.last10k.log | tail -n 50

# Optional: follow recent lines live while resuming
tail -n 200 -f /app/aiprojectengineerv3/langgraph_server.last10k.log
```
4) From that response while interrupted, read subgraph values under `tasks[][].state.values`.
   - Alternatively, capture `tasks[][].checkpoint.checkpoint_ns` and fetch via `POST /threads/<THREAD_ID>/state/checkpoint?subgraphs=true` if you prefer explicit checkpoint queries.
5) If updates are needed, apply them via `POST /threads/<THREAD_ID>/state` with `{ values, as_node }`, or fork via `.../state/checkpoint` POST.
6) If no changes required, resume:
```bash
curl -sS -X POST "http://localhost:2024/threads/<THREAD_ID>/runs" \
  -H 'Content-Type: application/json' \
  -d '{"assistant_id":"orchestrator","command": {"resume": "continue"}}'
```
7) Repeat steps 2–6 for each subsequent interrupt until the run completes.

Fail fast (do not continue on errors)
- Before resuming, ensure no errors are present:
  - Top-level: `.values.error` must be null/empty.
  - Subgraphs (while interrupted): in `tasks[]` the matching subgraph should have `error == null` and its `state.values` should contain expected outputs. For Document Extraction specifically, the run will set `failed: true` and `error` when there are ZERO successful responses from Azure Document Intelligence. Empty textual content still counts as a success if the API call succeeded; use `extraction_summary` and `extraction_meta[].content_length` to inspect.
- If any error or missing required data is detected, STOP and fix first (update state via `POST /threads/<THREAD_ID>/state`, correct inputs/config, or rerun upstream steps). Only then resume.

Tip: To pause after every node for deep QA without code edits, you can create runs with API-level interrupts:
```bash
curl -sS -X POST http://localhost:2024/threads/<THREAD_ID>/runs \
  -H 'Content-Type: application/json' \
  -d '{
        "assistant_id":"orchestrator",
        "input": {"project_id":"<PROJECT_ID>","document_ids":["<DOC_ID>"]},
        "interrupt_after": "*"
      }'
```
This repository also includes built-in pauses in subgraphs: `document_extraction`, `project_details`, `standards_extraction`, and `plan_generation` interrupt for inspection near their output assembly. All subgraphs compile with `checkpointer=True` so their state is persisted and queryable while interrupted.

### Project-specific quick start (this repository)

- Project ID (sample): `c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f`
- Sample Document ID: `136737b4-f86a-4445-920e-34bf30a36cb8`
- Primary graph: `orchestrator`
- Subgraphs used by orchestrator (graph names in `langgraph.json`):
  - `document_extraction` (interrupts for inspection after creating assets)
  - `project_details`
  - `standards_extraction`
  - `plan_generation`
  - `wbs_extraction`
  - `lbs_extraction`
  - `itp_generation`

Run with sample IDs
```bash
curl -sS -X POST http://localhost:2024/threads \
  -H 'Content-Type: application/json' \
  -d '{"metadata":{"project_id":"c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f","workflow_type":"orchestrator"}}'

curl -sS -X POST http://localhost:2024/threads/<THREAD_ID>/runs \
  -H 'Content-Type: application/json' \
  -d '{"assistant_id":"orchestrator","input":{"project_id":"c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f","document_ids":["136737b4-f86a-4445-920e-34bf30a36cb8"]}}'
```

Inspect orchestrator and subgraphs while interrupted
```bash
curl -sS http://localhost:2024/threads/<THREAD_ID>/state
curl -sS "http://localhost:2024/threads/<THREAD_ID>/state?subgraphs=true"
```

List all subgraph checkpoint namespaces and fetch any specific subgraph state
```bash
curl -sS "http://localhost:2024/threads/<THREAD_ID>/history?limit=50" | \
  jq '.[].tasks[]? | {name, checkpoint: .checkpoint}'

curl -sS "http://localhost:2024/threads/<THREAD_ID>/state/checkpoint?subgraphs=true" \
  -H 'Content-Type: application/json' \
  -d '{"checkpoint": {"thread_id": "<THREAD_ID>", "checkpoint_ns": "<SUBGRAPH_NAMESPACE>"}}'
```

Resume after inspection
```bash
curl -sS -X POST "http://localhost:2024/threads/<THREAD_ID>/runs" \
  -H 'Content-Type: application/json' \
  -d '{"assistant_id":"orchestrator","command": {"resume": "continue"}}'
```