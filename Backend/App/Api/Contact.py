from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from App.Models.Schemas import ContactMessage, ContactMessageCreate
from App.Core.Database import get_database
from App.Api.Auth import get_current_user
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("")
async def create_contact_message(message: ContactMessageCreate):
    """Create A New Contact Message With Error Handling"""
    try:
        db = get_database()
        
        message_dict = message.dict()
        message_dict["created_at"] = datetime.utcnow()
        message_dict["read"] = False
        
        result = await db.contact_messages.insert_one(message_dict)
        
        # TODO: Send Email Notification
        # This Would Integrate With SMTP Settings
        
        logger.info(f"Contact Message Created : {result.inserted_id}")
        return {
            "message": "Message Sent Successfully",
            "id": str(result.inserted_id)
        }
    except Exception as e:
        logger.error(f"Error Creating Contact Message: {e}")
        raise HTTPException(status_code=500, detail="Failed To Send Message")


@router.get("", response_model=List[ContactMessage])
async def get_contact_messages(
    read_only: bool = False,
    skip: int = 0,
    limit: int = 100,
    current_user: str = Depends(get_current_user)
):
    db = get_database()
    
    query = {}
    if read_only:
        query["read"] = True
    
    cursor = db.contact_messages.find(query).sort("created_at", -1).skip(skip).limit(limit)
    messages = await cursor.to_list(length=limit)
    
    return messages


@router.get("/{message_id}", response_model=ContactMessage)
async def get_contact_message(
    message_id: str,
    current_user: str = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(message_id):
        raise HTTPException(status_code=400, detail="Invalid Message ID")
    
    message = await db.contact_messages.find_one({"_id": ObjectId(message_id)})
    
    if not message:
        raise HTTPException(status_code=404, detail="Message Not Found")
    
    return message


@router.put("/{message_id}/read")
async def mark_message_read(
    message_id: str,
    current_user: str = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(message_id):
        raise HTTPException(status_code=400, detail="Invalid Message ID")
    
    result = await db.contact_messages.update_one(
        {"_id": ObjectId(message_id)},
        {"$set": {"read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message Not Found")
    
    return {"message": "Message Marked As Read"}


@router.delete("/{message_id}")
async def delete_contact_message(
    message_id: str,
    current_user: str = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(message_id):
        raise HTTPException(status_code=400, detail="Invalid Message ID")
    
    result = await db.contact_messages.delete_one({"_id": ObjectId(message_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message Not Found")
    
    return {"message": "Message Deleted Successfully"}