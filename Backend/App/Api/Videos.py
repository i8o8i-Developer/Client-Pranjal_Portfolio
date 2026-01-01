
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from bson import ObjectId
from App.Models.Schemas import VideoProject, VideoProjectCreate, VideoProjectUpdate
from App.Core.Database import get_database
from App.Api.Auth import get_current_user
from App.Core.CloudinaryUtil import upload_image_to_cloudinary
from datetime import datetime

router = APIRouter()
# Cloudinary Upload Endpoint For Videos
@router.post("/upload-video")
async def upload_video_file(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    # Upload video to Cloudinary (resource_type="video")
    from App.Core.CloudinaryUtil import cloudinary
    result = cloudinary.uploader.upload(
        await file.read(),
        folder="video_files",
        resource_type="video"
    )
    return {"video_url": result["secure_url"]}

# Cloudinary Upload Endpoint For Video Thumbnails
@router.post("/upload-thumbnail")
async def upload_video_thumbnail(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    url = upload_image_to_cloudinary(await file.read(), folder="video_thumbnails")
    return {"thumbnail_url": url}


@router.get("", response_model=List[VideoProject])
async def get_videos(
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
    
    cursor = db.video_projects.find(query).sort("order", 1).skip(skip).limit(limit)
    videos = await cursor.to_list(length=limit)
    
    return videos


@router.get("/categories", response_model=dict)
async def get_video_categories():
    db = get_database()
    categories = await db.video_projects.distinct("category")
    return {"categories": categories}


@router.get("/{video_id}", response_model=VideoProject)
async def get_video(video_id: str):
    db = get_database()
    
    if not ObjectId.is_valid(video_id):
        raise HTTPException(status_code=400, detail="Invalid Video ID")
    
    video = await db.video_projects.find_one({"_id": ObjectId(video_id)})
    
    if not video:
        raise HTTPException(status_code=404, detail="Video Not Found")
    
    return video


@router.post("", response_model=VideoProject)
async def create_video(
    video: VideoProjectCreate,
    current_user: str = Depends(get_current_user)
):
    db = get_database()
    video_dict = video.dict()
    video_dict["created_at"] = datetime.utcnow()
    video_dict["updated_at"] = datetime.utcnow()
    result = await db.video_projects.insert_one(video_dict)
    created_video = await db.video_projects.find_one({"_id": result.inserted_id})
    return created_video


@router.put("/{video_id}", response_model=VideoProject)
async def update_video(
    video_id: str,
    video: VideoProjectUpdate,
    current_user: str = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(video_id):
        raise HTTPException(status_code=400, detail="Invalid Video ID")
    
    video_dict = {k: v for k, v in video.dict().items() if v is not None}
    video_dict["updated_at"] = datetime.utcnow()
    
    result = await db.video_projects.update_one(
        {"_id": ObjectId(video_id)},
        {"$set": video_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Video Not Found")
    
    updated_video = await db.video_projects.find_one({"_id": ObjectId(video_id)})
    return updated_video


@router.delete("/{video_id}")
async def delete_video(
    video_id: str,
    current_user: str = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(video_id):
        raise HTTPException(status_code=400, detail="Invalid Video ID")
    
    result = await db.video_projects.delete_one({"_id": ObjectId(video_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video Not Found")
    
    return {"message": "Video Deleted Successfully"}