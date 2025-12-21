"""
Media API For Serving Google Drive Media URLs
Provides Endpoints To Get Direct URLs, Thumbnails, And Embed URLs For Media Files
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, List
from App.Core.GoogleDrive import get_drive_service, get_media_urls

router = APIRouter()


@router.get("/drive/{file_id}")
async def get_drive_file_urls(file_id: str) -> Dict[str, str]:
    """
    Get All URLs For A Google Drive File
    
    Args:
        file_id: Google Drive File ID
    
    Returns:
        Dictionary With direct_url, thumbnail_url, embed_url
    """
    try:
        urls = get_media_urls(file_id)
        return urls
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error Retrieving File URLs: {str(e)}")


@router.get("/drive/{file_id}/thumbnail")
async def get_drive_thumbnail(file_id: str, size: int = 800) -> Dict[str, str]:
    """
    Get Thumbnail URL For A Google Drive File
    
    Args:
        file_id: Google Drive File ID
        size: Thumbnail Width (Default 800)
    
    Returns:
        Dictionary With thumbnail_url
    """
    try:
        drive = get_drive_service()
        thumbnail_url = drive.get_thumbnail_url(file_id, size)
        return {"thumbnail_url": thumbnail_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error Retrieving Thumbnail: {str(e)}")


@router.get("/drive/{file_id}/direct")
async def get_drive_direct_url(file_id: str) -> Dict[str, str]:
    """
    Get Direct Download/View URL For A Google Drive File
    
    Args:
        file_id: Google Drive File ID
    
    Returns:
        Dictionary With direct_url
    """
    try:
        drive = get_drive_service()
        direct_url = drive.get_direct_download_url(file_id)
        return {"direct_url": direct_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error Retrieving Direct URL: {str(e)}")


@router.get("/drive/{file_id}/embed")
async def get_drive_embed_url(file_id: str) -> Dict[str, str]:
    """
    Get Embed URL For A Google Drive Video
    
    Args:
        file_id: Google Drive File ID
    
    Returns:
        Dictionary With embed_url
    """
    try:
        drive = get_drive_service()
        embed_url = drive.get_embed_url(file_id)
        return {"embed_url": embed_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error Retrieving Embed URL: {str(e)}")


@router.get("/drive/{file_id}/info")
async def get_drive_file_info(file_id: str) -> Dict:
    """
    Get Detailed Information About A Google Drive File
    
    Args:
        file_id: Google Drive File ID
    
    Returns:
        File Information Dictionary
    """
    try:
        drive = get_drive_service()
        file_info = drive.get_file_info(file_id)
        if not file_info:
            raise HTTPException(status_code=404, detail="File Not Found")
        return file_info
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error Retrieving File Info: {str(e)}")


@router.post("/drive/extract-id")
async def extract_drive_file_id(url: str) -> Dict[str, str]:
    """
    Extract Google Drive File ID From Various URL Formats
    
    Args:
        url: Google Drive URL
    
    Returns:
        Dictionary With file_id
    """
    try:
        drive = get_drive_service()
        file_id = drive.extract_file_id_from_url(url)
        if not file_id:
            raise HTTPException(status_code=400, detail="Could Not Extract File ID From URL")
        return {"file_id": file_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error Extracting File ID: {str(e)}")


@router.get("/drive/folder/{folder_id}/files")
async def list_folder_files(folder_id: str, page_size: int = 100) -> Dict[str, List[Dict]]:
    """
    List All Files In A Google Drive Folder
    
    Args:
        folder_id: Google Drive folder ID
        page_size: Number Of Files To Return (Default 100)
    
    Returns:
        Dictionary With Files List
    """
    try:
        drive = get_drive_service()
        files = drive.list_files_in_folder(folder_id, page_size)
        return {"files": files, "count": len(files)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error Listing Folder Files: {str(e)}")
