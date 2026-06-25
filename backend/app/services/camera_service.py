import httpx
from .config_service import PI_BASE_URL, logger

if not PI_BASE_URL:
    raise RuntimeError("PI_BASE_URL is not set!")

timeout = httpx.Timeout(connect=5.0, read=None, write=5.0, pool=5.0)
_client = httpx.AsyncClient(timeout=timeout)


async def open_stream() -> tuple[str, httpx.Response]:
    """Opens Pi MJPEG stream. Returns (content_type, response). Caller must close response."""
    full_url = f"{PI_BASE_URL}/camera/view_stream"
    req = _client.build_request("GET", full_url)
    response = await _client.send(req, stream=True)
    response.raise_for_status()
    content_type = response.headers.get("content-type", "multipart/x-mixed-replace; boundary=frame")
    logger.info(f"[Camera] Pi stream connected, content-type: {content_type}")
    return content_type, response


async def proxy_snapshot() -> bytes | None:
    full_url = f"{PI_BASE_URL}/camera/snapshot"
    try:
        r = await _client.get(full_url, timeout=5)
        r.raise_for_status()
        if "image/jpeg" not in r.headers.get("content-type", ""):
            logger.warning("[Camera] Unexpected snapshot content type")
            return None
        return r.content
    except httpx.HTTPError as e:
        logger.error(f"[Camera] Snapshot fetch failed: {e}")
        return None
