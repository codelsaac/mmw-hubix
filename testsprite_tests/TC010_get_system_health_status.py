import requests

def test_get_system_health_status():
    base_url = "http://localhost:3000"
    endpoint = "/api/health"
    url = base_url + endpoint

    headers = {
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=30)
        # Check for successful response status code 200
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        # Validate that response content is JSON and has expected keys
        data = response.json()
        assert isinstance(data, dict), "Response is not a JSON object"
        # We don't have schema details for health response, but expect at least some keys
        assert len(data) > 0, "Response JSON is empty"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_system_health_status()
