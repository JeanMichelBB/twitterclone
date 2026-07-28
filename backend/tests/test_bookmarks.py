from tests.helpers import seeded_login


def test_bookmark_lifecycle(client):
    headers, _ = seeded_login(client)

    tweets = client.get("/tweets", headers=headers).json()
    tweet_id = tweets[0]["id"]

    empty = client.get("/bookmarks", headers=headers).json()
    if tweet_id in [b["id"] for b in empty]:
        client.delete(f"/bookmarks/{tweet_id}", headers=headers)
        empty = client.get("/bookmarks", headers=headers).json()
    assert tweet_id not in [b["id"] for b in empty]

    add_resp = client.post(f"/bookmarks/{tweet_id}", headers=headers)
    assert add_resp.status_code == 200

    after_add = client.get("/bookmarks", headers=headers).json()
    assert tweet_id in [b["id"] for b in after_add]

    dup_resp = client.post(f"/bookmarks/{tweet_id}", headers=headers)
    assert dup_resp.status_code == 400

    remove_resp = client.delete(f"/bookmarks/{tweet_id}", headers=headers)
    assert remove_resp.status_code == 200

    after_remove = client.get("/bookmarks", headers=headers).json()
    assert tweet_id not in [b["id"] for b in after_remove]
