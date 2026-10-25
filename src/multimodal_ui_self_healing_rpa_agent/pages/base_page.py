"""OmniSight BasePage and SauceDemo Page Object supporting Desktop and Mobile views."""

from __future__ import annotations

import json
import logging
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Sequence

from playwright.sync_api import (
    Locator,
    Page,
    TimeoutError as PlaywrightTimeoutError,
    expect,
)

logger = logging.getLogger("OmniSight.POM")

DEFAULT_AUDIT_DIR = Path(__file__).resolve().parent.parent / "audit_logs"


class RPAActionError(RuntimeError):
    """Raised when an RPA interaction fails after exhausting all self-healing fallbacks."""


@dataclass
class AuditEvent:
    """Single step record in the OmniSight execution log."""

    timestamp: str
    view_mode: str
    stage: str
    action: str
    primary_selector: str
    used_selector: str
    self_healed: bool
    status: str
    screenshot_path: Optional[str] = None
    details: str = ""


@dataclass
class ExecutionReport:
    """Complete execution log returned at stage 7 of the OmniSight workflow."""

    task_name: str
    view_mode: str
    viewport: Optional[Dict[str, int]]
    target_url: str
    status: str = "IN_PROGRESS"
    repaired_selectors_count: int = 0
    events: List[AuditEvent] = field(default_factory=list)


class BasePage:
    """Parent Page Object class providing Observe-Act-Verify-Record for Desktop & Mobile."""

    def __init__(
        self,
        page: Page,
        task_name: str = "rpa_task",
        audit_dir: Path = DEFAULT_AUDIT_DIR,
        default_timeout_ms: float = 10000.0,
        fallback_timeout_ms: float = 2000.0,
    ) -> None:
        self.page = page
        self.view_mode: str = getattr(page, "view_mode", "desktop")
        self.task_name = f"{task_name}_{self.view_mode}"
        self.audit_dir = Path(audit_dir).resolve()
        self.default_timeout_ms = default_timeout_ms
        self.fallback_timeout_ms = fallback_timeout_ms
        self.audit_dir.mkdir(parents=True, exist_ok=True)
        self.report = ExecutionReport(
            task_name=self.task_name,
            view_mode=self.view_mode,
            viewport=self.page.viewport_size,
            target_url="",
        )

    def _timestamp(self) -> str:
        """Return a UTC ISO-8601 timestamp safe for filenames."""
        return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    def capture_audit_screenshot(self, label: str) -> str:
        """Record visual audit evidence tagged with the active Desktop/Mobile view mode."""
        safe_label = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in label)
        filename = f"{self.task_name}_{safe_label}_{self._timestamp()}.png"
        filepath = self.audit_dir / filename
        try:
            self.page.screenshot(
                path=str(filepath),
                full_page=True,
                animations="disabled",
                timeout=5000.0,
            )
            logger.info("[RECORD][%s] Saved visual audit screenshot: %s", self.view_mode, filepath)
            return str(filepath)
        except Exception as exc:
            logger.warning("[RECORD][%s] Could not capture screenshot (%s): %s", self.view_mode, label, exc)
            return ""

    def _record_event(
        self,
        stage: str,
        action: str,
        primary_selector: str,
        used_selector: str,
        self_healed: bool,
        status: str,
        screenshot_path: Optional[str] = None,
        details: str = "",
    ) -> None:
        """Append a structured entry to the OmniSight execution report and auto-flush to disk."""
        if self_healed:
            self.report.repaired_selectors_count += 1
        event = AuditEvent(
            timestamp=self._timestamp(),
            view_mode=self.view_mode,
            stage=stage,
            action=action,
            primary_selector=primary_selector,
            used_selector=used_selector,
            self_healed=self_healed,
            status=status,
            screenshot_path=screenshot_path,
            details=details,
        )
        self.report.events.append(event)
        log_path = self.audit_dir / f"{self.task_name}_execution_log.json"
        log_path.write_text(json.dumps(asdict(self.report), indent=2), encoding="utf-8")

    def navigate(self, url: str) -> None:
        """Navigate to a URL, wait for response commit, and capture an initial observation audit."""
        logger.info("[OBSERVE][%s] Navigating to %s", self.view_mode, url)
        self.report.target_url = url
        try:
            self.page.goto(url, wait_until="commit", timeout=15000.0)
            expect(self.page).to_have_url(url, timeout=self.default_timeout_ms)
            shot = self.capture_audit_screenshot("01_navigate_observe")
            self._record_event(
                stage="OBSERVE",
                action="navigate",
                primary_selector=url,
                used_selector=url,
                self_healed=False,
                status="SUCCESS",
                screenshot_path=shot,
                details=f"Page title: {self.page.title()} | Viewport: {self.page.viewport_size}",
            )
        except Exception as exc:
            shot = self.capture_audit_screenshot("error_navigate")
            self._record_event(
                stage="OBSERVE",
                action="navigate",
                primary_selector=url,
                used_selector=url,
                self_healed=False,
                status="FAILED",
                screenshot_path=shot,
                details=str(exc),
            )
            raise RPAActionError(f"Failed to navigate to {url}: {exc}") from exc

    def resolve_locator_with_healing(
        self,
        primary_selector: str,
        fallback_selectors: Sequence[str] = (),
        element_description: str = "UI control",
    ) -> tuple[Locator, str, bool]:
        """
        Observe the interface and resolve a visible locator across Desktop or Mobile layouts.
        Attempts `primary_selector` first. If the UI changed or is hidden in mobile layout,
        captures a diagnostic screenshot and iterates through `fallback_selectors`.
        """
        logger.info(
            "[OBSERVE][%s] Locating '%s' using primary selector: %s",
            self.view_mode,
            element_description,
            primary_selector,
        )
        primary_locator = self.page.locator(primary_selector).first
        try:
            expect(primary_locator).to_be_visible(timeout=self.fallback_timeout_ms)
            return primary_locator, primary_selector, False
        except (AssertionError, PlaywrightTimeoutError) as primary_err:
            logger.warning(
                "[SELF-HEAL][%s] Primary selector '%s' for '%s' failed (%s). "
                "Capturing UI state and evaluating %d fallback candidate(s)...",
                self.view_mode,
                primary_selector,
                element_description,
                primary_err.__class__.__name__,
                len(fallback_selectors),
            )
            heal_shot = self.capture_audit_screenshot(f"self_heal_trigger_{element_description}")

            for candidate in fallback_selectors:
                candidate_locator = self.page.locator(candidate).first
                try:
                    expect(candidate_locator).to_be_visible(timeout=self.fallback_timeout_ms)
                    logger.info(
                        "[SELF-HEAL][%s] Repaired target '%s'! Healed from '%s' -> '%s'",
                        self.view_mode,
                        element_description,
                        primary_selector,
                        candidate,
                    )
                    self._record_event(
                        stage="SELF_HEAL",
                        action="repair_selector",
                        primary_selector=primary_selector,
                        used_selector=candidate,
                        self_healed=True,
                        status="REPAIRED",
                        screenshot_path=heal_shot,
                        details=f"Recovered '{element_description}' via fallback selector.",
                    )
                    return candidate_locator, candidate, True
                except (AssertionError, PlaywrightTimeoutError):
                    logger.debug("[SELF-HEAL][%s] Fallback '%s' not visible.", self.view_mode, candidate)

            fail_shot = self.capture_audit_screenshot(f"unrecoverable_{element_description}")
            self._record_event(
                stage="SELF_HEAL",
                action="pause_for_human_review",
                primary_selector=primary_selector,
                used_selector="NONE",
                self_healed=False,
                status="FAILED",
                screenshot_path=fail_shot,
                details=f"All fallbacks exhausted for {element_description}: {fallback_selectors}",
            )
            raise RPAActionError(
                f"OmniSight [{self.view_mode}] could not locate '{element_description}'. "
                f"Primary '{primary_selector}' and fallbacks {list(fallback_selectors)} failed."
            )

    def wait_for_element(
        self,
        primary_selector: str,
        fallback_selectors: Sequence[str] = (),
        element_description: str = "element",
    ) -> Locator:
        """Explicitly wait for an element to be visible using `expect()` and self-healing."""
        locator, _, _ = self.resolve_locator_with_healing(
            primary_selector=primary_selector,
            fallback_selectors=fallback_selectors,
            element_description=element_description,
        )
        return locator

    def is_visible( 
        self,
        primary_selector: str,
        fallback_selectors: Sequence[str] = (),
        element_description: str = "element",
    ) -> bool:
        """Return True if the element is visible via primary or fallback selectors."""
        try:
            self.resolve_locator_with_healing(
                primary_selector=primary_selector,
                fallback_selectors=fallback_selectors,
                element_description=element_description,
            )
            return True
        except RPAActionError:
            return False
    
    def select_dropdown(
        self,
        selector: str,
        preferred_value: Optional[str] = None,
        element_description: str = "dropdown",
    ) -> str:
        """Select `preferred_value` (or first valid option) in a <select> dropdown."""
        locator = self.resolve_locator(selector=selector, element_description=element_description)
        locator.scroll_into_view_if_needed(timeout=self.default_timeout_ms)
        expect(locator).to_be_enabled(timeout=self.default_timeout_ms)

        options: List[str] = locator.evaluate(
            """(sel) => Array.from(sel.options)
                .map(o => o.value.trim())
                .filter(v => v && !v.toLowerCase().includes('select'))"""
        )
        if not options:
            raise RPAActionError(f"Dropdown '{element_description}' ({selector}) has no valid options.")

        chosen = preferred_value if (preferred_value and preferred_value in options) else options[0]
        logger.info("[ACT][%s] Selecting '%s' in '%s' (%s)", self.view_mode, chosen, element_description, selector)
        locator.select_option(value=chosen)
        shot = self.capture_audit_screenshot(f"act_select_{element_description}")
        self._record_event(
            stage="ACT",
            action="select_option",
            selector=selector,
            status="SUCCESS",
            screenshot_path=shot,
            details=f"Selected '{chosen}' in {element_description}",
        )
        return chosen
    
    def click(
        self,
        primary_selector: str,
        fallback_selectors: Sequence[str] = (),
        element_description: str = "button",
    ) -> None:
        """Scroll into viewport (for mobile screens), verify enabled state, and click."""
        try:
            locator, used_selector, healed = self.resolve_locator_with_healing(
                primary_selector=primary_selector,
                fallback_selectors=fallback_selectors,
                element_description=element_description,
            )
            locator.scroll_into_view_if_needed(timeout=self.default_timeout_ms)
            expect(locator).to_be_enabled(timeout=self.default_timeout_ms)
            logger.info(
                "[ACT][%s] Clicking '%s' via selector '%s'",
                self.view_mode,
                element_description,
                used_selector,
            )
            locator.click()
            shot = self.capture_audit_screenshot(f"act_click_{element_description}")
            self._record_event(
                stage="ACT",
                action="click",
                primary_selector=primary_selector,
                used_selector=used_selector,
                self_healed=healed,
                status="SUCCESS",
                screenshot_path=shot,
                details=f"Clicked {element_description}",
            )
        except Exception as exc:
            if not isinstance(exc, RPAActionError):
                shot = self.capture_audit_screenshot(f"error_click_{element_description}")
                self._record_event(
                    stage="ACT",
                    action="click",
                    primary_selector=primary_selector,
                    used_selector=primary_selector,
                    self_healed=False,
                    status="FAILED",
                    screenshot_path=shot,
                    details=str(exc),
                )
                raise RPAActionError(f"Click failed on '{element_description}': {exc}") from exc
            raise

    def fill(
        self,
        primary_selector: str,
        value: str,
        fallback_selectors: Sequence[str] = (),
        element_description: str = "input field",
        mask_in_log: bool = False,
    ) -> None:
        """Scroll into viewport (for mobile screens), verify editable state, and fill text."""
        try:
            locator, used_selector, healed = self.resolve_locator_with_healing(
                primary_selector=primary_selector,
                fallback_selectors=fallback_selectors,
                element_description=element_description,
            )
            locator.scroll_into_view_if_needed(timeout=self.default_timeout_ms)
            expect(locator).to_be_editable(timeout=self.default_timeout_ms)
            display_val = "********" if mask_in_log else value
            logger.info(
                "[ACT][%s] Filling '%s' (%s) with value '%s'",
                self.view_mode,
                element_description,
                used_selector,
                display_val,
            )
            locator.fill(value)
            expect(locator).to_have_value(value, timeout=self.default_timeout_ms)
            shot = self.capture_audit_screenshot(f"act_fill_{element_description}")
            self._record_event(
                stage="ACT",
                action="fill",
                primary_selector=primary_selector,
                used_selector=used_selector,
                self_healed=healed,
                status="SUCCESS",
                screenshot_path=shot,
                details=f"Filled {element_description} with {display_val}",
            )
        except Exception as exc:
            if not isinstance(exc, RPAActionError):
                shot = self.capture_audit_screenshot(f"error_fill_{element_description}")
                self._record_event(
                    stage="ACT",
                    action="fill",
                    primary_selector=primary_selector,
                    used_selector=primary_selector,
                    self_healed=False,
                    status="FAILED",
                    screenshot_path=shot,
                    details=str(exc),
                )
                raise RPAActionError(f"Fill failed on '{element_description}': {exc}") from exc
            raise

    def get_text(
        self,
        primary_selector: str,
        fallback_selectors: Sequence[str] = (),
        element_description: str = "text element",
    ) -> str:
        """Wait for an element to be visible and extract its stripped inner text."""
        locator, used_selector, healed = self.resolve_locator_with_healing(
            primary_selector=primary_selector,
            fallback_selectors=fallback_selectors,
            element_description=element_description,
        )
        text = locator.inner_text().strip()
        logger.info(
            "[OBSERVE][%s] Extracted text from '%s' (%s): %s",
            self.view_mode,
            element_description,
            used_selector,
            text,
        )
        self._record_event(
            stage="OBSERVE",
            action="get_text",
            primary_selector=primary_selector,
            used_selector=used_selector,
            self_healed=healed,
            status="SUCCESS",
            details=f"Extracted: {text}",
        )
        return text

    def export_execution_log(self) -> Path:
        """Stage 7: Write the complete OmniSight execution report and repair log to JSON."""
        self.report.status = "COMPLETED"
        log_path = self.audit_dir / f"{self.task_name}_execution_log.json"
        log_path.write_text(json.dumps(asdict(self.report), indent=2), encoding="utf-8")
        logger.info(
            "[RECORD][%s] Execution log saved to %s (Self-healed repairs: %d)",
            self.view_mode,
            log_path,
            self.report.repaired_selectors_count,
        )
        return log_path
