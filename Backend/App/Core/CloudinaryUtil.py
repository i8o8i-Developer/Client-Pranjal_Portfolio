import cloudinary
import cloudinary.uploader
from App.Core.Config import Settings

settings = Settings()

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret
)

def upload_image_to_cloudinary(file_path_or_stream, folder="profile_images"):
    """
    Uploads An Image To Cloudinary And Returns The Secure URL.
    file_path_or_stream : Can Be A File Path Or A File-Like Object (Stream)
    folder : Cloudinary Folder To Store Images
    """
    result = cloudinary.uploader.upload(
        file_path_or_stream,
        folder=folder,
        resource_type="image"
    )
    return result.get("secure_url")