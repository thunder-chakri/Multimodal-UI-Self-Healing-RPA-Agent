
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def run_automation():
    driver = None

    try:
        print("Starting OmniSight automation...")

        options = Options()
        options.add_argument("--disable-extensions")
        options.add_argument("--no-first-run")
        options.page_load_strategy = "eager"

        driver = webdriver.Chrome(options=options)
        driver.set_page_load_timeout(30)

        print("Chrome browser launched")

        driver.get("https://example.com")

        heading = WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located(
                (By.TAG_NAME, "h1")
            )
        )

        print("Website:", driver.title)
        print("Heading:", heading.text)
        print("Automation completed successfully!")

        time.sleep(3)

    except Exception as error:
        print("Automation failed:", error)

    finally:
        if driver is not None:
            try:
                driver.quit()
            except Exception:
                pass

if __name__ == "__main__":
    run_automation()
