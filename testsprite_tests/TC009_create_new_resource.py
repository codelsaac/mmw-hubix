import requests

BASE_URL = "http://localhost:3000"
ADMIN_RESOURCES_ENDPOINT = f"{BASE_URL}/api/admin/resources"
TIMEOUT = 30

# Use a placeholder bearer token for the admin user
BEARER_TOKEN = "fake-admin-token"


def test_create_new_resource():
    # Sample payload for creating a new resource
    resource_payload = {
        "title": "Test Resource Title",
        "description": "A description for the test resource",
        "url": "https://example.com/resource",
        "categoryId": 1,
        "active": True
    }

    # Attempt to create resource without authentication - expect 403 Forbidden
    try:
        response_unauth = requests.post(
            ADMIN_RESOURCES_ENDPOINT,
            json=resource_payload,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed for unauthorized access test: {e}"
    else:
        assert response_unauth.status_code == 403, (
            f"Expected 403 Forbidden for unauthenticated request, got {response_unauth.status_code}"
        )

    # Attempt to create resource with bearer token authentication - expect 201 Created
    resource_id = None
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {BEARER_TOKEN}"
    }
    try:
        response_auth = requests.post(
            ADMIN_RESOURCES_ENDPOINT,
            json=resource_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert response_auth.status_code == 201, (
            f"Expected 201 Created for authenticated request, got {response_auth.status_code}"
        )

        # Validate response contains resource id or similar identifier
        try:
            response_data = response_auth.json()
        except ValueError:
            assert False, "Response content is not valid JSON"

        # Expecting at least an "id" field in created resource response
        assert isinstance(response_data, dict), "Response JSON is not an object"
        assert "id" in response_data, "Response JSON does not contain 'id'"

        resource_id = response_data["id"]
        assert isinstance(resource_id, (int, str)), "'id' field should be int or str"

    finally:
        # Clean up: delete the created resource if creation succeeded
        if resource_id is not None:
            delete_url = f"{ADMIN_RESOURCES_ENDPOINT}/{resource_id}"
            try:
                del_response = requests.delete(
                    delete_url,
                    headers={"Authorization": f"Bearer {BEARER_TOKEN}"},
                    timeout=TIMEOUT
                )
                # Deletion success codes can be 200 or 204
                assert del_response.status_code in (200, 204), (
                    f"Failed to delete resource with id {resource_id}, status code: {del_response.status_code}"
                )
            except requests.RequestException as e:
                assert False, f"Request failed during cleanup deletion: {e}"


test_create_new_resource()
