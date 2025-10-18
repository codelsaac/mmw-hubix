import requests

def test_get_all_active_categories():
    base_url = "http://localhost:3000"
    endpoint = "/api/categories"
    url = f"{base_url}{endpoint}"
    headers = {
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status 200, got {response.status_code}"

    try:
        categories = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(categories, list), "Expected response to be a list of categories"

    for category in categories:
        assert isinstance(category, dict), "Each category should be a dictionary"
        assert 'id' in category, "Category missing 'id'"
        assert 'name' in category, "Category missing 'name'"
        # Validate resource counts
        resource_count = category.get('resourceCount')
        if resource_count is None:
            resource_count = category.get('resource_count')
        assert resource_count is not None, "Category missing resource count"
        assert isinstance(resource_count, int), "Resource count should be an integer and reflect accurate count"

    # Additional validation can be added here for accuracy if data available

test_get_all_active_categories()
