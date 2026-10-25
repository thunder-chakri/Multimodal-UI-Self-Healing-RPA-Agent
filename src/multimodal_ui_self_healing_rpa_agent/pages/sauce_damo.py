from __future__ import annotations

import json
import logging
import socket
import subprocess
import sys
import time
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
from base_page import BasePage, RPAActionError

logger = logging.getLogger("OmniSight.POM.sauce_demo")

class SauceDemoRPAPage(BasePage):
    """Concrete POM class for https://www.saucedemo.com/ supporting Desktop & Mobile views."""

    URL = "https://www.saucedemo.com/"
    INVENTORY_URL = "https://www.saucedemo.com/inventory.html"

    USERNAME_PRIMARY = '[data-test="username"]'
    USERNAME_FALLBACKS = ("#user-name", 'input[name="user-name"]')

    PASSWORD_PRIMARY = '[data-test="password"]'
    PASSWORD_FALLBACKS = ("#password", 'input[name="password"]')

    LOGIN_BTN_PRIMARY = '[data-test="login-button"]'
    LOGIN_BTN_FALLBACKS = ("#login-button", 'input[type="submit"]')

    HEADER_TITLE_PRIMARY = '[data-test="title"]'
    HEADER_TITLE_FALLBACKS = (".title", 'span:has-text("Products")')

    # Broken primary selector to trigger OmniSight's self-healing fallback
    ADD_BACKPACK_PRIMARY = '[data-test="legacy-moved-backpack-btn"]'
    ADD_BACKPACK_FALLBACKS = (
        '[data-test="add-to-cart-sauce-labs-backpack"]',
        "#add-to-cart-sauce-labs-backpack",
        'button:has-text("Add to cart")',
    )

    CART_BADGE_PRIMARY = '[data-test="shopping-cart-badge"]'
    CART_BADGE_FALLBACKS = (".shopping_cart_badge", "a.shopping_cart_link span")

    # Responsive mobile hamburger drawer controls
    BURGER_MENU_PRIMARY = '[data-test="legacy-mobile-menu-btn"]'
    BURGER_MENU_FALLBACKS = ("#react-burger-menu-btn", 'button:has-text("Open Menu")')

    LOGOUT_LINK_PRIMARY = '[data-test="logout-sidebar-link"]'
    LOGOUT_LINK_FALLBACKS = ("#logout_sidebar_link", 'a:has-text("Logout")')

    def stage_2_observe_interface(self) -> None:
        """Stage 2: Navigate to SauceDemo and confirm login controls are visible."""
        self.navigate(self.URL)
        assert self.is_visible(
            self.USERNAME_PRIMARY,
            self.USERNAME_FALLBACKS,
            element_description="username_input",
        ), "Username input must be visible"
        assert self.is_visible(
            self.LOGIN_BTN_PRIMARY,
            self.LOGIN_BTN_FALLBACKS,
            element_description="login_button",
        ), "Login button must be visible"

    def stage_3_perform_login_action(self, username: str, password: str) -> None:
        """Stage 3a: Fill credentials and click Login."""
        self.fill(
            primary_selector=self.USERNAME_PRIMARY,
            value=username,
            fallback_selectors=self.USERNAME_FALLBACKS,
            element_description="username_input",
        )
        self.fill(
            primary_selector=self.PASSWORD_PRIMARY,
            value=password,
            fallback_selectors=self.PASSWORD_FALLBACKS,
            element_description="password_input",
            mask_in_log=True,
        )
        self.click(
            primary_selector=self.LOGIN_BTN_PRIMARY,
            fallback_selectors=self.LOGIN_BTN_FALLBACKS,
            element_description="login_button",
        )

    def stage_4_assert_login_outcome(self) -> str:
        """Stage 4: Validate transition to inventory.html and verify 'Products' heading."""
        logger.info("[VERIFY][%s] Asserting URL transition to %s", self.view_mode, self.INVENTORY_URL)
        expect(self.page).to_have_url(self.INVENTORY_URL, timeout=self.default_timeout_ms)
        heading = self.get_text(
            primary_selector=self.HEADER_TITLE_PRIMARY,
            fallback_selectors=self.HEADER_TITLE_FALLBACKS,
            element_description="inventory_header",
        )
        assert heading == "Products", f"Expected 'Products' header, got '{heading}'"
        return heading

    def stage_3b_add_item_with_self_healing(self) -> None:
        """Stage 3b: Click 'Add to cart' using a broken primary selector that self-heals."""
        self.click(
            primary_selector=self.ADD_BACKPACK_PRIMARY,
            fallback_selectors=self.ADD_BACKPACK_FALLBACKS,
            element_description="add_backpack_to_cart_button",
        )

    def stage_5_verify_expected_result(self) -> Path:
        """Stage 5: Confirm cart badge == '1', test responsive drawer menu, and export JSON log."""
        badge_count = self.get_text(
            primary_selector=self.CART_BADGE_PRIMARY,
            fallback_selectors=self.CART_BADGE_FALLBACKS,
            element_description="shopping_cart_badge",
        )
        assert badge_count == "1", f"Expected cart badge count '1', got '{badge_count}'"

        # Open responsive hamburger navigation drawer (self-heals from legacy selector)
        self.click(
            primary_selector=self.BURGER_MENU_PRIMARY,
            fallback_selectors=self.BURGER_MENU_FALLBACKS,
            element_description="responsive_hamburger_menu",
        )
        logout_locator = self.wait_for_element(
            primary_selector=self.LOGOUT_LINK_PRIMARY,
            fallback_selectors=self.LOGOUT_LINK_FALLBACKS,
            element_description="drawer_logout_link",
        )
        expect(logout_locator).to_be_visible(timeout=self.default_timeout_ms)

        shot = self.capture_audit_screenshot("05_verified_cart_and_responsive_drawer")
        self._record_event(
            stage="VERIFY",
            action="verify_cart_and_drawer",
            primary_selector=self.CART_BADGE_PRIMARY,
            used_selector=self.CART_BADGE_PRIMARY,
            self_healed=False,
            status="SUCCESS",
            screenshot_path=shot,
            details=f"Verified cart badge == {badge_count} and responsive drawer in {self.view_mode} mode",
        )
        return self.export_execution_log()


# class CarPricePredictorRPAPage(BasePage):
#     """
#     Concrete POM class for https://github.com/keval-parmar-030902/car_price_predictor/blob/main/application.py
#     supporting Desktop & Mobile views.
#     """

#     URL = "http://127.0.0.1:5000/"
#     GITHUB_REPO_URL = "https://github.com/keval-parmar-030902/car_price_predictor.git"
#     LOCAL_REPO_DIR = Path(__file__).resolve().parent.parent / "car_price_predictor_repo"
#     _flask_process: Optional[subprocess.Popen] = None

#     COMPANY_PRIMARY = '[data-test="company-select"]'
#     COMPANY_FALLBACKS = ("#company", 'select[name="company"]')

#     CAR_MODEL_PRIMARY = '[data-test="car-model-select"]'
#     CAR_MODEL_FALLBACKS = (
#         "#car_models",
#         "#car_model",
#         'select[name="car_models"]',
#         'select[name="car_model"]',
#     )

#     YEAR_PRIMARY = '[data-test="year-select"]'
#     YEAR_FALLBACKS = ("#year", 'select[name="year"]')

#     FUEL_TYPE_PRIMARY = '[data-test="fuel-type-select"]'
#     FUEL_TYPE_FALLBACKS = ("#fuel_type", 'select[name="fuel_type"]')

#     KILO_DRIVEN_PRIMARY = '[data-test="kilo-driven-input"]'
#     KILO_DRIVEN_FALLBACKS = ("#kilo_driven", 'input[name="kilo_driven"]')

#     HEADER_TITLE_PRIMARY = '[data-test="car-header-title"]'
#     HEADER_TITLE_FALLBACKS = (".card-header h1", "h1")

#     # Broken primary selector to trigger OmniSight's self-healing fallback
#     PREDICT_BTN_PRIMARY = '[data-test="legacy-predict-price-btn"]'
#     PREDICT_BTN_FALLBACKS = (
#         '[data-test="predict-car-price-btn"]',
#         'button[onclick*="send_data"]',
#         "button.btn-primary",
#         'button:has-text("Predict Price")',
#     )

#     PREDICTION_RESULT_PRIMARY = "#prediction"
#     PREDICTION_RESULT_FALLBACKS = ('span[id="prediction"]', "h4 span", ".card-body h4")

#     @classmethod
#     def _ensure_car_predictor_server_running(cls) -> None:
#         """Auto-clone keval-parmar-030902/car_price_predictor and start application.py on port 5000."""
#         with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
#             sock.settimeout(0.5)
#             if sock.connect_ex(("127.0.0.1", 5000)) == 0:
#                 return

#         if not cls.LOCAL_REPO_DIR.exists():
#             logger.info("[SETUP] Cloning %s into %s ...", cls.GITHUB_REPO_URL, cls.LOCAL_REPO_DIR)
#             subprocess.run(
#                 ["git", "clone", cls.GITHUB_REPO_URL, str(cls.LOCAL_REPO_DIR)],
#                 check=True,
#             )

#         app_file = cls.LOCAL_REPO_DIR / "application.py"
#         if not app_file.exists():
#             app_file = cls.LOCAL_REPO_DIR / "app.py"

#         logger.info("[SETUP] Starting Flask server: %s", app_file)
#         cls._flask_process = subprocess.Popen(
#             [sys.executable, app_file.name],
#             cwd=str(cls.LOCAL_REPO_DIR),
#             stdout=subprocess.DEVNULL,
#             stderr=subprocess.DEVNULL,
#         )

#         for _ in range(30):
#             with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
#                 sock.settimeout(0.5)
#                 if sock.connect_ex(("127.0.0.1", 5000)) == 0:
#                     logger.info("[SETUP] Car Price Predictor is live at %s", cls.URL)
#                     return
#             time.sleep(0.5)

#         raise RPAActionError("Failed to start car_price_predictor/application.py on http://127.0.0.1:5000/")

#     def stage_2_observe_interface(self) -> None:
#         """Stage 2: Ensure application.py is running, navigate to UI, and verify form controls."""
#         self._ensure_car_predictor_server_running()
#         self.navigate(self.URL)
#         assert self.is_visible(
#             self.COMPANY_PRIMARY,
#             self.COMPANY_FALLBACKS,
#             element_description="company_dropdown",
#         ), "Company dropdown must be visible"
#         assert self.is_visible(
#             self.KILO_DRIVEN_PRIMARY,
#             self.KILO_DRIVEN_FALLBACKS,
#             element_description="kilo_driven_input",
#         ), "Kilometres driven input must be visible"

#     def stage_3_enter_car_values(
#         self,
#         company: str = "Maruti",
#         car_model: Optional[str] = None,
#         year: str = "2019",
#         fuel_type: str = "Petrol",
#         kilo_driven: str = "25000",
#     ) -> None:
#         """Stage 3a: Select Company, Car Model, Year, Fuel Type, and fill Kilometres Driven."""
#         self.select_dropdown(
#             primary_selector=self.COMPANY_PRIMARY,
#             preferred_value=company,
#             fallback_selectors=self.COMPANY_FALLBACKS,
#             element_description="company_dropdown",
#         )
#         self.select_dropdown(
#             primary_selector=self.CAR_MODEL_PRIMARY,
#             preferred_value=car_model,
#             fallback_selectors=self.CAR_MODEL_FALLBACKS,
#             element_description="car_model_dropdown",
#         )
#         self.select_dropdown(
#             primary_selector=self.YEAR_PRIMARY,
#             preferred_value=year,
#             fallback_selectors=self.YEAR_FALLBACKS,
#             element_description="year_dropdown",
#         )
#         self.select_dropdown(
#             primary_selector=self.FUEL_TYPE_PRIMARY,
#             preferred_value=fuel_type,
#             fallback_selectors=self.FUEL_TYPE_FALLBACKS,
#             element_description="fuel_type_dropdown",
#         )
#         self.fill(
#             primary_selector=self.KILO_DRIVEN_PRIMARY,
#             value=kilo_driven,
#             fallback_selectors=self.KILO_DRIVEN_FALLBACKS,
#             element_description="kilo_driven_input",
#         )

#     def stage_4_apply_and_assert_ui_changes(self) -> str:
#         """Stage 4: Apply UI changes to the Car Price Predictor page and verify the updated header."""
#         logger.info("[UI CHANGE][%s] Applying UI changes to Car Price Predictor...", self.view_mode)
#         self.page.evaluate(
#             """() => {
#                 const header = document.querySelector('.card-header h1, h1');
#                 if (header) {
#                     header.setAttribute('data-test', 'car-header-title');
#                     header.innerText = 'OmniSight Car Price Predictor';
#                 }
#                 const card = document.querySelector('.card');
#                 if (card) {
#                     card.style.borderRadius = '14px';
#                     card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.25)';
#                 }
#                 const btn = document.querySelector('button.btn-primary, button[onclick*="send_data"], form button');
#                 if (btn) {
#                     btn.setAttribute('data-test', 'predict-car-price-btn');
#                     btn.innerText = 'Predict Car Price (₹)';
#                     btn.style.backgroundColor = '#2563eb';
#                     btn.style.fontWeight = '600';
#                 }
#             }"""
#         )
#         self.capture_audit_screenshot("04_ui_changes_applied")
#         heading = self.get_text(
#             primary_selector=self.HEADER_TITLE_PRIMARY,
#             fallback_selectors=self.HEADER_TITLE_FALLBACKS,
#             element_description="car_predictor_header",
#         )
#         assert "Car Price Predictor" in heading, f"Unexpected header after UI change: '{heading}'"
#         return heading

#     def stage_3b_predict_price_with_self_healing(self) -> None:
#         """Stage 3b: Click 'Predict Car Price (₹)' using a broken primary selector that self-heals."""
#         self.click(
#             primary_selector=self.PREDICT_BTN_PRIMARY,
#             fallback_selectors=self.PREDICT_BTN_FALLBACKS,
#             element_description="predict_car_price_button",
#         )

#     # def stage_5_verify_expected_result(self) -> Path:
#     #     """Stage 5: Wait for `#prediction` to return the ML car price in ₹ and export JSON log."""
#     #     pred_locator, used_sel, healed = self.resolve_locator_with_healing(
#     #         primary_selector=self.PREDICTION_RESULT_PRIMARY,
#     #         fallback_selectors=self.PREDICTION_RESULT_FALLBACKS,
#     #         element_description="prediction_result_banner",
#     #     )
#     #     expect(pred_locator).not_to_have_text("", timeout=self.default_timeout_ms)
#     #     expect(pred_locator).not_to_contain_text("Wait!", timeout=self.default_timeout_ms)

#     #     prediction_text = pred_locator.inner_text().strip()
#     #     logger.info("[VERIFY][%s] Predicted Car Price: %s", self.view_mode, prediction_text)
#     #     assert len(prediction_text) > 0, "Expected non-empty car price prediction"

#     #     shot = self.capture_audit_screenshot("05_verified_car_price_prediction")
#     #     self._record_event(
#     #         stage="VERIFY",
#     #         action="verify_car_price_prediction",
#     #         primary_selector=self.PREDICTION_RESULT_PRIMARY,
#     #         used_selector=used_sel,
#     #         self_healed=healed,
#     #         status="SUCCESS",
#     #         screenshot_path=shot,
#     #         details=f"Verified Car Price Prediction == '{prediction_text}' in {self.view_mode} mode",
#     #     )
#     #     return self.export_execution_log()
    
#     def stage_5_verify_expected_result(self) -> Path:
#         """Stage 5: Wait for `#prediction` to return the ML car price in ₹ and export JSON log."""
#         pred_locator = self.resolve_locator(
#             self.PREDICTION_RESULT_SELECTOR,
#             "prediction_result_banner",
#         )
#         expect(pred_locator).not_to_have_text("", timeout=self.default_timeout_ms)
#         expect(pred_locator).not_to_contain_text("Wait!", timeout=self.default_timeout_ms)

#         prediction_text = pred_locator.inner_text().strip()
#         logger.info("[VERIFY][%s] Predicted Car Price: %s", self.view_mode, prediction_text)
#         assert len(prediction_text) > 0, "Expected non-empty car price prediction"

#         shot = self.capture_audit_screenshot("05_verified_car_price_prediction")
#         dom_path = self.capture_dom_snapshot("05_verified_car_price_prediction")
#         self._record_event(
#             stage="VERIFY",
#             action="verify_car_price_prediction",
#             selector=self.PREDICTION_RESULT_SELECTOR,
#             status="SUCCESS",
#             screenshot_path=shot,
#             dom_snapshot_path=dom_path,
#             details=f"Verified Car Price Prediction == '{prediction_text}' in {self.view_mode} mode",
#         )
#         return self.export_execution_log()

"""
#########################################################
### VLM generated report and Coder Agent code meets here:
#########################################################
"""

# class CarPricePredictorRPAPage(BasePage):
#     """
#     Concrete POM class for https://github.com/keval-parmar-030902/car_price_predictor/blob/main/application.py
#     supporting Desktop & Mobile views with dynamic VLM Report -> Coder Agent UI patching.
#     """

#     URL = "http://127.0.0.1:5000/"
#     GITHUB_REPO_URL = "https://github.com/keval-parmar-030902/car_price_predictor.git"
#     LOCAL_REPO_DIR = Path(__file__).resolve().parent.parent / "car_price_predictor_repo"
#     _flask_process: Optional[subprocess.Popen] = None

#     COMPANY_PRIMARY = '[data-test="company-select"]'
#     COMPANY_FALLBACKS = ("#company", 'select[name="company"]')

#     CAR_MODEL_PRIMARY = '[data-test="car-model-select"]'
#     CAR_MODEL_FALLBACKS = (
#         "#car_models",
#         "#car_model",
#         'select[name="car_models"]',
#         'select[name="car_model"]',
#     )

#     YEAR_PRIMARY = '[data-test="year-select"]'
#     YEAR_FALLBACKS = ("#year", 'select[name="year"]')

#     FUEL_TYPE_PRIMARY = '[data-test="fuel-type-select"]'
#     FUEL_TYPE_FALLBACKS = ("#fuel_type", 'select[name="fuel_type"]')

#     KILO_DRIVEN_PRIMARY = '[data-test="kilo-driven-input"]'
#     KILO_DRIVEN_FALLBACKS = ("#kilo_driven", 'input[name="kilo_driven"]')

#     HEADER_TITLE_PRIMARY = '[data-test="car-header-title"]'
#     HEADER_TITLE_FALLBACKS = (".card-header h1", "h1")

#     PREDICT_BTN_PRIMARY = '[data-test="legacy-predict-price-btn"]'
#     PREDICT_BTN_FALLBACKS = (
#         '[data-test="predict-car-price-btn"]',
#         'button[onclick*="send_data"]',
#         "button.btn-primary",
#         'button:has-text("Predict Price")',
#     )

#     PREDICTION_RESULT_PRIMARY = "#prediction"
#     PREDICTION_RESULT_FALLBACKS = ('span[id="prediction"]', "h4 span", ".card-body h4")

#     @classmethod
#     def _ensure_car_predictor_server_running(cls) -> None:
#         """Auto-clone keval-parmar-030902/car_price_predictor and start application.py on port 5000."""
#         with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
#             sock.settimeout(0.5)
#             if sock.connect_ex(("127.0.0.1", 5000)) == 0:
#                 return

#         if not cls.LOCAL_REPO_DIR.exists():
#             logger.info("[SETUP] Cloning %s into %s ...", cls.GITHUB_REPO_URL, cls.LOCAL_REPO_DIR)
#             subprocess.run(
#                 ["git", "clone", cls.GITHUB_REPO_URL, str(cls.LOCAL_REPO_DIR)],
#                 check=True,
#             )

#         app_file = cls.LOCAL_REPO_DIR / "application.py"
#         if not app_file.exists():
#             app_file = cls.LOCAL_REPO_DIR / "app.py"

#         logger.info("[SETUP] Starting Flask server: %s", app_file)
#         cls._flask_process = subprocess.Popen(
#             [sys.executable, app_file.name],
#             cwd=str(cls.LOCAL_REPO_DIR),
#             stdout=subprocess.DEVNULL,
#             stderr=subprocess.DEVNULL,
#         )

#         for _ in range(30):
#             with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
#                 sock.settimeout(0.5)
#                 if sock.connect_ex(("127.0.0.1", 5000)) == 0:
#                     logger.info("[SETUP] Car Price Predictor is live at %s", cls.URL)
#                     return
#             time.sleep(0.5)

#         raise RPAActionError("Failed to start car_price_predictor/application.py on http://127.0.0.1:5000/")

#     def stage_2_observe_interface(self) -> None:
#         """Stage 2: Ensure application.py is running, navigate to UI, and verify form controls."""
#         self._ensure_car_predictor_server_running()
#         self.navigate(self.URL)
#         assert self.is_visible(
#             self.COMPANY_PRIMARY,
#             self.COMPANY_FALLBACKS,
#             element_description="company_dropdown",
#         ), "Company dropdown must be visible"
#         assert self.is_visible(
#             self.KILO_DRIVEN_PRIMARY,
#             self.KILO_DRIVEN_FALLBACKS,
#             element_description="kilo_driven_input",
#         ), "Kilometres driven input must be visible"

#     def stage_3_enter_car_values(
#         self,
#         company: str = "Maruti",
#         car_model: Optional[str] = None,
#         year: str = "2019",
#         fuel_type: str = "Petrol",
#         kilo_driven: str = "25000",
#     ) -> None:
#         """Stage 3a: Select Company, Car Model, Year, Fuel Type, and fill Kilometres Driven."""
#         self.select_dropdown(
#             primary_selector=self.COMPANY_PRIMARY,
#             preferred_value=company,
#             fallback_selectors=self.COMPANY_FALLBACKS,
#             element_description="company_dropdown",
#         )
#         self.select_dropdown(
#             primary_selector=self.CAR_MODEL_PRIMARY,
#             preferred_value=car_model,
#             fallback_selectors=self.CAR_MODEL_FALLBACKS,
#             element_description="car_model_dropdown",
#         )
#         self.select_dropdown(
#             primary_selector=self.YEAR_PRIMARY,
#             preferred_value=year,
#             fallback_selectors=self.YEAR_FALLBACKS,
#             element_description="year_dropdown",
#         )
#         self.select_dropdown(
#             primary_selector=self.FUEL_TYPE_PRIMARY,
#             preferred_value=fuel_type,
#             fallback_selectors=self.FUEL_TYPE_FALLBACKS,
#             element_description="fuel_type_dropdown",
#         )
#         self.fill(
#             primary_selector=self.KILO_DRIVEN_PRIMARY,
#             value=kilo_driven,
#             fallback_selectors=self.KILO_DRIVEN_FALLBACKS,
#             element_description="kilo_driven_input",
#         )

#     # =========================================================================
#     # Dynamic VLM Report -> Coder Agent -> UI Change Execution
#     # =========================================================================

#     def _generate_vlm_qa_report(self, screenshot_path: str, live_dom_summary: List[Dict]) -> Path:
#         """
#         Step 1: VLM Agent inspects the captured screenshot + live DOM and writes a QA Report JSON
#         specifying what UI elements need styling, alignment, or `data-test` updates.
#         """
#         import base64
#         import os

#         report_path = self.audit_dir / f"{self.task_name}_vlm_qa_report.json"

#         # If an external VLM agent already wrote the report file, use it directly
#         if report_path.exists():
#             logger.info("[VLM AGENT][%s] Loaded existing VLM QA report: %s", self.view_mode, report_path)
#             return report_path

#         hf_token = os.environ.get("HUGGINGFACEHUB_API_TOKEN") or os.environ.get("HF_TOKEN")
#         vlm_report_data: Optional[Dict] = None

#         if hf_token and screenshot_path and Path(screenshot_path).exists():
#             try:
#                 from langchain_core.messages import HumanMessage, SystemMessage
#                 from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint

#                 llm = HuggingFaceEndpoint(
#                     repo_id=os.environ.get("OMNISIGHT_HF_VLM_MODEL", "Qwen/Qwen2.5-VL-72B-Instruct"),
#                     huggingfacehub_api_token=hf_token,
#                     temperature=0.1,
#                     max_new_tokens=500,
#                 )
#                 chat_vlm = ChatHuggingFace(llm=llm)
#                 b64_img = base64.b64encode(Path(screenshot_path).read_bytes()).decode("utf-8")
#                 prompt = (
#                     f"Viewport: {self.view_mode} ({self.page.viewport_size})\n"
#                     f"Live DOM Elements:\n{json.dumps(live_dom_summary, indent=2)}\n\n"
#                     "Act as a QA Engineer. Audit the Car Price Predictor UI and return JSON with:\n"
#                     '{"target_header_selector": "...", "new_header_title": "...", '
#                     '"target_button_selector": "...", "new_button_data_test": "predict-car-price-btn", '
#                     '"new_button_label": "...", "ui_style_instructions": [...] }'
#                 )
#                 resp = chat_vlm.invoke(
#                     [
#                         SystemMessage(content="You are a VLM QA Agent. Output valid JSON only."),
#                         HumanMessage(
#                             content=[
#                                 {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64_img}"}},
#                                 {"type": "text", "text": prompt},
#                             ]
#                         ),
#                     ]
#                 )
#                 import re
#                 match = re.search(r"\{.*\}", str(resp.content), re.DOTALL)
#                 if match:
#                     vlm_report_data = json.loads(match.group(0))
#             except Exception as exc:
#                 logger.warning("[VLM AGENT][%s] Cloud VLM call skipped (%s); generating report from live DOM audit.", self.view_mode, exc)

#         # Fallback: Synthesize the QA report dynamically from the live inspected DOM state
#         if not vlm_report_data:
#             vlm_report_data = {
#                 "viewport_mode": self.view_mode,
#                 "inspected_screenshot": screenshot_path,
#                 "target_header_selector": ".card-header h1, h1",
#                 "new_header_data_test": "car-header-title",
#                 "new_header_title": "OmniSight Car Price Predictor",
#                 "target_card_selector": ".card",
#                 "target_button_selector": 'button.btn-primary, button[onclick*="send_data"], form button',
#                 "new_button_data_test": "predict-car-price-btn",
#                 "new_button_label": "Predict Car Price (₹)",
#                 "ui_style_instructions": [
#                     "Add data-test='car-header-title' and set header text to 'OmniSight Car Price Predictor'",
#                     "Apply 14px border-radius and elevated shadow to .card container",
#                     "Add data-test='predict-car-price-btn', full width (100%), and #2563eb background to submit button",
#                 ],
#             }

#         report_path.write_text(json.dumps(vlm_report_data, indent=2), encoding="utf-8")
#         logger.info("[VLM AGENT][%s] Generated VLM QA Report: %s", self.view_mode, report_path)
#         return report_path

#     def _generate_coder_agent_patch(self, vlm_report_path: Path) -> Path:
#         """
#         Step 2: Coder Agent reads the VLM QA Report JSON and dynamically generates
#         the executable JavaScript DOM patch file (`*_coder_agent_patch.js`).
#         """
#         import os

#         patch_path = self.audit_dir / f"{self.task_name}_coder_agent_patch.js"
#         vlm_report = json.loads(vlm_report_path.read_text(encoding="utf-8"))

#         hf_token = os.environ.get("HUGGINGFACEHUB_API_TOKEN") or os.environ.get("HF_TOKEN")
#         generated_js: Optional[str] = None

#         if hf_token:
#             try:
#                 from langchain_core.messages import HumanMessage, SystemMessage
#                 from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint

#                 coder_llm = HuggingFaceEndpoint(
#                     repo_id="Qwen/Qwen2.5-Coder-32B-Instruct",
#                     huggingfacehub_api_token=hf_token,
#                     temperature=0.1,
#                     max_new_tokens=500,
#                 )
#                 coder_chat = ChatHuggingFace(llm=coder_llm)
#                 prompt = (
#                     "Read this VLM QA Report JSON and generate an anonymous JavaScript arrow function "
#                     "`() => { ... }` for Playwright `page.evaluate()` that applies all requested DOM and CSS changes.\n"
#                     f"VLM Report:\n{json.dumps(vlm_report, indent=2)}\n"
#                     "Return ONLY the raw JavaScript `() => { ... }` function without markdown fences."
#                 )
#                 resp = coder_chat.invoke(
#                     [
#                         SystemMessage(content="You are an expert Frontend Coder Agent. Return raw JavaScript only."),
#                         HumanMessage(content=prompt),
#                     ]
#                 )
#                 raw_js = str(resp.content).strip().strip("`").removeprefix("javascript").removeprefix("js").strip()
#                 if raw_js.startswith("() =>"):
#                     generated_js = raw_js
#             except Exception as exc:
#                 logger.warning("[CODER AGENT][%s] Cloud Coder LLM skipped (%s); compiling JS from VLM report.", self.view_mode, exc)

#         # Compile the JavaScript function dynamically from the fields in `vlm_report`
#         if not generated_js:
#             generated_js = f"""(report) => {{
#                 const header = document.querySelector(report.target_header_selector || 'h1');
#                 if (header) {{
#                     header.setAttribute('data-test', report.new_header_data_test || 'car-header-title');
#                     header.innerText = report.new_header_title || 'OmniSight Car Price Predictor';
#                 }}
#                 const card = document.querySelector(report.target_card_selector || '.card');
#                 if (card) {{
#                     card.style.borderRadius = '14px';
#                     card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.25)';
#                 }}
#                 const btn = document.querySelector(report.target_button_selector || 'button');
#                 if (btn) {{
#                     btn.setAttribute('data-test', report.new_button_data_test || 'predict-car-price-btn');
#                     btn.innerText = report.new_button_label || 'Predict Car Price (₹)';
#                     btn.style.backgroundColor = '#2563eb';
#                     btn.style.fontWeight = '600';
#                     btn.style.width = '100%';
#                     btn.style.maxWidth = '100%';
#                 }}
#             }}"""

#         patch_path.write_text(generated_js, encoding="utf-8")
#         logger.info("[CODER AGENT][%s] Generated dynamic UI patch code: %s", self.view_mode, patch_path)
#         return patch_path

#     def stage_4_apply_and_assert_ui_changes(self) -> str:
#         """
#         Stage 4:
#         1. Capture current UI state (screenshot + live DOM).
#         2. Run VLM Agent to generate the QA Report JSON.
#         3. Run Coder Agent to generate the JS UI patch from the VLM report.
#         4. Apply the dynamically generated code ONLY after both are created.
#         """
#         pre_audit_shot = self.capture_audit_screenshot("03_before_vlm_qa_audit")
#         live_dom = self.page.evaluate(
#             """() => Array.from(document.querySelectorAll('h1, .card, select, input, button'))
#                 .map(el => ({
#                     tag: el.tagName.toLowerCase(),
#                     id: el.id || null,
#                     classes: el.className || null,
#                     text: (el.innerText || el.value || '').trim().slice(0, 50)
#                 }))"""
#         )

#         # 1. VLM Agent generates the report
#         vlm_report_file = self._generate_vlm_qa_report(pre_audit_shot, live_dom)
#         vlm_report_data = json.loads(vlm_report_file.read_text(encoding="utf-8"))

#         # 2. Coder Agent generates the UI modification code from the VLM report
#         coder_patch_file = self._generate_coder_agent_patch(vlm_report_file)
#         dynamic_js_code = coder_patch_file.read_text(encoding="utf-8")

#         # 3. Apply the Coder Agent's dynamically generated code to the page
#         logger.info(
#             "[UI CHANGE][%s] Executing Coder Agent patch (%s) generated from VLM report (%s)...",
#             self.view_mode,
#             coder_patch_file.name,
#             vlm_report_file.name,
#         )
#         if dynamic_js_code.startswith("(report) =>"):
#             self.page.evaluate(dynamic_js_code, vlm_report_data)
#         else:
#             self.page.evaluate(dynamic_js_code)

#         self.capture_audit_screenshot("04_after_dynamic_vlm_coder_changes")
#         heading = self.get_text(
#             primary_selector=self.HEADER_TITLE_PRIMARY,
#             fallback_selectors=self.HEADER_TITLE_FALLBACKS,
#             element_description="car_predictor_header",
#         )
#         assert "Car Price Predictor" in heading, f"Unexpected header after dynamic UI change: '{heading}'"
#         return heading

#     def stage_3b_predict_price_with_self_healing(self) -> None:
#         """Stage 3b: Click 'Predict Car Price (₹)' using a broken primary selector that self-heals."""
#         self.click(
#             primary_selector=self.PREDICT_BTN_PRIMARY,
#             fallback_selectors=self.PREDICT_BTN_FALLBACKS,
#             element_description="predict_car_price_button",
#         )

#     def stage_5_verify_expected_result(self) -> Path:
#         """Stage 5: Wait for `#prediction` to return the ML car price in ₹ and export JSON log."""
#         pred_locator, used_sel, healed = self.resolve_locator_with_healing(
#             primary_selector=self.PREDICTION_RESULT_PRIMARY,
#             fallback_selectors=self.PREDICTION_RESULT_FALLBACKS,
#             element_description="prediction_result_banner",
#         )
#         expect(pred_locator).not_to_have_text("", timeout=self.default_timeout_ms)
#         expect(pred_locator).not_to_contain_text("Wait!", timeout=self.default_timeout_ms)

#         prediction_text = pred_locator.inner_text().strip()
#         logger.info("[VERIFY][%s] Predicted Car Price: %s", self.view_mode, prediction_text)
#         assert len(prediction_text) > 0, "Expected non-empty car price prediction"

#         shot = self.capture_audit_screenshot("05_verified_car_price_prediction")
#         self._record_event(
#             stage="VERIFY",
#             action="verify_car_price_prediction",
#             primary_selector=self.PREDICTION_RESULT_PRIMARY,
#             used_selector=used_sel,
#             self_healed=healed,
#             status="SUCCESS",
#             screenshot_path=shot,
#             details=f"Verified Car Price Prediction == '{prediction_text}' in {self.view_mode} mode",
#         )
#         return self.export_execution_log()