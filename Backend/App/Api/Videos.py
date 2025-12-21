from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from App.Models.Schemas import VideoProject, VideoProjectCreate, VideoProjectUpdate
from App.Core.Database import get_database
from App.Api.Auth import get_current_user
from App.Core.GoogleDrive import get_drive_service, get_media_urls
from datetime import datetime

router = APIRouter()


@router.get("", response_model=List[VideoProject])
async def get_videos(
    published_only: bool = True,
    skip: int = 0,
    limit: int = 100
):
    db = get_database()
    
    query = {}
    if published_only:
        query["published"] = True
    
    cursor = db.video_projects.find(query).sort("order", 1).skip(skip).limit(limit)
    videos = await cursor.to_list(length=limit)
    
    # Process Google Drive file IDs To Ensure Thumbnail URLs Are Available
    for video in videos:
        if video.get('drive_file_id') and not video.get('thumbnail_url'):
            drive = get_drive_service()
            video['thumbnail_url'] = drive.get_thumbnail_url(video['drive_file_id'])
    
    return videos


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
    drive = get_drive_service()
    
    video_dict = video.dict()
    
    # If video_url Is A Google Drive URL, Extract The file ID
    if video_dict['video_type'] == 'gdrive' or 'drive.google.com' in video_dict['video_url']:
        file_id = drive.extract_file_id_from_url(video_dict['video_url'])
        if file_id:
            video_dict['drive_file_id'] = file_id
            video_dict['video_type'] = 'gdrive'
            # Generate Thumbnail URL If Not Provided
            if not video_dict.get('thumbnail_url'):
                video_dict['thumbnail_url'] = drive.get_thumbnail_url(file_id)
    
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