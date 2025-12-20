from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "pranjal_portfolio"
    
    # JWT
    jwt_secret: str = "Anu8-Secret-@#$-Pranjal-Portfolio-Production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 Hours For Better Admin ExperienceQ
    
    # Admin
    admin_email: str = "admin@pranjal.com"
    admin_password: str = "1608@#$asd"
    
    # SMTP
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    
    # URLs
    frontend_url: str = "http://localhost:3000"
    admin_url: str = "http://localhost:3001"
    backend_url: str = "http://localhost:8000"
    
    # File Upload
    max_file_size: int = 104857600  # 100MB
    upload_directory: str = "./Uploads"
    
    # CORS - Allow All Localhost Ports For Development
    cors_origins: str = "http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:5174,http://localhost:4173,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:5173"
    
    # Environment
    environment: str = "development"
    
    class Config:
        env_file = "../.env"
        
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

settings = Settings()