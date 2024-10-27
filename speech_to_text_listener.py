from typing import Optional
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.select import Select
import time

class SpeechToTextListener:
    """A class for performing speech-to-text using our web-based service."""

    def __init__(
            self,
            website_path: str = "https://your-deployed-url.com",  # Replace with your actual deployed URL
            language: str = "en-IN",
            wait_time: int = 10):
        
        """Initializes the SpeechToTextListener class with the given website path and language."""
        self.website_path = website_path
        self.language = language
        self.chrome_options = Options()
        self.chrome_options.add_argument("--use-fake-ui-for-media-stream")
        self.chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3")
        self.chrome_options.add_argument("--headless=new")
        self.driver = webdriver.Chrome(options=self.chrome_options)
        self.wait = WebDriverWait(self.driver, wait_time)
        print("Made By ❤️ HelpingAI")

    def stream(self, content: str):
        """Prints the given content to the console with a cyan color, overwriting previous output."""
        print("\033[96m\rUser Speaking: \033[93m" + f" {content}", end='', flush=True)

    def get_text(self) -> str:
        """Retrieves the transcribed text from the website."""
        return self.driver.find_element(By.TAG_NAME, "textarea").get_attribute("value")

    def select_language(self):
        """Selects the language from the dropdown."""
        language_select = Select(self.driver.find_element(By.ID, "language-select"))
        language_select.select_by_value(self.language)

    def verify_language_selection(self):
        """Verifies if the language is correctly selected."""
        language_select = Select(self.driver.find_element(By.ID, "language-select"))
        selected_language = language_select.first_selected_option.get_attribute("value")
        return selected_language == self.language

    def main(self) -> Optional[str]:
        """Performs speech-to-text conversion and returns the transcribed text."""
        self.driver.get(self.website_path)
        
        # Ensure the dropdown options are fully loaded before selecting
        self.wait.until(EC.presence_of_element_located((By.ID, "language-select")))
        
        # Select the language
        self.select_language()

        # Verify the language selection
        if not self.verify_language_selection():
            print(f"Error: Failed to select the correct language. Selected: {self.verify_language_selection()}, Expected: {self.language}")
            return None

        # Start recording
        start_button = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Start Recording')]")))
        start_button.click()

        print("\033[94m\rListening...", end='', flush=True)
        
        # Wait for the "Stop Recording" button to appear, indicating that recording has started
        self.wait.until(EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Stop Recording')]")))

        # Keep checking for text changes
        previous_text = ""
        unchanged_count = 0
        max_unchanged = 5  # Stop after 5 seconds of no change

        while True:
            current_text = self.get_text()
            if current_text != previous_text:
                self.stream(current_text)
                previous_text = current_text
                unchanged_count = 0
            else:
                unchanged_count += 1
                if unchanged_count >= max_unchanged:
                    break
            time.sleep(1)

        # Stop recording
        stop_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Stop Recording')]")
        stop_button.click()

        return self.get_text()

    def listen(self, prints: bool = False) -> Optional[str]:
        """Starts the listening process and returns the transcribed text."""
        result = self.main()
        if result and len(result) != 0:
            print("\r" + " " * (len(result) + 16) + "\r", end="", flush=True)
            if prints: print("\033[92m\rYOU SAID: " + f"{result}\033[0m\n")
        return result

if __name__ == "__main__":
    listener = SpeechToTextListener(language="en-IN")  # You can specify the desired language here
    speech = listener.listen()
    print("FINAL EXTRACTION: ", speech)