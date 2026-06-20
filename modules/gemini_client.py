import os
import json
from google import genai
from google.genai import types

class GeminiClient:
    def __init__(self):
        self.config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config.json')
        self.api_key = self.load_api_key()
        self.client = None
        if self.api_key and self.api_key != "YOUR_GEMINI_API_KEY_HERE":
            self.client = genai.Client(api_key=self.api_key)

    def load_api_key(self):
        # 1. Check environment variable first
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            return api_key
            
        # 2. Check config.json
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                    key = config.get("GEMINI_API_KEY")
                    if key and key != "YOUR_GEMINI_API_KEY_HERE":
                        return key
            except Exception:
                pass
        return None

    def save_api_key(self, api_key):
        if not api_key:
            return False
        
        # Save to config.json
        config = {}
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
            except Exception:
                pass
                
        config["GEMINI_API_KEY"] = api_key
        
        try:
            with open(self.config_path, 'w') as f:
                json.dump(config, f, indent=2)
            self.api_key = api_key
            self.client = genai.Client(api_key=api_key)
            return True
        except Exception:
            return False

    def validate_api_key(self, api_key=None):
        test_key = api_key or self.api_key
        if not test_key or test_key == "YOUR_GEMINI_API_KEY_HERE":
            return False, "API Key is not set."
            
        try:
            # Temporary client for key verification
            temp_client = genai.Client(api_key=test_key)
            
            # Try a modern model first (gemini-2.5-flash)
            try:
                temp_client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents="test",
                    config=types.GenerateContentConfig(max_output_tokens=5)
                )
            except Exception:
                # Fallback to gemini-2.0-flash
                temp_client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents="test",
                    config=types.GenerateContentConfig(max_output_tokens=5)
                )
            
            # If successful and api_key was provided as an argument, save it
            if api_key:
                self.save_api_key(api_key)
            return True, "API Key is valid!"
        except Exception as e:
            return False, str(e)


    def generate(self, prompt, system_instruction=None, json_mode=False, model_name="gemini-2.5-flash", image_data=None, image_mime=None):
        if not self.api_key or self.api_key == "YOUR_GEMINI_API_KEY_HERE":
            raise ValueError("Gemini API key is not configured. Please set it in config.json or via the UI settings.")
            
        if not self.client:
            self.client = genai.Client(api_key=self.api_key)
        
        config_params = {}
        if system_instruction:
            config_params["system_instruction"] = system_instruction
        if json_mode:
            config_params["response_mime_type"] = "application/json"
            
        config = types.GenerateContentConfig(**config_params)
        
        contents = []
        if image_data and image_mime:
            import base64
            try:
                raw_bytes = base64.b64decode(image_data)
                img_part = types.Part.from_bytes(data=raw_bytes, mime_type=image_mime)
                contents.append(img_part)
            except Exception:
                pass
                
        contents.append(prompt)
        
        import time
        max_retries = 3
        retry_delay = 2 # initial delay in seconds
        
        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config
                )
                break  # If successful, exit the retry loop
            except Exception as e:
                error_str = str(e).lower()
                # Check if the error is a temporary server outage or rate limit
                if attempt < max_retries - 1 and ("503" in error_str or "unavailable" in error_str or "429" in error_str or "quota" in error_str or "high demand" in error_str):
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff (2s, 4s, 8s...)
                else:
                    raise e  # Throw error if we ran out of retries or it's a structural error
        
        text_response = response.text
        if json_mode and text_response:
            cleaned = text_response.strip()
            # Strip markdown json blocks if present
            if cleaned.startswith("```"):
                first_newline = cleaned.find("\n")
                if first_newline != -1:
                    cleaned = cleaned[first_newline:].strip()
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3].strip()
            return cleaned
            
        return text_response

