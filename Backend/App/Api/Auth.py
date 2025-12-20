from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from App.Models.Schemas import UserLogin, Token
from App.Core.Security import verify_password, create_access_token, decode_access_token, get_password_hash
from App.Core.Config import settings
from datetime import timedelta

router = APIRouter()
security = HTTPBearer()


@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    # Simple Admin Authentication
    if user.email != settings.admin_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Email Or Password"
        )
    
    # Simple Password Check For Admin (Avoid Bcrypt Issues)
    if user.password != settings.admin_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Email Or Password"
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could Not Validate Credentials"
        )
    
    email: str = payload.get("sub")
    if email is None or email != settings.admin_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could Not Validate Credentials"
        )
    
    return email


@router.get("/verify")
async def verify_token(current_user: str = Depends(get_current_user)):
    return {"email": current_user, "authenticated": True}