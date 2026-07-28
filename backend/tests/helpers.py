def seeded_login(client):
    """Log in as the first seeded user and return (headers, user_id)."""
    users = client.get("/users").json()
    assert users, "No seeded users found — has seed_data() run?"
    username = users[0]["username"]

    login = client.get("/login", params={"username": username, "password": "password"})
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    user_id = client.get("/userdata", headers=headers).json()["id"]
    return headers, user_id


def seeded_login_as(client, index: int):
    """Log in as the seeded user at the given index (for tests needing two distinct users)."""
    users = client.get("/users").json()
    assert len(users) > index, f"Not enough seeded users for index {index}"
    username = users[index]["username"]

    login = client.get("/login", params={"username": username, "password": "password"})
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    user_id = client.get("/userdata", headers=headers).json()["id"]
    return headers, user_id
