from pydantic import BaseModel, Field, EmailStr, field_serializer, field_validator
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class PyObjectId(str):
    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string"}

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        from pydantic_core import core_schema as cs
        return cs.no_info_plain_validator_function(cls.validate)

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str) and ObjectId.is_valid(v):
            return str(ObjectId(v))
        raise ValueError("Invalid ObjectId")


# Profile Models
class ProfileBase(BaseModel):
    full_name: str
    tagline: str
    bio: str
    profile_image: Optional[str] = None  # Cloudinary URL
    skills: List[str] = []
    experience: Optional[str] = None
    brands: List[str] = []
    software: List[str] = []
    social_instagram: Optional[str] = None
    social_youtube: Optional[str] = None
    social_vimeo: Optional[str] = None
    social_behance: Optional[str] = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(ProfileBase):
    pass


class Profile(ProfileBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('id', mode='before')
    @classmethod
    def convert_objectid(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


# Photo Project Models
class PhotoProjectBase(BaseModel):
    title: str
    description: str
    category: str
    image_url: str  # Cloudinary URL
    thumbnail_url: Optional[str] = None  # Cloudinary URL
    tags: List[str] = []
    published: bool = True
    order: int = 0


class PhotoProjectCreate(PhotoProjectBase):
    pass


class PhotoProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None
    order: Optional[int] = None


class PhotoProject(PhotoProjectBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('id', mode='before')
    @classmethod
    def convert_objectid(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


# Video Project Models
class VideoProjectBase(BaseModel):
    title: str
    description: str
    video_type: str  # Youtube, Vimeo, Cloudinary, Mp4
    video_url: str  # Cloudinary URL, YouTube, Vimeo
    thumbnail_url: Optional[str] = None  # Cloudinary URL
    category: Optional[str] = None
    tags: List[str] = []
    published: bool = True
    order: int = 0


class VideoProjectCreate(VideoProjectBase):
    pass


class VideoProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    video_type: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None
    order: Optional[int] = None


class VideoProject(VideoProjectBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('id', mode='before')
    @classmethod
    def convert_objectid(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


# Edit Project Models
class EditProjectBase(BaseModel):
    title: str
    description: str
    video_url: str  # Cloudinary URL, YouTube
    thumbnail_url: Optional[str] = None  # Cloudinary URL
    before_url: Optional[str] = None  # Cloudinary URL
    after_url: Optional[str] = None  # Cloudinary URL
    category: Optional[str] = None
    tags: List[str] = []
    published: bool = True
    order: int = 0
    is_featured: bool = False


class EditProjectCreate(EditProjectBase):
    pass


class EditProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    before_url: Optional[str] = None
    after_url: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None
    order: Optional[int] = None
    is_featured: Optional[bool] = None


class EditProject(EditProjectBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('id', mode='before')
    @classmethod
    def convert_objectid(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


# Contact Message Models
class ContactMessageBase(BaseModel):
    name: str
    email: EmailStr
    message: str


class ContactMessageCreate(ContactMessageBase):
    pass


class ContactMessage(ContactMessageBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False

    @field_validator('id', mode='before')
    @classmethod
    def convert_objectid(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


# Auth Models
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None