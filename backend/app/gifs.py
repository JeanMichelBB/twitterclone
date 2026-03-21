import json
import os
import datetime
import httpx
from fastapi import APIRouter
from .database import SessionLocal
from .models import GifCache

router = APIRouter()

GIPHY_API_KEY = os.environ.get("GIPHY_API_KEY", "")
CACHE_TTL_HOURS = 24
GIPHY_LIMIT = 24


async def _fetch_from_giphy(query: str) -> list:
    """Fetch GIFs from Giphy API. Returns list of {id, url, thumbnail} dicts."""
    if not GIPHY_API_KEY:
        return []
    params = {
        "api_key": GIPHY_API_KEY,
        "limit": GIPHY_LIMIT,
        "rating": "g",
    }
    if query == "__trending__":
        endpoint = "https://api.giphy.com/v1/gifs/trending"
    else:
        endpoint = "https://api.giphy.com/v1/gifs/search"
        params["q"] = query

    async with httpx.AsyncClient(timeout=8) as client:
        resp = await client.get(endpoint, params=params)
        resp.raise_for_status()
        data = resp.json()

    return [
        {
            "id": g["id"],
            "url": g["images"]["downsized"]["url"],
            "thumbnail": g["images"]["fixed_height_small"]["url"],
            "title": g.get("title", ""),
        }
        for g in data.get("data", [])
    ]


@router.get("/gifs")
async def get_gifs(q: str = ""):
    cache_key = q.strip().lower() if q.strip() else "__trending__"

    with SessionLocal() as db:
        cached = db.query(GifCache).filter(GifCache.query == cache_key).first()
        now = datetime.datetime.utcnow()

        if cached:
            age_hours = (now - cached.fetched_at).total_seconds() / 3600
            if age_hours < CACHE_TTL_HOURS:
                return json.loads(cached.data)

        # Cache miss or stale — fetch from Giphy
        gifs = await _fetch_from_giphy(cache_key)

        if gifs:
            if cached:
                cached.data = json.dumps(gifs)
                cached.fetched_at = now
            else:
                db.add(GifCache(query=cache_key, data=json.dumps(gifs), fetched_at=now))
            db.commit()

        return gifs
