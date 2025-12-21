import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def drop_database():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    await client.drop_database("pranjal_portfolio")
    print("Database 'pranjal_portfolio' dropped successfully.")
    client.close()

asyncio.run(drop_database())