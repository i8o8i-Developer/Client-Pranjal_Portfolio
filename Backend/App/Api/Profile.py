from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from App.Models.Schemas import Profile, ProfileCreate, ProfileUpdate
from App.Core.Database import get_database
from App.Api.Auth import get_current_user
from datetime import datetime

router = APIRouter()


@router.get("", response_model=Profile)
async def get_profile():
    db = get_database()
    profile = await db.profiles.find_one()

    def _serialize(doc):
        if not doc:
            return None
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return doc
    
    if not profile:
        # Return Default Profile If None Exists
        return {
            "_id": str(ObjectId()),
            "full_name": "Pranjal",
            "tagline": "Visual Storyteller",
            "bio": "Passionate About Capturing Life's Fleeting Moments And Weaving Compelling Narratives Through The Art Of Photography, Videography, And Video Editing. With Years Of Experience In Visual Storytelling, I Specialize In Creating Content That Not Only Looks Stunning But Also Resonates Deeply With Audiences. From Intimate Portraits And Dynamic Event Coverage To Cinematic Video Edits, I Bring Creativity, Technical Expertise, And A Keen Eye For Detail To Every Project, Ensuring Your Vision Comes To Life In The Most Impactful Way.",
            "skills": ["Photography", "Videography", "Video Editing", "Color Grading", "Sound Design"],
            "experience": "3+ Years Experience",
            "brands": ["Chetmani", "OBraba", "Taj Estate", "Many Other Businesses"],
            "software": ["Premiere Pro", "Capcut"],
            "profile_image": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    return _serialize(profile)


@router.post("", response_model=Profile)
async def create_profile(
    profile: ProfileCreate,
    current_user: str = Depends(get_current_user)
):
    db = get_database()

    # Check If Profile Already Exists
    existing = await db.profiles.find_one()
    if existing:
        raise HTTPException(status_code=400, detail="Profile Already Exists. Use PUT To Update.")
    
    profile_dict = profile.model_dump()
    profile_dict["created_at"] = datetime.utcnow()
    profile_dict["updated_at"] = datetime.utcnow()
    
    result = await db.profiles.insert_one(profile_dict)
    created_profile = await db.profiles.find_one({"_id": result.inserted_id})
    if created_profile and "_id" in created_profile:
        created_profile["_id"] = str(created_profile["_id"])
    
    return created_profile


@router.put("", response_model=Profile)
async def update_profile(
    profile: ProfileUpdate,
    current_user: str = Depends(get_current_user)
):
    db = get_database()
    
    existing = await db.profiles.find_one()
    
    # Use model_dump() for Pydantic v2, exclude_unset keeps all fields including empty strings
    profile_dict = profile.model_dump(exclude_unset=False)
    profile_dict["updated_at"] = datetime.utcnow()
    
    print(f"DEBUG: Updating profile with data: {profile_dict}")
    print(f"DEBUG: Existing profile ID: {existing['_id'] if existing else 'None'}")
    
    if existing:
        await db.profiles.update_one(
            {"_id": existing["_id"]},
            {"$set": profile_dict}
        )
        updated_profile = await db.profiles.find_one({"_id": existing["_id"]})
        print(f"DEBUG: Updated profile from DB: {updated_profile}")
    else:
        profile_dict["created_at"] = datetime.utcnow()
        result = await db.profiles.insert_one(profile_dict)
        updated_profile = await db.profiles.find_one({"_id": result.inserted_id})
        print(f"DEBUG: Created new profile: {updated_profile}")
    
    if updated_profile and "_id" in updated_profile:
        updated_profile["_id"] = str(updated_profile["_id"])

    return updated_profile