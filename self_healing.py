
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def find_with_healing(driver):
    locators = [
        (By.ID, "old-login-button"),
        (By.ID, "new-login-button"),
        (By.XPATH, "//button[normalize-space()='Login']")
    ]

    for index, locator in enumerate(locators):
        try:
            element = WebDriverWait(driver, 3).until(
                EC.element_to_be_clickable(locator)
            )
            if index > 0:
                print("SELF-HEALING ACTIVATED")
                print("Recovered using:", locator)
            return element
        except Exception:
            print("Locator failed:", locator)

    raise RuntimeError("All locators failed")

def main():
    driver = None

    try:
        options = Options()
        options.page_load_strategy = "eager"

        driver = webdriver.Chrome(options=options)

        page = Path(__file__).with_name(
            "test_page.html"
        ).resolve().as_uri()

        driver.get(page)

        button = find_with_healing(driver)
        button.click()

        result = driver.find_element(
            By.ID, "result"
        ).text

        print("Result:", result)
        assert result == "Login clicked successfully!"
        print("TEST PASSED")

    except Exception as error:
        print("TEST FAILED:", error)

    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    main()
