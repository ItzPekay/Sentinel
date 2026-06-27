import os
import logging
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

PI_BASE_URL = os.getenv("PI_BASE_URL")
MAIN_SERVER_HOST = os.getenv("MAIN_SERVER_HOST")
MAIN_SERVER_PORT = os.getenv("MAIN_SERVER_PORT")
GOOGLE_APP_PASSWORD = os.getenv("GOOGLE_APP_PASSWORD")
APP_EMAIL = os.getenv("APP_EMAIL")
EMERGENCY_EMAIL = os.getenv("EMERGENCY_EMAIL")
OAUTH_CLIENT_ID = os.getenv("OAUTH_CLIENT_ID")
OAUTH_SECRET = os.getenv("OAUTH_SECRET")
OAUTH_REDIRECT_URI = os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8001/auth/google/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",")] if _raw_origins != "*" else ["*"]

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

STANDARD_PHRASE = "the sky is blue"
YELLOW_THRESHOLD = 50.0
RED_THRESHOLD = 70.0

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "temp_audio")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

SUPABASE_CLIENT: Client | None = None

_supabase_url = os.getenv("SUPABASE_URL")
_supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

try:
    if _supabase_url and _supabase_key:
        SUPABASE_CLIENT = create_client(_supabase_url, _supabase_key)
        logger.info("[Config] Supabase client initialized.")
    else:
        logger.warning("[Config] SUPABASE_URL or Supabase key missing. DB operations will bypass.")
except Exception as e:
    logger.critical(f"[Config] Supabase failed initialization: {e}")
