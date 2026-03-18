"""Local runner for the backend FastAPI app."""

import uvicorn


def main() -> None:
    """Run the API server in local development."""
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)


if __name__ == "__main__":
    main()
