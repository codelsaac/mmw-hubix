import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
AUTH = HTTPBasicAuth("admin", "admin123")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_send_message_to_ai_assistant():
    url = f"{BASE_URL}/api/chat"

    # Valid payload for success case
    valid_payload = {
        "messages": [
            {
                "role": "user",
                "content": "Hello, how can you assist me today?"
            }
        ]
    }

    # Invalid payload for 400 case (missing 'messages' array)
    invalid_payload = {
        "msg": "This is an invalid format"
    }

    # Test success response 200
    try:
        response = requests.post(url, json=valid_payload, auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 200 or response.status_code == 503, f"Expected status 200 or 503, got {response.status_code}"
        if response.status_code == 200:
            # Validate response json structure loosely (AI response expected)
            json_data = response.json()
            assert isinstance(json_data, dict), "Response is not a JSON object"
            # We expect some content in response, e.g., an AI-generated message
            # At minimum, ensure keys exist or content type is appropriate
            # Since schema not fully defined for response, check presence of keys or string response
            assert "response" in json_data or len(json_data) > 0, "AI response content missing"
        elif response.status_code == 503:
            # AI service not configured - valid error scenario
            json_data = response.json()
            assert isinstance(json_data, dict), "503 response is not JSON"
            # A message or error field might be present
            assert "message" in json_data or "error" in json_data, "503 response missing message or error field"
    except Exception as e:
        raise AssertionError(f"Error on valid message test: {e}")

    # Test invalid payload returns 400
    try:
        response = requests.post(url, json=invalid_payload, auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 400, f"Expected status 400 for invalid payload, got {response.status_code}"
    except Exception as e:
        raise AssertionError(f"Error on invalid message format test: {e}")

test_send_message_to_ai_assistant()