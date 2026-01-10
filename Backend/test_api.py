"""
Simple test script to verify the API is working
"""
import asyncio
import httpx
import uvicorn
import threading
import time
from app.main import app


def run_server():
    """Run the FastAPI server in a separate thread for testing"""
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")


async def test_api():
    """Test the API endpoints"""
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        # Test health endpoint
        response = await client.get("/health")
        print(f"Health check: {response.status_code}, {response.json()}")

        # Test root endpoint
        response = await client.get("/")
        print(f"Root endpoint: {response.status_code}, {response.json()}")


if __name__ == "__main__":
    # Start server in background thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    # Give server time to start
    time.sleep(2)

    # Run tests
    asyncio.run(test_api())

    print("API is running and accessible!")