from tests.helpers import seeded_login


def test_trending_tweets_sorted_by_engagement(client):
    headers, _ = seeded_login(client)

    response = client.get("/tweets/trending", headers=headers)
    assert response.status_code == 200
    tweets = response.json()
    assert isinstance(tweets, list)

    scores = [t["num_likes"] + t["num_retweets"] for t in tweets]
    assert scores == sorted(scores, reverse=True)
