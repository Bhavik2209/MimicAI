# Claude Instructions — Mimic AI Backend

## Project Overview
This is a FastAPI backend that uses LangGraph and LangChain to build
an AI-powered persona research and chat platform.
Users research real-world entities (people, organizations), the system
collects data via agents, processes it into a vector store, and enables
chat with an AI persona of that entity.

---

## Tech Stack
- Python 3.11
- FastAPI — HTTP layer only, no business logic in routers
- LangGraph — orchestrates all multi-step agent pipelines
- LangChain — LLM calls, prompt templates, embeddings, text splitters
- NeonDB -  PostgreSQL
- Qdrant — vector store for embeddings
- uv — package manager (never suggest pip install)

---

## Project Structure Rules

### Module Layout
Every module under `app/modules/` follows this pattern:
- `router.py` — FastAPI routes only, no logic
- `service.py` — business logic, called by router
- `schemas.py` — Pydantic input/output models
- `graph.py` — LangGraph StateGraph definition (if module has a pipeline)
- `agents/` — individual LangGraph nodes, one per file

### Strict Separation
- Routers NEVER import from other routers
- Routers ONLY call service functions
- Services call repos for DB operations
- Services call graph/agent functions for AI operations
- Agents do one thing only — they are single-responsibility LangGraph nodes

---

## LangGraph Rules
- Every pipeline is defined in a `graph.py` file inside its module
- State is always a `TypedDict` defined at the top of `graph.py`
- Every node is an `async` function that takes state and returns updated state
- Nodes live in `agents/` folder — import them into `graph.py`
- Always use `ainvoke` for async graph execution
- Graph is compiled once at module level: `graph = build_graph()`
- Never put LLM calls directly in `graph.py` — delegate to agent files

---

## LangChain Rules
- LLM client is shared — always import from `app/utils/llm_client.py`
- Embeddings client is shared — always import from `app/utils/embeddings_client.py`
- Always use `PromptTemplate.from_template()` for prompts
- Always use LCEL pipe syntax: `chain = prompt | llm`
- Always use `ainvoke` not `invoke` — this is an async codebase
- Never hardcode model names — use `settings.OPENAI_MODEL`

---

## Database Rules
- All DB models live in `app/db/models/`
- All DB queries live in `app/repos/` — never write raw queries in services
- Always use async SQLAlchemy sessions
- Session is injected via `Depends(get_db)` in routers
- Pass `db: AsyncSession` down to service and repo functions

---

## Async Rules
- Every function that touches DB, LLM, or external API must be `async def`
- Never use `asyncio.run()` inside FastAPI — only inside Celery tasks
- Use `asyncio.gather()` when running multiple agents in parallel

---

## API Design Rules
- Routers return Pydantic schema objects, never raw dicts or ORM objects
- Use `status_code=201` for POST create routes
- Use `status_code=202` for async trigger routes (like starting research)
- Use `status_code=204` for DELETE routes
- Raise `NotFoundError` from `app/core/exceptions.py` — never HTTPException directly in services

---

## Environment & Config
- All config comes from `app/core/settings.py` via the `settings` object
- Never hardcode secrets, URLs, or model names anywhere
- Use `settings.X` not `os.environ.get("X")`
- Package management is uv — if suggesting installs, use `uv add <package>`

---

## Code Style
- All files use Python 3.11+ type hints
- Use `X | None` not `Optional[X]`
- Use `list[X]` not `List[X]`
- Use `dict[str, Any]` not `Dict`
- Prefer dataclasses or TypedDict for internal state, Pydantic only for API boundaries
- Every file must have a top docstring explaining its purpose

---

## What NOT to Do
- Do not add authentication/middleware unless explicitly asked
- Do not create new files outside the existing structure without asking
- Do not change the folder structure
- Do not use `requests` library — use `httpx` for all HTTP calls
- Do not use synchronous SQLAlchemy — always async
- Do not write business logic inside router functions
- Do not use `print()` — use the logger from `app/core/logging.py`