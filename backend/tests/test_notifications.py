from tests.helpers import seeded_login, seeded_login_as


def test_get_notifications_requires_auth(client):
    response = client.get("/notifications")
    assert response.status_code == 401


def test_get_notifications_returns_list_for_authed_user(client):
    headers, _ = seeded_login(client)

    response = client.get("/notifications", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_liking_a_tweet_creates_a_notification_for_the_author(client):
    liker_headers, liker_id = seeded_login_as(client, 0)
    author_headers, author_id = seeded_login_as(client, 1)

    tweets = client.get("/tweets", headers=liker_headers).json()
    author_tweet = next(t for t in tweets if t["user_id"] == author_id)

    before = client.get("/notifications", headers=author_headers).json()

    like_resp = client.post(
        "/tweets/like",
        params={"user_id": liker_id, "tweet_id": author_tweet["id"]},
        headers=liker_headers,
    )
    assert like_resp.status_code == 200

    after = client.get("/notifications", headers=author_headers).json()
    assert len(after) == len(before) + 1
    assert after[0]["notification_type"] == "Like"
    assert after[0]["actor"]["id"] == liker_id
