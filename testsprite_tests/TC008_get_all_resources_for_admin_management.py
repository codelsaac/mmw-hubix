import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
ADMIN_RESOURCES_ENDPOINT = "/api/admin/resources"
TIMEOUT = 30

USERNAME = "admin"
PASSWORD = "admin123"


def test_get_all_resources_for_admin_management():
    # Test unauthorized access (no auth)
    try:
        response_unauth = requests.get(
            f"{BASE_URL}{ADMIN_RESOURCES_ENDPOINT}",
            timeout=TIMEOUT
        )
        assert response_unauth.status_code == 401, (
            f"Expected status 401 for unauthorized access, got {response_unauth.status_code}"
        )
    except requests.RequestException as e:
        assert False, f"Request failed during unauthorized access test: {e}"

    # Test authorized access (basic auth)
    try:
        response_auth = requests.get(
            f"{BASE_URL}{ADMIN_RESOURCES_ENDPOINT}",
            auth=HTTPBasicAuth(USERNAME, PASSWORD),
            timeout=TIMEOUT
        )
        assert response_auth.status_code == 200, (
            f"Expected status 200 for authorized access, got {response_auth.status_code}"
        )
        # Further validate that response content is a list (likely JSON array)
        data = response_auth.json()
        assert isinstance(data, list), f"Response JSON is not a list, got {type(data)}"
    except requests.RequestException as e:
        assert False, f"Request failed during authorized access test: {e}"
    except ValueError as e:
        assert False, f"Response is not valid JSON: {e}"


test_get_all_resources_for_admin_management()