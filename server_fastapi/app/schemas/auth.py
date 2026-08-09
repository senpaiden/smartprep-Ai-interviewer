from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class QuickLoginRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = "Candidate"
    username: Optional[str] = None

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    password_confirm: str
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenData(BaseModel):
    access: str
    refresh: str

class TokenResponse(BaseModel):
    message: str
    user: dict
    tokens: TokenData

class RefreshTokenRequest(BaseModel):
    refresh: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    password: str
    password_confirm: str
