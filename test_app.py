from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
try:
    response = client.post("/api/v1/chat/?user_input=test")
    print(response.json())
except Exception as e:
    import traceback
    traceback.print_exc()
