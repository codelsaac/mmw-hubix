import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
AUTH = HTTPBasicAuth("admin", "admin123")
TIMEOUT = 30

def test_get_all_active_resources():
    url = f"{BASE_URL}/api/resources"
    headers = {
        "Accept": "application/json"
    }
    params_list = [
        {},  # no filter or pagination
        {"category": "education"},
        {"page": "1", "limit": "5"},
        {"category": "library", "page": "2", "limit": "3"}
    ]
    for params in params_list:
        response = requests.get(url, headers=headers, auth=AUTH, params=params, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200, got {response.status_code} for params {params}"
        json_data = response.json()
        assert isinstance(json_data, list), f"Response data is not a list for params {params}"
        # Validate each resource has expected fields including category info
        for resource in json_data:
            assert isinstance(resource, dict), "Resource item is not an object"
            # Required fields (example, as typical for resource with category)
            assert "id" in resource, "Resource missing 'id' field"
            assert "name" in resource, "Resource missing 'name' field"
            assert "active" in resource, "Resource missing 'active' field"
            assert resource["active"] is True, "Resource 'active' field is not True"
            assert "category" in resource, "Resource missing 'category' field"
            category = resource["category"]
            assert isinstance(category, dict), "'category' field is not an object"
            assert "id" in category, "Category missing 'id' field"
            assert "name" in category, "Category missing 'name' field"
            # Optionally check category fields type
            assert isinstance(category["id"], (int, str)), "Category 'id' is not int or str"
            assert isinstance(category["name"], str), "Category 'name' is not str"

test_get_all_active_resources()