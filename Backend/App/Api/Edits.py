from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from App.Models.Schemas import EditProject, EditProjectCreate, EditProjectUpdate
from App.Core.Database import get_database
from App.Api.Auth import get_current_user
from datetime import datetime

router = APIRouter()
# Cloudinary Upload Endpoint For Video Edits
from fastapi import UploadFile, File
@router.post("/upload-video")
async def upload_edit_video(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    from App.Core.CloudinaryUtil import cloudinary
    result = cloudinary.uploader.upload(
        await file.read(),
        folder="edit_videos",
        resource_type="video"
    )
    return {"video_url": result["secure_url"]}


@router.get("", response_model=List[EditProject])
async def get_edits(
    published_only: bool = True,
    category: str = None,
    skip: int = 0,
    limit: int = 100
):
    db = get_database()
    
    query = {}
    if published_only:
        query["published"] = True
    
    if category:
        query["category"] = category
    
    cursor = db.edit_projects.find(query).sort("order", 1).skip(skip).limit(limit)
    edits = await cursor.to_list(length=limit)
    
    return edits


@router.get("/categories", response_model=dict)
async def get_edit_categories():
    db = get_database()
    categories = await db.edit_projects.distinct("category")
    return {"categories": categories}


@router.get("/featured", response_model=EditProject)
async def get_featured_edit():
    db = get_database()
    
    edit = await db.edit_projects.find_one({"is_featured": True, "published": True})
    
    if not edit:
        # Return First Published Edit If No Featured
        edit = await db.edit_projects.find_one({"published": True})
    
    if not edit:
        raise HTTPException(status_code=404, detail="No Featured Edit Found")
    
    return edit


@router.get("/{edit_id}", response_model=EditProject)
async def get_edit(edit_id: str):
    db = get_database()
    
    if not ObjectId.is_valid(edit_id):
        raise HTTPException(status_code=400, detail="Invalid Edit ID")
    
    edit = await db.edit_projects.find_one({"_id": ObjectId(edit_id)})
    
    if not edit:
        raise HTTPException(status_code=404, detail="Edit Not Found")
    
    return edit


@router.post("", response_model=EditProject)
async def create_edit(
    edit: EditProjectCreate,
    current_user: str = Depends(get_current_user)
):
    db = get_database()
    
    # If This Is Featured, Unfeature Others
    if edit.is_featured:
        await db.edit_projects.update_many(
            {"is_featured": True},
            {"$set": {"is_featured": False}}
        )
    
    edit_dict = edit.dict()
    edit_dict["created_at"] = datetime.utcnow()
    edit_dict["updated_at"] = datetime.utcnow()
    
    result = await db.edit_projects.insert_one(edit_dict)
    created_edit = await db.edit_projects.find_one({"_id": result.inserted_id})
    
    return created_edit


@router.put("/{edit_id}", response_model=EditProject)
async def update_edit(
    edit_id: str,
    edit: EditProjectUpdate,
    current_user: str = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(edit_id):
        raise HTTPException(status_code=400, detail="Invalid Edit ID")
    
    edit_dict = {k: v for k, v in edit.dict().items() if v is not None}
    
    # If This Is Being Featured, Unfeature Others
    if edit_dict.get("is_featured"):
        await db.edit_projects.update_many(
            {"_id": {"$ne": ObjectId(edit_id)}, "is_featured": True},
            {"$set": {"is_featured": False}}
        )
    
    edit_dict["updated_at"] = datetime.utcnow()
    
    result = await db.edit_projects.update_one(
        {"_id": ObjectId(edit_id)},
        {"$set": edit_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Edit Not Found")
    
    updated_edit = await db.edit_projects.find_one({"_id": ObjectId(edit_id)})
    return updated_edit


@router.delete("/{edit_id}")
async def delete_edit(
    edit_id: str,
    current_user: str = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(edit_id):
        raise HTTPException(status_code=400, detail="Invalid Edit ID")
    
    result = await db.edit_projects.delete_one({"_id": ObjectId(edit_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Edit Not Found")
    
    return {"message": "Edit Deleted Successfully"}