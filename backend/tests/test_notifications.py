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
    author_tweets = [t for t in tweets if t["user_id"] == author_id]
    already_liked_ids = {
        l["tweet_id"] for l in client.get(f"/tweets/likes/{liker_id}", headers=liker_headers).json()
    }
    author_tweet = next(t for t in author_tweets if t["id"] not in already_liked_ids)

    before = client.get("/notifications", headers=author_headers).json()

    like_resp = client.post(
        "/tweets/like",
        params={"user_id": liker_id, "tweet_id": author_tweet["id"]},
        headers=liker_headers,
    )
    assert like_resp.status_code == 200

    after = client.get("/notifications", headers=author_headers).json()
    assert len(after) == len(before) + 1
    before_ids = {n["id"] for n in before}
    new_notification = next(n for n in after if n["id"] not in before_ids)
    assert new_notification["notification_type"] == "Like"
    assert new_notification["actor"]["id"] == liker_id


def test_retweeting_a_tweet_creates_a_notification_for_the_author(client):
    retweeter_headers, retweeter_id = seeded_login_as(client, 0)
    author_headers, author_id = seeded_login_as(client, 1)

    tweets = client.get("/tweets", headers=retweeter_headers).json()
    author_tweets = [t for t in tweets if t["user_id"] == author_id]
    already_retweeted_ids = {
        r["tweet_id"] for r in client.get(f"/tweets/retweets/{retweeter_id}", headers=retweeter_headers).json()
    }
    author_tweet = next(t for t in author_tweets if t["id"] not in already_retweeted_ids)

    before = client.get("/notifications", headers=author_headers).json()

    retweet_resp = client.post(
        "/tweets/retweet",
        params={"user_id": retweeter_id, "tweet_id": author_tweet["id"]},
        headers=retweeter_headers,
    )
    assert retweet_resp.status_code == 200

    after = client.get("/notifications", headers=author_headers).json()
    assert len(after) == len(before) + 1
    before_ids = {n["id"] for n in before}
    new_notification = next(n for n in after if n["id"] not in before_ids)
    assert new_notification["notification_type"] == "Retweet"
    assert new_notification["actor"]["id"] == retweeter_id


def test_commenting_on_a_tweet_creates_a_mention_notification_for_the_author(client):
    commenter_headers, commenter_id = seeded_login_as(client, 0)
    author_headers, author_id = seeded_login_as(client, 1)

    tweets = client.get("/tweets", headers=commenter_headers).json()
    author_tweet = next(t for t in tweets if t["user_id"] == author_id)

    before = client.get("/notifications", headers=author_headers).json()

    comment_resp = client.post(
        f"/tweets/{author_tweet['id']}/comments",
        json={"user_id": commenter_id, "content": "nice tweet"},
        headers=commenter_headers,
    )
    assert comment_resp.status_code == 200

    after = client.get("/notifications", headers=author_headers).json()
    assert len(after) == len(before) + 1
    before_ids = {n["id"] for n in before}
    new_notification = next(n for n in after if n["id"] not in before_ids)
    assert new_notification["notification_type"] == "Mention"
    assert new_notification["actor"]["id"] == commenter_id


def test_following_a_user_creates_a_notification_for_the_followee(client):
    follower_headers, follower_id = seeded_login_as(client, 0)
    followee_headers, followee_id = seeded_login_as(client, 7)

    # Seed data may have already created this follow relationship; reset it
    # so the test deterministically exercises the follow_user endpoint.
    is_following = client.get(
        f"/isfollowing/{follower_id}",
        params={"follow_id": followee_id},
        headers=follower_headers,
    ).json()
    if is_following.get("following"):
        client.delete(
            f"/unfollow/{follower_id}",
            params={"unfollow_id": followee_id},
            headers=follower_headers,
        )

    before = client.get("/notifications", headers=followee_headers).json()

    follow_resp = client.post(
        f"/follow/{follower_id}",
        params={"follow_id": followee_id},
        headers=follower_headers,
    )
    assert follow_resp.status_code == 200

    after = client.get("/notifications", headers=followee_headers).json()
    assert len(after) == len(before) + 1
    before_ids = {n["id"] for n in before}
    new_notification = next(n for n in after if n["id"] not in before_ids)
    assert new_notification["notification_type"] == "Follow"
    assert new_notification["actor"]["id"] == follower_id
