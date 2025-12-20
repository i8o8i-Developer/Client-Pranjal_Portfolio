from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from typing import List
import os
import aiofiles
from pathlib import Path
import uuid
from App.Core.Config import settings
from App.Api.Auth import get_current_user

router = APIRouter()

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm"}


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def is_allowed_file(filename: str, file_type: str) -> bool:
    ext = get_file_extension(filename)
    if file_type == "image":
        return ext in ALLOWED_IMAGE_EXTENSIONS
    elif file_type == "video":
        return ext in ALLOWED_VIDEO_EXTENSIONS
    return False


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    if not is_allowed_file(file.filename, "image"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid File Type. Allowed: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    # Generate Unique Filename
    ext = get_file_extension(file.filename)
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(settings.upload_directory, unique_filename)
    
    # Save File
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        
        # Check File Size
        if len(content) > settings.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"File Too Large. Max Size: {settings.max_file_size} Bytes"
            )
        
        await out_file.write(content)
    
    # Return URL
    file_url = f"/Uploads/{unique_filename}"
    return {
        "filename": unique_filename,
        "url": file_url,
        "size": len(content)
    }


@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    if not is_allowed_file(file.filename, "video"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid File Type. Allowed: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        )
    
    # Generate Unique Filename
    ext = get_file_extension(file.filename)
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(settings.upload_directory, unique_filename)
    
    # Save File
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        
        # Check File Size
        if len(content) > settings.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"File Too Large. Max Size: {settings.max_file_size} Bytes"
            )
        
        await out_file.write(content)
    
    # Return URL
    file_url = f"/Uploads/{unique_filename}"
    return {
        "filename": unique_filename,
        "url": file_url,
        "size": len(content)
    }


@router.post("/multiple")
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    current_user: str = Depends(get_current_user)
):
    uploaded_files = []
    
    for file in files:
        # Determine File Type
        ext = get_file_extension(file.filename)
        if ext in ALLOWED_IMAGE_EXTENSIONS:
            file_type = "image"
        elif ext in ALLOWED_VIDEO_EXTENSIONS:
            file_type = "video"
        else:
            continue  # Skip Invalid Files
        
        # Generate Unique Filename
        unique_filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(settings.upload_directory, unique_filename)
        
        # Save File
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            
            if len(content) > settings.max_file_size:
                continue  # Skip Files That Are Too Large
            
            await out_file.write(content)
        
        file_url = f"/Uploads/{unique_filename}"
        uploaded_files.append({
            "filename": unique_filename,
            "url": file_url,
            "size": len(content),
            "type": file_type
        })
    
    return {"files": uploaded_files, "count": len(uploaded_files)}