from motor.motor_asyncio import AsyncIOMotorClient
from App.Core.Config import settings
import logging

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient = None
database = None


async def connect_to_mongo():
    """Connect To MongoDB With Proper Error Handling"""
    global client, database
    try:
        client = AsyncIOMotorClient(
            settings.mongodb_url,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        # Test The Connection
        await client.admin.command('ping')
        database = client[settings.database_name]
        logger.info(f"Successfully Connected To MongoDB: {settings.database_name}")
    except Exception as e:
        logger.error(f"Failed To Connect To MongoDB: {e}")
        logger.warning("Continuing Without MongoDB Connection - Some Features May Not Work")
        # Do Not Raise, Allow App To Start


async def close_mongo_connection():
    """Close MongoDB Connection Gracefully"""
    global client
    try:
        if client:
            client.close()
            logger.info("MongoDB Connection Closed Successfully")
    except Exception as e:
        logger.error(f"Error Closing MongoDB Connection: {e}")


def get_database():
    """Get Database Instance With Validation"""
    if database is None:
        logger.error("Database Not Initialized. Call connect_to_mongo() First.")
        raise RuntimeError("Database Connection Not Established")
    return database