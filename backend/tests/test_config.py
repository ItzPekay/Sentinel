import os
import importlib


def test_supabase_client_is_none_without_env(monkeypatch):
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_ANON_KEY", raising=False)
    monkeypatch.setenv("SUPABASE_URL", "")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "")
    import app.services.config_service as cfg
    importlib.reload(cfg)
    assert cfg.SUPABASE_CLIENT is None


def test_allowed_origins_parses_comma_separated(monkeypatch):
    monkeypatch.setenv("ALLOWED_ORIGINS", "http://a.com,http://b.com")
    import app.services.config_service as cfg
    importlib.reload(cfg)
    assert cfg.ALLOWED_ORIGINS == ["http://a.com", "http://b.com"]


def test_allowed_origins_defaults_to_wildcard(monkeypatch):
    monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)
    import app.services.config_service as cfg
    importlib.reload(cfg)
    assert cfg.ALLOWED_ORIGINS == ["*"]
