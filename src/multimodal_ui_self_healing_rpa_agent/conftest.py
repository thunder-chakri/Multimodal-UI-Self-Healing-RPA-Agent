"""Pytest configuration and Desktop + Mobile Chromium RPA fixtures for OmniSight."""

import logging
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Generator

import pytest
from playwright.sync_api import Browser, BrowserContext, Page, Playwright

# Ensure the current directory is on sys.path so `from pages.base_page import ...` always works
sys.path.insert(0, str(Path(__file__).resolve().parent))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("OmniSight.Fixture")

AUDIT_DIR = Path(__file__).resolve().parent / "audit_logs"


@pytest.fixture(scope="session")
def audit_directory() -> Path:
    """Create and return the directory used for visual audit screenshots, videos, and logs."""
    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    (AUDIT_DIR / "videos" / "desktop").mkdir(parents=True, exist_ok=True)
    (AUDIT_DIR / "videos" / "mobile_pixel_7").mkdir(parents=True, exist_ok=True)
    return AUDIT_DIR


@pytest.fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args: Dict[str, Any]) -> Dict[str, Any]:
    """Configure Chromium launch options."""
    return {
        **browser_type_launch_args,
        "args": ["--disable-dev-shm-usage", "--no-sandbox"],
    }


@pytest.fixture(scope="function", params=["desktop", "mobile_pixel_7"])
def rpa_page(
    playwright: Playwright,
    browser: Browser,
    browser_context_args: Dict[str, Any],
    audit_directory: Path,
    request: pytest.FixtureRequest,
) -> Generator[Page, None, None]:
    """
    Stage 1 (Launch/Setup) & Stage 6 (Teardown):
    Provision an isolated Chromium Page for both Desktop (1280x800) and Mobile (Pixel 7),
    and flush the recorded `.webm` video to `audit_logs/videos/<view_mode>/`.
    """
    view_mode: str = request.param
    test_name = request.node.name
    video_subdir = audit_directory / "videos" / view_mode
    video_subdir.mkdir(parents=True, exist_ok=True)

    base_kwargs: Dict[str, Any] = {
        **browser_context_args,
        "accept_downloads": True,
        "record_video_dir": str(video_subdir),
    }

    if view_mode == "mobile_pixel_7":
        pixel_7_profile = {
            k: v
            for k, v in playwright.devices["Pixel 7"].items()
            if k != "default_browser_type"
        }
        context_kwargs = {
            **base_kwargs,
            **pixel_7_profile,
            "record_video_size": {"width": 412, "height": 915},
        }
    else:
        context_kwargs = {
            **base_kwargs,
            "viewport": {"width": 1280, "height": 800},
            "record_video_size": {"width": 1280, "height": 800},
            "is_mobile": False,
            "has_touch": False,
        }

    logger.info(
        "[STAGE 1: SETUP] Launching Chromium [%s] (viewport=%s) for task: %s",
        view_mode.upper(),
        context_kwargs.get("viewport"),
        test_name,
    )

    context: BrowserContext = browser.new_context(**context_kwargs)
    page: Page = context.new_page()
    setattr(page, "view_mode", view_mode)

    try:
        yield page
    finally:
        logger.info(
            "[STAGE 6: TEARDOWN] Closing Chromium [%s] page and context for task: %s",
            view_mode.upper(),
            test_name,
        )
        try:
            page.wait_for_timeout(500)
        except Exception:
            pass

        video_obj = page.video
        page.close()
        context.close()

        if video_obj:
            try:
                ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
                named_video = video_subdir / f"saucedemo_{view_mode}_{ts}.webm"
                video_obj.save_as(str(named_video))
                logger.info("[VIDEO SAVED][%s] %s", view_mode.upper(), named_video)
            except Exception as exc:
                logger.warning("[VIDEO][%s] Could not save named video: %s", view_mode, exc)
