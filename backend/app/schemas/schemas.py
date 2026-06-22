from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ================= Auth Schemas =================
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    organization: Optional[str] = None
    role: str = Field("Developer", description="Founder, Developer, Mentor, Investor, Professional")
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    organization: Optional[str] = None
    role: str
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ================= Profile Schemas =================
class ProfileResponse(BaseModel):
    id: str
    user_id: str
    bio: Optional[str] = None
    industry: Optional[str] = None
    skills: List[str] = []
    interests: List[str] = []
    goals: List[str] = []
    challenges: List[str] = []
    expertise: List[str] = []
    experience_years: int = 0

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    industry: Optional[str] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    goals: Optional[List[str]] = None
    challenges: Optional[List[str]] = None
    expertise: Optional[List[str]] = None
    experience_years: Optional[int] = None

# ================= Chat Schemas =================
class ChatMessageCreate(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    id: str
    user_id: str
    sender: str  # "user" or "assistant"
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

# ================= Match Schemas =================
class MatchResponse(BaseModel):
    id: str
    user1_id: str
    user2_id: str
    user1_name: str
    user1_role: str
    user2_name: str
    user2_role: str
    score: float
    reason: List[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ================= Introduction Schemas =================
class IntroductionResponse(BaseModel):
    id: str
    match_id: str
    introduction_message: str
    accepted: bool
    sent: bool
    created_at: datetime
    match_details: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# ================= Feedback Schemas =================
class FeedbackCreate(BaseModel):
    introduction_id: str
    rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None
    would_collaborate: bool = False
    verified: bool = False

class FeedbackResponse(BaseModel):
    id: str
    introduction_id: str
    user_id: str
    rating: int
    comments: Optional[str] = None
    would_collaborate: bool
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class FeedbackStats(BaseModel):
    total_feedbacks: int
    average_rating: float
    verification_rate: float  # Percentage of introductions that are verified useful
    collaboration_rate: float # Percentage of users willing to collaborate

# ================= Analytics Schemas =================
class AnalyticsDashboard(BaseModel):
    total_users: int
    total_matches: int
    total_introductions: int
    verified_introductions: int
    match_success_rate: float
    top_skills: List[Dict[str, Any]]
    most_requested_roles: List[Dict[str, Any]]
