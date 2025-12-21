from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from bson import ObjectId
from App.Models.Schemas import PhotoProject, PhotoProjectCreate, PhotoProjectUpdate
from App.Core.Database import get_database
from App.Api.Auth import get_current_user
from App.Core.GoogleDrive import get_drive_service, get_media_urls
from datetime import datetime

router = APIRouter()


@router.get("", response_model=List[PhotoProject])
async def get_photos(
    published_only: bool = True,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    db = get_database()
    
    query = {}
    if published_only:
        query["published"] = True
    if category:
        query["category"] = category
    
    cursor = db.photo_projects.find(query).sort("order", 1).skip(skip).limit(limit)
    photos = await cursor.to_list(length=limit)
    
    # Process Google Drive file IDs To Ensure Thumbnail URLs Are Available
    for photo in photos:
        if photo.get('drive_file_id'):
            drive = get_drive_service()
            # If No image_url Or thumbnail_url, Generate From drive_file_id
            if not photo.get('image_url') or 'drive.google.com' not in photo.get('image_url', ''):
                photo['image_url'] = drive.get_direct_download_url(photo['drive_file_id'])
            if not photo.get('thumbnail_url'):
                photo['thumbnail_url'] = drive.get_thumbnail_url(photo['drive_file_id'])
    
    return photos


@router.get("/categories")
async def get_photo_categories():
    db = get_database()
    categories = await db.photo_projects.distinct("category")
    return {"categories": categories}


@router.get("/{photo_id}", response_model=PhotoProject)
async def get_photo(photo_id: str):
    db = get_database()
    
    if not ObjectId.is_valid(photo_id):
        raise HTTPException(status_code=400, detail="Invalid Photo ID")
    
    photo = await db.photo_projects.find_one({"_id": ObjectId(photo_id)})
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo Not Found")
    
    return photo


@router.post("", response_model=PhotoProject)
async def create_photo(
    photo: PhotoProjectCreate,
    current_user: str = Depends(get_current_user)
):
    db = get_database()
    drive = get_drive_service()
    
    photo_dict = photo.dict()
    
    # If image_url Is A Google Drive URL, Extract The File ID
    if 'drive.google.com' in photo_dict['image_url']:
        file_id = drive.extract_file_id_from_url(photo_dict['image_url'])
        if file_id:
            photo_dict['drive_file_id'] = file_id
            # Generate Proper URLs
            photo_dict['image_url'] = drive.get_direct_download_url(file_id)
            if not photo_dict.get('thumbnail_url'):
                photo_dict['thumbnail_url'] = drive.get_thumbnail_url(file_id)
    
    photo_dict["created_at"] = datetime.utcnow()
    photo_dict["updated_at"] = datetime.utcnow()
    
    result = await db.photo_projects.insert_one(photo_dict)
    created_photo = await db.photo_projects.find_one({"_id": result.inserted_id})
    
    return created_photo


@router.put("/{photo_id}", response_model=PhotoProject)
async def update_photo(
    photo_id: str,
    photo: PhotoProjectUpdate,
    current_user: str = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(photo_id):
        raise HTTPException(status_code=400, detail="Invalid Photo ID")
    
    photo_dict = {k: v for k, v in photo.dict().items() if v is not None}
    photo_dict["updated_at"] = datetime.utcnow()
    
    result = await db.photo_projects.update_one(
        {"_id": ObjectId(photo_id)},
        {"$set": photo_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Photo Not Found")
    
    updated_photo = await db.photo_projects.find_one({"_id": ObjectId(photo_id)})
    return updated_photo


@router.delete("/{photo_id}")
async def delete_photo(
    photo_id: str,
    current_user: str = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(photo_id):
        raise HTTPException(status_code=400, detail="Invalid Photo ID")
    
    result = await db.photo_projects.delete_one({"_id": ObjectId(photo_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Photo Not Found")
    
    return {"message": "Photo Deleted Successfully"}