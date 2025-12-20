from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from bson import ObjectId
from App.Models.Schemas import PhotoProject, PhotoProjectCreate, PhotoProjectUpdate
from App.Core.Database import get_database
from App.Api.Auth import get_current_user
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
    
    photo_dict = photo.dict()
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