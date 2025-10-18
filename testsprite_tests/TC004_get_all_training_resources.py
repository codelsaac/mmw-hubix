import requests
from requests.auth import HTTPBasicAuth

def test_get_all_training_resources():
    base_url = "http://localhost:3000"
    endpoint = f"{base_url}/api/training"
    auth = HTTPBasicAuth('admin', 'admin123')
    headers = {
        "Accept": "application/json"
    }
    timeout = 30

    try:
        response = requests.get(endpoint, headers=headers, auth=auth, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(data, list), "Response JSON is not a list of training resources"

test_get_all_training_resources()