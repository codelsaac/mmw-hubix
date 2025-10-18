import requests

BASE_URL = "http://localhost:3000"
ENDPOINT = "/api/dashboard/tasks"
TIMEOUT = 30

# Replace this with a valid JWT or bearer token for the authorized user
BEARER_TOKEN = "your_valid_bearer_token_here"


def test_create_new_task():
    # Payload for creating a new task - example minimal valid payload
    new_task_payload = {
        "title": "Test Task Title",
        "description": "This is a test task created during automated testing.",
        "priority": "medium",
        "assignee": "admin"
    }

    # Headers for unauthorized request
    headers_unauth = {
        "Content-Type": "application/json"
    }

    # Headers for authorized request with Bearer token
    headers_auth = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {BEARER_TOKEN}"
    }

    # First test unauthorized access (no auth)
    try:
        response_unauth = requests.post(
            f"{BASE_URL}{ENDPOINT}",
            json=new_task_payload,
            headers=headers_unauth,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Unauthorized request failed with exception: {e}"
    assert response_unauth.status_code == 401, f"Expected 401 Unauthorized, got {response_unauth.status_code}"

    # Then test authorized access to create a new task
    try:
        response_auth = requests.post(
            f"{BASE_URL}{ENDPOINT}",
            json=new_task_payload,
            headers=headers_auth,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Authorized request failed with exception: {e}"

    assert response_auth.status_code == 201, f"Expected 201 Created, got {response_auth.status_code}"
    created_task = response_auth.json()
    assert "id" in created_task and isinstance(created_task["id"], (int, str)), "Created task ID is missing or invalid"
    assert created_task.get("title") == new_task_payload["title"], "Task title does not match"
    assert created_task.get("description") == new_task_payload["description"], "Task description does not match"
    assert created_task.get("priority") == new_task_payload["priority"], "Task priority does not match"
    assert created_task.get("assignee") == new_task_payload["assignee"], "Task assignee does not match"

    # Cleanup - delete the created task if ID is available
    task_id = created_task.get("id")
    if task_id:
        try:
            delete_response = requests.delete(
                f"{BASE_URL}{ENDPOINT}/{task_id}",
                headers={"Authorization": f"Bearer {BEARER_TOKEN}"},
                timeout=TIMEOUT
            )
            # Allow 200 or 204 on delete success
            assert delete_response.status_code in [200, 204], f"Failed to delete test task, status code: {delete_response.status_code}"
        except requests.RequestException as e:
            # Log error but do not fail test for cleanup failure
            print(f"Warning: Failed to delete test task with id {task_id}. Exception: {e}")


test_create_new_task()
