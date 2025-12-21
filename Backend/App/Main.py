from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from App.Core.Config import settings
from App.Core.Database import connect_to_mongo, close_mongo_connection
from App.Api import Auth as auth, Profile as profile, Photos as photos, Videos as videos, Edits as edits, Contact as contact, Analytics as analytics, Media as media
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
# Upload Router Removed - All Media Now Handled Via Google Drive
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(media.router, prefix="/api/media", tags=["Media - Google Drive"])