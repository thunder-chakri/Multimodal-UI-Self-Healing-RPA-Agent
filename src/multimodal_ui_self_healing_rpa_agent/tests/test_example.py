"""End-to-end Pytest suite validating OmniSight across both Desktop and Mobile viewports."""

import json
from pathlib import Path

from playwright.sync_api import Page

from pages.sauce_damo import SauceDemoRPAPage
# from pages.sauce_demp import CarPricePredictorRPAPage


def test_omnisight_saucedemo_rpa_workflow(
    rpa_page: Page,
    audit_directory: Path,
) -> None:
    """
    Runs automatically in BOTH Desktop (1280x800) and Mobile (Pixel 7, 412x915) views:
    1. Launch browser (via parameterized `rpa_page` Chromium fixture)
    2. Observe the Interface (login controls)
    3. Perform an Action (login + self-healed 'Add to cart' click)
    4. Assert the Outcome (inventory page URL & 'Products' title)
    5. Verify the Expected Result (cart badge == '1', responsive menu drawer, JSON audit report)
    6. Teardown (via fixture finalizer)
    """
    agent = SauceDemoRPAPage(
        page=rpa_page,
        task_name="saucedemo_order_rpa",
        audit_dir=audit_directory,
    )

    # Stage 2: Observe the interface
    agent.stage_2_observe_interface()

    # Stage 3a: Perform login action
    agent.stage_3_perform_login_action(
        username="standard_user",
        password="secret_sauce",
    )

    # Stage 4: Assert immediate login outcome
    header_text = agent.stage_4_assert_login_outcome()
    assert header_text == "Products"

    # Stage 3b: Perform action with simulated UI selector change (triggers self-healing)
    agent.stage_3b_add_item_with_self_healing()

    # Stage 5: Verify final cart state, responsive drawer, and export execution log
    log_file = agent.stage_5_verify_expected_result()
    assert log_file.exists(), "Execution log JSON must be created"

    log_data = json.loads(log_file.read_text(encoding="utf-8"))
    assert log_data["status"] == "COMPLETED"
    assert log_data["view_mode"] in ("desktop", "mobile_pixel_7")
    assert log_data["repaired_selectors_count"] >= 2
