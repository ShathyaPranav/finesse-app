import requests

def test_cors():
    # Test the health check endpoint
    print("Testing CORS on /api/health:")
    try:
        response = requests.get(
            "http://localhost:8000/api/health",
            headers={"Origin": "http://localhost:3000"}
        )
        print(f"Status code: {response.status_code}")
        print("Response headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"  {header}: {value}")
        print("Response data:", response.json())
    except Exception as e:
        print(f"Error: {e}")

    # Test the lessons endpoint
    print("\nTesting CORS on /api/lessons:")
    try:
        response = requests.get(
            "http://localhost:8000/api/lessons",
            headers={"Origin": "http://localhost:3000"}
        )
        print(f"Status code: {response.status_code}")
        print("Response headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"  {header}: {value}")
        print("Response data:", response.json())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_cors()
