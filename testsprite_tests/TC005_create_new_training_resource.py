import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Replace this token with a valid bearer token before running the test
BEARER_TOKEN = "example_admin_token"


def test_create_new_training_resource():
    url = f"{BASE_URL}/api/training"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {BEARER_TOKEN}"
    }

    # Sample payload for creating a new training resource
    payload = {
        "title": "Test Training Resource",
        "description": "This is a test training resource created during automated testing.",
        "category": "Testing",
        "difficulty": "Beginner",
        "content": "https://example.com/training-content",
        "format": "video"
    }

    # Test unauthorized access (no auth)
    try:
        resp_unauth = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=TIMEOUT)
        assert resp_unauth.status_code == 401, f"Expected 401 for unauthorized, got {resp_unauth.status_code}"
    except requests.RequestException as e:
        assert False, f"Unauthorized request failed: {e}"

    # Test authorized creation
    resource_id = None
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Expected 201 Created, got {resp.status_code}"
        data = resp.json()
        resource_id = data.get("id")
        assert resource_id is not None, "Response JSON does not contain 'id' of created resource"
    except requests.RequestException as e:
        assert False, f"Authorized request failed: {e}"

    finally:
        if resource_id:
            delete_url = f"{url}/{resource_id}"
            try:
                del_resp = requests.delete(delete_url, headers={"Authorization": f"Bearer {BEARER_TOKEN}"}, timeout=TIMEOUT)
                if del_resp.status_code not in (200, 204, 404):
                    print(f"Warning: Unexpected status code on delete: {del_resp.status_code}")
            except requests.RequestException:
                print("Warning: Failed to delete created training resource during cleanup.")


test_create_new_training_resource()
