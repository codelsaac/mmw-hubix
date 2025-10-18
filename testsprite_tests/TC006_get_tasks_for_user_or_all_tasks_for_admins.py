import requests

BASE_URL = "http://localhost:3000"
TASKS_ENDPOINT = "/api/dashboard/tasks"
TIMEOUT = 30

# Simulated bearer token for testing (should be replaced with real token acquisition in real test)
BEARER_TOKEN = "valid_token_example"

def test_get_tasks_for_user_or_admin():
    headers = {
        "Accept": "application/json",
    }

    # 1) Test unauthorized access returns 401
    try:
        response_unauth = requests.get(
            BASE_URL + TASKS_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )
        assert response_unauth.status_code == 401, (
            f"Expected status 401 for unauthorized access, got {response_unauth.status_code}"
        )
    except requests.RequestException as e:
        assert False, f"Request exception during unauthorized access test: {e}"

    # 2) Test authorized admin user gets status 200 and tasks list
    auth_headers = headers.copy()
    auth_headers["Authorization"] = f"Bearer {BEARER_TOKEN}"

    try:
        response_auth = requests.get(
            BASE_URL + TASKS_ENDPOINT,
            headers=auth_headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request exception during authorized access test: {e}"

    assert response_auth.status_code == 200, (
        f"Expected status 200 for authorized admin access, got {response_auth.status_code}"
    )

    try:
        tasks_data = response_auth.json()
    except ValueError:
        assert False, "Response for authorized admin access is not valid JSON"

    assert isinstance(tasks_data, (list, dict)), (
        "Response JSON should be a list or a dictionary representing tasks"
    )

    if isinstance(tasks_data, list) and len(tasks_data) > 0:
        sample_task = tasks_data[0]
        assert isinstance(sample_task, dict), "Each task item should be a dictionary"
        expected_keys = {"id", "title", "description", "assignedTo", "priority", "status"}
        assert expected_keys.intersection(sample_task.keys()), (
            "Task object missing expected keys, got keys: " + ", ".join(sample_task.keys())
        )

test_get_tasks_for_user_or_admin()