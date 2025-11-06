"""
Configuration module for Flask application.
Handles database and application settings from environment variables.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration class."""
    
    # Flask configuration
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    
    # MySQL Database configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'OSGCORER')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'customer_app_db')
    
    # PRP SMS OTP Service Configuration
    PRP_API_KEY = os.getenv('PRP_API_KEY', '9n5ZIuuNKTkIGyJ')
    PRP_API_BASE_URL = os.getenv('PRP_API_BASE_URL', 'https://api.bulksmsadmin.com/BulkSMSapi/keyApiSendSMS')
    PRP_SENDER_ID = os.getenv('PRP_SENDER_ID', 'PRP***')
    PRP_TEMPLATE_NAME = os.getenv('PRP_TEMPLATE_NAME', 'OSG_SMS_OTP')
    
    @property
    def database_url(self) -> str:
        """
        Construct MySQL database connection URL.
        
        Returns:
            str: MySQL connection URL
        """
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )
