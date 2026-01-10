"""
Test script to verify API operations are working correctly
"""
import requests
import json

BASE_URL = "http://localhost:8000"
USER_ID = "demo-user-123"

def test_api_operations():
    """
    Test all API operations to ensure they're working correctly
    """
    print("Testing API operations...")

    # Test 1: Get all tasks
    print("\n1. Testing GET /api/{user_id}/")
    try:
        response = requests.get(f"{BASE_URL}/api/{USER_ID}/")
        print(f"GET /api/{USER_ID}/ - Status: {response.status_code}")
        if response.status_code == 200:
            tasks = response.json()
            print(f"Found {len(tasks)} tasks")
            for task in tasks:
                print(f"  - Task ID: {task['id']}, Title: {task['title']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error making GET request: {e}")

    # Test 2: Create a new task
    print("\n2. Testing POST /api/{user_id}/")
    try:
        new_task_data = {
            "title": "Test task from API test",
            "description": "This is a test task created via API"
        }
        response = requests.post(f"{BASE_URL}/api/{USER_ID}/", json=new_task_data)
        print(f"POST /api/{USER_ID}/ - Status: {response.status_code}")
        if response.status_code == 201:
            created_task = response.json()
            print(f"Created task ID: {created_task['id']}, Title: {created_task['title']}")
            test_task_id = created_task['id']

            # Test 3: Get specific task
            print(f"\n3. Testing GET /api/{USER_ID}/{test_task_id}")
            try:
                response = requests.get(f"{BASE_URL}/api/{USER_ID}/{test_task_id}")
                print(f"GET /api/{USER_ID}/{test_task_id} - Status: {response.status_code}")
                if response.status_code == 200:
                    task = response.json()
                    print(f"Retrieved task: {task['title']}")

                    # Test 4: Update the task
                    print(f"\n4. Testing PUT /api/{USER_ID}/{test_task_id}")
                    update_data = {
                        "title": "Updated test task",
                        "description": "This task has been updated",
                        "completed": True
                    }
                    response = requests.put(f"{BASE_URL}/api/{USER_ID}/{test_task_id}", json=update_data)
                    print(f"PUT /api/{USER_ID}/{test_task_id} - Status: {response.status_code}")
                    if response.status_code == 200:
                        updated_task = response.json()
                        print(f"Updated task: {updated_task['title']}, Completed: {updated_task['completed']}")

                        # Test 5: Delete the task
                        print(f"\n5. Testing DELETE /api/{USER_ID}/{test_task_id}")
                        response = requests.delete(f"{BASE_URL}/api/{USER_ID}/{test_task_id}")
                        print(f"DELETE /api/{USER_ID}/{test_task_id} - Status: {response.status_code}")
                        if response.status_code == 204:
                            print("Task deleted successfully")
                        else:
                            print(f"Failed to delete task: {response.text}")
                    else:
                        print(f"Failed to update task: {response.text}")
                else:
                    print(f"Failed to get task: {response.text}")
            except Exception as e:
                print(f"Error testing individual task: {e}")
        else:
            print(f"Failed to create task: {response.text}")
    except Exception as e:
        print(f"Error making POST request: {e}")

if __name__ == "__main__":
    test_api_operations()