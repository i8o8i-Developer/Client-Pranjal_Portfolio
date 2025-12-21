"""
Google Drive Integration Module
Handles File Uploads, Downloads, And URL Generation From Google Drive
Uses Service Account For Authentication (No User OAuth Needed)
"""

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
from typing import Optional, Dict, List
import io
import os
import json
from App.Core.Config import settings


class GoogleDriveService:
    """
    Google Drive Service For Managing Portfolio Media Files
    """
    
    def __init__(self):
        self.service = None
        self.folder_id = settings.google_drive_folder_id
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize Google Drive API Service With Service Account Credentials"""
        try:
            # Load Service Account Credentials From JSON File Or Environment Variable
            if os.path.exists(settings.google_service_account_file):
                credentials = service_account.Credentials.from_service_account_file(
                    settings.google_service_account_file,
                    scopes=['https://www.googleapis.com/auth/drive']
                )
            elif settings.google_service_account_json:
                # For Environment Variables (Useful For Netlify Deployment)
                service_account_info = json.loads(settings.google_service_account_json)
                credentials = service_account.Credentials.from_service_account_info(
                    service_account_info,
                    scopes=['https://www.googleapis.com/auth/drive']
                )
            else:
                raise ValueError("Google Service Account Credentials Not Found")
            
            self.service = build('drive', 'v3', credentials=credentials)
            print("✅ Google Drive Service Initialized Successfully")
        except Exception as e:
            print(f"❌ Error initializing Google Drive Service: {e}")
            self.service = None
    
    def upload_file(
        self,
        file_path: str,
        file_name: str,
        mime_type: str = 'image/jpeg',
        folder_id: Optional[str] = None
    ) -> Optional[str]:
        """
        Upload A File To Google Drive
        
        Args:
            file_path: Local Path To The File
            file_name: Name For The File In Google Drive
            mime_type: MIME Type Of The File
            folder_id: Google Drive Folder ID (Uses Default If Not Provided)
        
        Returns:
            File ID If Successful, None Otherwise
        """
        if not self.service:
            print("❌ Google Drive Service Not Initialized")
            return None
        
        try:
            file_metadata = {
                'name': file_name,
                'parents': [folder_id or self.folder_id]
            }
            
            media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)
            
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, webViewLink, webContentLink'
            ).execute()
            
            # Make The File Publicly Accessible
            self._make_file_public(file['id'])
            
            print(f"✅ File Uploaded Successfully: {file_name} (ID: {file['id']})")
            return file['id']
        
        except Exception as e:
            print(f"❌ Error Uploading File: {e}")
            return None
    
    def _make_file_public(self, file_id: str):
        """Make A File Publicly Accessible"""
        try:
            permission = {
                'type': 'anyone',
                'role': 'reader'
            }
            self.service.permissions().create(
                fileId=file_id,
                body=permission
            ).execute()
        except Exception as e:
            print(f"⚠️ Warning: Could Not Make File Public: {e}")
    
    def delete_file(self, file_id: str) -> bool:
        """
        Delete A File From Google Drive
        
        Args:
            file_id: Google Drive File ID
        
        Returns:
            True if Successful, False Otherwise
        """
        if not self.service:
            return False
        
        try:
            self.service.files().delete(fileId=file_id).execute()
            print(f"✅ File Deleted Successfully: {file_id}")
            return True
        except Exception as e:
            print(f"❌ Error Deleting File: {e}")
            return False
    
    def get_file_info(self, file_id: str) -> Optional[Dict]:
        """
        Get File Information From Google Drive
        
        Args:
            file_id: Google Drive File ID
        
        Returns:
            File Information Dictionary Or None
        """
        if not self.service:
            return None
        
        try:
            file = self.service.files().get(
                fileId=file_id,
                fields='id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink'
            ).execute()
            return file
        except Exception as e:
            print(f"❌ Error Getting File Information: {e}")
            return None
    
    def get_direct_download_url(self, file_id: str) -> str:
        """
        Get Direct Download/View URL For A File
        
        Args:
            file_id: Google Drive File ID
        
        Returns:
            Direct URL For Accessing The File
        """
        return f"https://drive.google.com/uc?export=view&id={file_id}"
    
    def get_thumbnail_url(self, file_id: str, size: int = 800) -> str:
        """
        Get Thumbnail URL For Images/Videos
        
        Args:
            file_id: Google Drive File ID
            size: Thumbnail size (Width)
        
        Returns:
            Thumbnail URL
        """
        return f"https://drive.google.com/thumbnail?id={file_id}&sz=w{size}"
    
    def get_embed_url(self, file_id: str) -> str:
        """
        Get Embeddable URL For Videos
        
        Args:
            file_id: Google Drive File ID
        
        Returns:
            Embed URL For Iframes
        """
        return f"https://drive.google.com/file/d/{file_id}/preview"
    
    def list_files_in_folder(self, folder_id: Optional[str] = None, page_size: int = 100) -> List[Dict]:
        """
        List All Files In A Folder
        
        Args:
            folder_id: Google Drive Folder ID (Uses Default If Not Provided)
            page_size: Number Of Files Per Page
        
        Returns:
            List Of File Information Dictionaries
        """
        if not self.service:
            return []
        
        try:
            query = f"'{folder_id or self.folder_id}' in parents and trashed=false"
            results = self.service.files().list(
                q=query,
                pageSize=page_size,
                fields="files(id, name, mimeType, size, thumbnailLink, webViewLink)"
            ).execute()
            
            return results.get('files', [])
        except Exception as e:
            print(f"❌ Error Listing Files: {e}")
            return []
    
    def download_file(self, file_id: str, destination_path: str) -> bool:
        """
        Download A File From Google Drive To Local Storage
        
        Args:
            file_id: Google Drive File ID
            destination_path: Local Path To Save The File
        
        Returns:
            True If Successful, False Otherwise
        """
        if not self.service:
            return False
        
        try:
            request = self.service.files().get_media(fileId=file_id)
            fh = io.FileIO(destination_path, 'wb')
            downloader = MediaIoBaseDownload(fh, request)
            
            done = False
            while not done:
                status, done = downloader.next_chunk()
                print(f"Download Progress: {int(status.progress() * 100)}%")
            
            print(f"✅ File Downloaded Successfully To: {destination_path}")
            return True
        except Exception as e:
            print(f"❌ Error Downloading File: {e}")
            return False
    
    def extract_file_id_from_url(self, url: str) -> Optional[str]:
        """
        Extract Google Drive File ID From Various URL Formats
        
        Args:
            url: Google Drive URL
        
        Returns:
            File ID Or None
        """
        import re
        
        # Pattern For /d/{file_id}
        match = re.search(r'/d/([a-zA-Z0-9_-]+)', url)
        if match:
            return match.group(1)
        
        # Pattern For id={file_id}
        match = re.search(r'[?&]id=([a-zA-Z0-9_-]+)', url)
        if match:
            return match.group(1)
        
        # If It's Already Just An ID (No Special Characters Except - And _)
        if re.match(r'^[a-zA-Z0-9_-]+$', url):
            return url
        
        return None


# Singleton Instance
_drive_service = None

def get_drive_service() -> GoogleDriveService:
    """Get Or Create Google Drive Service Instance"""
    global _drive_service
    if _drive_service is None:
        _drive_service = GoogleDriveService()
    return _drive_service


# Helper Unctions For Easy Access
def get_media_urls(file_id: str) -> Dict[str, str]:
    """
    Get All Relevant URLs For A Google Drive File
    
    Args:
        file_id: Google Drive File ID
    
    Returns:
        Dictionary With direct_url, thumbnail_url, and embed_url
    """
    drive = get_drive_service()
    return {
        'direct_url': drive.get_direct_download_url(file_id),
        'thumbnail_url': drive.get_thumbnail_url(file_id),
        'embed_url': drive.get_embed_url(file_id),
        'file_id': file_id
    }