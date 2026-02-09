import os
from typing import Optional

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Configuration class to manage environment variables and settings."""

    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")


    # Application Settings
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    TEMPERATURE: float = float(os.getenv("AGENT_TEMPERATURE", "0.3"))
    MAX_OUTPUT_TOKENS: int = int(os.getenv("AGENT_MAX_OUTPUT_TOKENS", "2048"))

    # Validation
    @classmethod
    def validate(cls) -> None:
        """Validate that required configuration values are present."""
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is required")