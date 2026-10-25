
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()

try:
    driver.get("https://example.com")

    heading = driver.find_element(By.TAG_NAME, "h1")

    print("Website title:", driver.title)
    print("Heading:", heading.text)
    print("Automation completed successfully!")

finally:
    driver.quit()
