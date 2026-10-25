
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

print("Starting OmniSight automation...")

driver = None

try:
    driver = webdriver.Chrome()
    driver.get("https://example.com")

    heading = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "h1"))
    )

    print("Website:", driver.title)
    print("Heading:", heading.text)
    print("Automation successful!")

except Exception as error:
    print("Automation failed:", error)

finally:
    if driver is not None:
        driver.quit()
