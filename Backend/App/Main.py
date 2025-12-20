from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from App.Core.Config import settings
from App.Core.Database import connect_to_mongo, close_mongo_connection
from App.Api import Auth as auth, Profile as profile, Photos as photos, Videos as videos, Edits as edits, Contact as contact, Upload as upload, Analytics as analytics
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lifespan Context Manager (Replaces Deprecated on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Up Pranjal Portfolio API...")
    try:
        await connect_to_mongo()
        logger.info("Successfully Connected To MongoDB")
    except Exception as e:
        logger.error(f"Failed To Connect To MongoDB: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting Down Pranjal Portfolio API...")
    try:
        await close_mongo_connection()
        logger.info("Successfully Closed MongoDB Connection")
    except Exception as e:
        logger.error(f"Error Closing MongoDB Connection: {e}")

app = FastAPI(
    title="Pranjal Portfolio API",
    description="Cinematic Portfolio Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Uploads Directory
try:
    os.makedirs(settings.upload_directory, exist_ok=True)
    logger.info(f"Upload Directory Ready: {settings.upload_directory}")
except Exception as e:
    logger.error(f"Failed To Create Upload Directory: {e}")

# Mount Static Files
try:
    app.mount("/Uploads", StaticFiles(directory=settings.upload_directory), name="Uploads")
except Exception as e:
    logger.error(f"Failed To Mount Static Files: {e}")

# Health Check
@app.get("/")
async def root():
    return {
        "message": "Pranjal Portfolio API",
        "version": "1.0.0",
        "status": "active"
    }


@app.get("/api/health")
async def health():
    return {"status": "healthy"}


# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(photos.router, prefix="/api/photos", tags=["Photography"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videography"])
app.include_router(edits.router, prefix="/api/edits", tags=["Video Editing"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])