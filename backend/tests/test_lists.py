from tests.helpers import seeded_login


def test_list_lifecycle(client):
    headers, _ = seeded_login(client)

    create_resp = client.post("/lists", json={"name": "Close Friends"}, headers=headers)
    assert create_resp.status_code == 200
    list_id = create_resp.json()["id"]

    lists = client.get("/lists", headers=headers).json()
    assert any(l["id"] == list_id for l in lists)

    users = client.get("/users", headers=headers).json()
    member_id = next(u["id"] for u in users)

    add_resp = client.post(f"/lists/{list_id}/members/{member_id}", headers=headers)
    assert add_resp.status_code == 200

    members = client.get(f"/lists/{list_id}/members", headers=headers).json()
    assert any(m["id"] == member_id for m in members)

    remove_resp = client.delete(f"/lists/{list_id}/members/{member_id}", headers=headers)
    assert remove_resp.status_code == 200

    members_after = client.get(f"/lists/{list_id}/members", headers=headers).json()
    assert not any(m["id"] == member_id for m in members_after)

    delete_resp = client.delete(f"/lists/{list_id}", headers=headers)
    assert delete_resp.status_code == 200

    lists_after = client.get("/lists", headers=headers).json()
    assert not any(l["id"] == list_id for l in lists_after)
