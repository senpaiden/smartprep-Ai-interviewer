from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ProfileSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    phone: Optional[str] = ""
    bio: Optional[str] = ""
    education: Optional[List[Any]] = []
    experience: Optional[List[Any]] = []
    skills: Optional[List[Any]] = []
    social_links: Optional[Dict[str, Any]] = {}
    profile_completion: int = 0

class UserSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    username: str
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    role: str = "candidate"
    is_email_verified: bool = False
    avatar: Optional[str] = None
    profile: Optional[ProfileSchema] = None
    is_staff: bool = False
    created_at: Optional[datetime] = None

class UserUpdateSchema(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None
