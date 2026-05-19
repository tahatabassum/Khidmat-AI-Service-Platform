import os
import time
import json
import logging
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables from agents/.env explicitly
_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=_env_path)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    logger.warning("GEMINI_API_KEY not found in environment variables.")

def call_gemini(system_prompt: str, user_message: str, retries: int = 3, image_base64: str = None) -> str:
    """
    Calls the Google Gemini API with a system prompt and user message, with retry logic.
    Using gemini-2.5-flash via the official google-genai SDK.
    """
    start_time = time.time()
    
    logger.info("Waiting 1 second before the first API call...")
    time.sleep(1)
    
    for attempt in range(1, retries + 1):
        try:
            logger.info(f"Calling Google Gemini API (attempt {attempt}/{retries})")
            if not api_key:
                raise Exception("GEMINI_API_KEY not configured")
                
            client = genai.Client(api_key=api_key)
            
            contents = []
            if image_base64:
                import base64
                # Sometimes base64 strings have data:image/jpeg;base64, prefix. Strip it if exists.
                img_data = image_base64
                mime_type = 'image/jpeg'
                if "base64," in image_base64:
                    header, img_data = image_base64.split("base64,")
                    if "png" in header: mime_type = 'image/png'
                
                contents.append(
                    types.Part.from_bytes(
                        data=base64.b64decode(img_data),
                        mime_type=mime_type
                    )
                )
            contents.append(user_message)
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                ),
            )
                
            end_time = time.time()
            logger.info(f"Gemini API call successful in {end_time - start_time:.2f} seconds.")
            
            return response.text
            
        except Exception as e:
            logger.error(f"Network or API error: {e}")
            
            if attempt == 1:
                wait_time = 2
            elif attempt == 2:
                wait_time = 3
            else:
                wait_time = 3
                
            if attempt < retries:
                logger.info(f"Sleeping for {wait_time} seconds before next attempt...")
                time.sleep(wait_time)
            
    end_time = time.time()
    logger.error(f"Failed to get response from Gemini API after {retries} attempts (Total time: {end_time - start_time:.2f}s).")
    return ""

def call_gemini_json(system_prompt: str, user_message: str, retries: int = 3, image_base64: str = None) -> dict:
    """
    Calls Gemini API and parses the response as JSON. Strips markdown blocks if present.
    """
    # Instruct model to return JSON
    json_system_prompt = system_prompt + "\n\nIMPORTANT: You must return ONLY valid JSON. No markdown formatting, no explanation, just the raw JSON."
    
    raw_response = call_gemini(json_system_prompt, user_message, retries, image_base64)
    if not raw_response:
        return {}
        
    # Strip markdown if model didn't listen
    cleaned = raw_response.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    
    cleaned = cleaned.strip()
    
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from Gemini. Raw response: {cleaned}")
        logger.error(f"JSON Parse Error: {e}")
        return {}
