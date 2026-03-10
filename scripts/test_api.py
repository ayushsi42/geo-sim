import requests
import json
import time

def test_api():
    base_url = "http://localhost:8000/api/v1"
    
    # Wait for uvicorn to start
    time.sleep(3)
    
    # Check state
    print("Fetching current state...")
    try:
        r = requests.get(f"{base_url}/state/current")
        r.raise_for_status()
        print("State fetched successfully:")
        print(json.dumps(r.json().get('summary', 'No summary'), indent=2))
    except Exception as e:
         print(f"Failed to fetch state: {e}")

    # Run simulation
    print("\nRunning Simulation...")
    payload = {
        "action_type": "IMPOSE_TARIFFS",
        "actor": "USA",
        "target": "CHN",
        "simulation_depth": 3
    }
    
    try:
        r = requests.post(f"{base_url}/simulate/", json=payload)
        r.raise_for_status()
        data = r.json()
        print(f"Simulation Report:")
        print(f"Executive Summary: {data['executive_summary']}")
        print(f"Confidence: {data['confidence']}")
        print(f"Dominant rules: {data['dominant_rules']}")
        print(f"Path Score (most likely path steps): {len(data['most_likely_path'])}")
    except Exception as e:
        print(f"Failed to simulate: {e}")
        if hasattr(e, 'response') and e.response:
            print(e.response.text)

if __name__ == "__main__":
    test_api()
