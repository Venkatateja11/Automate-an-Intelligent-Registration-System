import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.options import Options

BASE_URL = "http://localhost:5500/registration/index.html"

def setup_driver():
    opts = Options()
    opts.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=opts)
    driver.implicitly_wait(5)
    return driver

def take_screenshot(driver, name):
    driver.save_screenshot(name)

def test_flow_A_negative():
    driver = setup_driver()
    try:
        # 1. Launch
        driver.get(BASE_URL)

        # 2. Print URL + Title
        print("URL:", driver.current_url)
        print("Title:", driver.title)

        # 3. Fill with Last Name skipped
        driver.find_element(By.ID, "firstName").send_keys("Amit")
        driver.find_element(By.ID, "email").send_keys("amit@example.com")
        Select(driver.find_element(By.ID, "country")).select_by_visible_text("India")
        driver.find_element(By.ID, "phone").send_keys("+91 9876543210")
        driver.find_element(By.CSS_SELECTOR, 'input[name="gender"][value="Male"]').click()
        driver.find_element(By.ID, "address").send_keys("Vaghodia, Vadodara, GJ")
        driver.find_element(By.ID, "password").send_keys("StrongPass1!")
        driver.find_element(By.ID, "confirmPassword").send_keys("StrongPass1!")
        driver.find_element(By.ID, "terms").click()

        # 4. Submit
        driver.find_element(By.ID, "submitBtn").click()

        # 5. Validate error for missing Last Name
        last_err = driver.find_element(By.ID, "lastNameError").text
        assert "Last name is required." in last_err

        group_class = driver.find_element(By.ID, "lastName").find_element(By.XPATH, "..").get_attribute("class")
        assert "invalid" in group_class

        # 6. Screenshot
        take_screenshot(driver, "error-state.png")
    finally:
        driver.quit()

def test_flow_B_positive():
    driver = setup_driver()
    try:
        driver.get(BASE_URL)

        driver.find_element(By.ID, "firstName").send_keys("Amit")
        driver.find_element(By.ID, "lastName").send_keys("Shah")
        driver.find_element(By.ID, "email").send_keys("amit.shah@example.com")
        Select(driver.find_element(By.ID, "country")).select_by_visible_text("India")
        Select(driver.find_element(By.ID, "state")).select_by_visible_text("Gujarat")
        Select(driver.find_element(By.ID, "city")).select_by_visible_text("Vaghodia")
        driver.find_element(By.ID, "phone").send_keys("+91 9876543210")
        driver.find_element(By.ID, "password").send_keys("StrongPass1!")
        driver.find_element(By.ID, "confirmPassword").send_keys("StrongPass1!")
        driver.find_element(By.ID, "terms").click()

        driver.find_element(By.ID, "submitBtn").click()

        alert = driver.find_element(By.ID, "formAlert").get_attribute("class")
        assert "success" in alert

        # Modal visible
        modal_class = driver.find_element(By.ID, "successModal").get_attribute("class")
        assert "hidden" not in modal_class

        # After success, form resets
        assert driver.find_element(By.ID, "firstName").get_attribute("value") == ""
        assert driver.find_element(By.ID, "lastName").get_attribute("value") == ""

        take_screenshot(driver, "success-state.png")

        # Close modal
        driver.find_element(By.ID, "successClose").click()
        time.sleep(0.5)
        assert "hidden" in driver.find_element(By.ID, "successModal").get_attribute("class")
    finally:
        driver.quit()

def test_flow_C_logic():
    driver = setup_driver()
    try:
        driver.get(BASE_URL)

        # Country → States update
        Select(driver.find_element(By.ID, "country")).select_by_visible_text("United States")
        st = Select(driver.find_element(By.ID, "state"))
        options = [o.text for o in st.options]
        assert "California" in options

        # State → Cities update
        st.select_by_visible_text("California")
        ct = Select(driver.find_element(By.ID, "city"))
        cities = [o.text for o in ct.options]
        assert "San Francisco" in cities

        # Password strength
        pwd = driver.find_element(By.ID, "password")
        pwd.send_keys("abc")
        label = driver.find_element(By.ID, "strengthLabel").text
        assert "Weak" in label

        pwd.clear()
        pwd.send_keys("abcD1234")
        label = driver.find_element(By.ID, "strengthLabel").text
        assert "Medium" in label or "Strong" in label

        # Wrong confirm password
        driver.find_element(By.ID, "confirmPassword").send_keys("Mismatch123")
        err = driver.find_element(By.ID, "confirmPasswordError").text
        assert "Passwords do not match." in err

        # Submit disabled until valid
        assert driver.find_element(By.ID, "submitBtn").get_attribute("disabled") == "true"

        # Make valid
        driver.find_element(By.ID, "firstName").send_keys("John")
        driver.find_element(By.ID, "lastName").send_keys("Doe")
        driver.find_element(By.ID, "email").send_keys("john.doe@example.com")
        driver.find_element(By.ID, "phone").send_keys("+1 5551234567")
        driver.find_element(By.CSS_SELECTOR, 'input[name="gender"][value="Male"]').click()
        driver.find_element(By.ID, "terms").click()

        # Confirm matches
        cf = driver.find_element(By.ID, "confirmPassword")
        cf.clear(); cf.send_keys("abcD1234")

        assert driver.find_element(By.ID, "submitBtn").get_attribute("disabled") is None
    finally:
        driver.quit()
